#!/usr/bin/env node
const { runCompleteSystemTest } = require('./testCompleteSystem');
const { runAPIRouteTests } = require('./testAPIRoutes');

async function runAllTests() {
  console.log('🚀 EXÉCUTION DE TOUS LES TESTS - SYSTÈME DE DÉBLOCAGE SÉQUENTIEL');
  console.log('================================================================');
  console.log('');

  const results = {
    completeSystem: { passed: false, error: null },
    apiRoutes: { passed: false, error: null }
  };

  // Test 1: Système complet
  console.log('📋 Test 1/2: Système Complet');
  console.log('----------------------------');
  try {
    await runCompleteSystemTest();
    results.completeSystem.passed = true;
    console.log('✅ Système complet: PASSÉ\n');
  } catch (error) {
    results.completeSystem.error = error.message;
    console.log(`❌ Système complet: ÉCHOUÉ - ${error.message}\n`);
  }

  // Test 2: Routes API
  console.log('📋 Test 2/2: Routes API');
  console.log('----------------------');
  try {
    await runAPIRouteTests();
    results.apiRoutes.passed = true;
    console.log('✅ Routes API: PASSÉ\n');
  } catch (error) {
    results.apiRoutes.error = error.message;
    console.log(`❌ Routes API: ÉCHOUÉ - ${error.message}\n`);
  }

  // Résumé final
  console.log('📊 RÉSUMÉ FINAL DES TESTS');
  console.log('========================');
  
  const totalTests = 2;
  const passedTests = Object.values(results).filter(r => r.passed).length;
  const successRate = (passedTests / totalTests) * 100;

  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Taux de réussite global: ${successRate.toFixed(1)}%`);

  if (successRate === 100) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! Le système de déblocage séquentiel fonctionne parfaitement.');
    console.log('✅ Le backend est prêt pour la production.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    
    if (results.completeSystem.error) {
      console.log(`❌ Système complet: ${results.completeSystem.error}`);
    }
    if (results.apiRoutes.error) {
      console.log(`❌ Routes API: ${results.apiRoutes.error}`);
    }
  }

  console.log('\n📝 Prochaines étapes recommandées:');
  if (successRate === 100) {
    console.log('1. ✅ Tester le frontend avec les nouveaux composants');
    console.log('2. ✅ Exécuter la migration des données existantes');
    console.log('3. ✅ Déployer en production');
  } else {
    console.log('1. 🔧 Corriger les erreurs identifiées');
    console.log('2. 🔄 Relancer les tests');
    console.log('3. ✅ Tester le frontend une fois les corrections apportées');
  }

  return results;
}

if (require.main === module) {
  runAllTests().catch(err => {
    console.error('💥 Erreur critique lors de l\'exécution des tests:', err);
    process.exit(1);
  });
} else {
  module.exports = { runAllTests };
}