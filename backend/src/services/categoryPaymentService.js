// src/services/categoryPaymentService.js
const CategoryPlan = require('../models/CategoryPlan');
const CategoryAccess = require('../models/CategoryAccess');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const User = require('../models/User');
const konnectPaymentService = require('./konnectPaymentService');

class CategoryPaymentService {
  
  /**
   * Récupère tous les plans de catégories actifs
   */
  static async getAllCategoryPlans() {
    try {
      // Vérifier que MongoDB est connecté
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.warn('⚠️ MongoDB non connecté, attente de la connexion...');
        // Attendre jusqu'à 5 secondes que MongoDB se connecte
        let attempts = 0;
        while (mongoose.connection.readyState !== 1 && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        if (mongoose.connection.readyState !== 1) {
          throw new Error('MongoDB non connecté - impossible de récupérer les plans');
        }
      }
      
      const plans = await CategoryPlan.findAllActive();
      // Convertir les plans en objets JavaScript simples et gérer les erreurs
      return plans.map(plan => {
        try {
          // Si c'est un document Mongoose, convertir en objet
          const planObj = plan.toObject ? plan.toObject() : plan;
          
          // Construire l'objet avec toutes les propriétés nécessaires
          const translation = planObj.translations?.fr || planObj.translations?.en || { name: 'Plan', description: '' };
          
          // Utiliser getLocalizedInfo si disponible, mais ajouter les champs manquants
          let localizedInfo = {};
          if (typeof plan.getLocalizedInfo === 'function') {
            localizedInfo = plan.getLocalizedInfo();
          }
          
          // Construire l'objet complet avec toutes les propriétés
          return {
            id: planObj._id || planObj.id || localizedInfo.id,
            _id: planObj._id || planObj.id || localizedInfo.id,
            category: planObj.category || localizedInfo.category,
            price: planObj.price !== undefined ? planObj.price : (localizedInfo.price !== undefined ? localizedInfo.price : 0),
            currency: planObj.currency || localizedInfo.currency || 'TND',
            paymentType: planObj.paymentType || localizedInfo.paymentType || 'one_time',
            accessDuration: planObj.accessDuration !== undefined ? planObj.accessDuration : (localizedInfo.accessDuration !== undefined ? localizedInfo.accessDuration : 365),
            active: planObj.active !== false && planObj.active !== undefined ? planObj.active : (localizedInfo.active !== undefined ? localizedInfo.active : true),
            name: localizedInfo.name || translation.name || 'Plan',
            description: localizedInfo.description || translation.description || '',
            translations: planObj.translations || {},
            features: planObj.features || localizedInfo.features || [],
            order: planObj.order !== undefined ? planObj.order : (localizedInfo.order !== undefined ? localizedInfo.order : 0)
          };
        } catch (err) {
          console.error('Error processing plan:', err);
          // Retourner un plan minimal en cas d'erreur
          return {
            id: plan._id || plan.id,
            _id: plan._id || plan.id,
            name: 'Plan',
            description: '',
            price: 0,
            currency: 'TND',
            active: true,
            translations: {},
            features: []
          };
        }
      });
    } catch (error) {
      console.error('Error getting category plans:', error);
      throw error;
    }
  }
  
  /**
   * Récupère le plan d'une catégorie spécifique
   */
  static async getCategoryPlan(categoryId) {
    try {
      const plan = await CategoryPlan.findByCategory(categoryId);
      if (!plan) {
        throw new Error('Plan de catégorie non trouvé');
      }
      return plan.getLocalizedInfo();
    } catch (error) {
      console.error('Error getting category plan:', error);
      throw error;
    }
  }
  
