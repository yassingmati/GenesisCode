const Plan = require('../../src/models/Plan');

/**
 * Fixtures pour les plans de test
 */
module.exports = {
  /**
   * Créer un plan gratuit
   */
  async createFreePlan(overrides = {}) {
    const defaultPlan = {
      _id: `free-${Date.now()}`,
      name: 'Plan Gratuit',
      description: 'Accès à la première leçon de chaque parcours',
      priceMonthly: null,
      currency: 'TND',
      interval: null,
      features: ['Première leçon gratuite', 'Accès limité'],
      active: true,
      ...overrides
    };

    return await Plan.create(defaultPlan);
  },

  /**
   * Créer un plan premium
   */
  async createPremiumPlan(overrides = {}) {
    const defaultPlan = {
      _id: `premium-${Date.now()}`,
      name: 'Plan Premium',
      description: 'Accès complet à tous les parcours',
      priceMonthly: 4999, // 49.99 TND en centimes
      currency: 'TND',
      interval: 'month',
      features: ['Tous les parcours', 'Exercices illimités', 'Support prioritaire'],
      active: true,
      ...overrides
    };

    return await Plan.create(defaultPlan);
  },

  /**
   * Créer un plan débutant
   */
  async createBeginnerPlan(overrides = {}) {
    const defaultPlan = {
      _id: `beginner-${Date.now()}`,
      name: 'Plan Débutant',
      description: 'Accès aux parcours débutant',
      priceMonthly: 1999, // 19.99 TND en centimes
      currency: 'TND',
      interval: 'month',
      features: ['Parcours débutant', 'Exercices illimités'],
      active: true,
      ...overrides
    };

    return await Plan.create(defaultPlan);
  },

  /**
   * Créer un plan annuel
   */
  async createYearlyPlan(overrides = {}) {
    const defaultPlan = {
      _id: `yearly-${Date.now()}`,
      name: 'Plan Annuel',
      description: 'Abonnement annuel avec réduction',
      priceMonthly: 39999, // 399.99 TND en centimes
      currency: 'TND',
      interval: 'year',
      features: ['Tous les parcours', 'Exercices illimités', 'Support prioritaire', 'Réduction annuelle'],
      active: true,
      ...overrides
    };

    return await Plan.create(defaultPlan);
  },

  /**
   * Créer plusieurs plans
   */
  async createMultiplePlans() {
    const freePlan = await this.createFreePlan();
    const premiumPlan = await this.createPremiumPlan();
    const beginnerPlan = await this.createBeginnerPlan();
    
    return {
      free: freePlan,
      premium: premiumPlan,
      beginner: beginnerPlan
    };
  },

  /**
   * Données brutes pour créer un plan (sans sauvegarde)
   */
  getRawPlanData(overrides = {}) {
    return {
      _id: `plan-${Date.now()}`,
      name: 'Plan Test',
      description: 'Description du plan test',
      priceMonthly: 2999,
      currency: 'TND',
      interval: 'month',
      features: ['Feature 1', 'Feature 2'],
      active: true,
      ...overrides
    };
  }
};

