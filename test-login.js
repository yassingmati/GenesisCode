// Script de test pour le login
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testLogin() {
  console.log('🧪 Test du login...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Test du health check...');
  try {
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check OK:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check échoué:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Le serveur n\'est pas démarré. Démarrez-le avec: cd backend && npm start');
      process.exit(1);
    }
  }
  
  console.log('\n2️⃣ Test du login avec email/password...');
  
  // Test avec un utilisateur de test
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    
    console.log('✅ Login réussi!');
    console.log('Token:', loginResponse.data.token ? '✅ Présent' : '❌ Absent');
    console.log('User:', loginResponse.data.user);
    console.log('Message:', loginResponse.data.message);
    
    // Test avec le token
    if (loginResponse.data.token) {
      console.log('\n3️⃣ Test de l\'authentification avec le token...');
      try {
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        console.log('✅ Authentification token OK:', userResponse.data);
      } catch (tokenError) {
        console.error('❌ Erreur avec le token:', tokenError.response?.data || tokenError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Login échoué');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message || error.response.data.error);
      console.error('Data:', error.response.data);
    } else {
      console.error('Erreur:', error.message);
    }
    
    // Si l'utilisateur n'existe pas, proposer de le créer
    if (error.response?.status === 404) {
      console.log('\n💡 L\'utilisateur n\'existe pas. Essayez de vous inscrire d\'abord:');
      console.log(`   POST ${API_URL}/auth/register`);
      console.log(`   Body: { "email": "${testEmail}", "password": "${testPassword}" }`);
    }
  }
}

// Exécuter le test
testLogin().catch(console.error);
