/**
 * Script pour corriger automatiquement le token d'authentification
 * À exécuter dans la console du navigateur
 */

// Fonction pour ajouter le token correct
function fixAuthToken() {
  console.log('🔧 Correction du token d\'authentification...');
  
  // Token JWT valide
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWU2OTIyYmViMGQ3OWYzNDhkMWQ2NyIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJmaXJlYmFzZVVpZCI6ImFkbWluLXN5c3RlbS0xNzYwNDU0OTQ2MjYzIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzYwNDU2MTA3LCJleHAiOjE3NjA1NDI1MDd9.mHEJrdHCXWyn0XSZwplR9tNCKPlSMZ3GqCLqE786wN4';
  
  // Supprimer l'ancien token
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
  
  // Ajouter le nouveau token
  localStorage.setItem('adminToken', validToken);
  
  console.log('✅ Token corrigé !');
  console.log('🔄 Rafraîchissez la page maintenant');
  
  return validToken;
}

// Fonction pour vérifier le token actuel
function checkCurrentToken() {
  const token = localStorage.getItem('adminToken');
  console.log('Token actuel:', token ? token.substring(0, 50) + '...' : 'Aucun token');
  return token;
}

// Fonction pour tester l'authentification
async function testAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.log('❌ Aucun token trouvé');
    return false;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/courses/categories', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Authentification réussie !');
      return true;
    } else {
      console.log('❌ Authentification échouée:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return false;
  }
}

// Exporter les fonctions pour utilisation dans la console
window.fixAuthToken = fixAuthToken;
window.checkCurrentToken = checkCurrentToken;
window.testAuth = testAuth;

console.log('🔧 Script d\'authentification chargé !');
console.log('📋 Commandes disponibles:');
console.log('  - fixAuthToken() : Corriger le token');
console.log('  - checkCurrentToken() : Vérifier le token actuel');
console.log('  - testAuth() : Tester l\'authentification');
console.log('');
console.log('🚀 Exécutez: fixAuthToken() puis rafraîchissez la page');






