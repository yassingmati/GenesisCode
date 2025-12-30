// src/controllers/paymentController.js
// Utiliser le service Konnect réel
console.log('🔗 Mode production - utilisation du service Konnect réel');
const konnectPaymentService = require('../services/konnectPaymentService');
const Plan = require('../models/Plan');
const CategoryPlan = require('../models/CategoryPlan');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const CourseAccessService = require('../services/courseAccessService');

class PaymentController {

  /**
   * Initialiser un paiement d'abonnement
   */
  static async initSubscriptionPayment(req, res) {
    try {
      const {
        planId,
        categoryPlanId,
        customerEmail,
        returnUrl,
        cancelUrl,
        pathId
      } = req.body;

      // Récupérer l'utilisateur (optionnel pour les tests)
      const userId = req.user ? req.user.id : null;
      const testUserId = userId || 'test-user-id';
      const testEmail = customerEmail || 'test@genesis.com';

      // Validation des paramètres
      if (!planId && !categoryPlanId) {
        return res.status(400).json({
          success: false,
          message: 'ID du plan requis (planId ou categoryPlanId)'
        });
      }

      // Tenter d'utiliser le système existant (Plan legacy), sinon basculer sur CategoryPlan
      let legacyPlan = null;
      let categoryPlan = null;
      let isCategoryPlan = false;

      if (planId) {
        try {
          legacyPlan = await Plan.findById(planId);
        } catch (_) { /* ignore */ }
      }

      if ((!legacyPlan || !legacyPlan.active) && (categoryPlanId || planId)) {
        // Utiliser categoryPlanId s'il est fourni, sinon tenter avec planId comme ObjectId de CategoryPlan
        const cpId = categoryPlanId || planId;
        try {
          categoryPlan = await CategoryPlan.findById(cpId).populate('category', 'translations type').lean();
        } catch (_) { /* ignore */ }

        if (categoryPlan && categoryPlan.active) {
          isCategoryPlan = true;
        }
      }

      if (!legacyPlan && !isCategoryPlan) {
        return res.status(404).json({
          success: false,
          message: 'Plan introuvable ou inactif'
        });
      }

      // Plan gratuit - accès immédiat
      if (!isCategoryPlan) {
        if (legacyPlan.priceMonthly === 0 || legacyPlan.priceMonthly === null) {
          return res.json({
            success: true,
            freeAccess: true,
            plan: legacyPlan,
            message: 'Accès gratuit accordé'
          });
        }
      } else {
        if ((categoryPlan.price || 0) === 0) {
          // Synthétiser un objet plan similaire pour la réponse
          const synthesizedPlan = {
            _id: String(categoryPlan._id),
            name: categoryPlan.translations?.fr?.name || 'Accès catégorie',
            description: categoryPlan.translations?.fr?.description || '',
            priceMonthly: null, // gratuit
            currency: categoryPlan.currency || 'TND',
            interval: null,
            features: Array.isArray(categoryPlan.features) ? categoryPlan.features : [],
            active: !!categoryPlan.active
          };
          return res.json({
            success: true,
            freeAccess: true,
            plan: synthesizedPlan,
            message: 'Accès gratuit accordé'
          });
        }
      }

      // Vérifier la configuration Konnect
      if (!konnectPaymentService.isConfigured()) {
        console.log('⚠️ Service de paiement non configuré, utilisation du mode test');
      }

      // Générer un ID de commande unique
      const merchantOrderId = `sub_${testUserId}_${Date.now()}`;

      // Préparer les données de paiement
      let paymentData;
      let responsePlanForClient;
      if (!isCategoryPlan) {
        paymentData = {
          amountCents: legacyPlan.priceMonthly,
          currency: legacyPlan.currency,
          description: `Abonnement ${legacyPlan.name} - GenesisCode`,
          merchantOrderId,
          customerEmail: testEmail,
          returnUrl: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success`,
          cancelUrl: cancelUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
          metadata: {
            planId,
            pathId: pathId || null,
            userId: testUserId,
            type: 'subscription',
            testMode: !userId || userId === 'test-user-id'
          }
        };
        responsePlanForClient = legacyPlan;
      } else {
        const interval = categoryPlan.paymentType === 'monthly' ? 'month' : (categoryPlan.paymentType === 'yearly' ? 'year' : null);
        const amountCents = Math.round((categoryPlan.price || 0) * 100);
        paymentData = {
          amountCents,
          currency: categoryPlan.currency || 'TND',
          description: `Accès ${categoryPlan.translations?.fr?.name || 'Catégorie'} - GenesisCode`,
          merchantOrderId,
          customerEmail: testEmail,
          returnUrl: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success`,
          cancelUrl: cancelUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
          metadata: {
            categoryPlanId: String(categoryPlan._id),
            categoryId: String(categoryPlan.category?._id || categoryPlan.category),
            pathId: pathId || null,
            userId: testUserId,
            type: 'category_plan',
            interval,
            testMode: !userId || userId === 'test-user-id'
          }
        };
        // Synthétiser un plan côté réponse pour compatibilité frontend
        responsePlanForClient = {
          _id: String(categoryPlan._id),
          name: categoryPlan.translations?.fr?.name || 'Accès catégorie',
          description: categoryPlan.translations?.fr?.description || '',
          priceMonthly: interval === 'month' ? amountCents : amountCents, // conserver format cents
          currency: categoryPlan.currency || 'TND',
          interval: interval,
          features: Array.isArray(categoryPlan.features) ? categoryPlan.features : [],
          active: !!categoryPlan.active,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Initialiser le paiement Konnect
      const paymentResult = await konnectPaymentService.initPayment(paymentData);

      // Enregistrer le paiement en base (seulement si l'utilisateur est authentifié)
      let payment = null;
      if (userId && userId !== 'test-user-id') {
        payment = new Payment({
          user: userId,
          plan: isCategoryPlan ? categoryPlan._id : legacyPlan._id,
          planModel: isCategoryPlan ? 'CategoryPlan' : 'Plan',
          konnectPaymentId: paymentResult.konnectPaymentId,
          merchantOrderId,
          amount: isCategoryPlan ? paymentData.amountCents : legacyPlan.priceMonthly,
          currency: isCategoryPlan ? (categoryPlan.currency || 'TND') : legacyPlan.currency,
          status: 'pending',
          description: paymentData.description,
          customerEmail: testEmail,
          paymentUrl: paymentResult.paymentUrl,
          returnUrl: paymentData.returnUrl,
          cancelUrl: paymentData.cancelUrl,
          metadata: paymentData.metadata
        });

        await payment.save();
      }

      // Créer un abonnement en attente si l'utilisateur est authentifié
      let subscription = null;
      if (userId && userId !== 'test-user-id') {
        // Pour les plans catégorie, on crée aussi un object subscription pour le suivi, 
        // même si c'est géré différemment (expiry via access)
        const planId = isCategoryPlan ? categoryPlan._id : legacyPlan._id;

        subscription = new Subscription({
          user: userId,
          plan: planId,
          planModel: isCategoryPlan ? 'CategoryPlan' : 'Plan',
          status: 'pending',
          konnectPaymentId: paymentResult.konnectPaymentId,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours (sera mis à jour à l'activation)
        });

        await subscription.save();
      }

      const logAmount = !isCategoryPlan
        ? legacyPlan.priceMonthly
        : (responsePlanForClient && typeof responsePlanForClient.priceMonthly === 'number'
          ? responsePlanForClient.priceMonthly
          : Math.round((categoryPlan?.price || 0) * 100));
      const logCurrency = !isCategoryPlan
        ? legacyPlan.currency
        : (responsePlanForClient?.currency || categoryPlan?.currency || 'TND');

      console.log('✅ Paiement initialisé:', {
        paymentId: paymentResult.konnectPaymentId,
        merchantOrderId,
        amount: logAmount,
        currency: logCurrency,
        isCategoryPlan
      });

      return res.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        konnectPaymentId: paymentResult.konnectPaymentId,
        merchantOrderId,
        plan: responsePlanForClient,
        subscription: subscription && !isCategoryPlan ? subscription._id : null,
        message: 'Paiement initialisé avec succès',
        testMode: !userId || userId === 'test-user-id'
      });

    } catch (error) {
      console.error('❌ Erreur initialisation paiement:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'initialisation du paiement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Traiter le webhook Konnect
   */
  static async handleKonnectWebhook(req, res) {
    try {
      const { payment_ref } = req.query;

      if (!payment_ref) {
        console.log('⚠️ Webhook Konnect sans payment_ref');
        return res.status(400).json({
          success: false,
          message: 'payment_ref requis'
        });
      }

      console.log('🔔 Webhook Konnect reçu:', payment_ref);

      // Traiter le webhook avec le service Konnect
      const webhookResult = await konnectPaymentService.processWebhook(payment_ref);

      // Récupérer le paiement en base (optionnel en mode test)
      let payment = null;
      try {
        payment = await Payment.findByKonnectId(payment_ref);
      } catch (error) {
        console.log('⚠️ Paiement non trouvé en base (mode test):', payment_ref);
      }

      // Mettre à jour le paiement (si trouvé)
      if (payment) {
        if (webhookResult.isCompleted) {
          await payment.markAsCompleted(webhookResult);

          // Activer l'abonnement si l'utilisateur est authentifié
          if (payment.user && payment.user.toString() !== 'test-user-id') {
            await this.activateSubscription(payment);
          }

          console.log('✅ Paiement confirmé:', payment_ref);
        } else if (webhookResult.isFailed) {
          await payment.markAsFailed('Paiement échoué selon Konnect');
          console.log('❌ Paiement échoué:', payment_ref);
        }
      } else {
        console.log('🧪 Mode test - Webhook traité sans paiement en base');
      }

      return res.json({
        success: true,
        message: 'Webhook traité avec succès',
        paymentRef: payment_ref,
        status: webhookResult.status
      });

    } catch (error) {
      console.error('❌ Erreur traitement webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du traitement du webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Activer un abonnement après paiement réussi
   */
  static async activateSubscription(payment) {
    try {
      const user = await User.findById(payment.user);
      if (!user) {
        console.log('⚠️ Utilisateur non trouvé pour paiement:', payment._id);
        return;
      }

      let plan;
      if (payment.planModel === 'CategoryPlan') {
        plan = await CategoryPlan.findById(payment.plan);
      } else {
        plan = await Plan.findById(payment.plan);
      }

      if (!plan) {
        console.log('⚠️ Plan non trouvé pour paiement:', payment._id);
        return;
      }

      // Calculer la date d'expiration
      const now = new Date();
      const expiresAt = new Date(now);
      // Gérer intervalle ou lifetime pour CategoryPlan
      if (plan.paymentType === 'lifetime') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 99);
      } else if (plan.interval === 'year' || plan.paymentType === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      // Mettre à jour l'abonnement (pour TOUS les types de plans maintenant)
      const subscription = await Subscription.findOne({
        user: payment.user,
        konnectPaymentId: payment.konnectPaymentId
      });

      if (subscription) {
        subscription.status = 'active';
        subscription.currentPeriodStart = now;
        subscription.currentPeriodEnd = expiresAt;
        subscription.konnectStatus = 'completed';
        await subscription.save();
      }

      // Mettre à jour l'utilisateur (seulement pour Plan principal pour compatibilité legacy)
      if (payment.planModel !== 'CategoryPlan') {
        user.subscription = {
          konnectPaymentId: payment.konnectPaymentId,
          konnectStatus: 'completed',
          planId: plan._id,
          status: 'active',
          currentPeriodEnd: expiresAt,
          cancelAtPeriodEnd: false
        };
        await user.save();
      }

      // Accorder l'accès selon le plan (fonctionne pour les deux types si formaté correctement)
      // Pour CategoryPlan, il faut s'assurer que l'objet plan a les propriétés attendues par grantAccessByPlan
      let planForGrant = plan;
      if (payment.planModel === 'CategoryPlan') {
        // Normaliser pour grantAccessByPlan
        planForGrant = {
          type: 'category', // ou 'path' si c'est un path plan
          targetId: plan.category, // CategoryPlan lie à une category
          // SI CategoryPlan peut lier Path, il faudrait vérifier le champ 'target' ou 'path' dans CategoryPlan schema
          // Supposons que CategoryPlan est lié à Category pour l'instant.
          // TODO: Vérifier schéma CategoryPlan si on a des PathPlans.
        };

        // Vérification rapide du target
        if (plan.type) planForGrant.type = plan.type; // Si CategoryPlan a un champ type ('category'/'path')
        if (plan.targetId) planForGrant.targetId = plan.targetId; // Si CategoryPlan a targetId

        // Fallback legacy CategoryPlan (qui n'était que category)
        if (!planForGrant.targetId && plan.category) {
          planForGrant.type = 'category';
          planForGrant.targetId = plan.category;
        }
      }

      await this.grantAccessByPlan(user._id, planForGrant, expiresAt);

      console.log('✅ Abonnement activé:', {
        userId: user._id,
        planId: plan._id,
        expiresAt
      });

    } catch (error) {
      console.error('❌ Erreur activation abonnement:', error);
      throw error;
    }
  }

  /**
   * Accorder l'accès selon le plan
   */
  static async grantAccessByPlan(userId, plan, expiresAt) {
    try {
      const Path = require('../models/Path');

      if (plan.type === 'global') {
        // Accès global - accorder l'accès à tous les parcours
        const paths = await Path.find({ active: true });
        for (const path of paths) {
          await CourseAccessService.grantAccess(userId, path._id, 'subscription', {
            canView: true,
            canInteract: true,
            canDownload: true,
            expiresAt: expiresAt
          });
        }
      } else if (plan.type === 'path' && plan.targetId) {
        // Accès à un parcours spécifique
        await CourseAccessService.grantAccess(userId, plan.targetId, 'subscription', {
          canView: true,
          canInteract: true,
          canDownload: true,
          expiresAt: expiresAt
        });
      } else if (plan.type === 'category' && plan.targetId) {
        // Accès à une catégorie spécifique
        const paths = await Path.find({
          category: plan.targetId,
          active: true
        });
        for (const path of paths) {
          await CourseAccessService.grantAccess(userId, path._id, 'subscription', {
            canView: true,
            canInteract: true,
            canDownload: true,
            expiresAt: expiresAt
          });
        }
      }

    } catch (error) {
      console.error('❌ Erreur attribution accès:', error);
      throw error;
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  static async checkPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user ? req.user.id : null;

      const payment = await Payment.findByKonnectId(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Paiement non trouvé'
        });
      }

      // Vérifier que l'utilisateur peut accéder à ce paiement
      if (userId && payment.user && payment.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Accès non autorisé'
        });
      }

      return res.json({
        success: true,
        payment: {
          id: payment._id,
          konnectPaymentId: payment.konnectPaymentId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          plan: payment.plan,
          initiatedAt: payment.initiatedAt,
          completedAt: payment.completedAt
        }
      });

    } catch (error) {
      console.error('❌ Erreur vérification statut:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du statut'
      });
    }
  }

  /**
   * Obtenir l'historique des paiements d'un utilisateur
   */
  static async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const payments = await Payment.findCompletedPayments(userId, parseInt(limit));

      return res.json({
        success: true,
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          plan: payment.plan,
          completedAt: payment.completedAt,
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd
        }))
      });

    } catch (error) {
      console.error('❌ Erreur historique paiements:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }

  /**
   * Obtenir l'historique des paiements d'un utilisateur spécifique (Admin/Parent)
   */
  static async getUserPaymentHistory(req, res) {
    try {
      const requesterId = req.user.id;
      const { userId } = req.params;
      const { limit = 10 } = req.query;

      // Vérification des droits
      if (requesterId !== userId && req.user.role !== 'admin') {
        const child = await User.findOne({ _id: userId, parentAccount: requesterId });
        if (!child) {
          return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
      }

      // Utiliser find car findCompletedPayments est une méthode statique du modèle
      // Si elle n'est pas dispo, on fait une query manuelle
      let payments;
      if (Payment.findCompletedPayments) {
        payments = await Payment.findCompletedPayments(userId, parseInt(limit));
      } else {
        payments = await Payment.find({
          user: userId,
          status: { $in: ['completed', 'paid'] }
        })
          .sort({ completedAt: -1 })
          .limit(parseInt(limit))
          .populate('plan');
      }

      return res.json({
        success: true,
        payments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          plan: payment.plan,
          completedAt: payment.completedAt,
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd,
          description: payment.description // Adding description as frontend uses it
        }))
      });

    } catch (error) {
      console.error('❌ Erreur historique paiements user:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }
}

module.exports = PaymentController;
