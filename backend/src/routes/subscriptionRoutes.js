// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const subscriptionController = require('../controllers/subscriptionController');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Routes Publiques ---

/**
 * Obtenir les plans d'abonnement publics
 */
router.get('/plans', catchErrors(subscriptionController.listPublicPlans));

/**
 * Obtenir les plans pour un parcours spécifique
 */
router.get('/plans/path/:pathId', catchErrors(subscriptionController.getPlansForPath));

/**
 * Retour de paiement Konnect (Callback)
 * Cette route est appelée par le frontend ou Konnect après le paiement
 */
router.get('/payment/return', catchErrors(subscriptionController.handlePaymentReturn));


// --- Routes Protégées ---
router.use(protect);

/**
 * Obtenir mes abonnements
 */
router.get('/me', catchErrors(subscriptionController.getMySubscriptions));

/**
 * S'abonner à un plan (Gratuit ou Payant)
 */
router.post('/subscribe', catchErrors(subscriptionController.subscribe));

/**
 * Annuler un abonnement spécifique
 */
router.post('/cancel', catchErrors(subscriptionController.cancelSubscription));

/**
 * Télécharger une facture
 */
const invoiceController = require('../controllers/invoiceController');
router.get('/invoices/:subscriptionId', catchErrors(invoiceController.generateInvoice));

module.exports = router;