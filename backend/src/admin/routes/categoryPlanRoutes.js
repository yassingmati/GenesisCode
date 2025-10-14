// src/admin/routes/categoryPlanRoutes.js
const express = require('express');
const router = express.Router();
const CategoryPlanController = require('../controllers/categoryPlanController');
const authMiddleware = require('../../middlewares/authMiddleware');
const roleMiddleware = require('../../middlewares/roleMiddleware');

// Middleware d'authentification et de rôle admin
router.use(authMiddleware.protect);
router.use(roleMiddleware.requireAdmin);

// Routes pour la gestion des plans de catégories
router.get('/', CategoryPlanController.getAllCategoryPlans);
router.get('/stats', CategoryPlanController.getCategoryPlanStats);
router.get('/category/:categoryId', CategoryPlanController.getCategoryPlan);
router.post('/', CategoryPlanController.createCategoryPlan);
router.put('/:id', CategoryPlanController.updateCategoryPlan);
router.delete('/:id', CategoryPlanController.deleteCategoryPlan);
router.patch('/:id/toggle', CategoryPlanController.toggleCategoryPlanStatus);

module.exports = router;
