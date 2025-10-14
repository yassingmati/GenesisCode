/**
 * Script pour tester l'API avec le token admin
 * Vérifie que les endpoints fonctionnent correctement avec l'authentification
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWU2OTIyYmViMGQ3OWYzNDhkMWQ2NyIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJmaXJlYmFzZVVpZCI6ImFkbWluLXN5c3RlbS0xNzYwNDU0OTQ2MjYzIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzYwNDU2MTA3LCJleHAiOjE3NjA1NDI1MDd9.mHEJrdHCXWyn0XSZwplR9tNCKPlSMZ3GqCLqE786wN4';

async function testAPIEndpoints() {
  console.log('🧪 Test des endpoints API avec token admin');
  console.log('=' .repeat(60));

  const tests = [
    {
      name: 'GET /api/courses/categories',
      url: `${API_BASE}/api/courses/categories`,
      method: 'GET'
    },
    {
      name: 'GET /api/admin/category-plans',
      url: `${API_BASE}/api/admin/category-plans`,
      method: 'GET'
    },
    {
      name: 'GET /api/category-payments/plans',
      url: `${API_BASE}/api/category-payments/plans`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔍 Test: ${test.name}`);
      console.log(`📡 URL: ${test.url}`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log(`✅ Succès: ${response.status}`);
      console.log(`📊 Données: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.response?.status || 'Network Error'}`);
      console.log(`📝 Message: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.status === 401) {
        console.log('🔑 Problème d\'authentification - Token invalide ou expiré');
      } else if (error.response?.status === 404) {
        console.log('🔍 Endpoint non trouvé - Route peut-être manquante');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🔌 Serveur non accessible - Vérifiez que le backend est démarré');
      }
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 DIAGNOSTIC:');
  console.log('1. Si toutes les requêtes échouent → Problème de serveur');
  console.log('2. Si 401 sur toutes → Problème de token');
  console.log('3. Si 404 sur certaines → Routes manquantes');
  console.log('4. Si succès → API fonctionne, problème dans le frontend');
}

// Exécution du script
if (require.main === module) {
  testAPIEndpoints()
    .then(() => {
      console.log('\n✅ Tests terminés');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = testAPIEndpoints;
