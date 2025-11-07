import { getApiUrl } from './apiConfig';
// Configuration centralisée de l'URL de l'API
// Cette fonction retourne toujours l'URL du backend, que ce soit en développement ou en production

export const getApiBaseUrl = () => {
  // Si REACT_APP_API_BASE_URL est défini, l'utiliser
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // En production, utiliser le backend Render
  if (process.env.NODE_ENV === 'production') {
    return 'https://codegenesis-backend.onrender.com';
  }
  
  // En développement, utiliser localhost
  return getApiUrl('');
};

export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Enlever le slash initial de l'endpoint s'il existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Exporter l'URL de base pour utilisation directe
export const API_BASE_URL = getApiBaseUrl();

