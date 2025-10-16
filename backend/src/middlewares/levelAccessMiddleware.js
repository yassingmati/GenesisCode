// src/middlewares/levelAccessMiddleware.js
const LevelUnlockService = require('../services/levelUnlockService');

/**
 * Middleware pour vérifier l'accès à un niveau spécifique
 */
exports.requireLevelAccess = () => {
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
      const categoryId = req.params.categoryId || req.body.categoryId;
      const pathId = req.params.pathId || req.body.pathId;
      const levelId = req.params.levelId || req.body.levelId;

      if (!categoryId || !pathId || !levelId) {
        return res.status(400).json({ 
          success: false, 
          message: 'IDs de catégorie, parcours et niveau requis',
          code: 'MISSING_IDS'
        });
      }

      // Vérifier l'accès au niveau
      const access = await LevelUnlockService.checkLevelAccess(
        userId, 
        categoryId, 
        pathId, 
        levelId
      );
      
      if (!access.hasAccess) {
        // Récupérer le plan de la catégorie pour proposer l'achat
        const CategoryPaymentService = require('../services/categoryPaymentService');
        let categoryPlan = null;
        
        try {
          const planResponse = await CategoryPaymentService.getCategoryPlan(categoryId);
          categoryPlan = planResponse.plan;
        } catch (error) {
          console.log('Erreur récupération plan catégorie:', error);
        }
        
        // Empêcher complètement l'accès aux niveaux verrouillés
        return res.status(403).json({ 
          success: false, 
          message: 'Niveau verrouillé - Accès refusé',
          code: 'LEVEL_LOCKED',
          reason: access.reason,
          categoryPlan: categoryPlan,
          requiresPayment: access.reason === 'no_category_access',
          levelLocked: true,
          lockedMessage: access.reason === 'level_not_unlocked' 
            ? 'Ce niveau est verrouillé. Complétez les niveaux précédents pour continuer.'
            : 'Vous devez acheter l\'accès à cette catégorie pour débloquer ce niveau.'
        });
      }

      // Ajouter les informations d'accès à la requête
      req.levelAccess = access;
      next();
    } catch (error) {
      console.error('Level access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès au niveau',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware pour vérifier l'accès en mode preview
 */
exports.allowLevelPreviewAccess = () => {
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
      const categoryId = req.params.categoryId || req.body.categoryId;
      const pathId = req.params.pathId || req.body.pathId;
      const levelId = req.params.levelId || req.body.levelId;

      if (!categoryId || !pathId || !levelId) {
        return res.status(400).json({ 
          success: false, 
          message: 'IDs de catégorie, parcours et niveau requis',
          code: 'MISSING_IDS'
        });
      }

      // Vérifier l'accès au niveau
      const access = await LevelUnlockService.checkLevelAccess(
        userId, 
        categoryId, 
        pathId, 
        levelId
      );
      
      if (!access.hasAccess) {
        // En mode preview, on permet la visualisation mais pas l'interaction
        req.levelAccess = {
          hasAccess: true,
          accessType: 'preview',
          canView: true,
          canInteract: false,
          canDownload: false,
          source: 'preview'
        };
      } else {
        req.levelAccess = access;
      }

      next();
    } catch (error) {
      console.error('Level preview access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware pour débloquer automatiquement le premier niveau
 */
exports.autoUnlockFirstLevel = () => {
  return async (req, res, next) => {
    try {
      const userId = req.user ? req.user.id : null;
      const categoryId = req.params.categoryId || req.body.categoryId;
      const pathId = req.params.pathId || req.body.pathId;
      const levelId = req.params.levelId || req.body.levelId;

      if (userId && categoryId && pathId && levelId) {
        // Vérifier si c'est le premier niveau et le débloquer automatiquement
        const access = await LevelUnlockService.checkLevelAccess(
          userId, 
          categoryId, 
          pathId, 
          levelId
        );
        
        if (access.hasAccess && access.accessType === 'free_first_level') {
          console.log('🎁 Premier niveau débloqué automatiquement');
        }
      }

      next();
    } catch (error) {
      console.error('Auto unlock first level middleware error:', error);
      // Ne pas bloquer la requête en cas d'erreur
      next();
    }
  };
};
