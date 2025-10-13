// src/routes/subscriptionPayment.js
const express = require('express');
const router = express.Router();
const SubscriptionPaymentController = require('../controllers/subscriptionPaymentController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

// Route publique pour l'initialisation du paiement (pour les tests)
router.post('/init', optionalAuth, SubscriptionPaymentController.initSubscriptionPayment);

// Routes protégées
router.use(protect);

// Paiement d'abonnement
router.get('/status/:paymentId', SubscriptionPaymentController.checkPaymentStatus);
router.post('/cancel', SubscriptionPaymentController.cancelSubscription);

// Route publique pour le retour de paiement
router.get('/return', SubscriptionPaymentController.handlePaymentReturn);

module.exports = router;
