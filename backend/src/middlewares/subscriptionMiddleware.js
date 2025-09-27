// src/middlewares/subscriptionMiddleware.js
const User = require('../models/User');

/**
 * requireSubscription(...allowedPlans)
 * - Vérifie que l'utilisateur connecté a un abonnement actif.
 * - Si allowedPlans fournis, vérifie que user.subscription.planId est dans la liste.
 *
 * Exemples:
 *   requireSubscription() => n'importe quel plan actif
 *   requireSubscription('pro') => uniquement plan 'pro'
 *   requireSubscription('basic','pro') => basic ou pro
 */
exports.requireSubscription = (...allowedPlans) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
      }

      const user = await User.findById(req.user.id).lean().exec();
      if (!user) return res.status(404).json({ success:false, message: 'Utilisateur introuvable' });

      const sub = user.subscription;
      if (!sub || !sub.status || sub.status !== 'active') {
        return res.status(403).json({ success:false, message: 'Abonnement requis' });
      }

      if (allowedPlans.length > 0) {
        // comparer en string; allowedPlans peut contenir ObjectIds ou strings
        const match = allowedPlans.map(String).includes(String(sub.planId));
        if (!match) {
          return res.status(403).json({ success:false, message: 'Plan insuffisant' });
        }
      }

      // ok
      req.currentUser = user; // utile plus tard dans la req
      next();
    } catch (err) {
      console.error('requireSubscription error:', err);
      return res.status(500).json({ success:false, message: 'Erreur serveur' });
    }
  };
};
