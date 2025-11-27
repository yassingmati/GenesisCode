const express = require('express');
const router = express.Router();
const {
  assignTasks,
  getChildTasks,
  getMyTasks,
  deleteAssignedTask,
  getAllAssignedTasks,
  computeTaskMetrics,
  getChildProgress
} = require('../controllers/assignedTaskController');
const { protectUserOrAdmin } = require('../middlewares/flexibleAuthMiddleware');

// Middleware to check if user is admin (for admin routes)
const requireAdmin = (req, res, next) => {
  if (req.admin || (req.user && req.user.roles && req.user.roles.includes('admin'))) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Permissions administrateur requises'
  });
};

// Admin routes
router.post('/assign', protectUserOrAdmin, requireAdmin, assignTasks);
router.post('/:id/compute', protectUserOrAdmin, requireAdmin, computeTaskMetrics);
router.delete('/:id', protectUserOrAdmin, requireAdmin, deleteAssignedTask);
router.get('/all', protectUserOrAdmin, requireAdmin, getAllAssignedTasks);

// Student routes (own tasks only)
router.get('/my-tasks', protectUserOrAdmin, getMyTasks);

// Parent routes (protected but no admin requirement)
router.get('/children/:childId/tasks', protectUserOrAdmin, getChildTasks);
router.get('/children/:childId/progress', protectUserOrAdmin, getChildProgress);

module.exports = router;
