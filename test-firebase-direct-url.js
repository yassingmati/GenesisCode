// Test de l'URL directe de la fonction Firebase
const axios = require('axios');

// URL directe de la fonction Firebase (sans rewrites)
const FUNCTION_URL = 'https://us-central1-codegenesis-platform.cloudfunctions.net/api';

async function testDirectFunction() {
  console.log('\n🔍 Test de l\'URL directe de la fonction Firebase...');
  console.log(`📍 URL: ${FUNCTION_URL}\n`);

  // Test health
  try {
    console.log('1. Test /api/health...');
    const healthResponse = await axios.get(`${FUNCTION_URL}/api/health`, {
      timeout: 15000
    });
    console.log('✅ Health répond:');
    console.log('   Status:', healthResponse.status);
    console.log('   Database:', healthResponse.data.database);
    console.log('   Data:', JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Erreur health:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }

  // Test login
  try {
    console.log('\n2. Test /api/auth/login...');
    const loginResponse = await axios.post(
      `${FUNCTION_URL}/api/auth/login`,
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
    console.log('✅ Login répond:');
    console.log('   Status:', loginResponse.status);
    console.log('   Token présent:', !!loginResponse.data.token);
  } catch (error) {
    console.error('❌ Erreur login:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      if (error.response.status === 401) {
        console.log('   ℹ️  Erreur d\'authentification (normal)');
      }
    } else {
      console.error('   Message:', error.message);
      console.error('   ❌ La fonction ne répond pas - elle n\'est probablement pas déployée');
    }
  }
}

testDirectFunction().catch(console.error);

