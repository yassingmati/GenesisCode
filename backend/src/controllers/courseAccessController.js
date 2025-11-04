// src/controllers/courseAccessController.js
const CourseAccessService = require('../services/courseAccessService');
const AccessControlService = require('../services/accessControlService');
const Plan = require('../models/Plan');
const Path = require('../models/Path');
const Level = require('../models/Level');
const CourseAccess = require('../models/CourseAccess');

class CourseAccessController {
  
  /**
   * Vérifier l'accès à un parcours
   */
  static async checkPathAccess(req, res) {
    try {
      const { pathId } = req.params;
      const userId = req.user.id;

      const access = await CourseAccessService.checkUserAccess(userId, pathId);
      
      if (access.hasAccess) {
        return res.json({
          success: true,
          access: access,
          message: 'Accès autorisé'
        });
      }

      // Récupérer les plans disponibles
      const availablePlans = await CourseAccessService.getPlansForPath(pathId);
      
      return res.status(403).json({
        success: false,
        access: access,
        availablePlans: availablePlans,
        message: 'Abonnement requis'
      });
    } catch (error) {
      console.error('Error checking path access:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de vérification d\'accès'
      });
    }
  }

  /**
   * Vérifier l'accès à un niveau
   */
  static async checkLevelAccess(req, res) {
    try {
      const { pathId, levelId } = req.params;
      const userId = req.user.id;

      const access = await AccessControlService.checkUserAccess(userId, pathId, levelId);
      
      if (access.hasAccess) {
        return res.json({
          success: true,
          access: access,
          message: 'Accès autorisé'
        });
      }

      // Récupérer les plans disponibles
      const availablePlans = await CourseAccessService.getPlansForPath(pathId);
      
      return res.status(403).json({
        success: false,
        access: access,
        availablePlans: availablePlans,
        message: 'Abonnement requis'
      });
    } catch (error) {
      console.error('Error checking level access:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de vérification d\'accès'
      });
    }
  }

  /**
   * Récupérer les plans disponibles pour un parcours
   */
  static async getAvailablePlans(req, res) {
    try {
      const { pathId } = req.params;
      const plans = await CourseAccessService.getPlansForPath(pathId);
      
      return res.json({
        success: true,
        plans: plans,
        message: 'Plans récupérés avec succès'
      });
    } catch (error) {
      console.error('Error getting available plans:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de récupération des plans'
      });
    }
  }

  /**
   * Récupérer tous les plans disponibles
   */
  static async getAllPlans(req, res) {
    try {
      console.log('📋 Récupération des plans (sans authentification)...');
      
      const plans = await Plan.find({ active: true })
        .sort({ sortOrder: 1, priceMonthly: 1 })
        .lean();
      
      console.log(`✅ ${plans.length} plans trouvés`);
      
      return res.json({
        success: true,
        plans: plans,
        message: 'Plans récupérés avec succès'
      });
    } catch (error) {
      console.error('Error getting all plans:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de récupération des plans'
      });
    }
  }

  /**
   * Récupérer l'historique d'accès d'un utilisateur
   */
  static async getUserAccessHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;
      
      const accesses = await CourseAccess.find({ user: userId })
        .populate('path level exercise')
        .sort({ unlockedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await CourseAccess.countDocuments({ user: userId });

      return res.json({
        success: true,
        accesses: accesses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        },
        message: 'Historique d\'accès récupéré avec succès'
      });
    } catch (error) {
      console.error('Error getting user access history:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de récupération de l\'historique'
      });
    }
  }

  /**
   * Initialiser l'accès gratuit pour un utilisateur
   */
  static async initializeFreeAccess(req, res) {
    try {
      const userId = req.user.id;
      
      const success = await CourseAccessService.initializeFreeAccess(userId);
      
      if (success) {
        return res.json({
          success: true,
          message: 'Accès gratuit initialisé avec succès'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'initialisation de l\'accès gratuit'
        });
      }
    } catch (error) {
      console.error('Error initializing free access:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur d\'initialisation de l\'accès gratuit'
      });
    }
  }

  /**
   * Accorder l'accès à un parcours (admin)
   */
  static async grantAccess(req, res) {
    try {
      const { userId, pathId, accessType, options = {} } = req.body;

      if (!userId || !pathId || !accessType) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres requis manquants'
        });
      }

      const access = await CourseAccessService.grantAccess(userId, pathId, accessType, options);
      
      return res.json({
        success: true,
        access: access,
        message: 'Accès accordé avec succès'
      });
    } catch (error) {
      console.error('Error granting access:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'octroi d\'accès'
      });
    }
  }

  /**
   * Récupérer les statistiques d'accès
   */
  static async getAccessStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await CourseAccess.aggregate([
        { $match: { user: userId, isActive: true } },
        {
          $group: {
            _id: '$accessType',
            count: { $sum: 1 },
            paths: { $addToSet: '$path' }
          }
        }
      ]);

      const totalAccesses = await CourseAccess.countDocuments({ 
        user: userId, 
        isActive: true 
      });

      return res.json({
        success: true,
        stats: stats,
        totalAccesses: totalAccesses,
        message: 'Statistiques récupérées avec succès'
      });
    } catch (error) {
      console.error('Error getting access stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur de récupération des statistiques'
      });
    }
  }

}

module.exports = CourseAccessController;
