// src/routes/notificationRoutes.js
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

// Routes pour les notifications
router.get('/notifications', catchErrors(invitationController.getNotifications));
router.put('/notifications/:notificationId/read', catchErrors(invitationController.markNotificationAsRead));

module.exports = router;
