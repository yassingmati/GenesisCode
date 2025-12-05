const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkMongoConnection } = require('../middlewares/mongoCheckMiddleware');

// Authentification (toutes nécessitent MongoDB)
router.post('/register', checkMongoConnection, authController.register);
router.post('/login', checkMongoConnection, authController.loginWithEmail);
router.post('/login/google', checkMongoConnection, authController.loginWithGoogle);

// Vérification email
router.post('/send-verification', authMiddleware.protect, authController.sendVerification);
router.get('/verify-email', authController.verifyEmail);

// Mot de passe oublié
router.post('/forgot-password', checkMongoConnection, authController.forgotPassword);
router.post('/reset-password', checkMongoConnection, authController.resetPassword);

// Profil utilisateur
router.put('/profile/complete', authMiddleware.protect, authController.completeProfile);
router.get('/profile', authMiddleware.protect, authController.getProfile);

// Debug route for test user setup
router.post('/debug/setup-test-user', authController.debugSetupTestUser); // TEMP DEBUG

module.exports = router;