import { getApiUrl } from '../utils/apiConfig';
// Configuration des URLs API avec intégration Konnect
const API_CONFIG = {
  // URL de base du backend
  // En production: utiliser le backend Render
  // En développement: localhost
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://codegenesis-backend.onrender.com' 
      : getApiUrl('')),
  
  // Configuration Konnect - PRODUCTION
  KONNECT: {
    API_KEY: '689df9b0833596bcddc09e0d:axek3r0LxkuY5rGHwcWKAZiUw',
    BASE_URL: 'https://api.konnect.network',
    RECEIVER_WALLET_ID: '689df9b2833596bcddc09fe0',
    GATEWAY_URL: 'https://gateway.konnect.network'
  },
  
  // Endpoints
  ENDPOINTS: {
    // Plans d'abonnement
    PLANS: '/api/plans',
    PLANS_BY_PATH: (pathId) => `/api/plans/path/${pathId}`,
    // Nouveaux plans par catégorie (même source que l'admin, public actuellement)
    CATEGORY_PLANS: '/api/category-payments/plans', // Endpoint public pour les plans de catégories
    ADMIN_CATEGORY_PLANS: '/api/admin/category-plans', // Endpoint admin protégé
    
    // Paiements Konnect
    PAYMENT_INIT: '/api/payment/init',
    PAYMENT_STATUS: (paymentId) => `/api/payment/status/${paymentId}`,
    PAYMENT_RETURN: '/api/payment/return',
    
    // Abonnements
    SUBSCRIPTION_PLANS: '/api/subscriptions/plans',
    SUBSCRIPTION_SUBSCRIBE: '/api/subscriptions/subscribe',
    SUBSCRIPTION_ME: '/api/subscriptions/me',
    SUBSCRIPTION_CANCEL: '/api/subscriptions/cancel',
    SUBSCRIPTION_RESUME: '/api/subscriptions/resume',
    
    // Vérification d'accès (historique)
    CHECK_ACCESS: (pathId) => `/api/course-access/check/path/${pathId}`,
    CHECK_LEVEL_ACCESS: (pathId, levelId) => `/api/course-access/check/path/${pathId}/level/${levelId}`,

    // Vérification d'accès (nouvelle route générique)
    ACCESS_CHECK: ({ pathId, levelId, exerciseId } = {}) => {
      const params = new URLSearchParams();
      if (pathId) params.set('pathId', pathId);
      if (levelId) params.set('levelId', levelId);
      if (exerciseId) params.set('exerciseId', exerciseId);
      return `/api/access/check?${params.toString()}`;
    }
  },
  
  // Méthodes utilitaires
  getFullUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
  
  // Headers par défaut
  getDefaultHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }),
  
  // Headers pour les requêtes publiques
  getPublicHeaders: () => ({
    'Content-Type': 'application/json'
  })
};

export default API_CONFIG;
