const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');

async function fixFillInTheBlankSolutions() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codegenesis');
    console.log('🔧 Correction des solutions FillInTheBlank\n');
    
    // Trouver l'exercice dans le niveau
    const exercise = await Exercise.findOne({ 
      level: '68c973738b6e19e85d67e35a',
      type: 'FillInTheBlank' 
    });
    
    if (!exercise) {
      console.log('❌ Exercice FillInTheBlank non trouvé dans le niveau');
      return;
    }
    
    console.log('📊 Avant correction:');
    console.log('   ID:', exercise._id);
    console.log('   Nom:', exercise.translations?.fr?.name);
    console.log('   Solutions:', exercise.solutions);
    console.log('   Type des solutions:', typeof exercise.solutions);
    
    // Corriger les solutions pour qu'elles soient des chaînes simples
    exercise.solutions = ['dynamique'];
    await exercise.save();
    
    console.log('\n✅ Après correction:');
    console.log('   Solutions:', exercise.solutions);
    console.log('   Type des solutions:', typeof exercise.solutions);
    
    // Test de validation
    console.log('\n🧪 Test de validation:');
    const testAnswer = 'dynamique';
    const normalized = String(testAnswer || '').trim();
    const solutions = exercise.solutions || [];
    let matched = false;
    
    for (const sol of solutions) {
      if (typeof sol === 'string') {
        if (normalized.toLowerCase() === sol.trim().toLowerCase()) {
          matched = true;
          break;
        }
      }
    }
    
    console.log(`   Réponse testée: "${testAnswer}"`);
    console.log(`   Solutions disponibles: ${JSON.stringify(solutions)}`);
    console.log(`   Résultat: ${matched ? '✅ Match' : '❌ Pas de match'}`);
    
    if (matched) {
      console.log('\n🎉 Correction réussie ! L\'exercice FillInTheBlank devrait maintenant fonctionner.');
    } else {
      console.log('\n⚠️ La correction n\'a pas résolu le problème.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixFillInTheBlankSolutions();

