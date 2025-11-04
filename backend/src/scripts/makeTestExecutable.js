const fs = require('fs');
const path = require('path');

// Script pour rendre les scripts de test exécutables et ajouter les permissions

const testScripts = [
  'testCompleteSystem.js',
  'testAPIRoutes.js',
  'runAllTests.js',
  'migrateSequentialUnlock.js'
];

const scriptsDir = __dirname;

console.log('🔧 Configuration des scripts de test...');

testScripts.forEach(scriptName => {
  const scriptPath = path.join(scriptsDir, scriptName);
  
  if (fs.existsSync(scriptPath)) {
    // Ajouter le shebang si ce n'est pas déjà fait
    const content = fs.readFileSync(scriptPath, 'utf8');
    
    if (!content.startsWith('#!/usr/bin/env node')) {
      const newContent = '#!/usr/bin/env node\n' + content;
      fs.writeFileSync(scriptPath, newContent);
      console.log(`✅ Shebang ajouté à ${scriptName}`);
    } else {
      console.log(`ℹ️ Shebang déjà présent dans ${scriptName}`);
    }
    
    // Sur Windows, on ne peut pas changer les permissions de la même manière
    // mais on peut créer un fichier .bat pour faciliter l'exécution
    if (process.platform === 'win32') {
      const batPath = path.join(scriptsDir, scriptName.replace('.js', '.bat'));
      const batContent = `@echo off
node "${scriptPath}" %*
`;
      fs.writeFileSync(batPath, batContent);
      console.log(`✅ Fichier .bat créé pour ${scriptName}`);
    }
  } else {
    console.log(`⚠️ Script ${scriptName} non trouvé`);
  }
});

// Créer un script de test principal
const mainTestScript = path.join(scriptsDir, 'test.js');
const mainTestContent = `#!/usr/bin/env node

const { runAllTests } = require('./runAllTests');

console.log('🚀 Lancement des tests CodeGenesis...');
console.log('=====================================');

runAllTests().then(results => {
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r.passed).length;
  const successRate = (passedTests / totalTests) * 100;
  
  if (successRate === 100) {
    console.log('\\n🎉 Tous les tests sont passés !');
    process.exit(0);
  } else {
    console.log('\\n⚠️ Certains tests ont échoué.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Erreur lors de l\\'exécution des tests:', error);
  process.exit(1);
});
`;

fs.writeFileSync(mainTestScript, mainTestContent);
console.log('✅ Script de test principal créé (test.js)');

// Créer un fichier package.json pour les scripts de test
const packageJsonPath = path.join(scriptsDir, 'package.json');
const packageJsonContent = {
  "name": "codegenesis-test-scripts",
  "version": "1.0.0",
  "description": "Scripts de test pour le système de déblocage séquentiel",
  "scripts": {
    "test": "node test.js",
    "test:complete": "node testCompleteSystem.js",
    "test:api": "node testAPIRoutes.js",
    "test:all": "node runAllTests.js",
    "migrate": "node migrateSequentialUnlock.js"
  },
  "keywords": ["test", "codegenesis", "sequential-unlock"],
  "author": "CodeGenesis Team",
  "license": "MIT"
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
console.log('✅ package.json créé pour les scripts de test');

console.log('\n📋 Instructions d\'utilisation:');
console.log('===============================');
console.log('1. Tests complets: npm run test:all');
console.log('2. Test système: npm run test:complete');
console.log('3. Test API: npm run test:api');
console.log('4. Migration: npm run migrate');
console.log('5. Test principal: npm test');

if (process.platform === 'win32') {
  console.log('\n🪟 Sur Windows, vous pouvez aussi utiliser:');
  console.log('- testCompleteSystem.bat');
  console.log('- testAPIRoutes.bat');
  console.log('- runAllTests.bat');
  console.log('- migrateSequentialUnlock.bat');
}

console.log('\n✅ Configuration terminée !');
