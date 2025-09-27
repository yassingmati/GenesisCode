const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Authentification
router.post('/register', authController.register);
router.post('/login', authController.loginWithEmail);
router.post('/login/google', authController.loginWithGoogle);

// Vérification email
router.post('/send-verification', authMiddleware.protect, authController.sendVerificationEmail);
router.get('/verify-email', authController.verifyEmail);

// Profil utilisateur
router.put('/profile/complete', authMiddleware.protect, authController.completeProfile);
router.get('/profile', authMiddleware.protect, authController.getProfile);

module.exports = router;