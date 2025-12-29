// src/controllers/admin/subscriptionAdminController.js
const User = require('../models/User');
const Plan = require('../models/Plan');

function computePeriodEnd(interval, fromDate = new Date()) {
  const d = new Date(fromDate);
  if (interval === 'year' || interval === 'annual') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

/* Plans CRUD */
exports.listPlans = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', active } = req.query;
    const q = {};
    if (active === 'true') q.active = true;
    if (active === 'false') q.active = false;
    if (search) q.$or = [{ _id: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];

    const p = Math.max(1, parseInt(page, 10));
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (p - 1) * lim;

    const [total, plans] = await Promise.all([
      Plan.countDocuments(q),
      Plan.find(q).sort({ priceMonthly: -1, _id: 1 }).skip(skip).limit(lim).lean().exec()
    ]);

    return res.json({ plans, page: p, totalPages: Math.max(1, Math.ceil(total / lim)), total });
  } catch (err) {
    console.error('listPlans error', err);
    return res.status(500).json({ message: 'Erreur liste plans' });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId).lean().exec();
    if (!plan) return res.status(404).json({ message: 'Plan introuvable' });
    return res.json({ plan });
  } catch (err) {
    console.error('getPlan error', err);
    return res.status(500).json({ message: 'Erreur lecture plan' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { _id, name, description = '', features = [], priceCents = null, currency = 'TND', interval = 'month', active = true, type = 'global', targetId = null, allowedPaths = [] } = req.body;
    if (!String(_id || '').trim() || !name) return res.status(400).json({ message: 'plan _id et name sont requis' });

    const exists = await Plan.findById(_id).lean().exec();
    if (exists) return res.status(409).json({ message: 'Plan déjà existant. Utilisez PUT pour mettre à jour.' });

    // Validation basique
    if ((type === 'Category' || type === 'Path') && !targetId) {
      return res.status(400).json({ message: 'targetId est requis pour les plans de type Category ou Path' });
    }

    const planData = {
      _id: String(_id),
      name,
      description,
      priceMonthly: priceCents ? Number(priceCents) : null,
      currency,
      interval,
      features: Array.isArray(features) ? features : [],
      active: !!active,
      type,       // 'global', 'Category', 'Path'
      targetId,   // ObjectId
      allowedPaths: Array.isArray(allowedPaths) ? allowedPaths : []
    };
    const created = await Plan.create(planData);
    return res.status(201).json({ message: 'Plan créé', plan: created });
  } catch (err) {
    console.error('createPlan error', err);
    return res.status(500).json({ message: 'Erreur création plan', error: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: 'Plan introuvable' });
    const updates = req.body || {};
    const allowed = ['name', 'description', 'priceMonthly', 'currency', 'interval', 'features', 'active', 'type', 'targetId', 'allowedPaths'];
    allowed.forEach(k => { if (typeof updates[k] !== 'undefined') plan[k] = updates[k]; });
    await plan.save();
    return res.json({ message: 'Plan mis à jour', plan });
  } catch (err) {
    console.error('updatePlan error', err);
    return res.status(500).json({ message: 'Erreur mise à jour plan', error: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const planId = req.params.planId;
    const hard = req.query.hard === 'true';
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan introuvable' });
    if (hard) { await plan.remove(); return res.json({ message: 'Plan supprimé définitivement' }); }
    plan.active = false;
    await plan.save();
    return res.json({ message: 'Plan désactivé (soft delete)', plan });
  } catch (err) {
    console.error('deletePlan error', err);
    return res.status(500).json({ message: 'Erreur suppression plan' });
  }
};

/* Subscriptions management (Users) */
const toUserSubscriptionView = (u) => ({
  _id: u._id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  planId: u.subscription?.planId || null,
  status: u.subscription?.status || null,
  currentPeriodEnd: u.subscription?.currentPeriodEnd || null,
  konnectPaymentId: u.subscription?.konnectPaymentId || null,
  konnectStatus: u.subscription?.konnectStatus || null,
  cancelAtPeriodEnd: !!u.subscription?.cancelAtPeriodEnd
});

exports.listSubscriptions = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 12, status } = req.query;
    const q = {
      $or: [
        { 'subscription.konnectPaymentId': { $exists: true, $ne: null } },
        { 'subscription.planId': { $exists: true, $ne: null } }
      ]
    };

    if (search) {
      q.$or = q.$or.concat([
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { 'subscription.planId': new RegExp(search, 'i') }
      ]);
    }
    if (status) q['subscription.status'] = status;

    const p = Math.max(1, parseInt(page, 10));
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (p - 1) * lim;

    const [total, users] = await Promise.all([
      User.countDocuments(q),
      User.find(q).sort({ createdAt: -1 }).skip(skip).limit(lim).lean().exec()
    ]);

    const subscriptions = users.map(toUserSubscriptionView);
    return res.json({ subscriptions, page: p, totalPages: Math.max(1, Math.ceil(total / lim)), total });
  } catch (err) {
    console.error('listSubscriptions error:', err);
    return res.status(500).json({ message: 'Erreur lecture abonnements' });
  }
};

