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
        // TODO: Implémenter sendSubscriptionConfirmationEmail dans emailService
        // await sendSubscriptionConfirmationEmail(subscription.user.email, subscription.plan.name);
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