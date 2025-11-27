// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protectUserOrAdmin } = require('../middlewares/flexibleAuthMiddleware');
const { protect, adminOnly } = require('../middlewares/authMiddleware'); // adapte selon ton middleware

// Middleware pour vérifier admin (accepte admin token ou user avec rôle admin)
const requireAdmin = (req, res, next) => {
  if (req.admin || (req.user && req.user.roles && req.user.roles.includes('admin'))) {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Permissions administrateur requises' 
  });
};

// Profile CRUD (utilisateur connecté)
router.get('/profile', protectUserOrAdmin, userController.getProfile);            // GET /api/users/profile
router.post('/', userController.createProfile);                        // POST /api/users
router.put('/profile', protectUserOrAdmin, userController.updateProfile);         // PUT /api/users/profile  (update connecté)
router.put('/:id', protectUserOrAdmin, userController.updateProfile);             // PUT /api/users/:id      (update par id - nécessite vérif d'admin dans protect si besoin)
router.delete('/:id', protectUserOrAdmin, userController.deleteProfile);          // DELETE /api/users/:id   (supprime user et ses progress)

// Accès public / admin
router.get('/', (req, res, next) => {
  console.log('🔒 GET /api/users - Auth check');
  console.log('   Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
}, protectUserOrAdmin, (req, res, next) => {
  console.log('✅ GET /api/users - After protectUserOrAdmin');
  console.log('   req.user:', req.user ? { id: req.user.id, email: req.user.email, roles: req.user.roles } : 'null');
  console.log('   req.admin:', req.admin ? { id: req.admin.id, email: req.admin.email } : 'null');
  next();
}, requireAdmin, userController.getAllUsers);       // GET /api/users (Admin only)
router.get('/:id', protectUserOrAdmin, userController.getProfileById);           // GET /api/users/:id

// Progress & leaderboard
router.get('/progress/:userId', protect, userController.getUserProgress);
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;
