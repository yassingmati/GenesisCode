const express = require('express');
const router = express.Router();
const {
    createTaskTemplate,
    getTaskTemplates,
    updateTaskTemplate,
    deleteTaskTemplate
} = require('../controllers/taskTemplateController');
const { protectUserOrAdmin } = require('../middlewares/flexibleAuthMiddleware');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  try {
    // Check if req.admin exists (from admin token) or req.user has admin role
    const isAdmin = req.admin || (req.user && req.user.roles && Array.isArray(req.user.roles) && req.user.roles.includes('admin'));
    
    if (isAdmin) {
      return next();
    }
    
    console.log('❌ requireAdmin: Accès refusé');
    console.log('   req.admin:', req.admin ? 'exists' : 'null');
    console.log('   req.user:', req.user ? { id: req.user.id, roles: req.user.roles } : 'null');
    
    return res.status(403).json({ 
      success: false, 
      message: 'Permissions administrateur requises' 
    });
  } catch (error) {
    console.error('❌ Error in requireAdmin middleware:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification des permissions' 
    });
  }
};

// All routes are protected and for admins (accepts both admin tokens and user tokens with admin role)
router.use((req, res, next) => {
  console.log('🔒 TaskTemplate route - Auth check');
  console.log('   URL:', req.url);
  console.log('   Method:', req.method);
  console.log('   Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  next();
});

router.use(protectUserOrAdmin);

router.use((req, res, next) => {
  console.log('✅ TaskTemplate route - After protectUserOrAdmin');
  console.log('   req.user:', req.user ? { id: req.user.id, email: req.user.email, roles: req.user.roles } : 'null');
  console.log('   req.admin:', req.admin ? { id: req.admin.id, email: req.admin.email } : 'null');
  next();
});

router.use(requireAdmin);

router.route('/')
    .get(getTaskTemplates)
    .post(createTaskTemplate);

router.route('/:id')
    .put(updateTaskTemplate)
    .delete(deleteTaskTemplate);

module.exports = router;
