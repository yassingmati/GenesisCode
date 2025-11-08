// Script pour vérifier et déployer les fonctions Firebase
const { execSync } = require('child_process');

console.log('═══════════════════════════════════════════════════════════');
console.log('      VÉRIFICATION ET DÉPLOIEMENT FIREBASE FUNCTIONS');
console.log('═══════════════════════════════════════════════════════════\n');

// Étape 1: Vérifier la configuration
console.log('1. Vérification de la configuration Firebase...');
try {
  const config = execSync('firebase functions:config:get', { encoding: 'utf8' });
  const configObj = JSON.parse(config.split('\n').filter(l => l.trim() && !l.includes('DEPRECATION')).join(''));
  
  console.log('✅ Configuration trouvée:');
  console.log(`   - MongoDB URI: ${configObj.mongodb?.uri ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   - JWT Secret: ${configObj.jwt?.secret ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   - JWT Admin Secret: ${configObj.jwt?.admin_secret ? '✅ Configuré' : '❌ Manquant'}`);
  console.log(`   - Client Origin: ${configObj.client?.origin || '❌ Manquant'}`);
  
  if (!configObj.mongodb?.uri || !configObj.jwt?.secret || !configObj.client?.origin) {
    console.error('\n❌ Configuration incomplète!');
    console.log('   Exécutez: node configure-firebase-config.js');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification de la configuration:', error.message);
  process.exit(1);
}

// Étape 2: Vérifier les fonctions déployées
console.log('\n2. Vérification des fonctions déployées...');
try {
  const functionsList = execSync('firebase functions:list', { encoding: 'utf8' });
  const hasFunctions = functionsList.includes('api');
  
  if (hasFunctions) {
    console.log('✅ Fonctions déjà déployées:');
    console.log(functionsList);
  } else {
    console.log('ℹ️  Aucune fonction déployée');
  }
} catch (error) {
  console.log('ℹ️  Aucune fonction déployée');
}

// Étape 3: Tentative de déploiement
console.log('\n3. Tentative de déploiement des fonctions...');
console.log('   (Cela peut prendre 3-5 minutes)\n');

try {
  execSync('firebase deploy --only functions', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('\n✅ Déploiement réussi!');
} catch (error) {
  if (error.message.includes('Blaze') || error.message.includes('pay-as-you-go')) {
    console.error('\n❌ ERREUR: Le projet doit être sur le plan Blaze');
    console.error('\n📋 Pour résoudre ce problème:');
    console.error('1. Allez sur: https://console.firebase.google.com/project/codegenesis-platform/usage/details');
    console.error('2. Cliquez sur "Upgrade to Blaze"');
    console.error('3. Ajoutez une méthode de paiement');
    console.error('4. Confirmez l\'upgrade');
    console.error('5. Réexécutez ce script: node check-and-deploy.js');
    console.error('\n💡 Le plan Blaze a un niveau gratuit généreux (2M invocations/mois)');
    process.exit(1);
  } else {
    console.error('\n❌ Erreur lors du déploiement:', error.message);
    process.exit(1);
  }
}

// Étape 4: Vérifier le déploiement
console.log('\n4. Vérification du déploiement...');
try {
  const functionsList = execSync('firebase functions:list', { encoding: 'utf8' });
  if (functionsList.includes('api')) {
    console.log('✅ Fonction "api" déployée avec succès!');
    console.log('\n📍 URL de la fonction:');
    console.log('   https://us-central1-codegenesis-platform.cloudfunctions.net/api');
    console.log('\n📍 URL via Hosting (rewrites):');
    console.log('   https://codegenesis-platform.web.app/api/*');
  } else {
    console.error('❌ La fonction n\'apparaît pas dans la liste');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Erreur lors de la vérification:', error.message);
  process.exit(1);
}

// Étape 5: Tester les endpoints
console.log('\n5. Test des endpoints...');
console.log('   Exécution de: node test-firebase-endpoints.js\n');

try {
  execSync('node test-firebase-endpoints.js', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.error('\n⚠️  Certains tests ont échoué, mais le déploiement est réussi');
  console.error('   Vérifiez les logs: firebase functions:log --only api');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('                    DÉPLOIEMENT TERMINÉ');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n📋 Prochaines étapes:');
console.log('1. Testez l\'authentification depuis le frontend');
console.log('2. Vérifiez les logs: firebase functions:log --only api');
console.log('3. Monitorer les performances dans Firebase Console');
console.log('\n✅ Tout est prêt!');

