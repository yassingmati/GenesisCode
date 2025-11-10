/**
 * Helpers pour les tests
 */

const path = require('path');
const fs = require('fs');
const Module = require('module');

// Sauvegarder le require original
const originalRequire = Module.prototype.require;

// Override require pour chercher dans backend/node_modules
Module.prototype.require = function(...args) {
  const moduleName = args[0];
  
  // Si c'est un chemin relatif ou absolu, utiliser le require normal
  if (moduleName.startsWith('.') || path.isAbsolute(moduleName)) {
    try {
      return originalRequire.apply(this, args);
    } catch (e) {
      // Si c'est un chemin relatif qui échoue, essayer depuis backend
      if (moduleName.startsWith('./')) {
        const backendPath = path.join(__dirname, 'backend', moduleName.substring(2));
        if (fs.existsSync(backendPath) || fs.existsSync(backendPath + '.js')) {
          return originalRequire.call(this, backendPath);
        }
      }
      throw e;
    }
  }
  
  // Essayer le require normal d'abord
  try {
    return originalRequire.apply(this, args);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      // Essayer depuis backend/node_modules
      const backendModulePath = path.join(__dirname, 'backend', 'node_modules', moduleName);
      if (fs.existsSync(backendModulePath)) {
        return originalRequire.call(this, backendModulePath);
      }
      
      // Si c'est un module npm, essayer de le résoudre depuis backend
      try {
        const resolved = require.resolve(moduleName, {
          paths: [
            path.join(__dirname, 'backend', 'node_modules'),
            path.join(__dirname, 'node_modules')
          ]
        });
        return originalRequire.call(this, resolved);
      } catch (resolveError) {
        // Re-throw l'erreur originale
        throw e;
      }
    }
    throw e;
  }
};

// Fonction pour charger un modèle depuis backend
function loadBackendModel(modelPath) {
  const fullPath = path.join(__dirname, 'backend', 'src', 'models', path.basename(modelPath));
  if (fs.existsSync(fullPath + '.js')) {
    return require(fullPath);
  }
  throw new Error(`Model not found: ${fullPath}`);
}

module.exports = { loadBackendModel };


