const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protectUserOrAdmin } = require('../middlewares/flexibleAuthMiddleware');

// All routes are protected (accepts both admin and user tokens)
router.use(protectUserOrAdmin);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
