/**
 * Script de test pour vérifier la récupération des plans depuis MongoDB Atlas via le frontend
 */

const { loadEnv } = require('./load-env');
loadEnv();

require('./test-helpers');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';

/**
 * Test: Récupérer les plans via l'endpoint frontend
 */
async function testFrontendPlansEndpoint() {
  try {
    console.log('🚀 Test de récupération des plans depuis MongoDB Atlas\n');
    console.log('API Base:', API_BASE);
    console.log('='.repeat(60));
    
    // Test 1: Endpoint /api/subscriptions/plans (utilisé par le frontend)
    console.log('\n📋 Test 1: Endpoint /api/subscriptions/plans');
    const response1 = await fetch(`${API_BASE}/api/subscriptions/plans`);
    const data1 = await response1.json();
    
    if (response1.ok && data1.success && Array.isArray(data1.plans)) {
      console.log('✅ Plans récupérés:', data1.plans.length);
      console.log('\n📊 Détails des plans:');
      data1.plans.forEach((plan, index) => {
        console.log(`\n${index + 1}. ${plan.name || plan._id || 'Plan sans nom'}`);
        console.log(`   ID: ${plan._id || plan.id}`);
        console.log(`   Description: ${plan.description || 'Aucune description'}`);
        console.log(`   Prix: ${plan.priceMonthly ? `${(plan.priceMonthly/100).toFixed(2)} ${plan.currency || 'TND'}` : 'Gratuit'}`);
        console.log(`   Intervalle: ${plan.interval || 'N/A'}`);
        console.log(`   Actif: ${plan.active !== false ? 'Oui' : 'Non'}`);
        console.log(`   Fonctionnalités: ${Array.isArray(plan.features) ? plan.features.length : 0}`);
      });
      
      return { success: true, plans: data1.plans };
    } else {
      console.error('❌ Échec récupération plans:', data1);
      return { success: false, error: data1.message || data1.error || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test frontend plans:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Vérifier le format des plans pour l'affichage frontend
 */
async function testPlanFormat() {
  try {
    console.log('\n📋 Test 2: Vérification du format des plans');
    
    const response = await fetch(`${API_BASE}/api/subscriptions/plans`);
    const data = await response.json();
    
    if (!response.ok || !data.success || !Array.isArray(data.plans)) {
      console.error('❌ Impossible de récupérer les plans');
      return { success: false };
    }
    
    const requiredFields = ['_id', 'id', 'name', 'priceMonthly', 'currency', 'features'];
    const issues = [];
    
    data.plans.forEach((plan, index) => {
      const planIssues = [];
      
      // Vérifier les champs requis
      if (!plan._id && !plan.id) {
        planIssues.push('ID manquant (_id ou id)');
      }
      if (!plan.name) {
        planIssues.push('Nom manquant');
      }
      if (plan.priceMonthly === undefined && plan.priceMonthly !== null) {
        planIssues.push('priceMonthly manquant ou invalide');
      }
      if (!plan.currency) {
        planIssues.push('Devise manquante');
      }
      if (!Array.isArray(plan.features)) {
        planIssues.push('Features doit être un tableau');
      }
      
      if (planIssues.length > 0) {
        issues.push({
          planIndex: index + 1,
          planId: plan._id || plan.id || 'N/A',
          issues: planIssues
        });
      }
    });
    
    if (issues.length > 0) {
      console.warn('⚠️ Problèmes de format détectés:');
      issues.forEach(issue => {
        console.warn(`   Plan ${issue.planIndex} (${issue.planId}):`);
        issue.issues.forEach(i => console.warn(`     - ${i}`));
      });
      return { success: false, issues };
    } else {
      console.log('✅ Tous les plans ont le format correct pour l\'affichage frontend');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Erreur test format:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('🚀 Tests Frontend - Récupération Plans depuis MongoDB Atlas\n');
  console.log('='.repeat(60));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  try {
    // Tests
    const tests = [
      { name: 'Récupération plans depuis MongoDB Atlas', fn: testFrontendPlansEndpoint },
      { name: 'Vérification format plans pour frontend', fn: testPlanFormat },
    ];
    
    for (const test of tests) {
      results.total++;
      const result = await test.fn();
      results.tests.push({ name: test.name, ...result });
      
      if (result.success) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      // Attendre un peu entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(60));
    console.log(`Total: ${results.total}`);
    console.log(`✅ Réussis: ${results.passed}`);
    console.log(`❌ Échoués: ${results.failed}`);
    console.log(`Taux de réussite: ${Math.round((results.passed / results.total) * 100)}%`);
    
    console.log('\n📋 Détails:');
    results.tests.forEach((test, index) => {
      const status = test.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (!test.success && test.error) {
        console.log(`   Erreur: ${test.error}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('\n❌ Erreur critique lors des tests:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✅ Tests terminés');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur lors des tests:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };

