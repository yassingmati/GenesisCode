// Script pour tester les endpoints Firebase Functions
const axios = require('axios');

const FIREBASE_URL = 'https://codegenesis-platform.web.app';
const API_BASE_URL = FIREBASE_URL; // Utilise le même domaine grâce aux rewrites

async function testHealthEndpoint() {
  console.log('\n🔍 Test de l\'endpoint /api/health...');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 10000
    });
    console.log('✅ Health endpoint répond:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Erreur health endpoint:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   Aucune réponse du serveur');
      console.error('   Message:', error.message);
    } else {
      console.error('   Erreur:', error.message);
    }
    return false;
  }
}

async function testAuthLogin() {
  console.log('\n🔍 Test de l\'endpoint /api/auth/login...');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      {
        email: 'test@example.com',
        password: 'test123'
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Login endpoint répond:');
    console.log('   Status:', response.status);
    console.log('   Token présent:', !!response.data.token);
    console.log('   User présent:', !!response.data.user);
    return true;
  } catch (error) {
    console.error('❌ Erreur login endpoint:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      if (error.response.status === 401) {
        console.log('   ℹ️  Erreur d\'authentification (normal si les credentials sont incorrects)');
      }
    } else if (error.request) {
      console.error('   ❌ Aucune réponse du serveur - Le problème est probablement:');
      console.error('      1. Les fonctions Firebase ne sont pas déployées');
      console.error('      2. Les variables d\'environnement ne sont pas configurées');
      console.error('      3. MongoDB n\'est pas connecté');
      console.error('   Message:', error.message);
    } else {
      console.error('   Erreur:', error.message);
    }
    return false;
  }
}

async function testAuthRegister() {
  console.log('\n🔍 Test de l\'endpoint /api/auth/register...');
  const testEmail = `test${Date.now()}@example.com`;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/register`,
      {
        email: testEmail,
        password: 'test123456',
        userType: 'student'
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Register endpoint répond:');
    console.log('   Status:', response.status);
    console.log('   Token présent:', !!response.data.token);
    console.log('   User créé:', !!response.data.user);
    return true;
  } catch (error) {
    console.error('❌ Erreur register endpoint:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      if (error.response.status === 400 && error.response.data.message?.includes('existe déjà')) {
        console.log('   ℹ️  L\'utilisateur existe déjà (normal)');
        return true; // C'est une réponse valide
      }
    } else if (error.request) {
      console.error('   ❌ Aucune réponse du serveur');
      console.error('   Message:', error.message);
    } else {
      console.error('   Erreur:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('      TEST DES ENDPOINTS FIREBASE - CodeGenesis');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📍 URL de base: ${API_BASE_URL}\n`);

  const results = {
    health: await testHealthEndpoint(),
    login: await testAuthLogin(),
    register: await testAuthRegister()
  };

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    RÉSULTATS DES TESTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Health:  ${results.health ? '✅' : '❌'}`);
  console.log(`   Login:   ${results.login ? '✅' : '❌'}`);
  console.log(`   Register: ${results.register ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    console.log('\n✅ Tous les tests sont passés!');
  } else {
    console.log('\n❌ Certains tests ont échoué.');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Vérifiez que les fonctions Firebase sont déployées');
    console.log('2. Vérifiez les logs: firebase functions:log --only api');
    console.log('3. Vérifiez la configuration: firebase functions:config:get');
    console.log('4. Redéployez si nécessaire: firebase deploy --only functions');
  }
  console.log('');
}

runTests().catch(console.error);

