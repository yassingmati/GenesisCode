#!/usr/bin/env node
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');
const CategoryAccess = require('../models/CategoryAccess');
const CategoryPlan = require('../models/CategoryPlan');
const UserLevelProgress = require('../models/UserLevelProgress');
const LevelUnlockService = require('../services/levelUnlockService');
const CategoryPaymentService = require('../services/categoryPaymentService');

// Configuration de test
const TEST_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/code_genesis_test',
  CLEANUP: true, // Nettoyer les données de test après
  VERBOSE: true  // Affichage détaillé
};

// Données de test
const TEST_DATA = {
  user: {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    firebaseUid: 'test-firebase-uid-' + Date.now()
  },
  category: {
    translations: {
      fr: { name: 'Catégorie Test - Déblocage Séquentiel' },
      en: { name: 'Test Category - Sequential Unlock' },
      ar: { name: 'فئة الاختبار - إلغاء القفل المتسلسل' }
    },
    order: 0,
    type: 'classic'
  },
  categoryPlan: {
    translations: {
      fr: { name: 'Plan Gratuit Test' },
      en: { name: 'Free Test Plan' },
      ar: { name: 'خطة مجانية للاختبار' }
    },
    price: 0,
    currency: 'TND',
    paymentType: 'one_time',
    accessDuration: 365
  },
  paths: [
    {
      translations: {
        fr: { name: 'Parcours Débutant' },
        en: { name: 'Beginner Path' },
        ar: { name: 'مسار المبتدئين' }
      },
      order: 0
    },
    {
      translations: {
        fr: { name: 'Parcours Intermédiaire' },
        en: { name: 'Intermediate Path' },
        ar: { name: 'مسار متوسط' }
      },
      order: 1
    }
  ],
  levels: [
    // Parcours 1 - Niveaux
    [
      {
        translations: {
          fr: { 
            title: 'Introduction à la Programmation',
            content: 'Ce niveau vous introduit aux concepts de base de la programmation.'
          },
          en: { 
            title: 'Introduction to Programming',
            content: 'This level introduces you to the basic concepts of programming.'
          },
          ar: { 
            title: 'مقدمة في البرمجة',
            content: 'هذا المستوى يقدم لك المفاهيم الأساسية للبرمجة.'
          }
        },
        order: 0,
        tags: ['débutant', 'introduction']
      },
      {
        translations: {
          fr: { 
            title: 'Variables et Types',
            content: 'Apprenez à utiliser les variables et les types de données.'
          },
          en: { 
            title: 'Variables and Types',
            content: 'Learn to use variables and data types.'
          },
          ar: { 
            title: 'المتغيرات والأنواع',
            content: 'تعلم استخدام المتغيرات وأنواع البيانات.'
          }
        },
        order: 1,
        tags: ['débutant', 'variables']
      },
      {
        translations: {
          fr: { 
            title: 'Structures de Contrôle',
            content: 'Découvrez les structures de contrôle comme les boucles et les conditions.'
          },
          en: { 
            title: 'Control Structures',
            content: 'Discover control structures like loops and conditions.'
          },
          ar: { 
            title: 'هياكل التحكم',
            content: 'اكتشف هياكل التحكم مثل الحلقات والشروط.'
          }
        },
        order: 2,
        tags: ['débutant', 'contrôle']
      }
    ],
    // Parcours 2 - Niveaux
    [
       {
         translations: {
           fr: { 
             title: 'Fonctions Avancées',
             content: 'Apprenez à créer et utiliser des fonctions avancées en programmation.'
           },
           en: { 
             title: 'Advanced Functions',
             content: 'Learn to create and use advanced functions in programming.'
           },
           ar: { 
             title: 'وظائف متقدمة',
             content: 'تعلم إنشاء واستخدام الوظائف المتقدمة في البرمجة.'
           }
         },
         order: 0,
         tags: ['intermédiaire', 'fonctions']
       },
       {
         translations: {
           fr: { 
             title: 'Programmation Orientée Objet',
             content: 'Découvrez les concepts de la programmation orientée objet.'
           },
           en: { 
             title: 'Object-Oriented Programming',
             content: 'Discover the concepts of object-oriented programming.'
           },
           ar: { 
             title: 'البرمجة الموجهة للكائنات',
             content: 'اكتشف مفاهيم البرمجة الموجهة للكائنات.'
           }
         },
         order: 1,
         tags: ['intermédiaire', 'oop']
       }
    ]
  ],
  exercises: [
    // Exercices pour chaque niveau
     [
       {
         type: 'Code',
         language: 'javascript',
         difficulty: 'easy',
         points: 10,
         translations: {
           fr: {
             name: 'Exercice 1.1 - Premier Programme',
             question: 'Écrivez un programme qui affiche "Hello World!"',
             explanation: 'Utilisez console.log() pour afficher du texte.'
           },
           en: {
             name: 'Exercise 1.1 - First Program',
             question: 'Write a program that displays "Hello World!"',
             explanation: 'Use console.log() to display text.'
           },
           ar: {
             name: 'التمرين 1.1 - البرنامج الأول',
             question: 'اكتب برنامجاً يعرض "Hello World!"',
             explanation: 'استخدم console.log() لعرض النص.'
           }
         }
       },
       {
         type: 'Code',
         language: 'javascript',
         difficulty: 'easy',
         points: 15,
         translations: {
           fr: {
             name: 'Exercice 1.2 - Calcul Simple',
             question: 'Calculez la somme de 5 et 3',
             explanation: 'Utilisez l\'opérateur + pour additionner.'
           },
           en: {
             name: 'Exercise 1.2 - Simple Calculation',
             question: 'Calculate the sum of 5 and 3',
             explanation: 'Use the + operator to add.'
           },
           ar: {
             name: 'التمرين 1.2 - حساب بسيط',
             question: 'احسب مجموع 5 و 3',
             explanation: 'استخدم عامل التشغيل + للجمع.'
           }
         }
       }
     ],
     [
       {
         type: 'Code',
         language: 'javascript',
         difficulty: 'easy',
         points: 10,
         translations: {
           fr: {
             name: 'Exercice 2.1 - Variables',
             question: 'Déclarez une variable nom et assignez-lui votre nom',
             explanation: 'Utilisez let ou const pour déclarer une variable.'
           },
           en: {
             name: 'Exercise 2.1 - Variables',
             question: 'Declare a variable name and assign your name to it',
             explanation: 'Use let or const to declare a variable.'
           },
           ar: {
             name: 'التمرين 2.1 - المتغيرات',
             question: 'أعلن متغير اسم وخصص له اسمك',
             explanation: 'استخدم let أو const لإعلان متغير.'
           }
         }
       }
     ],
     [
       {
         type: 'Code',
         language: 'javascript',
         difficulty: 'medium',
         points: 20,
         translations: {
           fr: {
             name: 'Exercice 3.1 - Boucle For',
             question: 'Écrivez une boucle for qui affiche les nombres de 1 à 5',
             explanation: 'Utilisez for(let i = 1; i <= 5; i++) pour créer une boucle.'
           },
           en: {
             name: 'Exercise 3.1 - For Loop',
             question: 'Write a for loop that displays numbers from 1 to 5',
             explanation: 'Use for(let i = 1; i <= 5; i++) to create a loop.'
           },
           ar: {
             name: 'التمرين 3.1 - حلقة For',
             question: 'اكتب حلقة for تعرض الأرقام من 1 إلى 5',
             explanation: 'استخدم for(let i = 1; i <= 5; i++) لإنشاء حلقة.'
           }
         }
       }
     ],
     [
       {
         type: 'Code',
         language: 'javascript',
         difficulty: 'medium',
         points: 25,
         translations: {
           fr: {
             name: 'Exercice 4.1 - Fonction',
             question: 'Créez une fonction qui retourne le carré d\'un nombre',
             explanation: 'Utilisez function nomFonction(param) { return ... } pour créer une fonction.'
           },
           en: {
             name: 'Exercise 4.1 - Function',
             question: 'Create a function that returns the square of a number',
             explanation: 'Use function functionName(param) { return ... } to create a function.'
           },
           ar: {
             name: 'التمرين 4.1 - الدالة',
             question: 'أنشئ دالة ترجع مربع رقم',
             explanation: 'استخدم function اسمالدالة(معامل) { return ... } لإنشاء دالة.'
           }
         }
       }
     ],
     [
       {
         type: 'Code',
         language: 'javascript',
         difficulty: 'hard',
         points: 30,
         translations: {
           fr: {
             name: 'Exercice 5.1 - Classe',
             question: 'Créez une classe Personne avec un constructeur',
             explanation: 'Utilisez class NomClasse { constructor(param) { ... } } pour créer une classe.'
           },
           en: {
             name: 'Exercise 5.1 - Class',
             question: 'Create a Person class with a constructor',
             explanation: 'Use class ClassName { constructor(param) { ... } } to create a class.'
           },
           ar: {
             name: 'التمرين 5.1 - الفئة',
             question: 'أنشئ فئة Person مع مُنشئ',
             explanation: 'استخدم class اسمالفئة { constructor(معامل) { ... } } لإنشاء فئة.'
           }
         }
       }
     ]
  ]
};

class CompleteSystemTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.testData = {
      user: null,
      category: null,
      categoryPlan: null,
      paths: [],
      levels: [],
      exercises: [],
      categoryAccess: null
    };
  }

  log(message, type = 'info') {
    if (TEST_CONFIG.VERBOSE) {
      const timestamp = new Date().toISOString();
      const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`🧪 Exécution du test: ${testName}`);
      await testFunction();
      this.testResults.passed++;
      this.log(`✅ Test réussi: ${testName}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
      this.log(`❌ Test échoué: ${testName} - ${error.message}`, 'error');
    }
  }

  async setupTestData() {
    this.log('🔧 Configuration des données de test...');

    // Nettoyer les données existantes si demandé
    if (TEST_CONFIG.CLEANUP) {
      await this.cleanupTestData();
    }

    // Créer l'utilisateur de test
    this.testData.user = await User.create(TEST_DATA.user);
    this.log(`Utilisateur créé: ${this.testData.user._id}`);

    // Créer la catégorie
    this.testData.category = await Category.create(TEST_DATA.category);
    this.log(`Catégorie créée: ${this.testData.category._id}`);

    // Créer le plan de catégorie
    this.testData.categoryPlan = await CategoryPlan.create({
      ...TEST_DATA.categoryPlan,
      category: this.testData.category._id
    });
    this.log(`Plan de catégorie créé: ${this.testData.categoryPlan._id}`);

    // Créer les parcours
    for (let i = 0; i < TEST_DATA.paths.length; i++) {
      const pathData = {
        ...TEST_DATA.paths[i],
        category: this.testData.category._id
      };
      const path = await Path.create(pathData);
      this.testData.paths.push(path);
      this.log(`Parcours créé: ${path._id} (${path.translations.fr.name})`);

      // Créer les niveaux pour ce parcours
      const pathLevels = [];
      for (let j = 0; j < TEST_DATA.levels[i].length; j++) {
        const levelData = {
          ...TEST_DATA.levels[i][j],
          path: path._id
        };
        const level = await Level.create(levelData);
        pathLevels.push(level);
        this.testData.levels.push(level);
        this.log(`Niveau créé: ${level._id} (${level.translations.fr.title})`);

        // Créer les exercices pour ce niveau
        const exerciseIndex = this.testData.levels.length - 1;
        if (TEST_DATA.exercises[exerciseIndex]) {
          for (const exerciseData of TEST_DATA.exercises[exerciseIndex]) {
            const exercise = await Exercise.create({
              ...exerciseData,
              level: level._id
            });
            this.testData.exercises.push(exercise);
            this.log(`Exercice créé: ${exercise._id} (${exercise.name})`);
          }
        }
      }

      // Mettre à jour le parcours avec les niveaux
      await Path.findByIdAndUpdate(path._id, {
        levels: pathLevels.map(l => l._id)
      });
    }

    this.log('✅ Données de test configurées avec succès', 'success');
  }

  async cleanupTestData() {
    this.log('🧹 Nettoyage des données de test...');
    
    const collections = [
      UserLevelProgress,
      CategoryAccess,
      Exercise,
      Level,
      Path,
      CategoryPlan,
      Category,
      User
    ];

    for (const Model of collections) {
      await Model.deleteMany({});
    }

    this.log('✅ Nettoyage terminé', 'success');
  }

  async testInitialAccessGrant() {
    this.log('🔓 Test: Attribution d\'accès initial...');

    // Accorder l'accès à la catégorie
    const access = await CategoryPaymentService.initializeUserAccess(
      this.testData.user._id,
      this.testData.category._id,
      this.testData.categoryPlan._id,
      'free'
    );

    if (!access) {
      throw new Error('Échec de l\'attribution d\'accès initial');
    }

    this.testData.categoryAccess = access.access;
    this.log(`Accès accordé: ${access.access._id}`);

    // Vérifier que le premier niveau du premier parcours est débloqué
    const unlockStatus = await LevelUnlockService.getUnlockStatus(
      this.testData.user._id,
      this.testData.category._id
    );

    if (!unlockStatus.hasAccess) {
      throw new Error('L\'utilisateur n\'a pas accès à la catégorie');
    }

    const firstPath = unlockStatus.paths[0];
    if (!firstPath || firstPath.levels.length === 0) {
      throw new Error('Aucun niveau trouvé dans le premier parcours');
    }

    const firstLevel = firstPath.levels[0];
    if (!firstLevel.isUnlocked) {
      throw new Error('Le premier niveau du premier parcours n\'est pas débloqué');
    }

    this.log(`Premier niveau débloqué: ${firstLevel.levelId}`, 'success');
  }

  async testSequentialUnlock() {
    this.log('🔓 Test: Déblocage séquentiel...');

    const userId = this.testData.user._id;
    const categoryId = this.testData.category._id;

    // Simuler la completion du premier niveau
    const firstLevel = this.testData.levels[0];
    this.log(`Completion du niveau: ${firstLevel._id}`);

    const nextLevel = await LevelUnlockService.onLevelCompleted(userId, firstLevel._id);
    
    if (!nextLevel) {
      throw new Error('Aucun niveau suivant débloqué après completion du premier niveau');
    }

    this.log(`Niveau suivant débloqué: ${nextLevel._id}`, 'success');

    // Vérifier le statut de déblocage
    const unlockStatus = await LevelUnlockService.getUnlockStatus(userId, categoryId);
    const firstPath = unlockStatus.paths[0];
    const secondLevel = firstPath.levels[1];

    if (!secondLevel.isUnlocked) {
      throw new Error('Le deuxième niveau n\'est pas débloqué');
    }

    this.log(`Deuxième niveau vérifié comme débloqué: ${secondLevel.levelId}`, 'success');
  }

  async testExerciseSubmission() {
    this.log('📝 Test: Soumission d\'exercice...');

    const userId = this.testData.user._id;
    const firstExercise = this.testData.exercises[0];

    // Simuler la soumission d'un exercice
    const submissionResult = {
      correct: true,
      pointsEarned: firstExercise.points,
      pointsMax: firstExercise.points,
      xpEarned: 10
    };

    // Créer un progrès utilisateur
    const progress = await UserLevelProgress.create({
      user: userId,
      level: firstExercise.level,
      exercise: firstExercise._id,
      completed: true,
      score: submissionResult.pointsEarned,
      maxScore: submissionResult.pointsMax,
      completedAt: new Date()
    });

    this.log(`Progrès créé: ${progress._id}`, 'success');

    // Vérifier que le progrès est enregistré
    const savedProgress = await UserLevelProgress.findById(progress._id);
    if (!savedProgress || !savedProgress.completed) {
      throw new Error('Le progrès n\'a pas été correctement enregistré');
    }

    this.log('Progrès vérifié avec succès', 'success');
  }

  async testAccessControl() {
    this.log('🔒 Test: Contrôle d\'accès...');

    const userId = this.testData.user._id;
    const categoryId = this.testData.category._id;

    // Tester l'accès à un niveau verrouillé
    const thirdLevel = this.testData.levels[2]; // Niveau 3 (index 2)
    
    const unlockStatus = await LevelUnlockService.getUnlockStatus(userId, categoryId);
    const firstPath = unlockStatus.paths[0];
    const thirdLevelStatus = firstPath.levels[2];

    if (thirdLevelStatus.isUnlocked) {
      throw new Error('Le troisième niveau ne devrait pas être débloqué');
    }

    this.log('Contrôle d\'accès vérifié: niveau verrouillé correctement', 'success');
  }

  async testConcurrentUnlocks() {
    this.log('⚡ Test: Déblocages concurrents...');

    const userId = this.testData.user._id;
    const categoryId = this.testData.category._id;
    const pathId = this.testData.paths[0]._id;
    const secondLevel = this.testData.levels[1];

    // Simuler des déblocages concurrents
    const promises = Array(5).fill().map(() => 
      LevelUnlockService.unlockLevel(userId, categoryId, pathId, secondLevel._id)
    );

    const results = await Promise.all(promises);
    
    // Vérifier qu'un seul déblocage a réussi (opérations atomiques)
    const successfulUnlocks = results.filter(r => r !== null);
    
    if (successfulUnlocks.length > 1) {
      throw new Error('Plusieurs déblocages concurrents ont réussi (problème d\'atomicité)');
    }

    this.log('Déblocages concurrents testés avec succès', 'success');
  }

  async testUnlockStatusAPI() {
    this.log('📊 Test: API de statut de déblocage...');

    const userId = this.testData.user._id;
    const categoryId = this.testData.category._id;
    const pathId = this.testData.paths[0]._id;

    // Tester getUnlockStatus pour une catégorie
    const categoryStatus = await LevelUnlockService.getUnlockStatus(userId, categoryId);
    
    if (!categoryStatus.hasAccess) {
      throw new Error('L\'utilisateur devrait avoir accès à la catégorie');
    }

    if (!categoryStatus.paths || categoryStatus.paths.length === 0) {
      throw new Error('Aucun parcours trouvé dans le statut');
    }

    // Tester getUnlockStatus pour un parcours spécifique
    const pathStatus = await LevelUnlockService.getUnlockStatus(userId, categoryId);
    const specificPath = pathStatus.paths.find(p => p.pathId.toString() === pathId.toString());
    
    if (!specificPath) {
      throw new Error('Parcours spécifique non trouvé dans le statut');
    }

    this.log('API de statut de déblocage testée avec succès', 'success');
  }

  async testErrorHandling() {
    this.log('🚨 Test: Gestion d\'erreurs...');

    const userId = this.testData.user._id;
    const categoryId = this.testData.category._id;

    // Tester avec un ID de niveau inexistant
    try {
      await LevelUnlockService.onLevelCompleted(userId, '507f1f77bcf86cd799439011');
      // Ne devrait pas lever d'erreur, mais retourner null
    } catch (error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('Gestion d\'erreur incorrecte pour ID invalide');
      }
    }

    // Tester avec un utilisateur inexistant
    try {
      await LevelUnlockService.getUnlockStatus('507f1f77bcf86cd799439011', categoryId);
      // Ne devrait pas lever d'erreur, mais retourner un statut sans accès
    } catch (error) {
      if (error.message.includes('Cast to ObjectId failed')) {
        throw new Error('Gestion d\'erreur incorrecte pour utilisateur inexistant');
      }
    }

    this.log('Gestion d\'erreurs testée avec succès', 'success');
  }

  async runAllTests() {
    this.log('🚀 Démarrage des tests complets du système de déblocage séquentiel...');
    
    try {
      // Configuration
      await this.setupTestData();

      // Tests fonctionnels
      await this.runTest('Attribution d\'accès initial', () => this.testInitialAccessGrant());
      await this.runTest('Déblocage séquentiel', () => this.testSequentialUnlock());
      await this.runTest('Soumission d\'exercice', () => this.testExerciseSubmission());
      await this.runTest('Contrôle d\'accès', () => this.testAccessControl());
      await this.runTest('Déblocages concurrents', () => this.testConcurrentUnlocks());
      await this.runTest('API de statut de déblocage', () => this.testUnlockStatusAPI());
      await this.runTest('Gestion d\'erreurs', () => this.testErrorHandling());

      // Résultats
      this.log('\n📊 RÉSULTATS DES TESTS:', 'info');
      this.log(`✅ Tests réussis: ${this.testResults.passed}`, 'success');
      this.log(`❌ Tests échoués: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'info');
      
      if (this.testResults.errors.length > 0) {
        this.log('\n🚨 ERREURS DÉTAILLÉES:', 'error');
        this.testResults.errors.forEach(error => {
          this.log(`  - ${error.test}: ${error.error}`, 'error');
        });
      }

      const successRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100;
      this.log(`\n📈 Taux de réussite: ${successRate.toFixed(1)}%`, successRate === 100 ? 'success' : 'warning');

      if (successRate === 100) {
        this.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! Le système de déblocage séquentiel fonctionne correctement.', 'success');
      } else {
        this.log('\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.', 'warning');
      }

    } catch (error) {
      this.log(`💥 Erreur critique lors des tests: ${error.message}`, 'error');
      throw error;
    } finally {
      // Nettoyage final
      if (TEST_CONFIG.CLEANUP) {
        await this.cleanupTestData();
      }
    }
  }
}

async function runCompleteSystemTest() {
  console.log('🧪 Test Complet du Système de Déblocage Séquentiel');
  console.log('================================================');
  
  try {
    await mongoose.connect(TEST_CONFIG.MONGODB_URI);
    console.log('✅ Connexion à MongoDB établie');

    const tester = new CompleteSystemTester();
    await tester.runAllTests();

  } catch (error) {
    console.error('💥 Erreur lors des tests:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Connexion à MongoDB fermée');
  }
}

if (require.main === module) {
  runCompleteSystemTest().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
} else {
  module.exports = { runCompleteSystemTest, CompleteSystemTester };
}
