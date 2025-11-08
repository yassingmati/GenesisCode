// Script pour configurer les variables d'environnement Firebase Functions
// Utilise firebase functions:config:set (fonctionne avec le plan gratuit)
const { execSync } = require('child_process');
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

async function configureConfig() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('      CONFIGURATION FIREBASE CONFIG - CodeGenesis');
  console.log('═══════════════════════════════════════════════════════════\n');

  // MongoDB URI
  const mongoURI = 'mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
  console.log('1. Configuration de mongodb.uri...');
  try {
    execSync(`firebase functions:config:set mongodb.uri="${mongoURI}"`, { stdio: 'inherit' });
    console.log('✅ mongodb.uri configuré\n');
  } catch (error) {
    console.error('❌ Erreur configuration mongodb.uri:', error.message);
  }

  // Générer JWT_SECRET
  const jwtSecret = require('crypto').randomBytes(32).toString('hex');
  console.log('2. Génération et configuration de jwt.secret...');
  try {
    execSync(`firebase functions:config:set jwt.secret="${jwtSecret}"`, { stdio: 'inherit' });
    console.log('✅ jwt.secret configuré\n');
  } catch (error) {
    console.error('❌ Erreur configuration jwt.secret:', error.message);
  }

  // Générer JWT_ADMIN_SECRET
  const jwtAdminSecret = require('crypto').randomBytes(32).toString('hex');
  console.log('3. Génération et configuration de jwt.admin_secret...');
  try {
    execSync(`firebase functions:config:set jwt.admin_secret="${jwtAdminSecret}"`, { stdio: 'inherit' });
    console.log('✅ jwt.admin_secret configuré\n');
  } catch (error) {
    console.error('❌ Erreur configuration jwt.admin_secret:', error.message);
  }

  // CLIENT_ORIGIN
  const clientOrigin = await question('4. Entrez l\'URL du frontend Firebase Hosting (ex: https://codegenesis-platform.web.app): ');
  if (clientOrigin) {
    try {
      execSync(`firebase functions:config:set client.origin="${clientOrigin}"`, { stdio: 'inherit' });
      console.log('✅ client.origin configuré\n');
    } catch (error) {
      console.error('❌ Erreur configuration client.origin:', error.message);
    }
  }

  console.log('\n✅ Configuration terminée!');
  console.log('\n📋 Afficher la configuration:');
  console.log('   firebase functions:config:get');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Mettre à jour index-firebase.js pour charger la config');
  console.log('2. Déployer les fonctions: firebase deploy --only functions');
  console.log('3. Tester les endpoints\n');

  rl.close();
}

configureConfig().catch(console.error);

