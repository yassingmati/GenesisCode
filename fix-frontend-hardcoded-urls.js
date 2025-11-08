// Script pour corriger toutes les URLs hardcodées dans le frontend
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendSrc = path.join(__dirname, 'frontend', 'src');

// Patterns à rechercher et remplacer
const patterns = [
  {
    // localhost:5000 hardcodé
    search: /['"]http:\/\/localhost:5000['"]/g,
    replace: `getApiUrl('')`,
    requiresImport: true
  },
  {
    // localhost:5000/api hardcodé
    search: /['"]http:\/\/localhost:5000\/api['"]/g,
    replace: `getApiUrl('/api')`,
    requiresImport: true
  },
  {
    // URL relative qui devrait utiliser le backend
    search: /fetch\(['"]\/api\/(category-payments|courses|users|auth|admin|payment|subscriptions|notifications|plans)/g,
    replace: (match, endpoint) => `fetch(getApiUrl('/api/${endpoint}')`,
    requiresImport: true
  },
  {
    // const API_BASE = 'http://localhost:5000'
    search: /const\s+API_BASE\s*=\s*['"]http:\/\/localhost:5000['"];?/g,
    replace: `import { getApiUrl } from '../utils/apiConfig';\nconst API_BASE = getApiUrl('');`,
    requiresImport: false
  },
  {
    // const API_BASE = 'http://localhost:5000/api'
    search: /const\s+API_BASE\s*=\s*['"]http:\/\/localhost:5000\/api['"];?/g,
    replace: `import { getApiUrl } from '../utils/apiConfig';\nconst API_BASE = getApiUrl('/api');`,
    requiresImport: false
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let needsImport = false;

    // Vérifier si le fichier a déjà l'import
    const hasImport = content.includes("from '../utils/apiConfig'") || 
                      content.includes("from '../../utils/apiConfig'") ||
                      content.includes("from '../../../utils/apiConfig'") ||
                      content.includes("from '../../../../utils/apiConfig'");

    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.search);
      if (regex.test(content)) {
        if (pattern.requiresImport && !hasImport) {
          needsImport = true;
        }
        
        if (typeof pattern.replace === 'function') {
          content = content.replace(regex, pattern.replace);
        } else {
          content = content.replace(regex, pattern.replace);
        }
        modified = true;
      }
    });

    // Ajouter l'import si nécessaire
    if (needsImport && !hasImport && modified) {
      // Calculer le chemin relatif vers utils/apiConfig.js
      const relativePath = path.relative(path.dirname(filePath), path.join(frontendSrc, 'utils', 'apiConfig.js'))
        .replace(/\\/g, '/')
        .replace(/\.js$/, '');
      
      const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
      const importStatement = `import { getApiUrl } from '${importPath}';\n`;
      
      // Ajouter l'import après les autres imports
      const importMatch = content.match(/(^import .*? from .*?;\n)+/m);
      if (importMatch) {
        content = content.replace(importMatch[0], importMatch[0] + importStatement);
      } else {
        // Si pas d'imports, ajouter au début
        content = importStatement + content;
      }
    }

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
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('__tests__')) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

console.log('🔧 Correction des URLs hardcodées dans le frontend...\n');

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
console.log('3. Tester l\'application');

