/**
 * Tests complets pour le système de soumission d'exercices
 * Teste tous les types d'exercices: QCM, Code, TextInput, etc.
 */

const { loadEnv } = require('./load-env');
loadEnv();

require('./test-helpers');

const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const Exercise = require('./backend/src/models/Exercise');
const Level = require('./backend/src/models/Level');
const jwt = require('jsonwebtoken');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

let testUser = null;
let userToken = null;
let testLevel = null;
let testExercises = {};

/**
 * Créer ou récupérer un utilisateur de test
 */
async function setupTestUser() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    }
    
    let user = await User.findOne({ email: 'test-exercise-complete@test.com' });
    
    if (!user) {
      user = new User({
        firebaseUid: `test-exercise-complete-${Date.now()}`,
        email: 'test-exercise-complete@test.com',
        firstName: 'Test',
        lastName: 'Exercise',
        userType: 'student',
        isVerified: true,
        isProfileComplete: true
      });
      await user.save();
    }
    
    testUser = user;
    
    // Créer un token JWT
    userToken = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    return user;
  } catch (error) {
    console.error('Erreur setup utilisateur:', error);
    throw error;
  }
}

/**
 * Créer un niveau de test avec des exercices
 */
async function setupTestExercises() {
  try {
    // Créer ou récupérer un niveau de test
    testLevel = await Level.findOne({ title: 'Niveau Test Exercices' });
    
    if (!testLevel) {
      testLevel = new Level({
        title: 'Niveau Test Exercices',
        description: 'Niveau pour tester les exercices',
        order: 1
      });
      await testLevel.save();
    }
    
    // Créer différents types d'exercices
    const exerciseTypes = [
      {
        type: 'QCM',
        name: 'Exercice QCM Test',
        question: 'Quelle est la bonne réponse?',
        options: [
          { id: 'opt1', text: 'Option 1' },
          { id: 'opt2', text: 'Option 2' },
          { id: 'opt3', text: 'Option 3' }
        ],
        solutions: ['opt2'],
        points: 10
      },
      {
        type: 'TextInput',
        name: 'Exercice TextInput Test',
        question: 'Quelle est la capitale de la France?',
        solutions: ['Paris', 'paris'],
        points: 10
      },
      {
        type: 'Code',
        name: 'Exercice Code Test',
        question: 'Écrivez une fonction qui retourne la somme de deux nombres',
        testCases: [
          { input: [1, 2], expected: 3, points: 5 },
          { input: [5, 5], expected: 10, points: 5 }
        ],
        points: 10
      }
    ];
    
    for (const exData of exerciseTypes) {
      let exercise = await Exercise.findOne({ 
        name: exData.name,
        level: testLevel._id 
      });
      
      if (!exercise) {
        exercise = new Exercise({
          translations: {
            fr: {
              name: exData.name,
              question: exData.question,
              explanation: 'Explication de l\'exercice'
            },
            en: {
              name: exData.name,
              question: exData.question,
              explanation: 'Exercise explanation'
            },
            ar: {
              name: exData.name,
              question: exData.question,
              explanation: 'شرح التمرين'
            }
          },
          type: exData.type,
          level: testLevel._id,
          points: exData.points || 10,
          difficulty: 'medium',
          ...exData
        });
        await exercise.save();
      }
      
      testExercises[exData.type] = exercise;
    }
    
    return testExercises;
  } catch (error) {
    console.error('Erreur setup exercices:', error);
    throw error;
  }
}

/**
 * Test: Soumettre un exercice QCM
 */
