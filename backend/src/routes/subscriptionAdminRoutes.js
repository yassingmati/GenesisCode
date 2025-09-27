// src/routes/subscriptionAdminRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // à adapter si ton modèle est différent
const adminCtrl = require('../controllers/subscriptionAdminController');

const router = express.Router();

function getTokenFromReq(req) {
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

const adminProtect = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ success: false, message: 'Token admin manquant. Connectez-vous.' });

    const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_ADMIN_SECRET ou JWT_SECRET non défini.');
      return res.status(500).json({ success: false, message: 'Configuration serveur manquante' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.warn('JWT verification failed for admin token:', err && err.message ? err.message : err);
      return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }

    const admin = await Admin.findById(decoded.id).lean().exec();
    if (!admin) return res.status(401).json({ success: false, message: 'Admin introuvable pour ce token' });

    req.admin = { id: admin._id, email: admin.email, roles: admin.roles || [] };
    next();
  } catch (err) {
    console.error('adminProtect error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur (adminProtect)' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.admin) return res.status(403).json({ success: false, message: 'Accès admin requis' });
  next();
};

router.use(adminProtect, adminOnly);

router.get('/plans', adminCtrl.listPlans);
router.post('/plans', adminCtrl.createPlan);
router.get('/plans/:planId', adminCtrl.getPlan);
router.put('/plans/:planId', adminCtrl.updatePlan);
router.delete('/plans/:planId', adminCtrl.deletePlan);

router.get('/', adminCtrl.listSubscriptions);
router.get('/:userId', adminCtrl.getSubscriptionForUser);
router.put('/:userId/change-plan', adminCtrl.changePlan);
router.post('/:userId/cancel', adminCtrl.cancelSubscription);
router.post('/:userId/resume', adminCtrl.resumeSubscription);
router.get('/:userId/billing-portal', adminCtrl.openBillingPortal);

module.exports = router;
