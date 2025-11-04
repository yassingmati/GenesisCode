// src/admin/routes/categoryPlanRoutes.js
const express = require('express');
const router = express.Router();
const CategoryPlanController = require('../controllers/categoryPlanController');
const { protectUserOrAdmin } = require('../../middlewares/flexibleAuthMiddleware');

// Middleware d'authentification pour toutes les routes admin
// Utilise protectUserOrAdmin pour accepter les tokens admin et user
router.use(protectUserOrAdmin);

// Routes pour la gestion des plans de catégories
router.get('/', CategoryPlanController.getAllCategoryPlans);
router.get('/stats', CategoryPlanController.getCategoryPlanStats);
router.get('/category/:categoryId', CategoryPlanController.getCategoryPlan);
router.post('/', CategoryPlanController.createCategoryPlan);
router.put('/:id', CategoryPlanController.updateCategoryPlan);
router.delete('/:id', CategoryPlanController.deleteCategoryPlan);
router.patch('/:id/toggle', CategoryPlanController.toggleCategoryPlanStatus);

module.exports = router;
