const User = require('../../src/models/User');
const Plan = require('../../src/models/Plan');
const CategoryAccess = require('../../src/models/CategoryAccess');
const userFixtures = require('./users');
const planFixtures = require('./plans');

/**
 * Fixtures pour les abonnements de test
 */
module.exports = {
  /**
   * Créer un utilisateur avec un abonnement actif
   */
  async createUserWithActiveSubscription(planData = null) {
    const plan = planData || await planFixtures.createPremiumPlan();
    const user = await userFixtures.createUserWithSubscription(plan._id);
    return { user, plan };
  },

  /**
   * Créer un utilisateur avec un abonnement expiré
   */
  async createUserWithExpiredSubscription(planData = null) {
    const plan = planData || await planFixtures.createPremiumPlan();
    const user = await userFixtures.createUserWithExpiredSubscription(plan._id);
    return { user, plan };
  },

  /**
   * Créer un utilisateur sans abonnement
   */
  async createUserWithoutSubscription() {
    const user = await userFixtures.createTestUser({
      subscription: {
        status: null,
        planId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }
    });
    return user;
  },

  /**
   * Mettre à jour l'abonnement d'un utilisateur
   */
  async updateUserSubscription(userId, subscriptionData) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    user.subscription = {
      ...user.subscription,
      ...subscriptionData
    };
    
    await user.save();
    return user;
  },

  /**
   * Créer un accès à une catégorie pour un utilisateur
   */
  async createCategoryAccess(userId, categoryId, overrides = {}) {
    const categoryAccess = await CategoryAccess.create({
      user: userId,
      category: categoryId,
      accessType: 'purchased',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      ...overrides
    });
    return categoryAccess;
  },

  /**
   * Données brutes pour un abonnement (sans sauvegarde)
   */
  getRawSubscriptionData(planId = null, overrides = {}) {
    return {
      status: 'active',
      planId: planId,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      cancelAtPeriodEnd: false,
      ...overrides
    };
  }
};

