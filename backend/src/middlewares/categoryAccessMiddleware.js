// src/middlewares/categoryAccessMiddleware.js
const CategoryPaymentService = require('../services/categoryPaymentService');

/**
 * Middleware pour vérifier l'accès à un niveau d'une catégorie
 */
exports.requireCategoryLevelAccess = () => {
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
      const access = await CategoryPaymentService.checkLevelAccess(
        userId, 
        categoryId, 
        pathId, 
        levelId
      );
      
      if (!access.hasAccess) {
        // Récupérer le plan de la catégorie pour proposer l'achat
        const categoryPlan = await CategoryPaymentService.getCategoryPlan(categoryId);
        
        return res.status(403).json({ 
          success: false, 
          message: 'Accès refusé',
          code: 'ACCESS_DENIED',
          reason: access.reason,
          categoryPlan: categoryPlan,
          requiresPayment: true
        });
      }

      // Ajouter les informations d'accès à la requête
      req.categoryAccess = access;
      next();
    } catch (error) {
      console.error('Category access middleware error:', error);
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
exports.allowCategoryPreviewAccess = () => {
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
      const access = await CategoryPaymentService.checkLevelAccess(
        userId, 
        categoryId, 
        pathId, 
        levelId
      );
      
      if (!access.hasAccess) {
        // En mode preview, on permet la visualisation mais pas l'interaction
        req.categoryAccess = {
          hasAccess: true,
          accessType: 'preview',
          canView: true,
          canInteract: false,
          canDownload: false,
          source: 'preview'
        };
      } else {
        req.categoryAccess = access;
      }

      next();
    } catch (error) {
      console.error('Category preview access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware pour vérifier l'accès à une catégorie entière
 */
exports.requireCategoryAccess = () => {
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

      if (!categoryId) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de catégorie requis',
          code: 'MISSING_CATEGORY_ID'
        });
      }

      // Vérifier l'accès à la catégorie
      const CategoryAccess = require('../models/CategoryAccess');
      const access = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      
      if (!access || !access.isActive()) {
        // Récupérer le plan de la catégorie pour proposer l'achat
        const categoryPlan = await CategoryPaymentService.getCategoryPlan(categoryId);
        
        return res.status(403).json({ 
          success: false, 
          message: 'Accès à la catégorie refusé',
          code: 'CATEGORY_ACCESS_DENIED',
          categoryPlan: categoryPlan,
          requiresPayment: true
        });
      }

      // Ajouter les informations d'accès à la requête
      req.categoryAccess = {
        hasAccess: true,
        accessType: access.accessType,
        categoryAccess: access
      };
      next();
    } catch (error) {
      console.error('Category access middleware error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};






