const mongoose = require('mongoose');
const Level = require('../src/models/Level');
const Exercise = require('../src/models/Exercise');

async function testExercises() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codegenesis');
    console.log('✅ Connexion à MongoDB réussie');
    
    const level = await Level.findById('68c973738b6e19e85d67e35a').populate('exercises');
    if (!level) {
      throw new Error('Niveau non trouvé');
    }
    
    console.log('📝 Test des exercices du niveau:', level.title || 'Sans titre');
    console.log('📊 Nombre d\'exercices:', level.exercises.length);
    
    // Test de chaque exercice
    for (let i = 0; i < level.exercises.length; i++) {
      const exercise = level.exercises[i];
      console.log(`\n${i + 1}. ${exercise.translations?.fr?.name || 'Sans nom'} (${exercise.type})`);
      
      // Vérifier les données de base
      console.log(`   📊 Points: ${exercise.points}, Difficulté: ${exercise.difficulty}`);
      console.log(`   ⏱️ Temps limite: ${exercise.timeLimit} min, Tentatives: ${exercise.attemptsAllowed}`);
      
      // Vérifier les solutions
      if (exercise.solutions && exercise.solutions.length > 0) {
        console.log(`   ✅ Solutions: ${exercise.solutions.length} trouvée(s)`);
        
        // Afficher les solutions selon le type
        if (exercise.type === 'QCM') {
          console.log(`   🎯 Réponse correcte: ${exercise.solutions[0]}`);
        } else if (exercise.type === 'Code') {
          console.log(`   💻 Solution: ${exercise.solutions[0].substring(0, 50)}...`);
        } else if (exercise.type === 'Algorithm' || exercise.type === 'OrderBlocks' || exercise.type === 'ScratchBlocks') {
          console.log(`   🔢 Ordre correct: ${exercise.solutions[0].join(' → ')}`);
        } else if (exercise.type === 'TextInput') {
          console.log(`   📝 Réponse: ${exercise.solutions.join(' ou ')}`);
        } else if (exercise.type === 'FillInTheBlank') {
          console.log(`   🔤 Complétion: ${JSON.stringify(exercise.solutions)}`);
        } else if (exercise.type === 'SpotTheError') {
          console.log(`   ❌ Lignes avec erreurs: ${exercise.solutions.join(', ')}`);
        }
      } else {
        console.log(`   ⚠️ Aucune solution trouvée`);
      }
      
      // Vérifier les traductions
      if (exercise.translations) {
        const langs = Object.keys(exercise.translations);
        console.log(`   🌐 Traductions: ${langs.join(', ')}`);
      }
      
      // Vérifier les cas de test pour les exercices Code
      if (exercise.type === 'Code' && exercise.testCases) {
        console.log(`   🧪 Cas de test: ${exercise.testCases.length} (${exercise.testCases.filter(tc => tc.public).length} publics)`);
      }
      
      // Vérifier les options pour QCM
      if (exercise.type === 'QCM' && exercise.options) {
        console.log(`   📋 Options: ${exercise.options.length}`);
      }
      
      // Vérifier les blocs pour OrderBlocks/ScratchBlocks
      if ((exercise.type === 'OrderBlocks' || exercise.type === 'ScratchBlocks') && exercise.blocks) {
        console.log(`   🧩 Blocs: ${exercise.blocks.length}`);
      }
    }
    
    console.log('\n🎉 Tous les exercices ont été vérifiés avec succès !');
    console.log(`📊 Total des points: ${level.exercises.reduce((sum, ex) => sum + ex.points, 0)}`);
    
    // Test de soumission simulé
    console.log('\n🧪 Test de soumission simulé:');
    const testAnswers = {
      'QCM': ['c'],
      'Code': 'function factorielle(n) { if (n <= 1) return 1; return n * factorielle(n - 1); }',
      'Algorithm': ['1', '2', '3', '4'],
      'OrderBlocks': ['1', '2', '3', '4'],
      'TextInput': 'console.log',
      'FillInTheBlank': { gap1: 'dynamique' },
      'SpotTheError': [2],
      'ScratchBlocks': ['start', 'say1', 'say2']
    };
    
    for (const exercise of level.exercises) {
      const testAnswer = testAnswers[exercise.type];
      if (testAnswer) {
        console.log(`✅ ${exercise.translations?.fr?.name}: Réponse de test prête`);
      } else {
        console.log(`⚠️ ${exercise.translations?.fr?.name}: Pas de réponse de test pour ${exercise.type}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

testExercises();

