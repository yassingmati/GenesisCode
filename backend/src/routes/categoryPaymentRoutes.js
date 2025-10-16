// src/routes/categoryPaymentRoutes.js
const express = require('express');
const router = express.Router();
const CategoryPaymentController = require('../controllers/categoryPaymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes publiques
router.get('/plans', CategoryPaymentController.getCategoryPlans);
router.get('/plans/:categoryId', CategoryPaymentController.getCategoryPlan);

// Webhook Konnect (pas d'authentification requise)
router.post('/webhook/konnect', CategoryPaymentController.handleKonnectWebhook);

// Routes protégées
router.use(authMiddleware.authenticate);

// Paiement
router.post('/init-payment', CategoryPaymentController.initCategoryPayment);

// Vérification d'accès
router.get('/access/:categoryId/:pathId/:levelId', CategoryPaymentController.checkLevelAccess);
router.post('/unlock-level', CategoryPaymentController.unlockLevel);

// Historique
router.get('/history', CategoryPaymentController.getUserAccessHistory);

// Admin
router.post('/cleanup', CategoryPaymentController.cleanupExpiredAccesses);

module.exports = router;
