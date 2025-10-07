const fs = require('fs');
const path = require('path');

// Fichiers Markdown à corriger
const markdownFiles = [
  '../../frontend/src/pages/course/INTEGRATION-GUIDE.md',
  '../../frontend/src/pages/course/INTEGRATION-SUMMARY.md'
];

function fixMarkdownLinting(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Corrections pour les erreurs de linting Markdown
    
    // 1. Supprimer les lignes vides multiples (MD012)
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 2. Ajouter des lignes vides autour des listes (MD032)
    content = content.replace(/(\n)([*-] .+)/g, '\n\n$2');
    content = content.replace(/([*-] .+)(\n)([^*-])/g, '$1\n\n$3');
    
    // 3. Ajouter des lignes vides autour des titres (MD022)
    content = content.replace(/(\n)(#{1,6} .+)/g, '\n\n$2');
    content = content.replace(/(#{1,6} .+)(\n)([^#])/g, '$1\n\n$3');
    
    // 4. Ajouter des langages aux blocs de code (MD040)
    content = content.replace(/(```)(\n)/g, '$1javascript\n');
    
    // 5. Supprimer les titres dupliqués (MD024)
    const lines = content.split('\n');
    const seenTitles = new Set();
    const fixedLines = lines.map(line => {
      if (line.match(/^#{1,6} /)) {
        const title = line.replace(/^#{1,6} /, '');
        if (seenTitles.has(title)) {
          return line + ' (2)';
        }
        seenTitles.add(title);
      }
      return line;
    });
    content = fixedLines.join('\n');
    
    // 6. Nettoyer les lignes vides multiples à nouveau
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} corrigé`);
    
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
  }
}

// Corriger tous les fichiers
console.log('🔧 Correction des erreurs de linting Markdown...\n');

markdownFiles.forEach(filePath => {
  const fullPath = path.resolve(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    fixMarkdownLinting(fullPath);
  } else {
    console.log(`⚠️ Fichier non trouvé: ${filePath}`);
  }
});

console.log('\n🎉 Correction terminée !');
