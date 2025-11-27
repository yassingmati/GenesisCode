// src/pages/CourseManagement/components/common.js
import axios from 'axios';

// API client
export const api = axios.create({
  baseURL: 'http://localhost:5000/api/courses',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  // Essayer d'abord le token admin, puis le token user
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  const token = adminToken || userToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('⚠️ Aucun token trouvé pour la requête:', config.url);
  }
  return config;
});

// Intercepteur de réponse pour gérer les erreurs 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('❌ Erreur 401 - Token invalide ou expiré');
      console.error('   URL:', error.config?.url);
      console.error('   Token utilisé:', error.config?.headers?.Authorization ? 'Oui' : 'Non');
      
      // Essayer de rafraîchir le token si c'était un token admin
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken && error.config?.headers?.Authorization?.includes(adminToken)) {
        console.log('🔄 Tentative de rafraîchissement du token admin...');
        // Supprimer le token invalide
        localStorage.removeItem('adminToken');
        // Essayer avec le token user si disponible
        const userToken = localStorage.getItem('token');
        if (userToken) {
          error.config.headers.Authorization = `Bearer ${userToken}`;
          return api.request(error.config);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper functions
export const pickTitle = (obj) => {
  if (!obj) return '';
  if (obj.translations) {
    return obj.translations.fr?.name || obj.translations.fr?.title || 
           obj.translations.en?.name || obj.translations.en?.title || 
           obj.translations.ar?.name || obj.translations.ar?.title || '';
  }
  return obj.name || obj.title || obj.question || '';
};

// Styles helpers
export const inputStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  width: '100%'
});

export const selectStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minWidth: '140px'
});

export const textareaStyle = () => ({
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eef2ff',
  background: '#fff',
  minHeight: '100px',
  width: '100%'
});