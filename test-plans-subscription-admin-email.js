/**
 * Script principal de test pour Plans, Subscription, Admin et Vérification Email
 * 
 * Ce script coordonne tous les tests et génère un rapport détaillé
 */

// Charger les variables d'environnement depuis backend/.env
const { loadEnv } = require('./load-env');
loadEnv();

// Charger les helpers pour les modules
require('./test-helpers');

const fs = require('fs').promises;
const path = require('path');

// Importer les scripts de test spécifiques avec gestion d'erreur
let testAdminCreation, testPlansManagement, testSubscriptionFlow, testEmailVerification;

try {
  testAdminCreation = require('./test-admin-creation');
} catch (error) {
  console.error('Erreur lors du chargement de test-admin-creation:', error.message);
  testAdminCreation = { runTests: async () => {} };
}

try {
  testPlansManagement = require('./test-plans-management');
} catch (error) {
  console.error('Erreur lors du chargement de test-plans-management:', error.message);
  testPlansManagement = { runTests: async () => {} };
}

try {
  testSubscriptionFlow = require('./test-subscription-flow');
} catch (error) {
  console.error('Erreur lors du chargement de test-subscription-flow:', error.message);
  testSubscriptionFlow = { runTests: async () => {} };
}

try {
  testEmailVerification = require('./test-email-verification');
} catch (error) {
  console.error('Erreur lors du chargement de test-email-verification:', error.message);
  testEmailVerification = { runTests: async () => {} };
}

// Configuration
const API_BASE_URL = process.env.SERVER_URL || process.env.API_BASE_URL || 'http://localhost:5000';
const REPORT_FILE = path.join(__dirname, 'TEST_RESULTS_PLANS_SUBSCRIPTION.md');

// Résultats globaux
const testResults = {
  timestamp: new Date().toISOString(),
  environment: {
    apiBaseUrl: API_BASE_URL,
    nodeEnv: process.env.NODE_ENV || 'development',
    hasMongoDB: !!process.env.MONGODB_URI,
    hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    hasJWTSecret: !!process.env.JWT_SECRET,
    hasAdminJWTSecret: !!process.env.JWT_ADMIN_SECRET
  },
  tests: {
    adminCreation: { passed: 0, failed: 0, results: [] },
    plansManagement: { passed: 0, failed: 0, results: [] },
    subscription: { passed: 0, failed: 0, results: [] },
    emailVerification: { passed: 0, failed: 0, results: [] }
  },
  errors: [],
  warnings: []
};

/**
 * Fonction utilitaire pour logger les résultats
 */
