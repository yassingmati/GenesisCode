// src/middlewares/flexibleAccessMiddleware.js
const AccessControlService = require('../services/accessControlService');
const LevelUnlockService = require('../services/levelUnlockService');
const CategoryPaymentService = require('../services/categoryPaymentService');

/**
 * Middleware flexible pour vérifier l'accès aux niveaux
 * S'adapte aux différents patterns de routes
 */
exports.requireFlexibleLevelAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Non authentifié',
          code: 'UNAUTHORIZED'
        });
      }

      const userId = req.user.id;
      const levelId = req.params.id || req.params.levelId;
      
      if (!levelId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID du niveau requis',
          code: 'MISSING_LEVEL_ID'
        });
      }

      // Récupérer le niveau pour obtenir pathId et categoryId
      const Level = require('../models/Level');
      const level = await Level.findById(levelId).populate('path').lean();
      
      if (!level) {
        return res.status(404).json({ 
          success: false, 
          message: 'Niveau non trouvé',
          code: 'LEVEL_NOT_FOUND'
        });
      }

      const pathId = level.path._id;
      const categoryId = level.path.category;

      // Vérifier l'accès via AccessControlService (unifié)
      console.log(`[DEBUG flexibleAccessMiddleware] Checking access: userId=${userId}, pathId=${pathId}, levelId=${levelId}`);
      const access = await AccessControlService.checkUserAccess(userId, pathId, levelId);
      console.log(`[DEBUG flexibleAccessMiddleware] Access result: hasAccess=${access.hasAccess}, reason=${access.reason}, source=${access.source}`);
      
      if (!access.hasAccess) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès refusé',
          code: 'ACCESS_DENIED',
          reason: access.reason
        });
      }

      // Ajouter les informations d'accès à la requête
      req.levelAccess = access;
      req.pathId = pathId;
      req.categoryId = categoryId;
      next();
    } catch (error) {
      console.error('Flexible level access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware flexible pour vérifier l'accès aux parcours
 */
exports.requireFlexibleCourseAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Non authentifié',
          code: 'UNAUTHORIZED'
        });
      }

      const userId = req.user.id;
      const pathId = req.params.id || req.params.pathId;
      
      if (!pathId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID du parcours requis',
          code: 'MISSING_PATH_ID'
        });
      }

      // Vérifier l'accès via AccessControlService
      const access = await AccessControlService.checkUserAccess(userId, pathId);
      
      if (!access.hasAccess) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès refusé',
          code: 'ACCESS_DENIED',
          reason: access.reason
        });
      }

      // Ajouter les informations d'accès à la requête
      req.courseAccess = access;
      next();
    } catch (error) {
      console.error('Flexible course access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware pour vérifier l'accès aux exercices
 */
exports.requireExerciseAccess = () => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Non authentifié',
          code: 'UNAUTHORIZED'
        });
      }

      const userId = req.user.id;
      const exerciseId = req.params.id || req.params.exerciseId;
      
      if (!exerciseId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de l\'exercice requis',
          code: 'MISSING_EXERCISE_ID'
        });
      }

      // Récupérer l'exercice pour obtenir levelId, pathId
      const Exercise = require('../models/Exercise');
      const exercise = await Exercise.findById(exerciseId).populate({
        path: 'level',
        populate: { path: 'path' }
      }).lean();
      
      if (!exercise) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exercice non trouvé',
          code: 'EXERCISE_NOT_FOUND'
        });
      }

      const levelId = exercise.level._id;
      const pathId = exercise.level.path._id;

      // Vérifier l'accès via AccessControlService
      const access = await AccessControlService.checkUserAccess(userId, pathId, levelId, exerciseId);
      
      if (!access.hasAccess) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès refusé',
          code: 'ACCESS_DENIED',
          reason: access.reason
        });
      }

      // Ajouter les informations d'accès à la requête
      req.exerciseAccess = access;
      req.levelId = levelId;
      req.pathId = pathId;
      next();
    } catch (error) {
      console.error('Exercise access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};
