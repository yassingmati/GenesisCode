// Service de gestion des abonnements avec Konnect
import API_CONFIG from '../config/api';

class SubscriptionService {
  /**
   * Récupérer tous les plans disponibles
   * @returns {Promise<Array>} - Liste des plans
   */
  static async getPlans() {
    try {
      console.log('📋 Récupération des plans...');

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.PLANS), {
        method: 'GET',
        headers: API_CONFIG.getPublicHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Plans récupérés:', data.plans?.length || 0);

      return data.plans || [];
    } catch (error) {
      console.error('❌ Erreur récupération plans:', error);
      throw error;
    }
  }

  /**
   * Récupérer les plans pour un parcours spécifique
   * @param {string} pathId - ID du parcours
   * @returns {Promise<Array>} - Liste des plans pour le parcours
   */
  static async getPlansForPath(pathId) {
    try {
      console.log('📋 Récupération des plans pour le parcours:', pathId);

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.PLANS_BY_PATH(pathId)), {
        method: 'GET',
        headers: API_CONFIG.getPublicHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Plans pour parcours récupérés:', data.plans?.length || 0);

      return data.plans || [];
    } catch (error) {
      console.error('❌ Erreur récupération plans parcours:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'abonnement de l'utilisateur actuel
   * @returns {Promise<Object>} - Abonnement de l'utilisateur
   */
  static async getMySubscription() {
    try {
      console.log('👤 Récupération de l\'abonnement utilisateur...');

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION_ME), {
        method: 'GET',
        headers: API_CONFIG.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Abonnement utilisateur récupéré:', data.subscription);

      return data.subscription || null;
    } catch (error) {
      console.error('❌ Erreur récupération abonnement:', error);
      throw error;
    }
  }

  /**
   * S'abonner à un plan
   * @param {string} planId - ID du plan
   * @param {Object} options - Options d'abonnement
   * @returns {Promise<Object>} - Résultat de l'abonnement
   */
  static async subscribe(planId, options = {}) {
    try {
      console.log('💳 Abonnement au plan:', planId);

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION_SUBSCRIBE), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify({
          planId,
          returnUrl: options.returnUrl || `${window.location.origin}/payment/success`,
          cancelUrl: options.cancelUrl || `${window.location.origin}/payment/cancel`,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Abonnement initialisé:', data);

      return data;
    } catch (error) {
      console.error('❌ Erreur abonnement:', error);
      throw error;
    }
  }

  /**
   * Annuler l'abonnement
   * @returns {Promise<Object>} - Résultat de l'annulation
   */
  static async cancelSubscription() {
    try {
      console.log('❌ Annulation de l\'abonnement...');

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION_CANCEL), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Abonnement annulé:', data);

      return data;
    } catch (error) {
      console.error('❌ Erreur annulation abonnement:', error);
      throw error;
    }
  }

  /**
   * Reprendre l'abonnement
   * @returns {Promise<Object>} - Résultat de la reprise
   */
  static async resumeSubscription() {
    try {
      console.log('▶️ Reprise de l\'abonnement...');

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION_RESUME), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Abonnement repris:', data);

      return data;
    } catch (error) {
      console.error('❌ Erreur reprise abonnement:', error);
      throw error;
    }
  }

  /**
   * Vérifier l'accès à un parcours
   * @param {string} pathId - ID du parcours
   * @returns {Promise<Object>} - Statut d'accès
   */
  static async checkPathAccess(pathId) {
    try {
      console.log('🔍 Vérification d\'accès au parcours:', pathId);

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.CHECK_ACCESS(pathId)), {
        method: 'GET',
        headers: API_CONFIG.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Accès vérifié:', data.access);

      return data.access || { hasAccess: false };
    } catch (error) {
      console.error('❌ Erreur vérification accès:', error);
      throw error;
    }
  }

  /**
   * Vérifier l'accès à un niveau spécifique
   * @param {string} pathId - ID du parcours
   * @param {string} levelId - ID du niveau
   * @returns {Promise<Object>} - Statut d'accès au niveau
   */
  static async checkLevelAccess(pathId, levelId) {
    try {
      console.log('🔍 Vérification d\'accès au niveau:', pathId, levelId);

      const response = await fetch(API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.CHECK_LEVEL_ACCESS(pathId, levelId)), {
        method: 'GET',
        headers: API_CONFIG.getDefaultHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Accès niveau vérifié:', data.access);

      return data.access || { hasAccess: false };
    } catch (error) {
      console.error('❌ Erreur vérification accès niveau:', error);
      throw error;
    }
  }
}

export default SubscriptionService;
