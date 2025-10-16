/**
 * Script d'authentification automatique pour les pages admin
 * S'exécute automatiquement sur toutes les pages /admin/*
 */

import { initAdminAuth } from './adminAuthBridge';

// Fonction d'initialisation automatique
const autoInit = () => {
  // Vérifier si nous sommes sur une page admin
  const isAdminPage = window.location.pathname.includes('/admin/');
  
  if (isAdminPage) {
    console.log('🔧 Page admin détectée - Initialisation de l\'authentification...');
    
    // Attendre que la page soit complètement chargée
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initAdminAuth();
      });
    } else {
      // Page déjà chargée
      initAdminAuth();
    }
  }
};

// Exécuter immédiatement
autoInit();

// Écouter les changements de route (pour les SPA)
let currentPath = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== currentPath) {
    currentPath = window.location.pathname;
    autoInit();
  }
}, 1000);

console.log('🔧 Auto Admin Auth chargé - Surveillance des pages admin activée');
