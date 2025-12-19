// src/controllers/subscriptionController.js
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const PromoCode = require('../models/PromoCode');
const konnectPaymentService = require('../services/konnectPaymentService');
const { sendEmail } = require('../utils/emailService'); // Assurez-vous que cette fonction existe ou adaptez

// Fonction utilitaire pour calculer la fin de période
function computePeriodEnd(interval, fromDate = new Date()) {
  const d = new Date(fromDate);
  if (interval === 'year' || interval === 'annual') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * S'abonner à un plan (Supporte Multi-Abonnements & Codes Promo)
 */
exports.subscribe = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { planId, promoCode, returnUrl, childId } = req.body;
    let targetUserId = userId;

    if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié' });

    // Gestion compte enfant
    if (childId) {
      const child = await User.findOne({ _id: childId, parentAccount: userId });
      if (!child) return res.status(403).json({ success: false, message: 'Non autorisé à gérer cet enfant' });
      targetUserId = childId;
    }

    if (!planId) return res.status(400).json({ success: false, message: 'planId requis' });

    // 1. Validation du Plan
    const plan = await Plan.findById(planId).lean();
    if (!plan || !plan.active) return res.status(404).json({ success: false, message: 'Plan introuvable ou inactif' });

    // 2. Vérifier si l'utilisateur a DÉJÀ ce plan actif
    const existingSub = await Subscription.findOne({
      user: targetUserId,
      plan: planId,
      status: 'active',
      currentPeriodEnd: { $gt: new Date() }
    });

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà un abonnement actif pour ce plan.',
        subscription: existingSub
      });
    }

    // 3. Gestion du Code Promo
    let finalPrice = plan.priceMonthly || 0;
    let appliedPromo = null;

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), active: true });
      if (promo && promo.isValid()) {
        // Vérifier si applicable à ce plan
        if (promo.applicablePlans && promo.applicablePlans.length > 0 && !promo.applicablePlans.includes(planId)) {
          // Code valide mais pas pour ce plan
        } else {
          appliedPromo = promo;
          if (promo.type === 'percentage') {
            finalPrice = finalPrice - (finalPrice * (promo.value / 100));
          } else if (promo.type === 'fixed_amount') {
            finalPrice = Math.max(0, finalPrice - promo.value); // Pas de prix négatif
          }
          finalPrice = Math.round(finalPrice); // Arrondir si besoin
        }
      }
    }

    // 4. Création de l'objet Subscription (Pending)
    const subscriptionData = {
      user: targetUserId,
      plan: planId,
      promoCode: appliedPromo ? appliedPromo._id : null,
      status: 'pending',
      currentPeriodStart: new Date(),
      currentPeriodEnd: computePeriodEnd(plan.interval || 'month'),
      autoRenew: true
    };

    // 5. Cas Gratuit (Prix 0 ou 100% remise)
    if (finalPrice <= 0) {
      subscriptionData.status = 'active';
      subscriptionData.paymentHistory = [{
        amount: 0,
        currency: plan.currency || 'TND',
        status: 'free',
        paidAt: new Date(),
        periodStart: new Date(),
        periodEnd: subscriptionData.currentPeriodEnd
      }];

      const newSub = await Subscription.create(subscriptionData);

      // Incrémenter usage promo
      if (appliedPromo) {
        await PromoCode.findByIdAndUpdate(appliedPromo._id, { $inc: { usedCount: 1 } });
      }

      // Mettre à jour le User (Legacy support + Virtual populate)
      // On ne met plus à jour user.subscription directement sauf pour compatibilité temporaire
      await User.findByIdAndUpdate(targetUserId, {
        $set: { 'subscription.status': 'active', 'subscription.planId': planId } // Legacy
      });

      return res.json({
        success: true,
        message: 'Abonnement activé (gratuit)',
        subscription: newSub
      });
    }

    // 6. Cas Payant - Initialisation Konnect
    const merchantOrderId = `sub_${targetUserId}_${Date.now()}`;
    const paymentConfig = {
      amountCents: finalPrice,
      currency: plan.currency || 'TND',
      returnUrl: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payments/konnect-return`,
      merchantOrderId,
      description: `Abonnement ${plan.name}`,
      customerEmail: req.user.email,
      metadata: {
        planId,
        userId: targetUserId,
        promoCodeId: appliedPromo ? appliedPromo._id : null
      }
    };

    const paymentResult = await konnectPaymentService.initPayment(paymentConfig);

    // Sauvegarder l'abonnement en attente avec ID de paiement
    subscriptionData.konnectPaymentId = paymentResult.konnectPaymentId;
    subscriptionData.konnectStatus = 'pending';

    const newSub = await Subscription.create(subscriptionData);

    return res.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      subscriptionId: newSub._id,
      message: 'Paiement initialisé'
    });

  } catch (err) {
    console.error('Subscribe Error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la souscription', error: err.message });
  }
};

/**
 * Gérer le retour de paiement (Validation Serveur-à-Serveur)
 */
exports.handlePaymentReturn = async (req, res) => {
  try {
    const { payment_ref } = req.query;

    if (!payment_ref) {
      return res.status(400).json({ success: false, message: 'Référence de paiement manquante' });
    }

    // 1. Vérification DIRECTE auprès de Konnect (Sécurité)
    const paymentStatus = await konnectPaymentService.checkPaymentStatus(payment_ref);

    // 2. Trouver l'abonnement correspondant
    const subscription = await Subscription.findOne({ konnectPaymentId: payment_ref }).populate('user plan');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Abonnement introuvable pour ce paiement' });
    }

    // 3. Mise à jour selon le statut RÉEL
    if (paymentStatus.status === 'completed' || paymentStatus.status === 'paid') {
      if (subscription.status !== 'active') {
        subscription.status = 'active';
        subscription.konnectStatus = paymentStatus.status;
        subscription.paymentHistory.push({
          konnectPaymentId: payment_ref,
          amount: paymentStatus.amount,
          currency: paymentStatus.currency,
          status: paymentStatus.status,
          paidAt: new Date(),
          periodStart: new Date(),
          periodEnd: subscription.currentPeriodEnd
        });

        await subscription.save();

        // Incrémenter usage promo si présent
        if (subscription.promoCode) {
          await PromoCode.findByIdAndUpdate(subscription.promoCode, { $inc: { usedCount: 1 } });
        }

        // Envoyer Email de Confirmation
        const { sendSubscriptionConfirmationEmail } = require('../utils/emailService');
        await sendSubscriptionConfirmationEmail(
          subscription.user.email,
          subscription.plan.name,
          paymentStatus.amount,
          paymentStatus.currency
        );
      }

      return res.json({
        success: true,
        message: 'Paiement validé et abonnement activé',
        subscription
      });
    } else {
      // Paiement échoué ou en attente
      subscription.konnectStatus = paymentStatus.status;
      if (['failed', 'cancelled', 'expired'].includes(paymentStatus.status)) {
        subscription.status = 'canceled';
      }
      await subscription.save();

      return res.json({
        success: false,
        message: 'Paiement non validé',
        status: paymentStatus.status
      });
    }

  } catch (err) {
    console.error('Payment Return Error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la validation du paiement' });
  }
};

/**
 * Récupérer mes abonnements
 */
exports.getMySubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer tous les abonnements (actifs et inactifs)
    const subscriptions = await Subscription.find({ user: userId })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Récupérer les abonnements d'un utilisateur spécifique (Pour Admin ou Parent)
 */
exports.getUserSubscriptions = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { userId } = req.params;

    // Vérification des droits
    // 1. Est-ce le user lui-même ?
    if (requesterId === userId) {
      // ok
    }
    // 2. Est-ce un admin ?
    else if (req.user.role === 'admin') {
      // ok
    }
    // 3. Est-ce un parent de ce user ?
    else {
      // On vérifie le lien parent/enfant
      const child = await User.findOne({ _id: userId, parentAccount: requesterId });
      // Ou peut-être via la collection ParentChild ?
      // Le modèle User a souvent parentAccount directement s'il a été invité.
      // Vérifions aussi via ParentChild si nécessaire, mais commençons par User.parentAccount
      if (!child) {
        // Essayons la collection ParentChild si le modèle User ne suffit pas
        // const relation = await require('../models/ParentChild').findOne({ parent: requesterId, child: userId, status: 'active' });
        // if (!relation) return res.status(403).json({ success: false, message: 'Non autorisé' });
        // Pour l'instant, supposons que parentAccount est peuplé ou qu'on est admin.
        // Si le fetchUser echoue, on bloque.
        return res.status(403).json({ success: false, message: 'Non autorisé' });
      }
    }

    const subscriptions = await Subscription.find({ user: userId })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
    });
  } catch (err) {
    console.error('getUserSubscriptions Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Annuler un abonnement spécifique
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    const sub = await Subscription.findOne({ _id: subscriptionId, user: userId });
    if (!sub) return res.status(404).json({ success: false, message: 'Abonnement introuvable' });

    sub.cancelAtPeriodEnd = true;
    sub.canceledAt = new Date();
    await sub.save();

    res.json({ success: true, message: 'Abonnement annulé (finira à la fin de la période)', subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Garder les anciennes méthodes si nécessaire pour compatibilité, ou les rediriger
exports.listPublicPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ active: true }).sort({ priceMonthly: 1 }).lean();
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Obtenir les plans pour un parcours spécifique (basé sur la catégorie)
 */
exports.getPlansForPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    // Lazy load Path model to avoid circular dependencies if any
    const Path = require('../models/Path');

    const path = await Path.findById(pathId).populate('category');

    if (!path) {
      return res.status(404).json({ success: false, message: 'Parcours introuvable' });
    }

    if (!path.category) {
      // Fallback to all plans if no category linked
      return exports.listPublicPlans(req, res);
    }

    const categoryName = path.category.translations?.fr?.name;

    if (!categoryName) {
      return exports.listPublicPlans(req, res);
    }

    // Find plan matching the category name
    // Since we created plans with exact category names, this should work.
    // We also include a fallback regex search.
    const plans = await Plan.find({
      $or: [
        { name: categoryName },
        { name: { $regex: new RegExp(`^${categoryName}$`, 'i') } }
      ],
      active: true
    }).lean();

    if (plans.length === 0) {
      // Fallback to all plans if specific plan not found
      return exports.listPublicPlans(req, res);
    }

    res.json({ success: true, plans });
  } catch (err) {
    console.error('getPlansForPath Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * ADMIN: Récupérer tous les abonnements (avec filtres)
 */
exports.getAllSubscriptionsAdmin = async (req, res) => {
  try {
    const { status, planId, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (planId) filter.plan = planId;

    // Si recherche par email utilisateur
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      filter.user = { $in: users.map(u => u._id) };
    }

    const subscriptions = await Subscription.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('plan', 'name priceMonthly currency')
      .sort({ createdAt: -1 })
      .limit(100); // Limite pour éviter la surcharge

    res.json({ success: true, subscriptions });
  } catch (err) {
    console.error('getAllSubscriptionsAdmin Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * ADMIN: Annuler un abonnement utilisateur
 */
exports.cancelSubscriptionAdmin = async (req, res) => {
  try {
    const { subscriptionId, immediate } = req.body;

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return res.status(404).json({ success: false, message: 'Abonnement introuvable' });

    if (immediate) {
      sub.status = 'canceled';
      sub.canceledAt = new Date();
      sub.cancelAtPeriodEnd = false; // Annulation immédiate
    } else {
      sub.cancelAtPeriodEnd = true;
      sub.canceledAt = new Date();
    }

    await sub.save();
    /**
     * Vérifier un code promo
     */
    exports.verifyPromoCode = async (req, res) => {
      try {
        const { code, planId } = req.body;
        if (!code) return res.status(400).json({ success: false, message: 'Code requis' });

        const promo = await PromoCode.findOne({ code: code.toUpperCase(), active: true });

        // Check basic validity
        if (!promo) {
          return res.status(400).json({ success: false, message: 'Code invalide' });
        }

        // Check expiry/limits (Assuming isValid logic matches subscribe method)
        if (promo.validUntil && new Date() > promo.validUntil) {
          return res.status(400).json({ success: false, message: 'Code expiré' });
        }
        if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
          return res.status(400).json({ success: false, message: 'Code épuisé' });
        }

        // Check plan applicability
        if (promo.applicablePlans && promo.applicablePlans.length > 0 && planId) {
          if (!promo.applicablePlans.map(id => id.toString()).includes(planId)) {
            return res.status(400).json({ success: false, message: 'Ce code ne s\'applique pas à ce plan' });
          }
        }

        res.json({
          success: true,
          promo: {
            id: promo._id,
            code: promo.code,
            type: promo.type,
            value: promo.value
          }
        });

      } catch (err) {
        console.error('Verify Promo Error:', err);
        res.status(500).json({ success: false, message: err.message });
      }
    };
    res.json({ success: true, message: 'Abonnement annulé par admin', subscription: sub });
  } catch (err) {
    console.error('cancelSubscriptionAdmin Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};