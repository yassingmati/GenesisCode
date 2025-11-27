// src/controllers/subscriptionController.js
const { initPayment } = require('../services/konnectService');
const Plan = require('../models/Plan');
const User = require('../models/User');

function computePeriodEnd(interval, fromDate = new Date()) {
  const d = new Date(fromDate);
  if (interval === 'year' || interval === 'annual') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

exports.subscribe = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { planId, returnUrl, childId } = req.body;
    let targetUserId = userId;

    // Validation des paramètres
    if (!userId) {
      console.warn('Subscribe: Utilisateur non authentifié');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    // Si un childId est fourni, vérifier que le parent a le droit
    if (childId) {
      const child = await User.findOne({ _id: childId, parentAccount: userId });
      if (!child) {
        console.warn('Subscribe: Tentative d\'abonnement pour un enfant non autorisé', { userId, childId });
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à gérer cet enfant'
        });
      }
      targetUserId = childId;
      console.log('Subscribe: Abonnement pour le compte enfant', { parentId: userId, childId: targetUserId });
    }

    if (!planId) {
      console.warn('Subscribe: planId manquant', { userId: targetUserId });
      return res.status(400).json({
        success: false,
        message: 'planId requis'
      });
    }

    // Validation du plan
    const plan = await Plan.findById(planId).lean().exec();
    if (!plan) {
      console.warn('Subscribe: Plan introuvable', { planId, userId: targetUserId });
      return res.status(404).json({
        success: false,
        message: 'Plan introuvable'
      });
    }

    if (!plan.active) {
      console.warn('Subscribe: Plan inactif', { planId, userId: targetUserId });
      return res.status(400).json({
        success: false,
        message: 'Plan inactif'
      });
    }

    // Validation de l'utilisateur cible
    const user = await User.findById(targetUserId);
    if (!user) {
      console.warn('Subscribe: Utilisateur cible introuvable', { userId: targetUserId });
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Vérifier qu'il n'y a pas déjà un abonnement actif
    if (user.subscription && user.subscription.status === 'active' &&
      user.subscription.currentPeriodEnd &&
      new Date(user.subscription.currentPeriodEnd) > new Date()) {
      console.warn('Subscribe: Abonnement actif existe déjà', { userId, currentPlanId: user.subscription.planId });
      return res.status(400).json({
        success: false,
        message: 'Un abonnement actif existe déjà',
        currentSubscription: user.subscription
      });
    }

    // Gestion des plans gratuits
    if (!plan.priceMonthly || plan.priceMonthly <= 0) {
      console.log('Subscribe: Activation plan gratuit', { planId, userId });

      if (!user.subscription) user.subscription = {};
      user.subscription.planId = plan._id.toString();
      user.subscription.status = 'active';
      user.subscription.cancelAtPeriodEnd = false;
      user.subscription.currentPeriodEnd = computePeriodEnd(plan.interval || 'month');
      user.subscription.konnectPaymentId = null;
      user.subscription.konnectStatus = null;

      await user.save();

      console.log('Subscribe: Plan gratuit activé avec succès', { planId, userId });

      return res.json({
        success: true,
        message: 'Abonnement activé (gratuit)',
        subscription: user.subscription
      });
    }

    // Gestion des plans payants - Vérifier que initPayment est disponible
    if (!initPayment || typeof initPayment !== 'function') {
      console.error('Subscribe: initPayment non disponible', {
        type: typeof initPayment,
        userId,
        planId
      });
      return res.status(500).json({
        success: false,
        message: 'Service de paiement non disponible'
      });
    }

    // Préparer les paramètres de paiement
    const merchantOrderId = `sub_${user._id}_${Date.now()}`;
    const amountCents = Number(plan.priceMonthly);

    if (isNaN(amountCents) || amountCents <= 0) {
      console.error('Subscribe: Montant invalide', { amountCents, planId, userId });
      return res.status(400).json({
        success: false,
        message: 'Montant du plan invalide'
      });
    }

    const return_url = returnUrl || `${process.env.APP_BASE_URL || 'http://localhost:3000'}/payments/konnect-return`;

    console.log('Subscribe: Initialisation paiement Konnect', {
      planId,
      userId,
      amountCents,
      currency: plan.currency || 'TND',
      merchantOrderId
    });

    // Initialiser le paiement avec Konnect
    let initResult;
    try {
      initResult = await initPayment({
        amountCents,
        currency: plan.currency || 'TND',
        returnUrl: return_url,
        merchantOrderId,
        description: `Abonnement ${plan.name || plan._id} pour ${user.email}`,
        customerEmail: user.email,
      });

      if (!initResult || !initResult.paymentUrl) {
        throw new Error('initPayment n\'a pas retourné de paymentUrl');
      }

      console.log('Subscribe: Paiement Konnect initialisé avec succès', {
        konnectPaymentId: initResult.konnectPaymentId,
        merchantOrderId
      });
    } catch (err) {
      console.error('Subscribe: Erreur initialisation paiement Konnect', {
        error: err.message,
        detail: err.detail,
        stack: err.stack,
        userId,
        planId
      });
      return res.status(500).json({
        success: false,
        message: 'Erreur initialisation paiement',
        error: err.message || 'Erreur inconnue'
      });
    }

    // Persister l'état "incomplete/pending" dans l'abonnement utilisateur
    if (!user.subscription) user.subscription = {};
    user.subscription.planId = plan._id.toString();
    user.subscription.status = 'incomplete';
    user.subscription.konnectPaymentId = initResult.konnectPaymentId || null;
    user.subscription.konnectStatus = 'pending';
    user.subscription.currentPeriodEnd = computePeriodEnd(plan.interval || 'month');
    user.subscription.cancelAtPeriodEnd = false;

    await user.save();

    console.log('Subscribe: Abonnement en attente de paiement créé', {
      userId,
      planId,
      konnectPaymentId: initResult.konnectPaymentId
    });

    return res.json({
      success: true,
      message: 'Paiement créé. Rediriger l\'utilisateur vers paymentUrl',
      paymentUrl: initResult.paymentUrl,
      konnect: {
        id: initResult.konnectPaymentId,
        raw: initResult.raw
      }
    });
  } catch (err) {
    console.error('Subscribe: Erreur inattendue', {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id
    });
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la souscription',
      error: err.message
    });
  }
};

