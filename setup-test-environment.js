/**
 * Script de configuration de l'environnement pour les tests
 * Configure NODE_PATH pour utiliser les modules du backend
 */

const path = require('path');
const fs = require('fs');

// Ajouter backend/node_modules au NODE_PATH
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
if (fs.existsSync(backendNodeModules)) {
  const currentPath = process.env.NODE_PATH || '';
  process.env.NODE_PATH = currentPath 
    ? `${currentPath}${path.delimiter}${backendNodeModules}`
    : backendNodeModules;
  
  // Pour Node.js, NODE_PATH doit être défini avant le chargement des modules
  // Cette solution utilise Module._initPaths
  require('module')._initPaths();
}

// Fonction helper pour charger dotenv
function loadDotenv() {
  try {
    // Essayer d'abord depuis backend/node_modules
    const dotenvPath = path.join(__dirname, 'backend', 'node_modules', 'dotenv');
    if (fs.existsSync(dotenvPath)) {
      const dotenv = require(dotenvPath);
      dotenv.config({ path: './backend/.env' });
      return true;
    }
    
    // Sinon, essayer depuis node_modules local
    require('dotenv').config({ path: './backend/.env' });
    return true;
  } catch (error) {
    console.error('Erreur lors du chargement de dotenv:', error.message);
    return false;
  }
}

module.exports = { loadDotenv };




