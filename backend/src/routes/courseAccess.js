// src/routes/courseAccess.js
const express = require('express');
const router = express.Router();
const CourseAccessController = require('../controllers/courseAccessController');
const { protect } = require('../middlewares/authMiddleware');

// Routes publiques (doivent être avant le middleware protect)
router.get('/plans', CourseAccessController.getAllPlans);
router.get('/plans/path/:pathId', CourseAccessController.getAvailablePlans);

// Routes protégées
router.use(protect);

// Vérification d'accès
router.get('/check/path/:pathId', CourseAccessController.checkPathAccess);
router.get('/check/path/:pathId/level/:levelId', CourseAccessController.checkLevelAccess);

// Gestion de l'accès
router.post('/initialize-free', CourseAccessController.initializeFreeAccess);
router.get('/history', CourseAccessController.getUserAccessHistory);
router.get('/stats', CourseAccessController.getAccessStats);

// Routes admin (à protéger avec un middleware admin)
router.post('/grant', CourseAccessController.grantAccess);

module.exports = router;
