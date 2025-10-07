const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');
const Level = require('../src/models/Level');
const newExercises = require('./new-exercises-data');

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';

// ID du niveau à modifier
const LEVEL_ID = '68c973738b6e19e85d67e35a';

async function updateLevelExercises() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier que le niveau existe
    const level = await Level.findById(LEVEL_ID);
    if (!level) {
      throw new Error(`Niveau avec l'ID ${LEVEL_ID} non trouvé`);
    }
    console.log(`✅ Niveau trouvé: ${level.name}`);

    // Supprimer tous les exercices existants du niveau
    const deleteResult = await Exercise.deleteMany({ level: LEVEL_ID });
    console.log(`🗑️ Supprimé ${deleteResult.deletedCount} exercices existants`);

    // Créer les nouveaux exercices
    const exercisesToCreate = newExercises.map(exerciseData => ({
      ...exerciseData,
      level: LEVEL_ID,
      category: level.category || 'JavaScript',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const createdExercises = await Exercise.insertMany(exercisesToCreate);
    console.log(`✅ Créé ${createdExercises.length} nouveaux exercices`);

    // Mettre à jour le niveau avec le nombre d'exercices
    await Level.findByIdAndUpdate(LEVEL_ID, {
      exerciseCount: createdExercises.length,
      updatedAt: new Date()
    });

    console.log('\n🎉 Mise à jour terminée avec succès!');
    console.log(`📊 Niveau: ${level.name}`);
    console.log(`📝 Exercices créés: ${createdExercises.length}`);
    console.log(`🏆 Points totaux: ${newExercises.reduce((sum, ex) => sum + ex.points, 0)}`);

    // Afficher la liste des exercices créés
    console.log('\n📋 Liste des exercices créés:');
    createdExercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name} (${exercise.points} points) - ${exercise.type}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  updateLevelExercises()
    .then(() => {
      console.log('\n✅ Script terminé avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error.message);
      process.exit(1);
    });
}

module.exports = { updateLevelExercises, newExercises };
