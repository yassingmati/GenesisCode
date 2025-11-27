/**
 * Helper pour charger les variables d'environnement depuis backend/.env
 */

const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.resolve(__dirname, 'backend', '.env');

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  Fichier .env non trouvé: ${envPath}`);
    return false;
  }

  try {
    // Essayer d'utiliser dotenv du backend s'il est disponible
    try {
      const dotenv = require('./backend/node_modules/dotenv');
      dotenv.config({ path: envPath, override: true });
      return true;
    } catch (e) {
      // Fallback à l'implémentation manuelle si dotenv n'est pas trouvé
      // Lire le fichier .env
      const envContent = fs.readFileSync(envPath, 'utf-8');

      // Parser les variables d'environnement
      envContent.split('\n').forEach((line, index) => {
        // Ignorer les commentaires et les lignes vides
        line = line.trim();
        if (!line || line.startsWith('#')) {
          return;
        }

        // Parser KEY=VALUE
        const match = line.match(/^([^=#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();

          // Retirer les guillemets si présents
          if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }

          // Toujours écraser pour correspondre au comportement du backend
          process.env[key] = value;
        }
      });

      return true;
    }
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de .env: ${error.message}`);
    return false;
  }
}

module.exports = { loadEnv };

// Si appelé directement, charger l'env
if (require.main === module) {
  loadEnv();
}




