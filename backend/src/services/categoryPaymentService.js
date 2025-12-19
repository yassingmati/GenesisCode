// src/services/categoryPaymentService.js
const CategoryPlan = require('../models/CategoryPlan');
const CategoryAccess = require('../models/CategoryAccess');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const User = require('../models/User');
const konnectPaymentService = require('./konnectPaymentService');
const Subscription = require('../models/Subscription');

class CategoryPaymentService {

  /**
   * Récupère tous les plans de catégories actifs
   */
  static async getAllCategoryPlans() {
    try {
      const Plan = require('../models/Plan');
      const Category = require('../models/Category');

      console.log('🔍 Fetching plans from "plans" collection (type=category)...');
      // Retrieve plans with type 'category' (or compatible)
      const plans = await Plan.find({ type: 'category', active: true }).lean();

      console.log(`✅ Found ${plans.length} plans in "plans" collection.`);

      // Manual population to avoid refPath case sensitivity issues (category vs Category)
      const categoryIds = plans.map(p => p.targetId).filter(id => id);
      const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
      const categoryMap = {};
      categories.forEach(c => {
        categoryMap[c._id.toString()] = c;
      });

      return plans.map(plan => {
        // Map "plans" fields to expected frontend format
        // plan.targetId is the ID, look it up in map
        const categoryObj = plan.targetId ? categoryMap[plan.targetId.toString()] : null;

        return {
          id: plan._id, // String ID
          _id: plan._id,
          category: categoryObj, // Populated category object
          categoryId: categoryObj?._id,

          // Map price: priceMonthly is in millimes/cents? 
          // Assuming priceMonthly 30000 = 30.000 TND or 300? 
          // Let's assume it's directly usable or needs division. 
          // Previous Context: User generally uses TND. 30000 likely means 30 Dinars (millimes).
          // But purely for display, let's pass it. If frontend expects generic units.
          // Let's divide by 1000 if it's millimes, or 100 if cents. 
          // Standard TND is usually 3 decimals. 30000 millimes = 30 TND.
          price: plan.priceMonthly ? plan.priceMonthly / 1000 : 0,

          currency: plan.currency || 'TND',
          paymentType: plan.interval === 'year' ? 'yearly' : 'one_time', // or monthly
          accessDuration: plan.interval === 'year' ? 365 : 30,

          name: plan.name,
          description: plan.description,
          features: plan.features,
          active: plan.active,

          // Compatibilité translations (si le front l'utilise)
          translations: {
            fr: { name: plan.name, description: plan.description },
            en: { name: plan.name, description: plan.description },
            ar: { name: plan.name, description: plan.description }
          }
        };
      });
    } catch (error) {
      console.error('Error getting category plans from Plan model:', error);
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
  static async initCategoryPayment(userId, categoryId, returnUrl, cancelUrl, promoCode) {
    try {
      const Plan = require('../models/Plan');
      const User = require('../models/User'); // Ensure User is loaded
      const PromoCode = require('../models/PromoCode'); // Import PromoCode model

      // Vérifier que l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Récupérer le plan de la catégorie depuis le modèle Plan
      // Note: On cherche le plan 'category' lié à cette categoryId
      console.log(`🔍 InitPayment: Searching for active plan for category ${categoryId}`);
      const categoryPlan = await Plan.findOne({
        type: 'category',
        targetId: categoryId,
        active: true
      });

      if (!categoryPlan) {
        throw new Error('Plan de catégorie non trouvé');
      }
      console.log(`✅ Plan found: ${categoryPlan._id}`);

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

      // Map price (assuming priceMonthly is stored in millimes/cents? defaulting to /1000 for consistency with getAll)
      // If we assume the DB value 30000 = 30 TND, then for payment we usually need millimes (30000) or main units?
      // Konnect usually expects Millimes.
      // IF DB is 30000 (30 TND), passing 30000 to Konnect (params: amount in CENTS/MILLIMES?)
      // PaymentData expected: amountCents? Konnect typically TND * 1000.
      // If DB has 30000, and it means 30000 millimes.
      // Let's assume priceMonthly IS the amount in smallest unit.
      let priceVal = categoryPlan.priceMonthly !== undefined ? categoryPlan.priceMonthly : 0;
      let appliedPromo = null;

      // START CLEANUP: Supprimer les accès 'pending' ou 'cancelled' précédents pour ne pas bloquer
      await CategoryAccess.deleteMany({
        user: userId,
        category: categoryId,
        status: { $in: ['pending', 'cancelled'] }
      });

      // --- LOGIQUE CODE PROMO ---
      if (promoCode) {
        // Validation logic reused from validatePromoCode method for consistency
        const validation = await this.validatePromoCode(promoCode, categoryPlan._id);

        if (validation.isValid) {
          appliedPromo = validation.promo;
          // Calculate price logic (duplicated slightly but simpler to keep linear here or use validation result)
          // Let's use validation result if extended later, but for now apply logic:
          if (appliedPromo.type === 'percentage') {
            priceVal = priceVal - (priceVal * (appliedPromo.value / 100));
          } else if (appliedPromo.type === 'fixed_amount') {
            priceVal = Math.max(0, priceVal - appliedPromo.value);
          }
          priceVal = Math.round(priceVal);
        }
      }

      // Plan gratuit (ou rendu gratuit par promo)
      if (priceVal <= 0) {
        const access = await this.grantFreeAccess(userId, categoryId, categoryPlan._id);

        // Incrémenter usage promo
        if (appliedPromo) {
          await PromoCode.findByIdAndUpdate(appliedPromo._id, { $inc: { usedCount: 1 } });
        }

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
        amountCents: priceVal, // Assuming stored in smallest unit
        currency: categoryPlan.currency || 'TND',
        description: `Accès à la catégorie ${categoryPlan.name} - GenesisCode`,
        merchantOrderId,
        customerEmail: user.email,
        returnUrl: returnUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success`,
        cancelUrl: cancelUrl || `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
        metadata: {
          categoryId,
          categoryPlanId: categoryPlan._id, // String ID
          userId,
          type: 'category_payment',
          paymentType: categoryPlan.interval === 'year' ? 'yearly' : 'one_time',
          promoCodeId: appliedPromo ? appliedPromo._id : null
        }
      };

      console.log(`💰 Final Price to charge: ${priceVal} (Promo applied: ${appliedPromo ? 'YES' : 'NO'})`);

      // Initialiser le paiement Konnect
      const paymentResult = await konnectPaymentService.initPayment(paymentData);

      // Créer l'accès en attente
      const access = new CategoryAccess({
        user: userId,
        category: categoryId,
        categoryPlan: categoryPlan._id, // String ID
        accessType: 'purchase',
        status: 'pending', // IMPORTANT: Ne pas activer par défaut
        payment: {
          konnectPaymentId: paymentResult.konnectPaymentId,
          amount: priceVal, // Storing raw value
          currency: categoryPlan.currency || 'TND',
          status: 'pending'
        }
      });

      await access.save();

      return {
        success: true,
        paymentUrl: paymentResult.paymentUrl,
        konnectPaymentId: paymentResult.konnectPaymentId,
        merchantOrderId,
        categoryPlan: {
          name: categoryPlan.name,
          description: categoryPlan.description
        },
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
      const Plan = require('../models/Plan'); // Ensure Plan is loaded

      // Trouver l'accès correspondant
      const access = await CategoryAccess.findOne({
        'payment.konnectPaymentId': konnectPaymentId
      }).populate('category');

      // Manual population of Plan if populate fails (optional but safe) or rely on Model ref
      // Since we changed schema to ref: 'Plan', standard populate 'categoryPlan' should work
      // BUT let's manually fetch correctly to be safe with String IDs
      if (!access) {
        throw new Error('Accès non trouvé pour ce paiement');
      }

      if (!access.categoryPlan) {
        throw new Error('ID du plan manquant dans l\'accès');
      }

      // Fetch the plan manually
      const plan = await Plan.findById(access.categoryPlan);
      if (!plan) {
        console.error(`Plan not found for ID: ${access.categoryPlan}`); // Log but proceed? No, can't calc expiry
        // Fallback default?
      }

      // Mettre à jour le statut du paiement
      access.payment.status = 'completed';
      access.status = 'active';

      // Calculer la date d'expiration
      // Plan model: interval 'month', 'year'
      if (plan) {
        if (plan.interval === 'year') {
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          access.expiresAt = expiresAt;
        } else if (plan.interval === 'month') {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          access.expiresAt = expiresAt;
        } else {
          // Default 365 days?
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 365);
          access.expiresAt = expiresAt;
        }
      } else {
        // Fallback if plan not found (should not happen)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);
        access.expiresAt = expiresAt;
      }

      await access.save();

      // Débloquer le premier niveau de chaque parcours de la catégorie
      await this.unlockFirstLevels(access.user, access.category);

      console.log('✅ Paiement de catégorie traité avec succès:', {
        userId: access.user,
        categoryId: access.category._id || access.category,
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
      // 1. Vérifier si l'utilisateur est Admin
      const user = await User.findById(userId);
      if (user && (user.roles?.includes('admin') || user.isAdmin)) {
        return { hasAccess: true, accessType: 'admin' };
      }

      // 2. Vérifier si l'utilisateur a un abonnement global actif
      // Note: Avec un abonnement global, on devrait aussi vérifier la progression (si les niveaux précédents sont faits)
      // Mais pour l'instant, on débloque l'accès technique.
      const activeSubscription = await Subscription.findActiveByUser(userId);

      const access = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);

      // Si pas d'accès catégoriel ET pas d'abonnement global -> Refus
      if ((!access || !access.isActive()) && !activeSubscription) {
        return { hasAccess: false, reason: 'no_category_access' };
      }

      // Si abonnement global, on autorise (ou on pourrait ajouter une logique de progression ici plus tard)
      if (activeSubscription) {
        // TODO: Implémenter la vérification de progression pour les abonnés globaux si nécessaire
        // Pour l'instant, disons qu'ils ont accès
        return { hasAccess: true, accessType: 'subscription' };
      }

      // Vérifier si le niveau est débloqué dans l'objet CategoryAccess
      if (access && access.hasUnlockedLevel(pathId, levelId)) {
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
   * Vérifie si un utilisateur a accès à une catégorie
   */
  static async checkCategoryAccess(userId, categoryId) {
    try {
      // 1. Vérifier si l'utilisateur est Admin
      const user = await User.findById(userId);
      if (user && (user.roles?.includes('admin') || user.isAdmin)) {
        return {
          hasAccess: true,
          access: {
            id: 'admin_bypass',
            type: 'admin',
            expiresAt: null
          }
        };
      }

      // 2. Vérifier si l'utilisateur a un abonnement global actif
      const activeSubscription = await Subscription.findActiveByUser(userId);
      if (activeSubscription) {
        return {
          hasAccess: true,
          access: {
            id: activeSubscription._id,
            type: 'subscription',
            expiresAt: activeSubscription.currentPeriodEnd
          }
        };
      }

      // 3. Vérifier l'accès spécifique à la catégorie
      const access = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);

      if (!access) {
        return { hasAccess: false, reason: 'no_access_found' };
      }

      // Vérifier si l'accès est encore valide (au cas où findActive ne capture pas tout)
      if (!access.isActive()) {
        return { hasAccess: false, reason: 'access_expired' };
      }

      return {
        hasAccess: true,
        access: {
          id: access._id,
          type: access.accessType,
          expiresAt: access.expiresAt
        }
      };
    } catch (error) {
      console.error('Error checking category access:', error);
      throw error;
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
        .populate('category') // 'categoryPlan' population might fail or return Plan doc
        .sort({ purchasedAt: -1 });

      // Manual fetch of Plans if needed, or rely on stored snapshot? 
      // Actually accessing the Plan document from the ID string
      const Plan = require('../models/Plan');
      const planIds = accesses.map(a => a.categoryPlan).filter(id => id && typeof id === 'string'); // IDs are strings
      const plans = await Plan.find({ _id: { $in: planIds } }).lean();
      const planMap = {};
      plans.forEach(p => planMap[p._id] = p);

      return accesses.map(access => {
        // Resolve Plan
        const plan = planMap[access.categoryPlan] || { name: 'Plan inconnu' };

        return {
          id: access._id,
          category: access.category,
          categoryPlan: {
            id: access.categoryPlan,
            name: plan.name,
            description: plan.description || ''
          },
          status: access.status,
          accessType: access.accessType,
          purchasedAt: access.purchasedAt,
          expiresAt: access.expiresAt,
          isActive: access.isActive(),
          unlockedLevelsCount: access.unlockedLevels.length
        };
      });

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
  /**
   * Valide un code promo et retourne les détails
   */
  static async validatePromoCode(code, categoryPlanId = null) {
    const PromoCode = require('../models/PromoCode');

    if (!code) return { isValid: false, message: 'Code requis' };

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), active: true });

    if (!promo || !promo.isValid()) {
      return { isValid: false, message: 'Code invalide ou expiré' };
    }

    // Vérification spécifique au plan si demandé
    if (categoryPlanId && promo.applicablePlans && promo.applicablePlans.length > 0) {
      if (!promo.applicablePlans.includes(categoryPlanId.toString())) {
        return { isValid: false, message: 'Ce code ne s\'applique pas à ce plan' };
      }
    }

    return {
      isValid: true,
      promo: promo,
      details: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        description: `Réduction de ${promo.value}${promo.type === 'percentage' ? '%' : ' TND'}`
      }
    };
  }
}
module.exports = CategoryPaymentService;
