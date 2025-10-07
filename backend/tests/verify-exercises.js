const mongoose = require('mongoose');
const Level = require('../src/models/Level');
const Exercise = require('../src/models/Exercise');

async function verifyExercises() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codegenesis');
    console.log('✅ Connexion à MongoDB réussie');
    
    const level = await Level.findById('68c973738b6e19e85d67e35a').populate('exercises');
    if (level) {
      console.log('✅ Niveau trouvé:', level.title || 'Sans titre');
      console.log('📝 Nombre d\'exercices:', level.exercises.length);
      console.log('\n📋 Liste des exercices:');
      
      level.exercises.forEach((ex, i) => {
        const name = ex.translations?.fr?.name || ex.name || 'Sans nom';
        console.log(`${i+1}. ${name} (${ex.type}) - ${ex.points} pts - ${ex.difficulty}`);
      });
      
      console.log('\n🎯 Total des points:', level.exercises.reduce((sum, ex) => sum + ex.points, 0));
    } else {
      console.log('❌ Niveau non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

verifyExercises();

