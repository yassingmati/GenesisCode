// Configuration des URLs API avec intégration Konnect
const API_CONFIG = {
  // URL de base du backend
  BASE_URL: 'http://localhost:5000',
  
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
    
    // Vérification d'accès
    CHECK_ACCESS: (pathId) => `/api/course-access/check/path/${pathId}`,
    CHECK_LEVEL_ACCESS: (pathId, levelId) => `/api/course-access/check/path/${pathId}/level/${levelId}`,
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