exports.getSubscriptionForUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean().exec();
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    return res.json({ user });
  } catch (err) {
    console.error('getSubscriptionForUser error', err);
    return res.status(500).json({ message: 'Erreur lecture utilisateur' });
  }
};

exports.changePlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ message: 'planId requis' });

    const plan = await Plan.findById(planId).lean().exec();
    if (!plan) return res.status(404).json({ message: 'Plan inconnu' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (!user.subscription) user.subscription = {};
    user.subscription.planId = plan._id;
    user.subscription.status = 'active';
    user.subscription.cancelAtPeriodEnd = false;
    user.subscription.currentPeriodEnd = computePeriodEnd(plan.interval || 'month');

    await user.save();
    return res.json({ message: 'Plan mis à jour (local)', subscription: user.subscription });
  } catch (err) {
    console.error('changePlan error:', err);
    return res.status(500).json({ message: 'Erreur changement plan', error: err.message || err });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (!user.subscription || (!user.subscription.planId && !user.subscription.konnectPaymentId)) {
      return res.status(400).json({ message: 'Pas d\'abonnement local à annuler' });
    }

    user.subscription.cancelAtPeriodEnd = true;
    user.subscription.status = 'canceled';
    if (!user.subscription.currentPeriodEnd) user.subscription.currentPeriodEnd = new Date();

    await user.save();
    return res.json({ message: 'Annulation programmée (local)', subscription: user.subscription });
  } catch (err) {
    console.error('cancelSubscription error:', err);
    return res.status(500).json({ message: 'Erreur annulation' });
  }
};

exports.resumeSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (!user.subscription || (!user.subscription.planId && !user.subscription.konnectPaymentId)) {
      return res.status(400).json({ message: 'Pas d\'abonnement local à réactiver' });
    }

    user.subscription.cancelAtPeriodEnd = false;
    user.subscription.status = 'active';

    const plan = user.subscription.planId ? await Plan.findById(user.subscription.planId).lean().exec() : null;
    if (plan) {
      const now = new Date();
      if (!user.subscription.currentPeriodEnd || new Date(user.subscription.currentPeriodEnd) < now) {
        user.subscription.currentPeriodEnd = computePeriodEnd(plan.interval || 'month', now);
      }
    } else {
      if (!user.subscription.currentPeriodEnd) user.subscription.currentPeriodEnd = computePeriodEnd('month');
    }

    await user.save();
    return res.json({ message: 'Abonnement réactivé (local)', subscription: user.subscription });
  } catch (err) {
    console.error('resumeSubscription error:', err);
    return res.status(500).json({ message: 'Erreur réactivation' });
  }
};

exports.openBillingPortal = async (req, res) => {
  return res.status(400).json({ message: 'Billing portal non disponible : integration Stripe désactivée. Utiliser Konnect pay-links si besoin.' });
};
