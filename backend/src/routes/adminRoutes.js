const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminProtect, adminOnly } = require('../middlewares/adminAuthMiddleware');

// Route d'authentification
router.post('/login', adminController.login);

// Route d'enregistrement
router.post('/register', adminController.register);

// Routes pour la gestion des plans de catégories (doivent être AVANT /:id)
try {
  const categoryPlanRoutes = require('../admin/routes/categoryPlanRoutes');
  router.use('/category-plans', categoryPlanRoutes);
  console.log('✅ categoryPlanRoutes chargé dans adminRoutes');
} catch (err) {
  console.error('❌ Erreur chargement categoryPlanRoutes:', err);
}

// Routes protégées pour la gestion des admins (doivent être APRÈS les routes spécifiques)
router.get('/list', adminProtect, adminOnly, adminController.listAdmins);
router.get('/:id', adminProtect, adminOnly, adminController.getAdminById);

module.exports = router;
