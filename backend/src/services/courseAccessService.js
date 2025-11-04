// src/services/courseAccessService.js
const CourseAccess = require('../models/CourseAccess');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Path = require('../models/Path');
const Level = require('../models/Level');

class CourseAccessService {
  
  /**
   * Vérifie si un utilisateur a accès à un contenu
   */
  static async checkUserAccess(userId, pathId, levelId = null, exerciseId = null) {
    try {
      const user = await User.findById(userId).select('subscription').lean();
      if (!user) return { hasAccess: false, reason: 'user_not_found' };

      // Vérifier l'accès explicite
      const explicitAccess = await CourseAccess.checkAccess(userId, pathId, levelId, exerciseId);
      if (explicitAccess) {
        return {
          hasAccess: true,
          accessType: explicitAccess.accessType,
          canView: explicitAccess.canView,
          canInteract: explicitAccess.canInteract,
          canDownload: explicitAccess.canDownload,
          source: 'explicit'
        };
      }

      // Vérifier l'abonnement
      if (user.subscription && user.subscription.status === 'active') {
        const subscriptionAccess = await this.checkSubscriptionAccess(user, pathId, levelId);
        if (subscriptionAccess.hasAccess) {
          return subscriptionAccess;
        }
      }

      // Vérifier l'accès gratuit (première leçon)
      const freeAccess = await this.checkFreeAccess(userId, pathId, levelId);
      if (freeAccess.hasAccess) {
        return freeAccess;
      }

      return { hasAccess: false, reason: 'no_access' };
    } catch (error) {
      console.error('Error checking user access:', error);
      return { hasAccess: false, reason: 'error' };
    }
  }

  /**
   * Vérifie l'accès via abonnement
   */
  static async checkSubscriptionAccess(user, pathId, levelId = null) {
    try {
      const plan = await Plan.findById(user.subscription.planId).lean();
      if (!plan || !plan.active) {
        return { hasAccess: false, reason: 'invalid_plan' };
      }

      // Plan global - accès à tout
      if (plan.type === 'global') {
        return {
          hasAccess: true,
          accessType: 'subscription',
          canView: true,
          canInteract: true,
          canDownload: true,
          source: 'subscription'
        };
      }

      // Plan par parcours
      if (plan.type === 'path' && plan.targetId && plan.targetId.toString() === pathId.toString()) {
        return {
          hasAccess: true,
          accessType: 'subscription',
          canView: true,
          canInteract: true,
          canDownload: true,
          source: 'subscription'
        };
      }

      // Plan par catégorie
      if (plan.type === 'category') {
        const path = await Path.findById(pathId).select('category').lean();
        if (path && path.category && plan.targetId && plan.targetId.toString() === path.category.toString()) {
          return {
            hasAccess: true,
            accessType: 'subscription',
            canView: true,
            canInteract: true,
            canDownload: true,
            source: 'subscription'
          };
        }
      }

      // Vérifier les parcours autorisés
      if (plan.allowedPaths && plan.allowedPaths.length > 0) {
        const hasPathAccess = plan.allowedPaths.some(allowedPathId => 
          allowedPathId.toString() === pathId.toString()
        );
        if (hasPathAccess) {
          return {
            hasAccess: true,
            accessType: 'subscription',
            canView: true,
            canInteract: true,
            canDownload: true,
            source: 'subscription'
          };
        }
      }

      return { hasAccess: false, reason: 'plan_not_covering_path' };
    } catch (error) {
      console.error('Error checking subscription access:', error);
      return { hasAccess: false, reason: 'error' };
    }
  }

  /**
   * Vérifie l'accès gratuit (première leçon)
   */
  static async checkFreeAccess(userId, pathId, levelId = null) {
    try {
      // Charger le premier niveau sans populate
      const firstLevel = await Level.findOne({ path: pathId }).sort({ order: 1 }).lean();
      if (!firstLevel) {
        return { hasAccess: false, reason: 'no_levels' };
      }

      // Si on demande un niveau spécifique, vérifier si c'est le premier
      if (levelId) {
        if (firstLevel._id.toString() === levelId.toString()) {
          return {
            hasAccess: true,
            accessType: 'free',
            canView: true,
            canInteract: true,
            canDownload: false,
            source: 'free_first_lesson'
          };
        }
      } else {
        // Si on ne demande pas de niveau spécifique, accès au premier niveau
        return {
          hasAccess: true,
          accessType: 'free',
          canView: true,
          canInteract: true,
          canDownload: false,
          source: 'free_first_lesson'
        };
      }

      return { hasAccess: false, reason: 'not_first_lesson' };
    } catch (error) {
      console.error('Error checking free access:', error);
      return { hasAccess: false, reason: 'error' };
    }
  }

  /**
   * Débloque l'accès pour un utilisateur
   */
  static async grantAccess(userId, pathId, accessType, options = {}) {
    try {
      // Vérifier si l'accès existe déjà
      const existingAccess = await CourseAccess.findOne({
        user: userId,
        path: pathId,
        isActive: true
      });

      if (existingAccess) {
        // Mettre à jour l'accès existant
        existingAccess.accessType = accessType;
        existingAccess.canView = options.canView !== false;
        existingAccess.canInteract = options.canInteract || false;
        existingAccess.canDownload = options.canDownload || false;
        existingAccess.expiresAt = options.expiresAt || null;
        await existingAccess.save();
        return existingAccess;
      }

      // Créer un nouvel accès
      return await CourseAccess.grantAccess(userId, pathId, accessType, options);
    } catch (error) {
      console.error('Error granting access:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les plans disponibles pour un parcours
   */
  static async getPlansForPath(pathId) {
    try {
      const path = await Path.findById(pathId).populate('category').lean();
      if (!path) return [];

      const plans = await Plan.find({
        active: true,
        $or: [
          { type: 'global' },
          { type: 'path', targetId: pathId },
          { type: 'category', targetId: path.category._id },
          { allowedPaths: pathId }
        ]
      }).sort({ sortOrder: 1, priceMonthly: 1 }).lean();

      return plans;
    } catch (error) {
      console.error('Error getting plans for path:', error);
      return [];
    }
  }

  /**
   * Initialise l'accès gratuit pour un nouvel utilisateur
   */
  static async initializeFreeAccess(userId) {
    try {
      // Récupérer tous les parcours
      const paths = await Path.find().populate('levels').lean();
      
      for (const path of paths) {
        if (path.levels && path.levels.length > 0) {
          // Trier les niveaux par ordre
          const sortedLevels = path.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
          const firstLevel = sortedLevels[0];

          // Accorder l'accès gratuit au premier niveau
          await this.grantAccess(userId, path._id, 'free', {
            levelId: firstLevel._id,
            canView: true,
            canInteract: true,
            canDownload: false
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error initializing free access:', error);
      return false;
    }
  }
}

module.exports = CourseAccessService;
