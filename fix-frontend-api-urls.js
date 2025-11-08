// Script pour corriger toutes les références API_BASE_URL dans le frontend
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendSrc = path.join(__dirname, 'frontend', 'src');

// Pattern à rechercher et remplacer
const patterns = [
  {
    search: /const API_BASE_URL = process\.env\.REACT_APP_API_BASE_URL \|\| 'http:\/\/localhost:5000';/g,
    replace: `const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');`
  },
  {
    search: /const API_BASE_URL = process\.env\.REACT_APP_API_BASE_URL \|\| "http:\/\/localhost:5000";/g,
    replace: `const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');`
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    patterns.forEach(pattern => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${path.relative(frontendSrc, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur sur ${filePath}:`, error.message);
    return false;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔧 Correction des URLs API dans le frontend...\n');

const files = walkDir(frontendSrc);
let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ ${fixedCount} fichier(s) corrigé(s)`);
console.log('\n📋 Prochaines étapes:');
console.log('1. Rebuild le frontend: cd frontend && npm run build');
console.log('2. Redéployer: firebase deploy --only hosting');
console.log('3. Tester l\'authentification');