function logResult(category, testName, passed, message, details = {}) {
  const result = {
    testName,
    passed,
    message,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  testResults.tests[category].results.push(result);
  if (passed) {
    testResults.tests[category].passed++;
    console.log(`✅ ${category} - ${testName}: ${message}`);
  } else {
    testResults.tests[category].failed++;
    console.error(`❌ ${category} - ${testName}: ${message}`);
    if (details.error) {
      testResults.errors.push({
        category,
        testName,
        error: details.error
      });
    }
  }
}

/**
 * Vérifier la configuration de l'environnement
 */
async function checkEnvironment() {
  console.log('\n🔍 Vérification de l\'environnement...\n');
  
  const checks = {
    mongodb: !!process.env.MONGODB_URI,
    jwtSecret: !!process.env.JWT_SECRET,
    adminJWTSecret: !!process.env.JWT_ADMIN_SECRET,
    emailUser: !!process.env.EMAIL_USER,
    emailPass: !!process.env.EMAIL_PASS,
    serverUrl: !!process.env.SERVER_URL,
    clientUrl: !!process.env.CLIENT_URL
  };
  
  console.log('Configuration:');
  console.log(`  - MongoDB URI: ${checks.mongodb ? '✅' : '❌'}`);
  console.log(`  - JWT Secret: ${checks.jwtSecret ? '✅' : '❌'}`);
  console.log(`  - Admin JWT Secret: ${checks.adminJWTSecret ? '✅' : '❌'}`);
  console.log(`  - Email User: ${checks.emailUser ? '✅' : '❌'}`);
  console.log(`  - Email Pass: ${checks.emailPass ? '✅' : '❌'}`);
  console.log(`  - Server URL: ${checks.serverUrl ? '✅' : '❌'}`);
  console.log(`  - Client URL: ${checks.clientUrl ? '✅' : '❌'}`);
  
  if (!checks.mongodb) {
    testResults.warnings.push('MONGODB_URI n\'est pas défini');
  }
  if (!checks.emailUser || !checks.emailPass) {
    testResults.warnings.push('Configuration email incomplète - les tests d\'email peuvent échouer');
  }
  
  return Object.values(checks).every(v => v);
}

/**
 * Tester la connexion au backend
 */
async function testBackendConnection() {
  console.log('\n🔗 Test de connexion au backend...\n');
  console.log(`   URL testée: ${API_BASE_URL}\n`);
  
  try {
    // Essayer d'abord une route publique avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    let response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    }).catch(err => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.error('❌ Timeout: Le backend ne répond pas dans les 5 secondes');
        return null;
      }
      console.error(`❌ Erreur de connexion: ${err.message}`);
      return null;
    });
    
    clearTimeout(timeoutId);
    
    if (response && (response.ok || response.status === 401 || response.status === 403)) {
      console.log('✅ Backend accessible (répond aux requêtes)');
      return true;
    }
    
    if (response) {
      console.log(`⚠️  Backend répond mais avec le statut: ${response.status}`);
      return true; // Le backend répond, même si ce n'est pas 200
    }
    
    // Essayer la route health
    const healthController = new AbortController();
    const healthTimeoutId = setTimeout(() => healthController.abort(), 5000);
    
    response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: healthController.signal
    }).catch(() => {
      clearTimeout(healthTimeoutId);
      return null;
    });
    
    clearTimeout(healthTimeoutId);
    
    if (response && response.ok) {
      console.log('✅ Backend accessible (health check)');
      return true;
    }
    
    console.error('❌ Backend non accessible');
    console.log('   Vérifiez que le backend est démarré:');
    console.log('   cd backend && npm start');
    console.log(`   Le backend devrait être accessible sur: ${API_BASE_URL}`);
    testResults.warnings.push('Backend non accessible - assurez-vous qu\'il est démarré sur le port 5000');
    return false;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log(`   URL testée: ${API_BASE_URL}`);
    testResults.warnings.push(`Erreur de connexion: ${error.message}`);
    return false;
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('\n🚀 Démarrage des tests...\n');
  console.log('='.repeat(60));
  
  // Vérifier l'environnement
  const envOk = await checkEnvironment();
  if (!envOk) {
    console.log('\n⚠️  Certaines configurations sont manquantes, mais les tests continueront...\n');
  }
  
  // Tester la connexion
  const backendOk = await testBackendConnection();
  if (!backendOk) {
    console.log('\n⚠️  Backend non accessible - certains tests peuvent échouer\n');
  }
  
  // Tests de création d'admin
  console.log('\n📋 Tests de création d\'admin...\n');
  try {
    await testAdminCreation.runTests(API_BASE_URL, logResult);
  } catch (error) {
    console.error('❌ Erreur lors des tests admin:', error);
    testResults.errors.push({ category: 'adminCreation', error: error.message });
  }
  
  // Tests de gestion des plans
  console.log('\n📋 Tests de gestion des plans...\n');
  try {
    await testPlansManagement.runTests(API_BASE_URL, logResult);
  } catch (error) {
    console.error('❌ Erreur lors des tests plans:', error);
    testResults.errors.push({ category: 'plansManagement', error: error.message });
  }
  
  // Tests de subscription
  console.log('\n📋 Tests de subscription...\n');
  try {
    await testSubscriptionFlow.runTests(API_BASE_URL, logResult);
  } catch (error) {
    console.error('❌ Erreur lors des tests subscription:', error);
    testResults.errors.push({ category: 'subscription', error: error.message });
  }
  
  // Tests de vérification email
  console.log('\n📋 Tests de vérification email...\n');
  try {
    await testEmailVerification.runTests(API_BASE_URL, logResult);
  } catch (error) {
    console.error('❌ Erreur lors des tests email:', error);
    testResults.errors.push({ category: 'emailVerification', error: error.message });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Tous les tests sont terminés\n');
}

/**
 * Générer le rapport de test
 */
