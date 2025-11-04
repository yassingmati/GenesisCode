#!/usr/bin/env node

const { runAllTests } = require('./runAllTests');

console.log('🚀 Lancement des tests CodeGenesis...');
console.log('=====================================');

runAllTests().then(results => {
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.passed).length;
  const successRate = (passedTests / totalTests) * 100;
  
  if (successRate === 100) {
    console.log('\n🎉 Tous les tests sont passés !');
    process.exit(0);
  } else {
    console.log('\n⚠️ Certains tests ont échoué.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});