  /**
   * Initialise un paiement pour une catégorie
   */
  static async initCategoryPayment(userId, categoryId, returnUrl, cancelUrl) {
    try {
      // Vérifier que l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Récupérer le plan de la catégorie
      const categoryPlan = await CategoryPlan.findByCategory(categoryId);
      if (!categoryPlan) {
        throw new Error('Plan de catégorie non trouvé');
      }
      
      // Vérifier si l'utilisateur a déjà accès à cette catégorie
      const existingAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (existingAccess) {
        return {
          success: true,
          alreadyHasAccess: true,
          access: existingAccess,
          message: 'Vous avez déjà accès à cette catégorie'
        };
      }
      
      // Plan gratuit - accès immédiat
      if (categoryPlan.price === 0) {
        const access = await this.grantFreeAccess(userId, categoryId, categoryPlan._id);
        return {
          success: true,
          freeAccess: true,
          access: access,
          message: 'Accès gratuit accordé'
        };
      }
      
      // Générer un ID de commande unique
      const merchantOrderId = `cat_${userId}_${categoryId}_${Date.now()}`;
      
      // Préparer les données de paiement
      const paymentData = {
        amountCents: categoryPlan.price * 100, // Convertir en centimes
        currency: categoryPlan.currency,
        description: `Accès à la catégorie ${categoryPlan.translations.fr.name} - GenesisCode`,
        merchantOrderId,
        customerEmail: user.email,
        returnUrl: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success`,
        cancelUrl: cancelUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
        metadata: {
          categoryId,
          categoryPlanId: categoryPlan._id,
          userId,
          type: 'category_payment',
          paymentType: categoryPlan.paymentType
        }
      };
      
      // Initialiser le paiement Konnect
      const paymentResult = await konnectPaymentService.initPayment(paymentData);
      
      // Créer l'accès en attente
      const access = new CategoryAccess({
        user: userId,
        category: categoryId,
        categoryPlan: categoryPlan._id,
        accessType: 'purchase',
        payment: {
          konnectPaymentId: paymentResult.konnectPaymentId,
          amount: categoryPlan.price,
          currency: categoryPlan.currency,
          status: 'pending'
        }
      });
      
      await access.save();
      
      return {
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        konnectPaymentId: paymentResult.konnectPaymentId,
        merchantOrderId,
        categoryPlan: categoryPlan.getLocalizedInfo(),
        accessId: access._id
      };
      
    } catch (error) {
      console.error('Error initializing category payment:', error);
      throw error;
    }
  }
  
  /**
   * Traite un paiement réussi pour une catégorie
   */
  static async processSuccessfulPayment(konnectPaymentId) {
    try {
      // Trouver l'accès correspondant
      const access = await CategoryAccess.findOne({
        'payment.konnectPaymentId': konnectPaymentId
      }).populate('category categoryPlan');
      
      if (!access) {
        throw new Error('Accès non trouvé pour ce paiement');
      }
      
      // Mettre à jour le statut du paiement
      access.payment.status = 'completed';
      access.status = 'active';
      
      // Calculer la date d'expiration
      if (access.categoryPlan.paymentType === 'one_time') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + access.categoryPlan.accessDuration);
        access.expiresAt = expiresAt;
      } else if (access.categoryPlan.paymentType === 'monthly') {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        access.expiresAt = expiresAt;
      } else if (access.categoryPlan.paymentType === 'yearly') {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        access.expiresAt = expiresAt;
      }
      
      await access.save();
      
      // Débloquer le premier niveau de chaque parcours de la catégorie
      await this.unlockFirstLevels(access.user, access.category);
      
      console.log('✅ Paiement de catégorie traité avec succès:', {
        userId: access.user,
        categoryId: access.category,
        expiresAt: access.expiresAt
      });
      
      return access;
      
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }
  
  /**
   * Débloque le premier niveau de chaque parcours d'une catégorie
   */
  static async unlockFirstLevels(userId, categoryId) {
    try {
      const LevelUnlockService = require('./levelUnlockService');
      await LevelUnlockService.unlockFirstLevelsForCategory(userId, categoryId);
    } catch (error) {
      console.error('Error unlocking first levels:', error);
      throw error;
    }
  }
  
  /**
   * Débloque un niveau spécifique
   */
  static async unlockLevel(userId, categoryId, pathId, levelId) {
    try {
      const access = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (!access) {
        throw new Error('Accès à la catégorie non trouvé');
      }
      
      // Débloquer le niveau (opération atomique)
      await CategoryAccess.updateOne(
        {
          _id: access._id,
          status: 'active',
          'unlockedLevels.level': { $ne: levelId }
        },
        {
          $addToSet: {
            unlockedLevels: {
              path: pathId,
              level: levelId,
              unlockedAt: new Date()
            }
          }
        }
      );
      
      console.log('✅ Niveau débloqué:', {
        userId,
        categoryId,
        pathId,
        levelId
      });
      
      return access;
      
    } catch (error) {
      console.error('Error unlocking level:', error);
      throw error;
    }
  }
  
  /**
   * Vérifie si un utilisateur a accès à un niveau d'une catégorie
   */
  static async checkLevelAccess(userId, categoryId, pathId, levelId) {
    try {
      const access = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (!access || !access.isActive()) {
        return { hasAccess: false, reason: 'no_category_access' };
      }
      
      // Vérifier si le niveau est débloqué
      if (access.hasUnlockedLevel(pathId, levelId)) {
        return { hasAccess: true, accessType: 'purchased' };
      }
      
      // Vérifier si c'est le premier niveau (gratuit)
      const path = await Path.findById(pathId).populate('levels');
      if (path && path.levels && path.levels.length > 0) {
        const sortedLevels = path.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
        const firstLevel = sortedLevels[0];
        
        if (firstLevel._id.toString() === levelId.toString()) {
          return { hasAccess: true, accessType: 'free' };
        }
      }
      
      return { hasAccess: false, reason: 'level_not_unlocked' };
      
    } catch (error) {
      console.error('Error checking level access:', error);
      return { hasAccess: false, reason: 'error' };
    }
  }
  
  /**
   * Accorde l'accès gratuit à une catégorie
   */
  static async grantFreeAccess(userId, categoryId, categoryPlanId) {
    try {
      const access = new CategoryAccess({
        user: userId,
        category: categoryId,
        categoryPlan: categoryPlanId,
        accessType: 'free',
        status: 'active'
      });
      
      await access.save();
      
      // Débloquer le premier niveau de chaque parcours
      await this.unlockFirstLevels(userId, categoryId);
      
      return access;
      
    } catch (error) {
      console.error('Error granting free access:', error);
      throw error;
    }
  }
  
  /**
   * Récupère l'historique des accès d'un utilisateur
   */
  static async getUserAccessHistory(userId) {
    try {
      const accesses = await CategoryAccess.find({ user: userId })
        .populate('category categoryPlan')
        .sort({ purchasedAt: -1 });
      
      return accesses.map(access => ({
        id: access._id,
        category: access.category,
        categoryPlan: access.categoryPlan,
        status: access.status,
        accessType: access.accessType,
        purchasedAt: access.purchasedAt,
        expiresAt: access.expiresAt,
        isActive: access.isActive(),
        unlockedLevelsCount: access.unlockedLevels.length
      }));
      
    } catch (error) {
      console.error('Error getting user access history:', error);
      throw error;
    }
  }
  
  /**
   * Nettoie les accès expirés
   */
  static async cleanupExpiredAccesses() {
    try {
      const expiredAccesses = await CategoryAccess.findExpired();
      
      for (const access of expiredAccesses) {
        await access.expire();
      }
      
      console.log(`✅ ${expiredAccesses.length} accès expirés nettoyés`);
      return expiredAccesses.length;
      
    } catch (error) {
      console.error('Error cleaning up expired accesses:', error);
      throw error;
    }
  }
}

module.exports = CategoryPaymentService;
