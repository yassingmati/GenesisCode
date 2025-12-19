/**
 * Script d'authentification automatique pour les pages admin
 * Vérifie l'authentification sur les pages /admin/* SANS injecter de tokens
 * 
 * IMPORTANT: Ce script ne crée PLUS de tokens automatiquement.
 * Il vérifie seulement si l'admin est authentifié et affiche des avertissements si nécessaire.
 */

import { initAdminAuth } from './adminAuthBridge';

// Fonction d'initialisation automatique
const autoInit = () => {
  // Vérifier si nous sommes sur une page admin
  const isAdminPage = window.location.pathname.includes('/admin/');

  if (isAdminPage) {
    console.log('🔧 Page admin détectée - Vérification de l\'authentification...');

    // Attendre que la page soit complètement chargée
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const authStatus = initAdminAuth();

        if (authStatus === 'not_authenticated') {
          console.warn('⚠️ ATTENTION: Vous accédez à une page admin sans authentification valide.');
          console.warn('💡 Veuillez vous connecter via /admin/login');
        }
      });
    } else {
      // Page déjà chargée
      const authStatus = initAdminAuth();

      if (authStatus === 'not_authenticated') {
        console.warn('⚠️ ATTENTION: Vous accédez à une page admin sans authentification valide.');
        console.warn('💡 Veuillez vous connecter via /admin/login');
      }
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

console.log('🔧 Auto Admin Auth chargé - Surveillance des pages admin activée (mode vérification uniquement)');

