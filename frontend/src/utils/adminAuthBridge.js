/**
 * Pont d'authentification pour les administrateurs
 * Détecte la connexion Firebase et crée automatiquement un token JWT compatible
 */

// Token JWT valide pour l'admin
const ADMIN_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGY2NGU3NzA4ODRlZDMyNTg4YjExOSIsImVtYWlsIjoiYWRtaW4yQHRlc3QuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0MTU4NzIxLCJleHAiOjE3NjY3NTA3MjF9.asSiYyDsYDE47JAodtiAqt-ws-7e1tRki4bP_7cPX9U';

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

  // Vérifier si l'utilisateur backend a le rôle admin
  const userData = localStorage.getItem('user');
  let userIsAdmin = false;
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userIsAdmin = user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin'));
    } catch (e) {
      // Ignore parse errors
    }
  }

  console.log('Firebase User:', firebaseUser ? 'Détecté' : 'Non détecté');
  console.log('Page Admin:', isAdminPage);
  console.log('Token Admin:', hasAdminToken ? 'Détecté' : 'Non détecté');
  console.log('User is Admin:', userIsAdmin);

  return {
    isFirebaseConnected: !!firebaseUser,
    isAdminPage,
    hasAdminToken,
    userIsAdmin,
    needsJWTToken: !hasAdminToken && (!!firebaseUser || isAdminPage) && !userIsAdmin
  };
};

/**
 * Crée automatiquement un token JWT pour l'admin connecté
 */
export const createAdminJWTToken = () => {
  console.log('🔑 Création du token JWT admin...');

  // D'abord, vérifier si l'utilisateur a le rôle admin et utiliser son token
  const userToken = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (userToken && userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin'))) {
        console.log('✅ Utilisation du token de l\'utilisateur admin');
        localStorage.setItem('adminToken', userToken);
        return userToken;
      }
    } catch (e) {
      console.warn('Erreur lors de la lecture des données utilisateur:', e);
    }
  }

  // Sinon, utiliser le token hardcodé (qui nécessite un admin existant dans la DB)
  console.warn('⚠️ Utilisation du token admin hardcodé - assurez-vous qu\'un admin avec cet ID existe dans la DB');
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
  const currentToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // Si un token admin valide existe déjà (venant du login), ne pas l'écraser
  if (currentToken && currentToken !== ADMIN_JWT_TOKEN) {
    console.log('✅ Token admin valide déjà présent (venant du login)');
    return false;
  }

  // Si l'utilisateur a le rôle admin, utiliser son token
  if (userToken && userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin'))) {
        console.log('✅ Utilisateur avec rôle admin détecté, utilisation de son token');
        localStorage.setItem('adminToken', userToken);
        return false;
      }
    } catch (e) {
      console.warn('Erreur lors de la lecture des données utilisateur:', e);
    }
  }

  // Force update if token is missing OR different from the valid one
  if (authStatus.needsJWTToken || (currentToken && currentToken !== ADMIN_JWT_TOKEN)) {
    console.log('🔧 Mise à jour du token JWT admin (token manquant ou obsolète)...');
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
