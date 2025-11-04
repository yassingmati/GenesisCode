const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');

/**
 * Fixtures pour les utilisateurs de test
 */
module.exports = {
  /**
   * Créer un utilisateur de test standard
   */
  async createTestUser(overrides = {}) {
    const defaultUser = {
      firebaseUid: `test-uid-${Date.now()}-${Math.random()}`,
      email: `test-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'User',
      userType: 'student',
      isVerified: true,
      isProfileComplete: true,
      subscription: {
        status: null,
        planId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      },
      roles: [],
      totalXP: 0,
      ...overrides
    };

    return await User.create(defaultUser);
  },

  /**
   * Créer un utilisateur avec abonnement actif
   */
  async createUserWithSubscription(planId, overrides = {}) {
    const user = await this.createTestUser({
      subscription: {
        status: 'active',
        planId: planId,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        cancelAtPeriodEnd: false
      },
      ...overrides
    });
    return user;
  },

  /**
   * Créer un utilisateur avec abonnement expiré
   */
  async createUserWithExpiredSubscription(planId, overrides = {}) {
    const user = await this.createTestUser({
      subscription: {
        status: 'canceled',
        planId: planId,
        currentPeriodEnd: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 jours passés
        cancelAtPeriodEnd: false
      },
      ...overrides
    });
    return user;
  },

  /**
   * Créer un utilisateur parent
   */
  async createParentUser(overrides = {}) {
    return await this.createTestUser({
      userType: 'parent',
      ...overrides
    });
  },

  /**
   * Créer un utilisateur non vérifié
   */
  async createUnverifiedUser(overrides = {}) {
    return await this.createTestUser({
      isVerified: false,
      isProfileComplete: false,
      ...overrides
    });
  },

  /**
   * Données brutes pour créer un utilisateur (sans sauvegarde)
   */
  getRawUserData(overrides = {}) {
    return {
      firebaseUid: `test-uid-${Date.now()}-${Math.random()}`,
      email: `test-${Date.now()}@test.com`,
      firstName: 'Test',
      lastName: 'User',
      userType: 'student',
      isVerified: true,
      isProfileComplete: true,
      subscription: {
        status: null,
        planId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      },
      roles: [],
      totalXP: 0,
      ...overrides
    };
  }
};

