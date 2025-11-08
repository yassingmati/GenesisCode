// Script pour configurer les secrets Firebase Functions
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

async function configureSecrets() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('      CONFIGURATION FIREBASE SECRETS - CodeGenesis');
  console.log('═══════════════════════════════════════════════════════════\n');

  // MongoDB URI
  const mongoURI = 'mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
  console.log('1. Configuration de MONGODB_URI...');
  try {
    execSync(`echo ${mongoURI} | firebase functions:secrets:set MONGODB_URI`, { stdio: 'inherit' });
    console.log('✅ MONGODB_URI configuré\n');
  } catch (error) {
    console.error('❌ Erreur configuration MONGODB_URI:', error.message);
  }

  // Générer JWT_SECRET
  const jwtSecret = require('crypto').randomBytes(32).toString('hex');
  console.log('2. Génération et configuration de JWT_SECRET...');
  try {
    execSync(`echo ${jwtSecret} | firebase functions:secrets:set JWT_SECRET`, { stdio: 'inherit' });
    console.log('✅ JWT_SECRET configuré\n');
  } catch (error) {
    console.error('❌ Erreur configuration JWT_SECRET:', error.message);
  }

  // Générer JWT_ADMIN_SECRET
  const jwtAdminSecret = require('crypto').randomBytes(32).toString('hex');
  console.log('3. Génération et configuration de JWT_ADMIN_SECRET...');
  try {
    execSync(`echo ${jwtAdminSecret} | firebase functions:secrets:set JWT_ADMIN_SECRET`, { stdio: 'inherit' });
    console.log('✅ JWT_ADMIN_SECRET configuré\n');
  } catch (error) {
    console.error('❌ Erreur configuration JWT_ADMIN_SECRET:', error.message);
  }

  // CLIENT_ORIGIN
  const clientOrigin = await question('4. Entrez l\'URL du frontend Firebase Hosting (ex: https://codegenesis-platform.web.app): ');
  if (clientOrigin) {
    try {
      execSync(`echo ${clientOrigin} | firebase functions:secrets:set CLIENT_ORIGIN`, { stdio: 'inherit' });
      console.log('✅ CLIENT_ORIGIN configuré\n');
    } catch (error) {
      console.error('❌ Erreur configuration CLIENT_ORIGIN:', error.message);
    }
  }

  console.log('\n✅ Configuration des secrets terminée!');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Mettre à jour index-firebase.js pour charger les secrets');
  console.log('2. Déployer les fonctions: firebase deploy --only functions');
  console.log('3. Tester les endpoints\n');

  rl.close();
}

configureSecrets().catch(console.error);

