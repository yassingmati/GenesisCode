const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Vérifie l'importation

// Route d'authentification
router.post('/login', adminController.login);

// Route d'enregistrement
router.post('/register', adminController.register);

// Routes pour la gestion des plans de catégories
try {
  const categoryPlanRoutes = require('../admin/routes/categoryPlanRoutes');
  router.use('/category-plans', categoryPlanRoutes);
  console.log('✅ categoryPlanRoutes chargé dans adminRoutes');
} catch (err) {
  console.error('❌ Erreur chargement categoryPlanRoutes:', err);
}

module.exports = router;
