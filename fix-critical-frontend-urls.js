// Script pour corriger les URLs critiques dans le frontend
const fs = require('fs');
const path = require('path');

const filesToFix = [
  {
    file: 'frontend/src/pages/course/LevelPage.jsx',
    patterns: [
      {
        search: /const API_BASE = ['"]http:\/\/localhost:5000\/api\/courses['"];?/,
        replace: `import { getApiUrl } from '../../utils/apiConfig';\nconst API_BASE = getApiUrl('/api/courses');`
      },
      {
        search: /const API_ORIGIN = ['"]http:\/\/localhost:5000['"];?/,
        replace: `const API_ORIGIN = getApiUrl('');`
      }
    ]
  },
  {
    file: 'frontend/src/pages/course/ExercisePage.jsx',
    patterns: [
      {
        search: /const API_BASE = ['"]http:\/\/localhost:5000\/api\/courses['"];?/,
        replace: `import { getApiUrl } from '../../utils/apiConfig';\nconst API_BASE = getApiUrl('/api/courses');`
      }
    ]
  },
  {
    file: 'frontend/src/pages/ExercisePage.jsx',
    patterns: [
      {
        search: /axios\.get\(['"]http:\/\/localhost:5000\/api\/courses\/exercises\/\$\{exerciseId\}['"]/g,
        replace: `axios.get(\`\${getApiUrl('/api/courses/exercises')}/\${exerciseId}\``
      },
      {
        search: /axios\.post\(['"]http:\/\/localhost:5000\/api\/courses\/exercises\/\$\{exerciseId\}\/submit['"]/g,
        replace: `axios.post(\`\${getApiUrl('/api/courses/exercises')}/\${exerciseId}/submit\``
      }
    ],
    addImport: true
  },
  {
    file: 'frontend/src/pages/admin/CourseManagement.jsx',
    patterns: [
      {
        search: /baseURL: ['"]http:\/\/localhost:5000\/api\/courses['"]/,
        replace: `baseURL: getApiUrl('/api/courses')`
      },
      {
        search: /const API_BASE_URL = ['"]http:\/\/localhost:5000['"];?/,
        replace: `const API_BASE_URL = getApiUrl('');`
      }
    ],
    addImport: true
  },
  {
    file: 'frontend/src/api/adminService.js',
    patterns: [
      {
        search: /const API_URL = process\.env\.REACT_APP_API_URL \|\| ['"]http:\/\/localhost:5000\/api\/admin['"];?/,
        replace: `import { getApiUrl } from '../utils/apiConfig';\nconst API_URL = process.env.REACT_APP_API_URL || getApiUrl('/api/admin');`
      }
    ]
  }
];

function fixFile(filePath, patterns, addImport = false) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Vérifier si le fichier a déjà l'import
    const hasImport = content.includes("from '../utils/apiConfig'") || 
                      content.includes("from '../../utils/apiConfig'") ||
                      content.includes("from '../../../utils/apiConfig'");

    patterns.forEach(pattern => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        modified = true;
      }
    });

    // Ajouter l'import si nécessaire
    if (addImport && !hasImport && modified) {
      const importPath = filePath.includes('pages/admin') 
        ? '../../../utils/apiConfig'
        : filePath.includes('pages/') 
          ? '../../utils/apiConfig'
          : '../utils/apiConfig';
      
      const importStatement = `import { getApiUrl } from '${importPath}';\n`;
      
      // Ajouter après les autres imports
      const importMatch = content.match(/(^import .*? from .*?;\n)+/m);
      if (importMatch) {
        content = content.replace(importMatch[0], importMatch[0] + importStatement);
      } else {
        content = importStatement + content;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Erreur sur ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Correction des URLs critiques dans le frontend...\n');

let fixedCount = 0;
filesToFix.forEach(({ file, patterns, addImport = false }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    if (fixFile(filePath, patterns, addImport)) {
      fixedCount++;
    }
  } else {
    console.log(`⚠️  Fichier non trouvé: ${file}`);
  }
});

console.log(`\n✅ ${fixedCount} fichier(s) critique(s) corrigé(s)`);

