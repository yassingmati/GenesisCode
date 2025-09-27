// snippet extrait ou remplacer subscribe dans src/controllers/subscriptionController.js
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
    const { planId, returnUrl } = req.body;
    if (!userId) return res.status(401).json({ message: 'Non authentifié' });
    if (!planId) return res.status(400).json({ message: 'planId requis' });

    const plan = await Plan.findById(planId).lean().exec();
    if (!plan) return res.status(404).json({ message: 'Plan inconnu' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (!plan.priceMonthly || plan.priceMonthly <= 0) {
      // gratuit -> activer localement
      if (!user.subscription) user.subscription = {};
      user.subscription.planId = plan._id;
      user.subscription.status = 'active';
      user.subscription.cancelAtPeriodEnd = false;
      user.subscription.currentPeriodEnd = computePeriodEnd(plan.interval || 'month');
      await user.save();
      return res.json({ message: 'Abonnement activé (local)', subscription: user.subscription });
    }

    // Vérifier que initPayment est bien une fonction
    if (!initPayment || typeof initPayment !== 'function') {
      console.error('initPayment is not a function OR not exported correctly from konnectService. typeof:', typeof initPayment);
      return res.status(500).json({ message: 'Service de paiement non disponible' });
    }

    const merchantOrderId = `sub_${user._id}_${Date.now()}`;
    const amountCents = Number(plan.priceMonthly); // on suppose cents
    const return_url = returnUrl || `${process.env.APP_BASE_URL || 'http://localhost:3000'}/payments/konnect-return`;

    let initResult;
    try {
      initResult = await initPayment({
        amountCents,
        currency: plan.currency || 'TND',
        returnUrl: return_url,
        merchantOrderId,
        description: `Abonnement ${plan._id} pour ${user.email}`,
        customerEmail: user.email,
      });
    } catch (err) {
      console.error('Konnect initPayment error:', err && err.message ? err.message : err, err && err.detail ? err.detail : '');
      return res.status(500).json({ message: 'Erreur initialisation paiement', error: err.message || err });
    }

    // Persister état local "incomplete/pending"
    if (!user.subscription) user.subscription = {};
    user.subscription.planId = plan._id;
    user.subscription.status = 'incomplete';
    user.subscription.konnectPaymentId = initResult.konnectPaymentId || null;
    user.subscription.konnectStatus = 'pending';
    user.subscription.currentPeriodEnd = computePeriodEnd(plan.interval || 'month');
    await user.save();

    return res.json({
      message: 'Paiement créé. Rediriger l’utilisateur vers paymentUrl',
      paymentUrl: initResult.paymentUrl,
      konnect: { id: initResult.konnectPaymentId, raw: initResult.raw }
    });
  } catch (err) {
    console.error('subscribe error:', err);
    return res.status(500).json({ message: 'Erreur souscription', error: err.message });
  }
};
