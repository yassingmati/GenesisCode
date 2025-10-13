// src/controllers/subscriptionPaymentController.js
const { initPayment } = require('../services/konnectService');
const Plan = require('../models/Plan');
const User = require('../models/User');
const CourseAccessService = require('../services/courseAccessService');

class SubscriptionPaymentController {
  
  /**
   * Initialiser un paiement d'abonnement
   */
  static async initSubscriptionPayment(req, res) {
    try {
      const { planId, pathId, amount, currency, description, returnUrl, cancelUrl, merchantOrderId, customerEmail } = req.body;
      
      // Gérer les cas avec et sans authentification
      const userId = req.user ? req.user.id : null;
      
      // Si pas d'utilisateur authentifié, utiliser des valeurs par défaut pour les tests
      const testUserId = userId || 'test-user-id';
      const testEmail = customerEmail || 'test@genesis.com';

      if (!planId) {
        return res.status(400).json({
          success: false,
          message: 'ID du plan requis'
        });
      }

      // Vérifier que le plan existe
      const plan = await Plan.findById(planId).lean();
      if (!plan || !plan.active) {
        return res.status(404).json({
          success: false,
          message: 'Plan introuvable ou inactif'
        });
      }

      // Récupérer l'utilisateur (optionnel pour les tests)
      let user = null;
      if (userId && userId !== 'test-user-id') {
        user = await User.findById(userId).lean();
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Utilisateur introuvable'
          });
        }
      }

      // Générer un ID de commande unique
      const finalMerchantOrderId = merchantOrderId || `sub_${testUserId}_${Date.now()}`;
      
      // Configuration du paiement (utiliser les paramètres fournis ou ceux du plan)
      const paymentConfig = {
        amountCents: amount || plan.priceMonthly || 0,
        currency: currency || plan.currency || 'TND',
        returnUrl: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success`,
        merchantOrderId: finalMerchantOrderId,
        description: description || `Abonnement ${plan.name} - GenesisCode`,
        customerEmail: testEmail,
        metadata: {
          planId: planId,
          pathId: pathId || null,
          userId: testUserId,
          type: 'subscription',
          testMode: !userId || userId === 'test-user-id'
        }
      };

      // Initialiser le paiement
      const paymentResult = await initPayment(paymentConfig);

      // Sauvegarder les informations de paiement dans l'utilisateur (seulement si authentifié)
      if (user && userId !== 'test-user-id') {
        await User.findByIdAndUpdate(userId, {
          'subscription.konnectPaymentId': paymentResult.konnectPaymentId,
          'subscription.planId': planId,
          'subscription.status': 'pending'
        });
      }

      return res.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        konnectPaymentId: paymentResult.konnectPaymentId,
        merchantOrderId: finalMerchantOrderId,
        plan: plan,
        message: 'Paiement initialisé avec succès',
        testMode: !userId || userId === 'test-user-id'
      });
    } catch (error) {
      console.error('Error initializing subscription payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'initialisation du paiement'
      });
    }
  }

  /**
   * Traiter le retour de paiement
   */
  static async handlePaymentReturn(req, res) {
    try {
      const { status, payment_ref, merchant_order_id } = req.query;

      if (!merchant_order_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de commande manquant'
        });
      }

      // Extraire l'ID utilisateur de l'ID de commande
      const parts = merchant_order_id.split('_');
      if (parts.length < 3 || parts[0] !== 'sub') {
        return res.status(400).json({
          success: false,
          message: 'Format d\'ID de commande invalide'
        });
      }

      const userId = parts[1];
      const user = await User.findById(userId).lean();
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur introuvable'
        });
      }

      // Vérifier le statut du paiement
      if (status === 'success' || status === 'paid') {
        // Récupérer le plan
        const plan = await Plan.findById(user.subscription.planId).lean();
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Plan introuvable'
          });
        }

        // Calculer la date d'expiration
        const now = new Date();
        const expiresAt = new Date(now);
        if (plan.interval === 'year') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Mettre à jour l'abonnement
        await User.findByIdAndUpdate(userId, {
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': expiresAt,
          'subscription.konnectStatus': status
        });

        // Accorder l'accès selon le plan
        if (plan.type === 'global') {
          // Accès global - accorder l'accès à tous les parcours
          const paths = await require('../models/Path').find().lean();
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
          const paths = await require('../models/Path').find({ category: plan.targetId }).lean();
          for (const path of paths) {
            await CourseAccessService.grantAccess(userId, path._id, 'subscription', {
              canView: true,
              canInteract: true,
              canDownload: true,
              expiresAt: expiresAt
            });
          }
        }

        return res.json({
          success: true,
          message: 'Paiement confirmé avec succès',
          subscription: {
            status: 'active',
            planId: plan._id,
            planName: plan.name,
            expiresAt: expiresAt
          }
        });
      } else {
        // Paiement échoué
        await User.findByIdAndUpdate(userId, {
          'subscription.status': 'failed',
          'subscription.konnectStatus': status
        });

        return res.json({
          success: false,
          message: 'Paiement échoué',
          status: status
        });
      }
    } catch (error) {
      console.error('Error handling payment return:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du traitement du paiement'
      });
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  static async checkPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId).lean();
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur introuvable'
        });
      }

      return res.json({
        success: true,
        subscription: user.subscription,
        message: 'Statut récupéré avec succès'
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du statut'
      });
    }
  }

  /**
   * Annuler un abonnement
   */
  static async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur introuvable'
        });
      }

      if (!user.subscription || user.subscription.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Aucun abonnement actif à annuler'
        });
      }

      // Marquer l'abonnement pour annulation à la fin de la période
      await User.findByIdAndUpdate(userId, {
        'subscription.cancelAtPeriodEnd': true
      });

      return res.json({
        success: true,
        message: 'Abonnement programmé pour annulation',
        subscription: user.subscription
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'annulation de l\'abonnement'
      });
    }
  }
}

module.exports = SubscriptionPaymentController;
