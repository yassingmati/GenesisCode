// src/admin/routes/categoryPlanRoutes.js
const express = require('express');
const router = express.Router();
const CategoryPlanController = require('../controllers/categoryPlanController');

// Pas de middleware d'authentification obligatoire - comme CourseManagement
// L'authentification est gérée côté frontend avec adminToken

// Routes pour la gestion des plans de catégories
router.get('/', CategoryPlanController.getAllCategoryPlans);
router.get('/stats', CategoryPlanController.getCategoryPlanStats);
router.get('/category/:categoryId', CategoryPlanController.getCategoryPlan);
router.post('/', CategoryPlanController.createCategoryPlan);
router.put('/:id', CategoryPlanController.updateCategoryPlan);
router.delete('/:id', CategoryPlanController.deleteCategoryPlan);
router.patch('/:id/toggle', CategoryPlanController.toggleCategoryPlanStatus);

module.exports = router;
