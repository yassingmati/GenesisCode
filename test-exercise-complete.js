/**
 * Tests complets pour le système de soumission d'exercices (Version corrigée)
 * Teste tous les types d'exercices: QCM, Code, TextInput, etc.
 */

const { loadEnv } = require('./load-env');
loadEnv();

require('./test-helpers');

const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const Exercise = require('./backend/src/models/Exercise');
const Level = require('./backend/src/models/Level');
const Path = require('./backend/src/models/Path');
const Category = require('./backend/src/models/Category');
const jwt = require('jsonwebtoken');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

let testUser = null;
let userToken = null;
let testPath = null;
let testLevel = null;
let testExercises = {};

/**
 * Créer ou récupérer un utilisateur de test
 */
async function setupTestUser() {
  try {
    // Utiliser MongoDB Atlas si disponible, sinon local
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10
      });
      console.log('✅ Connecté à MongoDB:', mongoose.connection.db.databaseName);
      console.log('   URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    }
    
    const testEmail = 'test-exercise-complete@test.com';
    const testPassword = 'test123456';
    
    // Chercher ou créer l'utilisateur
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      user = new User({
        firebaseUid: `test-exercise-complete-${Date.now()}`,
        email: testEmail,
        firstName: 'Test',
        lastName: 'Exercise',
        userType: 'student',
        isVerified: true,
        isProfileComplete: true
      });
      await user.save();
      console.log('✅ Utilisateur créé:', user._id.toString());
      
      // Attendre un peu pour s'assurer que l'utilisateur est bien sauvegardé
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('✅ Utilisateur existant trouvé:', user._id.toString());
    }
    
    // Vérifier que l'utilisateur est bien sauvegardé
    const savedUser = await User.findById(user._id);
    if (!savedUser) {
      throw new Error('Utilisateur non sauvegardé correctement');
    }
    
    // S'assurer que l'utilisateur est bien configuré
    savedUser.isVerified = true;
    savedUser.isProfileComplete = true;
    await savedUser.save();
    
    // Attendre un peu pour s'assurer que l'utilisateur est bien sauvegardé dans MongoDB Atlas
    await new Promise(resolve => setTimeout(resolve, 500));
    
    testUser = savedUser;
    
    console.log('✅ Utilisateur final pour les tests:', {
      id: savedUser._id.toString(),
      email: savedUser.email
    });
    
    // Utiliser l'API d'authentification réelle pour obtenir un token valide
    try {
      console.log('🔐 Tentative de connexion via API d\'authentification...');
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword // L'authentification simple accepte n'importe quel mot de passe
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.token) {
        userToken = loginData.token;
        console.log('✅ Token obtenu via API d\'authentification');
      } else {
        // Fallback: créer un token manuellement si l'API échoue
        console.warn('⚠️ API login échouée, utilisation du token manuel');
        console.warn('   Réponse API:', loginData);
        userToken = jwt.sign(
          { id: savedUser._id.toString(), email: savedUser.email },
          JWT_SECRET,
          { expiresIn: '1d' }
        );
        console.log('   Token créé avec ID:', savedUser._id.toString());
      }
    } catch (loginError) {
      // Fallback: créer un token manuellement si l'API n'est pas disponible
      console.warn('⚠️ Impossible d\'utiliser l\'API login, utilisation du token manuel:', loginError.message);
      userToken = jwt.sign(
        { id: savedUser._id.toString(), email: savedUser.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log('   Token créé avec ID:', savedUser._id.toString());
    }
    
    return savedUser;
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
    // Créer ou récupérer une catégorie de test d'abord
    let testCategory = await Category.findOne({ 'translations.fr.name': 'Catégorie Test Exercices' });
    
    if (!testCategory) {
      testCategory = new Category({
        translations: {
          fr: {
            name: 'Catégorie Test Exercices',
            description: 'Catégorie pour tester les exercices'
          },
          en: {
            name: 'Test Exercises Category',
            description: 'Category for testing exercises'
          },
          ar: {
            name: 'فئة اختبار التمارين',
            description: 'فئة لاختبار التمارين'
          }
        },
        active: true
      });
      await testCategory.save();
      console.log('✅ Catégorie créée:', testCategory._id.toString());
    }
    
    // Créer ou récupérer un Path (parcours) d'abord
    testPath = await Path.findOne({ 
      'translations.fr.name': 'Parcours Test Exercices',
      category: testCategory._id
    });
    
    if (!testPath) {
      testPath = new Path({
        translations: {
          fr: {
            name: 'Parcours Test Exercices',
            description: 'Parcours pour tester les exercices'
          },
          en: {
            name: 'Test Exercises Path',
            description: 'Path for testing exercises'
          },
          ar: {
            name: 'مسار اختبار التمارين',
            description: 'مسار لاختبار التمارين'
          }
        },
        category: testCategory._id,
        order: 1
      });
      await testPath.save();
      console.log('✅ Path créé:', testPath._id.toString());
    }
    
    // Créer ou récupérer un niveau de test
    testLevel = await Level.findOne({ 
      'translations.fr.title': 'Niveau Test Exercices',
      path: testPath._id 
    });
    
    if (!testLevel) {
      testLevel = new Level({
        translations: {
          fr: {
            title: 'Niveau Test Exercices',
            content: 'Niveau pour tester les exercices'
          },
          en: {
            title: 'Test Exercises Level',
            content: 'Level for testing exercises'
          },
          ar: {
            title: 'مستوى اختبار التمارين',
            content: 'مستوى لاختبار التمارين'
          }
        },
        path: testPath._id,
        order: 1
      });
      await testLevel.save();
      console.log('✅ Level créé:', testLevel._id.toString());
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
        'translations.fr.name': exData.name,
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
        console.log(`✅ Exercice ${exData.type} créé:`, exercise._id.toString());
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
    
    console.log('\n✅ Setup terminé');
    console.log('   User ID:', testUser._id.toString());
    console.log('   Level ID:', testLevel._id.toString());
    console.log('   Path ID:', testPath._id.toString());
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

