// src/routes/parentRoutes.js
const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { protect } = require('../middlewares/authMiddleware');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les parents
router.post('/invite-child', catchErrors(parentController.inviteChild));
router.get('/children', catchErrors(parentController.getChildren));
router.get('/children/:childId', catchErrors(parentController.getChildDetails));
router.put('/children/:childId/controls', catchErrors(parentController.updateParentalControls));
router.get('/children/:childId/activity-report', catchErrors(parentController.getActivityReport));
router.put('/children/:childId/status', catchErrors(parentController.toggleChildStatus));

// Nouvelles routes analytics et templates
router.get('/children/:childId/analytics', catchErrors(parentController.getChildAnalytics));
router.post('/children/:childId/apply-template', catchErrors(parentController.applyControlTemplate));

// Routes pour les enfants (accepter invitation)
router.post('/accept-invitation', catchErrors(parentController.acceptInvitation));

module.exports = router;
