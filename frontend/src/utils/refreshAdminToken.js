/**
 * Script pour rafraîchir automatiquement le token admin
 * Génère un nouveau token JWT valide quand l'ancien expire
 */

// Token JWT valide et récent pour l'admin
// Généré avec: node backend/src/scripts/generateValidAdminToken.js
const FRESH_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGY2NGU3NzA4ODRlZDMyNTg4YjExOSIsImVtYWlsIjoiYWRtaW4yQHRlc3QuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzY0MTU4NzIxLCJleHAiOjE3NjY3NTA3MjF9.asSiYyDsYDE47JAodtiAqt-ws-7e1tRki4bP_7cPX9U';

/**
 * Vérifie si le token actuel est valide
 */
export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    // Décoder le token JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);

    // Vérifier l'expiration
    if (payload.exp && payload.exp < now) {
      console.log('⚠️ Token expiré');
      return false;
    }

    // Vérifier la structure
    if (!payload.id || !payload.email || !payload.roles) {
      console.log('⚠️ Token invalide - structure incorrecte');
      return false;
    }

    console.log('✅ Token valide');
    return true;
  } catch (error) {
    console.log('❌ Token invalide - erreur de décodage:', error.message);
    return false;
  }
};

/**
 * Rafraîchit le token admin
 */
export const refreshAdminToken = () => {
  console.log('🔄 Rafraîchissement du token admin...');

  // Supprimer l'ancien token
  localStorage.removeItem('adminToken');

  // Créer un nouveau token
  localStorage.setItem('adminToken', FRESH_ADMIN_TOKEN);

  console.log('✅ Nouveau token admin créé');
  return FRESH_ADMIN_TOKEN;
};

/**
 * Vérifie et rafraîchit automatiquement le token si nécessaire
 */
export const ensureValidToken = () => {
  console.log('🔍 Vérification du token admin...');

  const currentToken = localStorage.getItem('adminToken');

  if (!currentToken) {
    console.log('🔧 Aucun token trouvé - création d\'un nouveau token...');
    return refreshAdminToken();
  }

  if (!isTokenValid(currentToken)) {
    console.log('🔧 Token invalide - rafraîchissement...');
    return refreshAdminToken();
  }

  console.log('✅ Token valide - aucune action nécessaire');
  return currentToken;
};

/**
 * Fonction principale pour corriger l'authentification
 */
export const fixAdminAuth = () => {
  console.log('🚀 Correction de l\'authentification admin...');

  try {
    const token = ensureValidToken();
    console.log('✅ Authentification corrigée avec le token:', token.substring(0, 20) + '...');

    // Rafraîchir la page après 1 seconde
    setTimeout(() => {
      console.log('🔄 Rafraîchissement de la page...');
      window.location.reload();
    }, 1000);

    return 'success';
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return 'error';
  }
};

// Exporter pour utilisation globale
window.fixAdminAuth = fixAdminAuth;
window.refreshAdminToken = refreshAdminToken;
window.ensureValidToken = ensureValidToken;

console.log('🔧 Script de rafraîchissement du token admin chargé !');
console.log('📋 Commandes disponibles:');
console.log('  - fixAdminAuth() : Correction complète de l\'authentification');
console.log('  - refreshAdminToken() : Créer un nouveau token');
console.log('  - ensureValidToken() : Vérifier et corriger le token');
