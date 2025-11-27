// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les notifications
router.get('/notifications', catchErrors(notificationController.getNotifications));
router.put('/notifications/:id/read', catchErrors(notificationController.markAsRead));
router.put('/notifications/read-all', catchErrors(notificationController.markAllAsRead));

module.exports = router;
