/**
 * Script amélioré pour exécuter tous les tests avec une meilleure gestion d'erreur
 */

console.log('\n' + '='.repeat(60));
console.log('🧪 EXÉCUTION DE TOUS LES TESTS');
console.log('='.repeat(60) + '\n');

// Charger l'environnement
const { loadEnv } = require('./load-env');
loadEnv();

// Configuration
const API_BASE_URL = process.env.SERVER_URL || 'http://localhost:5000';

console.log('📋 Configuration:');
console.log(`   Backend URL: ${API_BASE_URL}`);
console.log(`   MongoDB URI: ${process.env.MONGODB_URI ? '✅ Défini' : '❌ Non défini'}`);
console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Défini' : '❌ Non défini'}`);
console.log(`   Admin JWT Secret: ${process.env.JWT_ADMIN_SECRET ? '✅ Défini' : '❌ Non défini'}`);
console.log(`   Email Config: ${process.env.EMAIL_USER && process.env.EMAIL_PASS ? '✅ Défini' : '❌ Non défini'}`);
console.log('');

// Vérifier si le backend est accessible
async function checkBackend() {
  console.log('🔍 Vérification du backend...\n');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`, {
      method: 'GET',
      signal: controller.signal
    }).catch(err => {
      clearTimeout(timeoutId);
      return null;
    });
    
    clearTimeout(timeoutId);
    
    if (response) {
      console.log(`✅ Backend accessible (statut: ${response.status})\n`);
      return true;
    } else {
      console.log('❌ Backend non accessible\n');
      console.log('⚠️  Le backend doit être démarré pour exécuter les tests API.');
      console.log('   Pour démarrer le backend:');
      console.log('   cd backend && npm start\n');
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}\n`);
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  const backendOk = await checkBackend();
  
  if (!backendOk) {
    console.log('⚠️  Les tests API ne peuvent pas être exécutés sans backend.');
    console.log('   Certains tests peuvent quand même être exécutés (tests de modèle, etc.)\n');
  }
  
  console.log('🚀 Exécution des tests...\n');
  console.log('='.repeat(60) + '\n');
  
  // Exécuter le script principal de test
  try {
    require('./test-plans-subscription-admin-email.js');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Exécuter
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});




