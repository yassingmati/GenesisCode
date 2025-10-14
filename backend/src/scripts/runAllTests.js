// src/scripts/runAllTests.js
const { spawn } = require('child_process');
const path = require('path');

async function runAllTests() {
  console.log('🧪 EXÉCUTION DE TOUS LES TESTS');
  console.log('===============================');
  
  const tests = [
    {
      name: 'Test Complet du Système',
      command: 'npm',
      args: ['run', 'test:complete'],
      description: 'Test complet du système de paiement par catégorie'
    },
    {
      name: 'Test des Endpoints API',
      command: 'npm',
      args: ['run', 'test:api'],
      description: 'Test de tous les endpoints API'
    },
    {
      name: 'Test du Système de Déblocage',
      command: 'npm',
      args: ['run', 'test:unlock'],
      description: 'Test du système de déblocage des niveaux'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n🔬 ${test.name}`);
    console.log(`📝 ${test.description}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await runTest(test);
      results.push({
        name: test.name,
        success: result.success,
        output: result.output,
        error: result.error
      });
      
      if (result.success) {
        console.log(`✅ ${test.name} - RÉUSSI`);
      } else {
        console.log(`❌ ${test.name} - ÉCHOUÉ`);
        console.log('Erreur:', result.error);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERREUR`);
      console.log('Erreur:', error.message);
      results.push({
        name: test.name,
        success: false,
        output: '',
        error: error.message
      });
    }
  }
  
  // Résumé final
  console.log('\n📊 RÉSUMÉ FINAL DES TESTS');
  console.log('==========================');
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  
  console.log(`Total des tests: ${totalTests}`);
  console.log(`✅ Réussis: ${successfulTests}`);
  console.log(`❌ Échoués: ${failedTests}`);
  console.log(`📈 Taux de réussite: ${Math.round((successfulTests / totalTests) * 100)}%`);
  
  console.log('\n📋 DÉTAIL DES RÉSULTATS:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (!result.success && result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
  });
  
  if (failedTests > 0) {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('Vérifiez les erreurs ci-dessus et corrigez les problèmes.');
    process.exit(1);
  } else {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('Le système de paiement par catégorie fonctionne parfaitement.');
    process.exit(0);
  }
}

function runTest(test) {
  return new Promise((resolve) => {
    const child = spawn(test.command, test.args, {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      error += text;
      process.stderr.write(text);
    });
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output,
        error: error
      });
    });
    
    child.on('error', (err) => {
      resolve({
        success: false,
        output: output,
        error: err.message
      });
    });
  });
}

// Exécuter tous les tests si le script est appelé directement
if (require.main === module) {
  runAllTests();
}

module.exports = runAllTests;


