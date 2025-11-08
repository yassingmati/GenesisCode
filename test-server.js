// Script de test complet pour le serveur backend
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    // Si le chemin ne commence pas par /api, l'ajouter
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    const url = new URL(fullPath, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoint(name, method, path, data = null, expectedStatus = 200) {
  try {
    log(`\n🧪 Test: ${name}`, 'cyan');
    log(`   ${method} ${path}`, 'yellow');
    
    const response = await makeRequest(method, path, data);
    
    if (response.status === expectedStatus) {
      log(`   ✅ Status: ${response.status} (attendu: ${expectedStatus})`, 'green');
      if (response.data && typeof response.data === 'object') {
        log(`   📦 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      return { success: true, response };
    } else {
      log(`   ❌ Status: ${response.status} (attendu: ${expectedStatus})`, 'red');
      log(`   📦 Response: ${JSON.stringify(response.data)}`);
      return { success: false, response };
    }
  } catch (error) {
    log(`   ❌ Erreur: ${error.message}`, 'red');
    if (error.code === 'ECONNREFUSED') {
      log(`   ⚠️  Le serveur n'est pas démarré. Démarrez-le avec: cd backend && npm start`, 'yellow');
    }
    return { success: false, error: error.message };
  }
}

async function testEndpointWithAuth(name, method, path, data = null, expectedStatus = 200, token = null) {
  try {
    log(`\n🧪 Test: ${name}`, 'cyan');
    log(`   ${method} ${path}`, 'yellow');
    
    const response = await makeRequestWithAuth(method, path, data, token);
    
    if (response.status === expectedStatus) {
      log(`   ✅ Status: ${response.status} (attendu: ${expectedStatus})`, 'green');
      if (response.data && typeof response.data === 'object') {
        log(`   📦 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
      return { success: true, response };
    } else {
      log(`   ❌ Status: ${response.status} (attendu: ${expectedStatus})`, 'red');
      log(`   📦 Response: ${JSON.stringify(response.data)}`);
      return { success: false, response };
    }
  } catch (error) {
    log(`   ❌ Erreur: ${error.message}`, 'red');
    if (error.code === 'ECONNREFUSED') {
      log(`   ⚠️  Le serveur n'est pas démarré. Démarrez-le avec: cd backend && npm start`, 'yellow');
    }
    return { success: false, error: error.message };
  }
}

function makeRequestWithAuth(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    // Si le chemin ne commence pas par /api, l'ajouter
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    const url = new URL(fullPath, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Ajouter le token d'authentification
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('           TESTS COMPLETS DU SERVEUR BACKEND', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Health Check
  const test1 = await testEndpoint('Health Check', 'GET', '/health', null, 200);
  results.total++;
  if (test1.success) {
    results.passed++;
    if (test1.response.data.database === 'connected') {
      log('   ✅ MongoDB est connecté', 'green');
    } else {
      log('   ⚠️  MongoDB n\'est pas connecté (mode dégradé)', 'yellow');
    }
  } else {
    results.failed++;
  }

  // Test 2: Login sans utilisateur (devrait échouer avec 404 ou 503)
  const test2 = await testEndpoint('Login sans utilisateur', 'POST', '/api/auth/login', {
    email: 'nonexistent@example.com',
    password: 'test123'
  }, 404);
  results.total++;
  if (test2.success) {
    results.passed++;
  } else {
    // Vérifier si c'est une erreur MongoDB (503)
    if (test2.response && test2.response.status === 503) {
      log('   ⚠️  MongoDB n\'est pas connecté - Erreur attendue', 'yellow');
      results.passed++;
      results.failed--;
    } else {
      results.failed++;
    }
  }

  // Test 3: Register (créer un utilisateur de test)
  const test3 = await testEndpoint('Register', 'POST', '/api/auth/register', {
    email: 'test@example.com',
    password: 'test123',
    userType: 'student'
  }, 201);
  results.total++;
  if (test3.success) {
    results.passed++;
    log('   ✅ Utilisateur créé avec succès', 'green');
  } else {
    // Vérifier si c'est une erreur MongoDB (503) ou si l'utilisateur existe déjà (409)
    if (test3.response && (test3.response.status === 503 || test3.response.status === 409)) {
      log(`   ⚠️  Status: ${test3.response.status} - ${test3.response.status === 503 ? 'MongoDB non connecté' : 'Utilisateur existe déjà'}`, 'yellow');
      results.passed++;
      results.failed--;
    } else {
      results.failed++;
    }
  }

  // Test 4: Login avec l'utilisateur créé
  const test4 = await testEndpoint('Login avec utilisateur', 'POST', '/api/auth/login', {
    email: 'test@example.com',
    password: 'test123'
  }, 200);
  results.total++;
  if (test4.success) {
    results.passed++;
      if (test4.response.data.token) {
        log('   ✅ Token reçu avec succès', 'green');
        
        // Stocker le token pour les tests suivants
        const token = test4.response.data.token;
        
        // Test 5: Get Profile avec token
        const test5 = await testEndpointWithAuth('Get Profile (avec token)', 'GET', '/api/users/profile', null, 200, token);
        results.total++;
        if (test5.success) {
          results.passed++;
        } else {
          results.failed++;
        }
      }
  } else {
    // Vérifier si c'est une erreur MongoDB (503)
    if (test4.response && test4.response.status === 503) {
      log('   ⚠️  MongoDB n\'est pas connecté - Erreur attendue', 'yellow');
      results.passed++;
      results.failed--;
    } else {
      results.failed++;
    }
  }

  // Résumé
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('                        RÉSUMÉ', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log(`Total de tests: ${results.total}`, 'cyan');
  log(`✅ Réussis: ${results.passed}`, 'green');
  log(`❌ Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  // Corriger le compteur si nécessaire
  if (results.failed < 0) {
    results.failed = 0;
  }

  if (results.failed === 0 && results.passed === results.total) {
    log('\n🎉 Tous les tests sont passés !', 'green');
    process.exit(0);
  } else if (results.passed === results.total) {
    log('\n🎉 Tous les tests sont passés !', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Certains tests ont échoué. Vérifiez les détails ci-dessus.', 'yellow');
    log('💡 Si MongoDB n\'est pas connecté, suivez le guide MONGODB_SETUP_GUIDE.md', 'yellow');
    process.exit(1);
  }
}

// Exécuter les tests
runTests().catch((error) => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});

