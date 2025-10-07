const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');

async function debugFillInTheBlankDetailed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codegenesis');
    console.log('🔍 Diagnostic détaillé de FillInTheBlank\n');
    
    const exercise = await Exercise.findOne({ type: 'FillInTheBlank' });
    if (!exercise) {
      console.log('❌ Exercice FillInTheBlank non trouvé');
      return;
    }
    
    console.log('📊 Données de l\'exercice:');
    console.log('   ID:', exercise._id);
    console.log('   Nom:', exercise.translations?.fr?.name);
    console.log('   Type:', exercise.type);
    console.log('   Points:', exercise.points);
    console.log('   Solutions:', exercise.solutions);
    console.log('   Type des solutions:', typeof exercise.solutions);
    console.log('   Longueur des solutions:', exercise.solutions?.length);
    
    if (exercise.solutions && exercise.solutions.length > 0) {
      console.log('\n🔍 Analyse des solutions:');
      exercise.solutions.forEach((sol, i) => {
        console.log(`   Solution ${i + 1}: "${sol}" (type: ${typeof sol})`);
        console.log(`   Longueur: ${sol.length}`);
        console.log(`   Trim: "${sol.trim()}"`);
        console.log(`   Lowercase: "${sol.toLowerCase()}"`);
      });
    }
    
    // Test de comparaison
    console.log('\n🧪 Tests de comparaison:');
    const testAnswers = [
      'dynamique',
      'Dynamique', 
      'DYNAMIQUE',
      ' dynamique ',
      'dynamique ',
      ' dynamique'
    ];
    
    for (const answer of testAnswers) {
      console.log(`\n   Test avec: "${answer}"`);
      const normalized = String(answer || '').trim();
      console.log(`   Normalisé: "${normalized}"`);
      
      let matched = false;
      if (exercise.solutions && exercise.solutions.length > 0) {
        for (const sol of exercise.solutions) {
          if (typeof sol === 'string') {
            const comparison = normalized.toLowerCase() === sol.trim().toLowerCase();
            console.log(`   Comparaison avec "${sol}": ${comparison}`);
            if (comparison) {
              matched = true;
              break;
            }
          }
        }
      }
      console.log(`   Résultat: ${matched ? '✅ Match' : '❌ Pas de match'}`);
    }
    
    // Vérifier la structure de l'exercice
    console.log('\n📋 Structure complète de l\'exercice:');
    console.log('   Traductions:', Object.keys(exercise.translations || {}));
    console.log('   Options:', exercise.options);
    console.log('   Elements:', exercise.elements);
    console.log('   Targets:', exercise.targets);
    console.log('   Blocks:', exercise.blocks);
    console.log('   CodeSnippet:', exercise.codeSnippet);
    console.log('   Language:', exercise.language);
    console.log('   Prompts:', exercise.prompts);
    console.log('   Matches:', exercise.matches);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugFillInTheBlankDetailed();

