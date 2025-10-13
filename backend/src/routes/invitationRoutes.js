// src/routes/invitationRoutes.js
const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { protect } = require('../middlewares/authMiddleware');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les invitations parent
router.get('/invitations', catchErrors(invitationController.getInvitations));
router.post('/accept-invitation', catchErrors(invitationController.acceptInvitation));
router.post('/reject-invitation', catchErrors(invitationController.rejectInvitation));

module.exports = router;