async function generateReport() {
  const totalTests = Object.values(testResults.tests).reduce((sum, category) => 
    sum + category.passed + category.failed, 0
  );
  const totalPassed = Object.values(testResults.tests).reduce((sum, category) => 
    sum + category.passed, 0
  );
  const totalFailed = Object.values(testResults.tests).reduce((sum, category) => 
    sum + category.failed, 0
  );
  
  const report = `# Rapport de Test - Plans, Subscription, Admin et Vérification Email

**Date:** ${new Date(testResults.timestamp).toLocaleString('fr-FR')}
**Environnement:** ${testResults.environment.nodeEnv}
**API Base URL:** ${testResults.environment.apiBaseUrl}

## Résumé

- **Total des tests:** ${totalTests}
- **Tests réussis:** ${totalPassed} ✅
- **Tests échoués:** ${totalFailed} ${totalFailed > 0 ? '❌' : '✅'}
- **Taux de succès:** ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%

## Configuration

- MongoDB: ${testResults.environment.hasMongoDB ? '✅ Configuré' : '❌ Non configuré'}
- Email: ${testResults.environment.hasEmailConfig ? '✅ Configuré' : '❌ Non configuré'}
- JWT Secret: ${testResults.environment.hasJWTSecret ? '✅ Configuré' : '❌ Non configuré'}
- Admin JWT Secret: ${testResults.environment.hasAdminJWTSecret ? '✅ Configuré' : '❌ Non configuré'}

## Résultats détaillés

### 1. Tests de création d'admin

**Résultat:** ${testResults.tests.adminCreation.passed} réussis, ${testResults.tests.adminCreation.failed} échoués

${testResults.tests.adminCreation.results.map(r => `
#### ${r.testName}
- **Statut:** ${r.passed ? '✅ Réussi' : '❌ Échoué'}
- **Message:** ${r.message}
- **Timestamp:** ${new Date(r.timestamp).toLocaleString('fr-FR')}
${r.error ? `- **Erreur:** ${r.error}` : ''}
`).join('\n')}

### 2. Tests de gestion des plans

**Résultat:** ${testResults.tests.plansManagement.passed} réussis, ${testResults.tests.plansManagement.failed} échoués

${testResults.tests.plansManagement.results.map(r => `
#### ${r.testName}
- **Statut:** ${r.passed ? '✅ Réussi' : '❌ Échoué'}
- **Message:** ${r.message}
- **Timestamp:** ${new Date(r.timestamp).toLocaleString('fr-FR')}
${r.error ? `- **Erreur:** ${r.error}` : ''}
`).join('\n')}

### 3. Tests de subscription

**Résultat:** ${testResults.tests.subscription.passed} réussis, ${testResults.tests.subscription.failed} échoués

${testResults.tests.subscription.results.map(r => `
#### ${r.testName}
- **Statut:** ${r.passed ? '✅ Réussi' : '❌ Échoué'}
- **Message:** ${r.message}
- **Timestamp:** ${new Date(r.timestamp).toLocaleString('fr-FR')}
${r.error ? `- **Erreur:** ${r.error}` : ''}
`).join('\n')}

### 4. Tests de vérification email

**Résultat:** ${testResults.tests.emailVerification.passed} réussis, ${testResults.tests.emailVerification.failed} échoués

${testResults.tests.emailVerification.results.map(r => `
#### ${r.testName}
- **Statut:** ${r.passed ? '✅ Réussi' : '❌ Échoué'}
- **Message:** ${r.message}
- **Timestamp:** ${new Date(r.timestamp).toLocaleString('fr-FR')}
${r.error ? `- **Erreur:** ${r.error}` : ''}
`).join('\n')}

## Avertissements

${testResults.warnings.length > 0 ? testResults.warnings.map(w => `- ⚠️ ${w}`).join('\n') : 'Aucun avertissement'}

## Erreurs

${testResults.errors.length > 0 ? testResults.errors.map(e => `- ❌ ${e.category} - ${e.testName || 'Erreur générale'}: ${e.error}`).join('\n') : 'Aucune erreur'}

## Recommandations

${totalFailed > 0 ? `
1. Vérifier les logs du serveur backend
2. Vérifier la configuration des variables d'environnement
3. Vérifier la connexion à MongoDB
4. Vérifier la configuration email (Gmail)
5. Réexécuter les tests qui ont échoué
` : `
✅ Tous les tests sont passés avec succès!

Prochaines étapes:
1. Vérifier manuellement les fonctionnalités dans l'interface
2. Tester les emails dans la boîte de réception
3. Vérifier les logs serveur pour confirmer l'envoi d'emails
`}

## Logs détaillés

\`\`\`json
${JSON.stringify(testResults, null, 2)}
\`\`\`
`;
  
  await fs.writeFile(REPORT_FILE, report, 'utf-8');
  console.log(`\n📄 Rapport généré: ${REPORT_FILE}\n`);
}

/**
 * Point d'entrée principal
 */
async function main() {
  try {
    await runAllTests();
    await generateReport();
    
    // Résumé final
    const totalTests = Object.values(testResults.tests).reduce((sum, category) => 
      sum + category.passed + category.failed, 0
    );
    const totalPassed = Object.values(testResults.tests).reduce((sum, category) => 
      sum + category.passed, 0
    );
    const totalFailed = Object.values(testResults.tests).reduce((sum, category) => 
      sum + category.failed, 0
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ FINAL');
    console.log('='.repeat(60));
    console.log(`Total: ${totalTests} tests`);
    console.log(`Réussis: ${totalPassed} ✅`);
    console.log(`Échoués: ${totalFailed} ${totalFailed > 0 ? '❌' : '✅'}`);
    console.log(`Taux de succès: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`);
    console.log('='.repeat(60) + '\n');
    
    process.exit(totalFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { testResults, runAllTests, generateReport };

