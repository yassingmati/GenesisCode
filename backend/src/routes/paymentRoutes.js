// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');
const { requireActiveSubscription } = require('../middlewares/subscriptionMiddleware');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes publiques (sans authentification)
router.post('/init', optionalAuth, catchErrors(PaymentController.initSubscriptionPayment));
router.get('/webhook', catchErrors(PaymentController.handleKonnectWebhook));

// Routes protégées
router.use(protect);

// Vérifier le statut d'un paiement
router.get('/status/:paymentId', catchErrors(PaymentController.checkPaymentStatus));

// Historique des paiements
router.get('/history', catchErrors(PaymentController.getPaymentHistory));

module.exports = router;






