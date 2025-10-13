// src/routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { protect } = require('../middlewares/authMiddleware');

// Helper pour gérer les erreurs async
const catchErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour le calendrier partagé
router.get('/:childId', catchErrors(calendarController.getSharedCalendar));
router.post('/:childId/events', catchErrors(calendarController.addEvent));
router.put('/:childId/events/:eventId', catchErrors(calendarController.updateEvent));
router.delete('/:childId/events/:eventId', catchErrors(calendarController.deleteEvent));

// Routes pour les objectifs partagés
router.post('/:childId/goals', catchErrors(calendarController.addSharedGoal));
router.put('/:childId/goals/:goalId/progress', catchErrors(calendarController.updateGoalProgress));

// Routes pour les événements à venir et synchronisation
router.get('/:childId/upcoming', catchErrors(calendarController.getUpcomingEvents));
router.post('/:childId/sync', catchErrors(calendarController.syncCalendar));

// Routes pour les statistiques du calendrier
router.get('/:childId/stats', catchErrors(calendarController.getCalendarStats));

module.exports = router;
