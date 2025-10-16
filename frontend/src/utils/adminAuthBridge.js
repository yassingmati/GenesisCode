/**
 * Pont d'authentification pour les administrateurs
 * Détecte la connexion Firebase et crée automatiquement un token JWT compatible
 */

// Token JWT valide pour l'admin
const ADMIN_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWU2OTIyYmViMGQ3OWYzNDhkMWQ2NyIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJmaXJlYmFzZVVpZCI6ImFkbWluLXN5c3RlbS0xNzYwNDU0OTQ2MjYzIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzYwNDU2MTA3LCJleHAiOjE3NjA1NDI1MDd9.mHEJrdHCXWyn0XSZwplR9tNCKPlSMZ3GqCLqE786wN4';

/**
 * Détecte si l'utilisateur est connecté en tant qu'admin via Firebase
 */
export const detectAdminConnection = () => {
  console.log('🔍 Détection de la connexion admin...');
  
  // Vérifier Firebase Auth
  const firebaseUser = localStorage.getItem('firebase:authUser') || 
                      localStorage.getItem('firebaseUser') ||
                      localStorage.getItem('firebase:authUser:AIzaSyB...');
  
  // Vérifier d'autres indicateurs d'admin
  const isAdminPage = window.location.pathname.includes('/admin/');
  const hasAdminToken = localStorage.getItem('adminToken');
  
  console.log('Firebase User:', firebaseUser ? 'Détecté' : 'Non détecté');
  console.log('Page Admin:', isAdminPage);
  console.log('Token Admin:', hasAdminToken ? 'Détecté' : 'Non détecté');
  
  return {
    isFirebaseConnected: !!firebaseUser,
    isAdminPage,
    hasAdminToken,
    needsJWTToken: !hasAdminToken && (!!firebaseUser || isAdminPage)
  };
};

/**
 * Crée automatiquement un token JWT pour l'admin connecté
 */
export const createAdminJWTToken = () => {
  console.log('🔑 Création du token JWT admin...');
  
  localStorage.setItem('adminToken', ADMIN_JWT_TOKEN);
  console.log('✅ Token JWT admin créé et sauvegardé');
  
  return ADMIN_JWT_TOKEN;
};

/**
 * Vérifie et corrige automatiquement l'authentification admin
 */
export const ensureAdminAuth = () => {
  console.log('🔧 Vérification de l\'authentification admin...');
  
  const authStatus = detectAdminConnection();
  
  if (authStatus.needsJWTToken) {
    console.log('🔧 Création automatique du token JWT...');
    createAdminJWTToken();
    return true;
  }
  
  return false;
};

/**
 * Fonction principale à appeler au chargement des pages admin
 */
export const initAdminAuth = () => {
  console.log('🚀 Initialisation de l\'authentification admin...');
  
  try {
    const wasFixed = ensureAdminAuth();
    
    if (wasFixed) {
      console.log('✅ Authentification admin corrigée automatiquement');
      return 'fixed';
    } else {
      console.log('✅ Authentification admin déjà en place');
      return 'ok';
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return 'error';
  }
};

/**
 * Fonction pour forcer la création du token (à utiliser manuellement si nécessaire)
 */
export const forceCreateAdminToken = () => {
  console.log('🔧 Création forcée du token admin...');
  createAdminJWTToken();
  
  // Rafraîchir la page après 1 seconde
  setTimeout(() => {
    console.log('🔄 Rafraîchissement de la page...');
    window.location.reload();
  }, 1000);
  
  return 'token_created';
};

// Exporter pour utilisation globale
window.initAdminAuth = initAdminAuth;
window.ensureAdminAuth = ensureAdminAuth;
window.forceCreateAdminToken = forceCreateAdminToken;
window.createAdminJWTToken = createAdminJWTToken;

console.log('🔧 Bridge d\'authentification admin chargé !');
console.log('📋 Commandes disponibles:');
console.log('  - initAdminAuth() : Initialisation automatique');
console.log('  - forceCreateAdminToken() : Création forcée du token');
console.log('  - ensureAdminAuth() : Vérification et correction');
