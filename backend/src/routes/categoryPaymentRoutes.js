// src/routes/categoryPaymentRoutes.js
const express = require('express');
const router = express.Router();
const CategoryPaymentController = require('../controllers/categoryPaymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes publiques (doivent être avant le middleware protect)
// Pas de middleware d'authentification pour ces routes
router.get('/plans', (req, res, next) => {
  console.log('🔓 Route publique /plans appelée');
  console.log('🔓 URL:', req.originalUrl);
  console.log('🔓 Path:', req.path);
  console.log('🔓 Method:', req.method);
  next();
}, CategoryPaymentController.getCategoryPlans);

router.get('/plans/:categoryId', (req, res, next) => {
  console.log('📋 Route /plans/:categoryId appelée (publique)');
  next();
}, CategoryPaymentController.getCategoryPlan);

// Webhook Konnect (pas d'authentification requise)
router.post('/webhook/konnect', CategoryPaymentController.handleKonnectWebhook);

// Routes protégées
router.use(authMiddleware.protect);

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
