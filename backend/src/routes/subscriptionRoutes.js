// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();

let subscriptionCtrl = null;
let authMiddleware = null;
let userProtect = null;

try {
  subscriptionCtrl = require('../controllers/subscriptionController');
} catch (err) {
  console.error('Erreur require subscriptionController:', err && err.message ? err.message : err);
}

try {
  authMiddleware = require('../middlewares/authMiddleware');
  userProtect = authMiddleware && (authMiddleware.userProtect || authMiddleware.protect);
} catch (err) {
  console.warn('Impossible de require ../middlewares/authMiddleware:', err && err.message ? err.message : err);
  userProtect = undefined;
}

function ensureHandler(name) {
  const fn = subscriptionCtrl && subscriptionCtrl[name];
  if (typeof fn === 'function') return fn;
  return (req, res) => {
    console.error(`Missing handler: subscriptionController.${name} (type: ${typeof fn})`);
    return res.status(500).json({ success: false, message: `Handler manquant: ${name}` });
  };
}

function ensureUserProtect() {
  if (typeof userProtect === 'function') return userProtect;
  return (req, res) => {
    console.error('userProtect middleware introuvable ou non exporté correctement.');
    return res.status(500).json({ success: false, message: 'Middleware auth manquant sur le serveur' });
  };
}

console.log('subscriptionController loaded:', !!subscriptionCtrl);
if (subscriptionCtrl) console.log('Available handlers:', Object.keys(subscriptionCtrl));
console.log('userProtect available:', typeof userProtect === 'function');

router.get('/plans', ensureHandler('listPublicPlans'));

const protect = ensureUserProtect();
router.get('/me', protect, ensureHandler('getMySubscription'));
router.post('/subscribe', protect, ensureHandler('subscribe'));
router.post('/change-plan', protect, ensureHandler('changePlan'));
router.post('/cancel', protect, ensureHandler('cancel'));
router.post('/resume', protect, ensureHandler('resume'));

module.exports = router;
