/**
 * Utilitaire pour vérifier et corriger le token d'authentification
 * Utilise le même système que CourseManagement
 */

export const checkAndFixAuthToken = () => {
  console.log('🔍 Vérification du token d\'authentification...');
  
  // Vérifier le token actuel
  const currentToken = localStorage.getItem('adminToken');
  console.log('Token actuel:', currentToken ? 'Présent' : 'Absent');
  
  if (currentToken) {
    console.log('Token trouvé:', currentToken.substring(0, 50) + '...');
    
    // Vérifier si le token est valide en testant une API
    return testTokenValidity(currentToken);
  } else {
    console.log('❌ Aucun token trouvé dans localStorage');
    return false;
  }
};

const testTokenValidity = async (token) => {
  try {
    console.log('🧪 Test de validité du token...');
    
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://codegenesis-backend.onrender.com' 
        : 'http://localhost:5000');
    const response = await fetch(`${apiUrl}/api/courses/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Token valide - Authentification réussie');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Token invalide ou expiré');
      return false;
    } else {
      console.log('⚠️ Erreur inattendue:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lors du test du token:', error.message);
    return false;
  }
};

export const setValidAuthToken = () => {
  console.log('🔑 Définition d\'un token valide...');
  
  // Token JWT valide généré avec le bon JWT_SECRET
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWU2OTIyYmViMGQ3OWYzNDhkMWQ2NyIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJmaXJlYmFzZVVpZCI6ImFkbWluLXN5c3RlbS0xNzYwNDU0OTQ2MjYzIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzYwNDU2MTA3LCJleHAiOjE3NjA1NDI1MDd9.mHEJrdHCXWyn0XSZwplR9tNCKPlSMZ3GqCLqE786wN4';
  
  localStorage.setItem('adminToken', validToken);
  console.log('✅ Token valide défini dans localStorage');
  
  return validToken;
};

export const clearAuthToken = () => {
  console.log('🗑️ Suppression du token d\'authentification...');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
  console.log('✅ Token supprimé');
};

// Fonction pour déboguer l'authentification
export const debugAuth = () => {
  console.log('🔍 === DEBUG AUTHENTIFICATION ===');
  console.log('localStorage adminToken:', localStorage.getItem('adminToken'));
  console.log('localStorage adminData:', localStorage.getItem('adminData'));
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('================================');
};







