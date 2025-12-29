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

// Routes PUBLIQUES pour tester le frontend (SANS AUTH)
try {
  const categoryPlanRoutesPublic = require('../admin/routes/categoryPlanRoutesPublic');
  router.use('/test-category-plans', categoryPlanRoutesPublic);
  console.log('✅ categoryPlanRoutesPublic (sans auth) chargé dans adminRoutes');
} catch (err) {
  console.error('❌ Erreur chargement categoryPlanRoutesPublic:', err);
}

// Routes protégées pour la gestion des admins (doivent être APRÈS les routes spécifiques)
// Temporairement public pour migration avec clé secrète
// Routes pour la gestion des abonnements (Admin)
const subscriptionController = require('../controllers/subscriptionController');
router.get('/subscriptions', adminProtect, adminOnly, subscriptionController.getAllSubscriptionsAdmin);
router.post('/subscriptions', adminProtect, adminOnly, subscriptionController.createSubscriptionAdmin);
router.put('/subscriptions/status', adminProtect, adminOnly, subscriptionController.updateSubscriptionStatusAdmin);
router.delete('/subscriptions/:subscriptionId', adminProtect, adminOnly, subscriptionController.deleteSubscriptionAdmin);
router.post('/subscriptions/cancel', adminProtect, adminOnly, subscriptionController.cancelSubscriptionAdmin);

// Route pour récupérer les CategoryAccess (vrais abonnements selon la demande)
router.get('/category-accesses', adminProtect, adminOnly, adminController.getAllCategoryAccesses);
router.post('/category-accesses', adminProtect, adminOnly, adminController.createCategoryAccess);
router.put('/category-accesses/:id', adminProtect, adminOnly, adminController.updateCategoryAccess);
router.delete('/category-accesses/:id', adminProtect, adminOnly, adminController.deleteCategoryAccess);

router.post('/migrate-plans', adminController.migratePlans);
router.post('/promo-codes', adminProtect, adminOnly, adminController.createPromoCode);
router.get('/promo-codes', adminProtect, adminOnly, adminController.getPromoCodes);
// --- Gestion des Plans (CRUD) ---
router.get('/plans', adminProtect, adminOnly, adminController.getAllPlans);
router.post('/plans', adminProtect, adminOnly, adminController.createPlan);
router.put('/plans/:id', adminProtect, adminOnly, adminController.updatePlan);
router.delete('/plans/:id', adminProtect, adminOnly, adminController.deletePlan);

// --- Historique des Paiements ---
router.get('/payments/history', adminProtect, adminOnly, adminController.getAllPayments);

// --- Gestion Avancée Utilisateurs ---
router.get('/users', adminProtect, adminOnly, adminController.getUsers);
router.put('/users/:id/role', adminProtect, adminOnly, adminController.updateUserRole);
router.delete('/users/:id', adminProtect, adminOnly, adminController.deleteUser);

// --- Catégories (pour dropdowns) ---
router.get('/categories', adminProtect, adminOnly, adminController.getAllCategories);

router.get('/dashboard-stats', adminProtect, adminOnly, adminController.getDashboardStats);

router.get('/list', adminProtect, adminOnly, adminController.listAdmins);
router.get('/:id', adminProtect, adminOnly, adminController.getAdminById);

module.exports = router;
