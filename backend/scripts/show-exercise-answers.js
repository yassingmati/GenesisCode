const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';

// ID du niveau
const LEVEL_ID = '68c973738b6e19e85d67e35a';

async function showExerciseAnswers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les exercices du niveau
    const exercises = await Exercise.find({ level: LEVEL_ID }).sort({ createdAt: 1 });
    
    if (exercises.length === 0) {
      console.log('❌ Aucun exercice trouvé pour ce niveau');
      return;
    }

    console.log(`\n📚 Exercices du niveau ${LEVEL_ID}:`);
    console.log(`📊 Total: ${exercises.length} exercices`);
    console.log(`🏆 Points totaux: ${exercises.reduce((sum, ex) => sum + ex.points, 0)}`);
    console.log('\n' + '='.repeat(80));

    exercises.forEach((exercise, index) => {
      console.log(`\n📝 Exercice ${index + 1}: ${exercise.translations.fr.name}`);
      console.log(`🎯 Type: ${exercise.type} | 🏆 Points: ${exercise.points} | 📊 Difficulté: ${exercise.difficulty}`);
      console.log(`❓ Question: ${exercise.translations.fr.question}`);
      console.log(`💡 Explication: ${exercise.translations.fr.explanation}`);
      
      if (exercise.hint) {
        console.log(`💡 Indice: ${exercise.hint}`);
      }
      
      if (exercise.solutions && exercise.solutions.length > 0) {
        console.log(`\n✅ Solution:`);
        exercise.solutions.forEach((solution, solIndex) => {
          console.log(`\n--- Solution ${solIndex + 1} ---`);
          console.log(solution);
        });
      }
      
      if (exercise.testCases && exercise.testCases.length > 0) {
        console.log(`\n🧪 Cas de test:`);
        exercise.testCases.forEach((testCase, testIndex) => {
          console.log(`  ${testIndex + 1}. Input: "${testCase.input}" → Expected: "${testCase.expected}"`);
        });
      }
      
      console.log('\n' + '-'.repeat(80));
    });

    console.log('\n🎉 Affichage terminé!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  showExerciseAnswers()
    .then(() => {
      console.log('\n✅ Script terminé avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error.message);
      process.exit(1);
    });
}

module.exports = showExerciseAnswers;








