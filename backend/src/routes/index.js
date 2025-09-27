const express = require('express');
const router = express.Router();
const { 
  validateObjectId, 
  validateTranslations, 
  languageMiddleware 
} = require('../middlewares/validateObjectId');
const errorHandler = require('../middlewares/errorHandler');

// Middleware global
router.use(languageMiddleware);

// Routes principales
router.use('/categories', require('./categoryRoutes'));
router.use('/paths', require('./pathRoutes'));
router.use('/levels', require('./levelRoutes'));
router.use('/exercises', require('./exerciseRoutes'));

// Gestionnaire d'erreurs
router.use(errorHandler);

module.exports = router;