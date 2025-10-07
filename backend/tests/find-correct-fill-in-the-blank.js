const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');

async function findCorrectFillInTheBlank() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codegenesis');
    console.log('🔍 Recherche de l\'exercice FillInTheBlank correct\n');
    
    // Trouver tous les exercices FillInTheBlank
    const exercises = await Exercise.find({ type: 'FillInTheBlank' });
    console.log(`📊 Nombre d'exercices FillInTheBlank trouvés: ${exercises.length}\n`);
    
    exercises.forEach((ex, i) => {
      console.log(`📝 Exercice ${i + 1}:`);
      console.log(`   ID: ${ex._id}`);
      console.log(`   Nom: ${ex.translations?.fr?.name || 'Sans nom'}`);
      console.log(`   Points: ${ex.points}`);
      console.log(`   Solutions: ${JSON.stringify(ex.solutions)}`);
      console.log(`   CodeSnippet: ${ex.codeSnippet ? 'Oui' : 'Non'}`);
      if (ex.codeSnippet) {
        console.log(`   Code: ${ex.codeSnippet.substring(0, 50)}...`);
      }
      console.log('');
    });
    
    // Trouver l'exercice avec "dynamique" dans les solutions
    const exerciseWithDynamique = exercises.find(ex => 
      ex.solutions && ex.solutions.some(sol => 
        typeof sol === 'string' && sol.toLowerCase().includes('dynamique')
      )
    );
    
    if (exerciseWithDynamique) {
      console.log('✅ Exercice avec "dynamique" trouvé:');
      console.log(`   ID: ${exerciseWithDynamique._id}`);
      console.log(`   Nom: ${exerciseWithDynamique.translations?.fr?.name}`);
      console.log(`   Solutions: ${JSON.stringify(exerciseWithDynamique.solutions)}`);
    } else {
      console.log('❌ Aucun exercice avec "dynamique" trouvé');
    }
    
    // Trouver l'exercice dans le niveau spécifique
    console.log('\n🔍 Exercices dans le niveau 68c973738b6e19e85d67e35a:');
    const levelExercises = await Exercise.find({ 
      level: '68c973738b6e19e85d67e35a',
      type: 'FillInTheBlank' 
    });
    
    levelExercises.forEach((ex, i) => {
      console.log(`📝 Exercice niveau ${i + 1}:`);
      console.log(`   ID: ${ex._id}`);
      console.log(`   Nom: ${ex.translations?.fr?.name || 'Sans nom'}`);
      console.log(`   Solutions: ${JSON.stringify(ex.solutions)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

findCorrectFillInTheBlank();

