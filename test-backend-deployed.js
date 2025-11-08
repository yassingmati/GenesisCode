// Script pour tester le backend déployé sur Railway ou Render
const axios = require('axios');

// Récupérer l'URL du backend depuis les arguments ou utiliser une valeur par défaut
const BACKEND_URL = process.argv[2] || process.env.BACKEND_URL || 'http://localhost:5000';

console.log('═══════════════════════════════════════════════════════════');
console.log('      TEST DU BACKEND DÉPLOYÉ');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`📍 URL du backend: ${BACKEND_URL}\n`);

const tests = [
  {
    name: 'Health Check (/health)',
    method: 'GET',
    url: `${BACKEND_URL}/health`,
    expectedStatus: 200
  },
  {
    name: 'API Health Check (/api/health)',
    method: 'GET',
    url: `${BACKEND_URL}/api/health`,
    expectedStatus: 200
  },
  {
    name: 'CORS Preflight (OPTIONS)',
    method: 'OPTIONS',
    url: `${BACKEND_URL}/api/health`,
    expectedStatus: 204,
    headers: {
      'Origin': 'https://codegenesis-platform.web.app',
      'Access-Control-Request-Method': 'GET'
    }
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🧪 Test: ${test.name}`);
      console.log(`   ${test.method} ${test.url}`);

      const config = {
        method: test.method,
        url: test.url,
        headers: test.headers || {},
        validateStatus: () => true // Ne pas rejeter sur n'importe quel statut
      };

      const response = await axios(config);

      if (response.status === test.expectedStatus) {
        console.log(`   ✅ Succès (${response.status})`);
        if (test.method === 'GET' && response.data) {
          console.log(`   📊 Réponse:`, JSON.stringify(response.data, null, 2).substring(0, 200));
        }
        passed++;
      } else {
        console.log(`   ❌ Échec: Status ${response.status} (attendu: ${test.expectedStatus})`);
        if (response.data) {
          console.log(`   📊 Réponse:`, JSON.stringify(response.data, null, 2).substring(0, 200));
        }
        failed++;
      }

      // Vérifier les headers CORS pour les requêtes OPTIONS
      if (test.method === 'OPTIONS') {
        const corsHeaders = [
          'access-control-allow-origin',
          'access-control-allow-methods',
          'access-control-allow-headers'
        ];
        const hasCorsHeaders = corsHeaders.some(header => response.headers[header]);
        if (hasCorsHeaders) {
          console.log(`   ✅ Headers CORS présents`);
        } else {
          console.log(`   ⚠️  Headers CORS manquants`);
        }
      }

      console.log('');
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📊 Données:`, JSON.stringify(error.response.data, null, 2).substring(0, 200));
      }
      failed++;
      console.log('');
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`                    RÉSULTATS`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📊 Total: ${passed + failed}\n`);

  if (failed === 0) {
    console.log('🎉 Tous les tests sont passés! Le backend est opérationnel.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.\n');
    process.exit(1);
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});

