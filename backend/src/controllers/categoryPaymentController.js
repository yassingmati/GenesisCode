// src/controllers/categoryPaymentController.js
const CategoryPaymentService = require('../services/categoryPaymentService');
const konnectPaymentService = require('../services/konnectPaymentService');

class CategoryPaymentController {

  /**
   * Récupère tous les plans de catégories
   */
  static async getCategoryPlans(req, res) {
    try {
      console.log('📋 Récupération des plans de catégories (endpoint public)...');

      const plans = await CategoryPaymentService.getAllCategoryPlans();

      console.log(`✅ ${plans.length} plans trouvés`);

      return res.json({
        success: true,
        plans: plans
      });

    } catch (error) {
      console.error('❌ Error getting category plans:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des plans',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Récupère le plan d'une catégorie spécifique
   */
  static async getCategoryPlan(req, res) {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'ID de catégorie requis'
        });
      }

      const plan = await CategoryPaymentService.getCategoryPlan(categoryId);

      return res.json({
        success: true,
        plan: plan
      });

    } catch (error) {
      console.error('Error getting category plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Initialise un paiement pour une catégorie
   */
  static async initCategoryPayment(req, res) {
    try {
      const userId = req.user ? req.user.id : null;
      const { categoryId, returnUrl, cancelUrl } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'ID de catégorie requis'
        });
      }

      const result = await CategoryPaymentService.initCategoryPayment(
        userId,
        categoryId,
        returnUrl,
        cancelUrl
      );

      return res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('Error initializing category payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'initialisation du paiement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Traite le webhook Konnect pour les paiements de catégorie
   */
  static async handleKonnectWebhook(req, res) {
    try {
      const { payment_ref } = req.query;

      if (!payment_ref) {
        console.log('⚠️ Webhook Konnect sans payment_ref');
        return res.status(400).json({
          success: false,
          message: 'payment_ref requis'
        });
      }

      console.log('🔔 Webhook Konnect reçu pour paiement de catégorie:', payment_ref);

      // Traiter le webhook avec le service Konnect
      const webhookResult = await konnectPaymentService.processWebhook(payment_ref);

      if (webhookResult.isCompleted) {
        // Traiter le paiement réussi
        await CategoryPaymentService.processSuccessfulPayment(payment_ref);
        console.log('✅ Paiement de catégorie confirmé:', payment_ref);
      } else if (webhookResult.isFailed) {
        console.log('❌ Paiement de catégorie échoué:', payment_ref);
      }

      return res.json({
        success: true,
        message: 'Webhook traité avec succès',
        paymentRef: payment_ref,
        status: webhookResult.status
      });

    } catch (error) {
      console.error('❌ Erreur traitement webhook catégorie:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du traitement du webhook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vérifie l'accès à une catégorie
   */
  static async checkCategoryAccess(req, res) {
    try {
      const userId = req.user ? req.user.id : null;
      const { categoryId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      if (!categoryId) {
        return res.status(400).json({
          success: false,
          message: 'ID de catégorie requis'
        });
      }

      const result = await CategoryPaymentService.checkCategoryAccess(userId, categoryId);

      return res.json({
        success: true,
        hasAccess: result.hasAccess,
        access: result.access
      });

    } catch (error) {
      console.error('Error checking category access:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de l\'accès',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vérifie l'accès à un niveau
   */
  static async checkLevelAccess(req, res) {
    try {
      const userId = req.user ? req.user.id : null;
      const { categoryId, pathId, levelId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      if (!categoryId || !pathId || !levelId) {
        return res.status(400).json({
          success: false,
          message: 'IDs de catégorie, parcours et niveau requis'
        });
      }

      const LevelUnlockService = require('../services/levelUnlockService');
      const access = await LevelUnlockService.checkLevelAccess(
        userId,
        categoryId,
        pathId,
        levelId
      );

      return res.json({
        success: true,
        access: access
      });

    } catch (error) {
      console.error('Error checking level access:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de l\'accès',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Débloque un niveau (après validation)
   */
  static async unlockLevel(req, res) {
    try {
      const userId = req.user ? req.user.id : null;
      const { categoryId, pathId, levelId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      if (!categoryId || !pathId || !levelId) {
        return res.status(400).json({
          success: false,
          message: 'IDs de catégorie, parcours et niveau requis'
        });
      }

      const access = await CategoryPaymentService.unlockLevel(
        userId,
        categoryId,
        pathId,
        levelId
      );

      return res.json({
        success: true,
        message: 'Niveau débloqué avec succès',
        access: access
      });

    } catch (error) {
      console.error('Error unlocking level:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du déblocage du niveau',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Récupère l'historique des accès de l'utilisateur
   */
  static async getUserAccessHistory(req, res) {
    try {
      const userId = req.user ? req.user.id : null;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentification requise'
        });
      }

      const history = await CategoryPaymentService.getUserAccessHistory(userId);

      return res.json({
        success: true,
        history: history
      });

    } catch (error) {
      console.error('Error getting user access history:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Nettoie les accès expirés (admin)
   */
  static async cleanupExpiredAccesses(req, res) {
    try {
      const count = await CategoryPaymentService.cleanupExpiredAccesses();

      return res.json({
        success: true,
        message: `${count} accès expirés nettoyés`,
        cleanedCount: count
      });

    } catch (error) {
      console.error('Error cleaning up expired accesses:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du nettoyage',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  /**
   * DEBUG: Réinitialise les accès d'un utilisateur par email
   */
  static async debugResetAccess(req, res) {
    try {
      const { email } = req.params;
      const User = require('../models/User');
      const CategoryAccess = require('../models/CategoryAccess');

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      const result = await CategoryAccess.deleteMany({ user: user._id });

      return res.json({
        success: true,
        message: `Accès réinitialisés pour ${email}`,
        count: result.deletedCount
      });
    } catch (error) {
      console.error('Error resetting access:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = CategoryPaymentController;
