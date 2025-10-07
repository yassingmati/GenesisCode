const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');

async function fixFillInTheBlank() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codegenesis');
    const exercise = await Exercise.findOne({ type: 'FillInTheBlank' });
    if (exercise) {
      console.log('Correction de l\'exercice FillInTheBlank...');
      exercise.solutions = ['dynamique'];
      await exercise.save();
      console.log('✅ Solutions corrigées:', exercise.solutions);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixFillInTheBlank();