// Liste des plans publics
exports.listPublicPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ active: true }).sort({ priceMonthly: 1 }).lean().exec();
    console.log('listPublicPlans: Plans récupérés', { count: plans.length });
    res.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan._id,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features || []
      })),
      message: 'Plans récupérés avec succès'
    });
  } catch (err) {
    console.error('listPublicPlans error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plans',
      error: err.message
    });
  }
};

// Récupérer l'abonnement de l'utilisateur
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      console.warn('getMySubscription: Utilisateur non authentifié');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const user = await User.findById(userId).select('subscription').lean();
    if (!user) {
      console.warn('getMySubscription: Utilisateur introuvable', { userId });
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    console.log('getMySubscription: Abonnement récupéré', {
      userId,
      hasSubscription: !!user.subscription,
      status: user.subscription?.status
    });

    res.json({
      success: true,
      subscription: user.subscription || null,
      message: user.subscription ? 'Abonnement récupéré avec succès' : 'Aucun abonnement actif'
    });
  } catch (err) {
    console.error('getMySubscription error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'abonnement',
      error: err.message
    });
  }
};

// Changer de plan
exports.changePlan = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const { planId } = req.body;

    if (!userId) {
      console.warn('changePlan: Utilisateur non authentifié');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    if (!planId) {
      console.warn('changePlan: planId manquant', { userId });
      return res.status(400).json({
        success: false,
        message: 'planId requis'
      });
    }

    const plan = await Plan.findById(planId).lean().exec();
    if (!plan) {
      console.warn('changePlan: Plan introuvable', { planId, userId });
      return res.status(404).json({
        success: false,
        message: 'Plan introuvable'
      });
    }

    if (!plan.active) {
      console.warn('changePlan: Plan inactif', { planId, userId });
      return res.status(400).json({
        success: false,
        message: 'Plan inactif'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn('changePlan: Utilisateur introuvable', { userId });
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    // Mettre à jour le plan
    if (!user.subscription) user.subscription = {};
    user.subscription.planId = plan._id.toString();
    user.subscription.status = 'active';
    user.subscription.currentPeriodEnd = computePeriodEnd(plan.interval || 'month');
    user.subscription.cancelAtPeriodEnd = false;

    await user.save();

    console.log('changePlan: Plan modifié avec succès', { userId, planId });

    res.json({
      success: true,
      message: 'Plan modifié avec succès',
      subscription: user.subscription
    });
  } catch (err) {
    console.error('changePlan error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de plan',
      error: err.message
    });
  }
};

// Annuler l'abonnement
exports.cancel = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      console.warn('cancel: Utilisateur non authentifié');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn('cancel: Utilisateur introuvable', { userId });
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    if (!user.subscription || user.subscription.status !== 'active') {
      console.warn('cancel: Aucun abonnement actif', { userId });
      return res.status(400).json({
        success: false,
        message: 'Aucun abonnement actif'
      });
    }

    user.subscription.cancelAtPeriodEnd = true;
    user.subscription.canceledAt = new Date();
    await user.save();

    console.log('cancel: Abonnement annulé avec succès', {
      userId,
      effectiveEndDate: user.subscription.currentPeriodEnd
    });

    res.json({
      success: true,
      message: 'Annulation programmée avec succès',
      cancellationDate: user.subscription.canceledAt,
      effectiveEndDate: user.subscription.currentPeriodEnd
    });
  } catch (err) {
    console.error('cancel error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de l\'abonnement',
      error: err.message
    });
  }
};

// Reprendre l'abonnement
exports.resume = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      console.warn('resume: Utilisateur non authentifié');
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn('resume: Utilisateur introuvable', { userId });
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    if (!user.subscription) {
      console.warn('resume: Aucun abonnement trouvé', { userId });
      return res.status(400).json({
        success: false,
        message: 'Aucun abonnement trouvé'
      });
    }

    if (!user.subscription.cancelAtPeriodEnd) {
      console.warn('resume: Abonnement non en attente d\'annulation', { userId });
      return res.status(400).json({
        success: false,
        message: 'Aucun abonnement à reprendre'
      });
    }

    user.subscription.cancelAtPeriodEnd = false;
    user.subscription.canceledAt = null;
    user.subscription.status = 'active';
    await user.save();

    console.log('resume: Abonnement repris avec succès', { userId });

    res.json({
      success: true,
      message: 'Abonnement repris avec succès',
      subscription: user.subscription
    });
  } catch (err) {
    console.error('resume error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la reprise de l\'abonnement',
      error: err.message
    });
  }
};