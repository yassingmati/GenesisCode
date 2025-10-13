// src/routes/reportsRoutes.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { protect } = require('../middlewares/authMiddleware');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les rapports détaillés
router.get('/children/:childId/detailed', catchErrors(reportsController.generateDetailedReport));
router.get('/children/:childId/analytics', catchErrors(reportsController.getAdvancedAnalytics));

// Routes pour les comparaisons multi-enfants
router.get('/comparison', catchErrors(reportsController.getMultiChildComparison));

module.exports = router;
