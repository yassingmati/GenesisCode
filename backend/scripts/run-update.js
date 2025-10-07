#!/usr/bin/env node

const { updateLevelExercises } = require('./update-level-exercises');

console.log('🚀 Démarrage de la mise à jour des exercices...');
console.log('📋 Niveau cible: 68c973738b6e19e85d67e35a');
console.log('');

updateLevelExercises()
  .then(() => {
    console.log('\n✅ Mise à jour terminée avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de la mise à jour:', error.message);
    process.exit(1);
  });


