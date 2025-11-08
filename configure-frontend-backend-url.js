// Script pour configurer l'URL du backend dans le frontend
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configureFrontend() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('      CONFIGURATION FRONTEND - URL DU BACKEND');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Demander l'URL du backend
  const backendUrl = await question('Entrez l\'URL du backend déployé (ex: https://backend.railway.app): ');
  
  if (!backendUrl || !backendUrl.startsWith('http')) {
    console.error('❌ URL invalide. Doit commencer par http:// ou https://');
    rl.close();
    process.exit(1);
  }

  // Nettoyer l'URL (enlever le slash final)
  const cleanUrl = backendUrl.replace(/\/$/, '');

  console.log(`\n📝 Configuration de l'URL: ${cleanUrl}\n`);

  // Créer le fichier .env.production
  const envProductionPath = path.join(__dirname, 'frontend', '.env.production');
  const envContent = `# Production environment variables
# URL du backend déployé (Railway, Render, etc.)
REACT_APP_API_BASE_URL=${cleanUrl}
`;

  try {
    fs.writeFileSync(envProductionPath, envContent, 'utf8');
    console.log(`✅ Fichier créé: ${envProductionPath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la création du fichier: ${error.message}`);
    rl.close();
    process.exit(1);
  }

  // Créer aussi un fichier .env.local pour le développement (optionnel)
  const envLocalPath = path.join(__dirname, 'frontend', '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    const envLocalContent = `# Local development environment variables
# URL du backend local (pour le développement)
REACT_APP_API_BASE_URL=http://localhost:5000
`;
    try {
      fs.writeFileSync(envLocalPath, envLocalContent, 'utf8');
      console.log(`✅ Fichier créé: ${envLocalPath}`);
    } catch (error) {
      console.warn(`⚠️  Impossible de créer .env.local: ${error.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    CONFIGURATION TERMINÉE');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📋 Prochaines étapes:');
  console.log('1. Rebuild le frontend:');
  console.log('   cd frontend');
  console.log('   npm run build');
  console.log('');
  console.log('2. Redéployer le frontend:');
  console.log('   firebase deploy --only hosting');
  console.log('');
  console.log('3. Tester l\'authentification:');
  console.log('   Ouvrir https://codegenesis-platform.web.app');
  console.log('   Essayer de se connecter');
  console.log('');

  rl.close();
}

// Exécuter la configuration
configureFrontend().catch(error => {
  console.error('❌ Erreur:', error.message);
  rl.close();
  process.exit(1);
});

