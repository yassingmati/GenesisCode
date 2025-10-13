// src/middlewares/courseAccessMiddleware.js
const CourseAccessService = require('../services/courseAccessService');

/**
 * Middleware pour vérifier l'accès aux cours
 */
exports.requireCourseAccess = (options = {}) => {
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
      const pathId = req.params.pathId || req.body.pathId;
      const levelId = req.params.levelId || req.body.levelId;
      const exerciseId = req.params.exerciseId || req.body.exerciseId;

      if (!pathId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID du parcours requis',
          code: 'MISSING_PATH_ID'
        });
      }

      // Vérifier l'accès
      const access = await CourseAccessService.checkUserAccess(userId, pathId, levelId, exerciseId);
      
      if (!access.hasAccess) {
        // Récupérer les plans disponibles pour ce parcours
        const availablePlans = await CourseAccessService.getPlansForPath(pathId);
        
        return res.status(403).json({ 
          success: false, 
          message: 'Accès refusé',
          code: 'ACCESS_DENIED',
          reason: access.reason,
          availablePlans: availablePlans,
          requiresSubscription: true
        });
      }

      // Ajouter les informations d'accès à la requête
      req.courseAccess = access;
      next();
    } catch (error) {
      console.error('Course access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware pour vérifier l'accès en mode preview
 */
exports.allowPreviewAccess = (options = {}) => {
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
      const pathId = req.params.pathId || req.body.pathId;
      const levelId = req.params.levelId || req.body.levelId;

      if (!pathId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID du parcours requis',
          code: 'MISSING_PATH_ID'
        });
      }

      // Vérifier l'accès (même en mode preview)
      const access = await CourseAccessService.checkUserAccess(userId, pathId, levelId);
      
      if (!access.hasAccess) {
        // En mode preview, on permet la visualisation mais pas l'interaction
        req.courseAccess = {
          hasAccess: true,
          accessType: 'preview',
          canView: true,
          canInteract: false,
          canDownload: false,
          source: 'preview'
        };
      } else {
        req.courseAccess = access;
      }

      next();
    } catch (error) {
      console.error('Preview access middleware error:', error);
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
      const exerciseId = req.params.exerciseId || req.body.exerciseId;
      const levelId = req.params.levelId || req.body.levelId;

      if (!exerciseId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de l\'exercice requis',
          code: 'MISSING_EXERCISE_ID'
        });
      }

      // Récupérer l'exercice pour obtenir le parcours
      const Exercise = require('../models/Exercise');
      const Level = require('../models/Level');
      
      const exercise = await Exercise.findById(exerciseId).populate('level').lean();
      if (!exercise || !exercise.level) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exercice introuvable',
          code: 'EXERCISE_NOT_FOUND'
        });
      }

      const pathId = exercise.level.path;
      const access = await CourseAccessService.checkUserAccess(userId, pathId, levelId, exerciseId);
      
      if (!access.hasAccess || !access.canInteract) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès aux exercices refusé',
          code: 'EXERCISE_ACCESS_DENIED',
          reason: access.reason
        });
      }

      req.courseAccess = access;
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
