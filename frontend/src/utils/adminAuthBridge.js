/**
 * Pont d'authentification pour les administrateurs
 * Vérifie l'authentification admin sans injecter de tokens hardcodés
 * 
 * IMPORTANT: Ce module ne crée PLUS de tokens automatiquement.
 * Les admins doivent se connecter via /admin/login pour obtenir un token valide.
 */

/**
 * Détecte si l'utilisateur est connecté en tant qu'admin
 */
export const detectAdminConnection = () => {
  console.log('🔍 Détection de la connexion admin...');

  const isAdminPage = window.location.pathname.includes('/admin/');
  const hasAdminToken = localStorage.getItem('adminToken');
  const adminData = localStorage.getItem('adminData');

  // Vérifier si l'utilisateur backend a le rôle admin
  const userData = localStorage.getItem('user');
  const userToken = localStorage.getItem('token');
  let userIsAdmin = false;

  if (userData) {
    try {
      const user = JSON.parse(userData);
      userIsAdmin = user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin'));
    } catch (e) {
      console.warn('Erreur lors de la lecture des données utilisateur:', e);
    }
  }

  console.log('📍 Page Admin:', isAdminPage);
  console.log('🔑 Token Admin:', hasAdminToken ? 'Présent' : 'Absent');
  console.log('👤 Admin Data:', adminData ? 'Présent' : 'Absent');
  console.log('👥 User is Admin:', userIsAdmin);

  return {
    isAdminPage,
    hasAdminToken: !!hasAdminToken,
    hasAdminData: !!adminData,
    userIsAdmin,
    userToken,
    isAuthenticated: !!(hasAdminToken && adminData)
  };
};

/**
 * Synchronise le token utilisateur avec le token admin si l'utilisateur a le rôle admin
 */
export const syncUserAdminToken = () => {
  console.log('🔄 Synchronisation du token admin depuis l\'utilisateur...');

  const userToken = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!userToken || !userData) {
    console.log('❌ Pas de token utilisateur à synchroniser');
    return false;
  }

  try {
    const user = JSON.parse(userData);
    if (user.role === 'admin' || (Array.isArray(user.roles) && user.roles.includes('admin'))) {
      console.log('✅ Utilisateur avec rôle admin détecté, synchronisation du token');
      localStorage.setItem('adminToken', userToken);
      localStorage.setItem('adminData', userData);
      return true;
    }
  } catch (e) {
    console.warn('❌ Erreur lors de la synchronisation:', e);
  }

  return false;
};

/**
 * Vérifie l'authentification admin sans créer de token automatiquement
 */
export const ensureAdminAuth = () => {
  console.log('🔧 Vérification de l\'authentification admin...');

  const authStatus = detectAdminConnection();

  // Si un token admin existe déjà, c'est bon
  if (authStatus.isAuthenticated) {
    console.log('✅ Token admin valide déjà présent');
    return { status: 'ok', authenticated: true };
  }

  // Si l'utilisateur a le rôle admin, synchroniser son token
  if (authStatus.userIsAdmin && authStatus.userToken) {
    console.log('🔄 Synchronisation du token utilisateur admin...');
    const synced = syncUserAdminToken();
    if (synced) {
      return { status: 'synced', authenticated: true };
    }
  }

  // Pas de token valide
  console.warn('⚠️ Aucun token admin valide - connexion requise');
  return { status: 'no_token', authenticated: false };
};

/**
 * Fonction principale à appeler au chargement des pages admin
 */
export const initAdminAuth = () => {
  console.log('🚀 Initialisation de l\'authentification admin...');

  try {
    const result = ensureAdminAuth();

    if (result.authenticated) {
      console.log('✅ Authentification admin confirmée');
      return result.status;
    } else {
      console.warn('⚠️ Authentification admin manquante - redirection vers login recommandée');
      return 'not_authenticated';
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return 'error';
  }
};

/**
 * Nettoie les tokens admin (pour déconnexion)
 */
export const clearAdminAuth = () => {
  console.log('🧹 Nettoyage de l\'authentification admin...');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
  console.log('✅ Tokens admin supprimés');
};

// Exporter pour utilisation globale (debugging)
if (typeof window !== 'undefined') {
  window.initAdminAuth = initAdminAuth;
  window.ensureAdminAuth = ensureAdminAuth;
  window.detectAdminConnection = detectAdminConnection;
  window.syncUserAdminToken = syncUserAdminToken;
  window.clearAdminAuth = clearAdminAuth;

  console.log('🔧 Bridge d\'authentification admin chargé !');
  console.log('📋 Commandes disponibles:');
  console.log('  - initAdminAuth() : Vérification de l\'authentification');
  console.log('  - detectAdminConnection() : Détection du statut admin');
  console.log('  - syncUserAdminToken() : Synchronisation token utilisateur admin');
  console.log('  - clearAdminAuth() : Nettoyage des tokens admin');
}
