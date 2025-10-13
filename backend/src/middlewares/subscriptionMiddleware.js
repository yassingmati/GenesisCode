// src/middlewares/subscriptionMiddleware.js
const User = require('../models/User');
const Subscription = require('../models/Subscription');

/**
 * Middleware pour vérifier qu'un utilisateur a un abonnement actif
 */
exports.requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'UNAUTHORIZED'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Vérifier l'abonnement dans le modèle User
    if (!user.subscription || !user.subscription.status || user.subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Abonnement actif requis',
        code: 'SUBSCRIPTION_REQUIRED',
        subscription: user.subscription
      });
    }

    // Vérifier que l'abonnement n'est pas expiré
    if (user.subscription.currentPeriodEnd && user.subscription.currentPeriodEnd < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Abonnement expiré',
        code: 'SUBSCRIPTION_EXPIRED',
        subscription: user.subscription
      });
    }

    // Ajouter les informations d'abonnement à la requête
    req.subscription = user.subscription;
    next();

  } catch (error) {
    console.error('Erreur middleware abonnement:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification d\'abonnement',
      code: 'SUBSCRIPTION_CHECK_ERROR'
    });
  }
};

/**
 * Middleware pour vérifier un plan spécifique
 */
exports.requirePlan = (requiredPlanId) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
          code: 'UNAUTHORIZED'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user || !user.subscription) {
        return res.status(403).json({
          success: false,
          message: 'Abonnement requis',
          code: 'SUBSCRIPTION_REQUIRED'
        });
      }

      if (user.subscription.planId !== requiredPlanId) {
        return res.status(403).json({
          success: false,
          message: `Plan ${requiredPlanId} requis`,
          code: 'INSUFFICIENT_PLAN',
          currentPlan: user.subscription.planId,
          requiredPlan: requiredPlanId
        });
      }

      req.subscription = user.subscription;
      next();

    } catch (error) {
      console.error('Erreur middleware plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de vérification de plan',
        code: 'PLAN_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware pour vérifier l'accès à un contenu spécifique
 */
exports.requireContentAccess = (contentType, contentId) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise',
          code: 'UNAUTHORIZED'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        });
      }

      // Vérifier l'accès selon le type de contenu
      let hasAccess = false;

      if (contentType === 'path') {
        // Vérifier l'accès au parcours
        const CourseAccessService = require('../services/courseAccessService');
        const access = await CourseAccessService.checkUserAccess(
          user._id, 
          contentId || req.params.pathId
        );
        hasAccess = access.hasAccess;
      } else if (contentType === 'level') {
        // Vérifier l'accès au niveau
        const CourseAccessService = require('../services/courseAccessService');
        const access = await CourseAccessService.checkUserAccess(
          user._id, 
          req.params.pathId, 
          contentId || req.params.levelId
        );
        hasAccess = access.hasAccess;
      } else if (contentType === 'exercise') {
        // Vérifier l'accès à l'exercice
        const CourseAccessService = require('../services/courseAccessService');
        const access = await CourseAccessService.checkUserAccess(
          user._id, 
          req.params.pathId, 
          req.params.levelId, 
          contentId || req.params.exerciseId
        );
        hasAccess = access.hasAccess;
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Accès au contenu refusé',
          code: 'CONTENT_ACCESS_DENIED',
          contentType,
          contentId: contentId || req.params[`${contentType}Id`]
        });
      }

      next();

    } catch (error) {
      console.error('Erreur middleware accès contenu:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de vérification d\'accès',
        code: 'ACCESS_CHECK_ERROR'
      });
    }
  };
};

/**
 * Middleware optionnel pour l'abonnement (pour les tests)
 */
exports.optionalSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      req.subscription = null;
      return next();
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.subscription) {
      req.subscription = null;
      return next();
    }

    // Vérifier que l'abonnement n'est pas expiré
    if (user.subscription.currentPeriodEnd && user.subscription.currentPeriodEnd < new Date()) {
      req.subscription = null;
      return next();
    }

    req.subscription = user.subscription;
    next();

  } catch (error) {
    console.error('Erreur middleware abonnement optionnel:', error);
    req.subscription = null;
    next();
  }
};

/**
 * Middleware pour vérifier les permissions d'admin
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'UNAUTHORIZED'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Vérifier les rôles admin
    const isAdmin = user.roles && user.roles.includes('admin');
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permissions administrateur requises',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();

  } catch (error) {
    console.error('Erreur middleware admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification des permissions',
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};