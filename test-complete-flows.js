// Script pour tester les flux complets de l'application
const http = require('http');
const path = require('path');

const API_URL = 'http://localhost:5000';
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

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    const url = new URL(fullPath, API_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
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

async function testCompleteFlows() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('           TESTS DES FLUX COMPLETS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  let results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Flow 1: Inscription → Login → Accès au profil
  log('\n📋 Flow 1: Inscription → Login → Accès au profil', 'cyan');
  log('─────────────────────────────────────────────────────────', 'cyan');
  
  const testEmail = `test-flow-${Date.now()}@example.com`;
  const testPassword = 'test123';
  
  // 1.1 Inscription
  log('\n1.1 Inscription...', 'yellow');
  const register = await makeRequest('POST', '/api/auth/register', {
    name: 'Test Flow User',
    email: testEmail,
    password: testPassword,
    userType: 'student'
  });
  results.total++;
  
  if (register.status === 201 || register.status === 409) {
    log('   ✅ Inscription réussie ou utilisateur existe déjà', 'green');
    results.passed++;
  } else {
    log(`   ❌ Échec inscription: ${register.status}`, 'red');
    log(`   ${JSON.stringify(register.data)}`);
    results.failed++;
    return results;
  }

  // 1.2 Login
  log('\n1.2 Login...', 'yellow');
  const login = await makeRequest('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword
  });
  results.total++;
  
  if (login.status === 200 && login.data.token) {
    log('   ✅ Login réussi', 'green');
    const token = login.data.token;
    results.passed++;
    
    // 1.3 Accès au profil
    log('\n1.3 Accès au profil...', 'yellow');
    const profile = await makeRequest('GET', '/api/users/profile', null, token);
    results.total++;
    
    if (profile.status === 200 && profile.data.user) {
      log('   ✅ Accès au profil réussi', 'green');
      log(`   📧 Email: ${profile.data.user.email}`);
      results.passed++;
    } else {
      log(`   ❌ Échec accès profil: ${profile.status}`, 'red');
      results.failed++;
    }
  } else {
    log(`   ❌ Échec login: ${login.status}`, 'red');
    results.failed++;
  }

  // Flow 2: Health Check → Vérification MongoDB
  log('\n\n📋 Flow 2: Health Check → Vérification MongoDB', 'cyan');
  log('─────────────────────────────────────────────────────────', 'cyan');
  
  log('\n2.1 Health Check...', 'yellow');
  const health = await makeRequest('GET', '/health');
  results.total++;
  
  if (health.status === 200) {
    log('   ✅ Health check réussi', 'green');
    log(`   📊 Status: ${health.data.status}`);
    log(`   💾 Database: ${health.data.database}`);
    results.passed++;
  } else {
    log(`   ❌ Échec health check: ${health.status}`, 'red');
    results.failed++;
  }

  // Flow 3: Accès aux routes publiques
  log('\n\n📋 Flow 3: Accès aux routes publiques', 'cyan');
  log('─────────────────────────────────────────────────────────', 'cyan');
  
  log('\n3.1 Plans de catégories...', 'yellow');
  const plans = await makeRequest('GET', '/api/category-payments/plans');
  results.total++;
  
  if (plans.status === 200) {
    log('   ✅ Accès aux plans réussi', 'green');
    log(`   📦 Plans trouvés: ${Array.isArray(plans.data) ? plans.data.length : 'N/A'}`);
    results.passed++;
  } else {
    log(`   ❌ Échec accès plans: ${plans.status}`, 'red');
    results.failed++;
  }

  // Résumé
  log('\n\n═══════════════════════════════════════════════════════════', 'cyan');
  log('                        RÉSUMÉ', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log(`Total de tests: ${results.total}`, 'cyan');
  log(`✅ Réussis: ${results.passed}`, 'green');
  log(`❌ Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0 && results.passed === results.total) {
    log('\n🎉 Tous les flux complets fonctionnent !', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Certains flux ont échoué. Vérifiez les détails ci-dessus.', 'yellow');
    process.exit(1);
  }
}

testCompleteFlows().catch((error) => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});

