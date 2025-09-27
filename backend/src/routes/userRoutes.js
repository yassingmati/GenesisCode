// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware'); // adapte selon ton middleware

// Profile CRUD (utilisateur connecté)
router.get('/profile', protect, userController.getProfile);            // GET /api/users/profile
router.post('/', userController.createProfile);                        // POST /api/users
router.put('/profile', protect, userController.updateProfile);         // PUT /api/users/profile  (update connecté)
router.put('/:id', protect, userController.updateProfile);             // PUT /api/users/:id      (update par id - nécessite vérif d'admin dans protect si besoin)
router.delete('/:id', protect, userController.deleteProfile);          // DELETE /api/users/:id   (supprime user et ses progress)

// Accès public / admin
router.get('/:id', protect, userController.getProfileById);           // GET /api/users/:id

// Progress & leaderboard
router.get('/progress/:userId', protect, userController.getUserProgress);
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;