async function testSubmitQCM() {
  try {
    console.log('\n📝 Test: Soumission exercice QCM');
    
    const exercise = testExercises.QCM;
    if (!exercise) {
      return { success: false, error: 'Exercice QCM non trouvé' };
    }
    
    const response = await fetch(`${API_BASE}/api/courses/exercises/${exercise._id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUser._id.toString(),
        answer: ['opt2'] // Bonne réponse
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.correct) {
      console.log('✅ QCM soumis avec succès - Réponse correcte');
      return { success: true, data };
    } else {
      console.error('❌ Échec soumission QCM:', data);
      return { success: false, error: data.error || data.message || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test submit QCM:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Soumettre un exercice TextInput
 */
async function testSubmitTextInput() {
  try {
    console.log('\n📝 Test: Soumission exercice TextInput');
    
    const exercise = testExercises.TextInput;
    if (!exercise) {
      return { success: false, error: 'Exercice TextInput non trouvé' };
    }
    
    const response = await fetch(`${API_BASE}/api/courses/exercises/${exercise._id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUser._id.toString(),
        answer: 'Paris' // Bonne réponse
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.correct) {
      console.log('✅ TextInput soumis avec succès - Réponse correcte');
      return { success: true, data };
    } else {
      console.error('❌ Échec soumission TextInput:', data);
      return { success: false, error: data.error || data.message || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test submit TextInput:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Soumettre un exercice Code
 */
async function testSubmitCode() {
  try {
    console.log('\n💻 Test: Soumission exercice Code');
    
    const exercise = testExercises.Code;
    if (!exercise) {
      return { success: false, error: 'Exercice Code non trouvé' };
    }
    
    const response = await fetch(`${API_BASE}/api/courses/exercises/${exercise._id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUser._id.toString(),
        passed: true, // Simuler que les tests passent
        passedCount: 2,
        totalCount: 2,
        tests: [
          { name: 'Test 1', passed: true, points: 5 },
          { name: 'Test 2', passed: true, points: 5 }
        ]
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.correct) {
      console.log('✅ Code soumis avec succès - Tous les tests passent');
      return { success: true, data };
    } else {
      console.error('❌ Échec soumission Code:', data);
      return { success: false, error: data.error || data.message || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test submit Code:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Soumettre avec une réponse incorrecte
 */
async function testSubmitIncorrectAnswer() {
  try {
    console.log('\n❌ Test: Soumission réponse incorrecte');
    
    const exercise = testExercises.QCM;
    if (!exercise) {
      return { success: false, error: 'Exercice QCM non trouvé' };
    }
    
    const response = await fetch(`${API_BASE}/api/courses/exercises/${exercise._id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: testUser._id.toString(),
        answer: ['opt1'] // Mauvaise réponse
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && !data.correct) {
      console.log('✅ Réponse incorrecte gérée correctement');
      return { success: true, data };
    } else {
      console.error('❌ Échec test réponse incorrecte:', data);
      return { success: false, error: data.error || data.message || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test submit incorrect:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Validation des paramètres (userId manquant)
 */
async function testValidationMissingUserId() {
  try {
    console.log('\n🔍 Test: Validation userId manquant');
    
    const exercise = testExercises.QCM;
    if (!exercise) {
      return { success: false, error: 'Exercice QCM non trouvé' };
    }
    
    const response = await fetch(`${API_BASE}/api/courses/exercises/${exercise._id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answer: ['opt2']
        // userId manquant intentionnellement
      })
    });
    
    const data = await response.json();
    
    if (!response.ok && data.error && data.error.includes('userId')) {
      console.log('✅ Validation userId fonctionne correctement');
      return { success: true, data };
    } else {
      console.error('❌ Validation userId ne fonctionne pas:', data);
      return { success: false, error: 'La validation userId devrait échouer' };
    }
  } catch (error) {
    console.error('❌ Erreur test validation:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('🚀 Démarrage des tests complets d\'exercices\n');
  console.log('API Base:', API_BASE);
  console.log('='.repeat(60));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  try {
    // Setup
    await setupTestUser();
    await setupTestExercises();
    
    console.log('✅ Setup terminé');
    console.log('   User ID:', testUser._id.toString());
    console.log('   Level ID:', testLevel._id.toString());
    console.log('   Exercices créés:', Object.keys(testExercises).length);
    
    // Tests
    const tests = [
      { name: 'Soumission QCM (correcte)', fn: testSubmitQCM },
      { name: 'Soumission TextInput (correcte)', fn: testSubmitTextInput },
      { name: 'Soumission Code (correcte)', fn: testSubmitCode },
      { name: 'Soumission réponse incorrecte', fn: testSubmitIncorrectAnswer },
      { name: 'Validation userId manquant', fn: testValidationMissingUserId },
    ];
    
    for (const test of tests) {
      results.total++;
      const result = await test.fn();
      results.tests.push({ name: test.name, ...result });
      
      if (result.success) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      // Attendre un peu entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(60));
    console.log(`Total: ${results.total}`);
    console.log(`✅ Réussis: ${results.passed}`);
    console.log(`❌ Échoués: ${results.failed}`);
    console.log(`Taux de réussite: ${Math.round((results.passed / results.total) * 100)}%`);
    
    console.log('\n📋 Détails:');
    results.tests.forEach((test, index) => {
      const status = test.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (!test.success && test.error) {
        console.log(`   Erreur: ${test.error}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('\n❌ Erreur critique lors des tests:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✅ Tests terminés');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur lors des tests:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };

