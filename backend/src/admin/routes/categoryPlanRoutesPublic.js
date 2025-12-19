// src/admin/routes/categoryPlanRoutesPublic.js
// Routes PUBLIQUES pour tester le frontend SANS authentification
const express = require('express');
const router = express.Router();
const CategoryPlanController = require('../controllers/categoryPlanController');

// PAS de middleware d'authentification pour ces routes de test

// Routes pour la gestion des plans de catégories
router.get('/', CategoryPlanController.getAllCategoryPlans);
router.get('/stats', CategoryPlanController.getCategoryPlanStats);
router.get('/category/:categoryId', CategoryPlanController.getCategoryPlan);
router.post('/', CategoryPlanController.createCategoryPlan);
router.put('/:id', CategoryPlanController.updateCategoryPlan);
router.delete('/:id', CategoryPlanController.deleteCategoryPlan);
router.patch('/:id/toggle', CategoryPlanController.toggleCategoryPlanStatus);

module.exports = router;
