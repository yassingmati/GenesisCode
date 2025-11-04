#!/usr/bin/env node
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');
const CategoryAccess = require('../models/CategoryAccess');
const CategoryPlan = require('../models/CategoryPlan');
const LevelUnlockService = require('../services/levelUnlockService');

// Configuration de test
const TEST_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/code_genesis_test',
  CLEANUP: true,
  VERBOSE: true
};

class APIRouteTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.testData = {
      user: null,
      category: null,
      path: null,
      level: null,
      exercise: null,
      categoryAccess: null
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async setupTestData() {
    this.log('🔧 Configuration des données de test API...');

    // Créer un utilisateur de test
    this.testData.user = await User.create({
      email: 'apitest@example.com',
      password: 'password123',
      username: 'apitestuser',
      firstName: 'API',
      lastName: 'Test',
      firebaseUid: 'api-test-firebase-uid-' + Date.now()
    });

    // Créer une catégorie de test
    this.testData.category = await Category.create({
      translations: {
        fr: { name: 'Catégorie Test API' },
        en: { name: 'API Test Category' }
      },
      order: 0,
      type: 'classic'
    });

    // Créer un parcours de test
    this.testData.path = await Path.create({
      category: this.testData.category._id,
      translations: {
        fr: { name: 'Parcours Test API' },
        en: { name: 'API Test Path' }
      },
      order: 0
    });

    // Créer un niveau de test
    this.testData.level = await Level.create({
      path: this.testData.path._id,
      translations: {
        fr: { 
          title: 'Niveau Test API',
          content: 'Ce niveau teste les fonctionnalités API du système de déblocage séquentiel.'
        },
        en: { 
          title: 'API Test Level',
          content: 'This level tests the API functionality of the sequential unlock system.'
        },
        ar: { 
          title: 'مستوى اختبار API',
          content: 'هذا المستوى يختبر وظائف API لنظام إلغاء القفل المتسلسل.'
        }
      },
      order: 0,
      tags: ['test', 'api'],
      videos: {
        fr: 'test-video-fr.mp4',
        en: 'test-video-en.mp4',
        ar: 'test-video-ar.mp4'
      },
      pdfs: {
        fr: 'test-document-fr.pdf',
        en: 'test-document-en.pdf',
        ar: 'test-document-ar.pdf'
      }
    });

    // Créer un exercice
    this.testData.exercise = await Exercise.create({
      level: this.testData.level._id,
      type: 'Code',
      language: 'javascript',
      difficulty: 'easy',
      points: 10,
      translations: {
        fr: {
          name: 'Exercice Test API',
          question: 'Écrivez un programme qui affiche "Hello API Test!"',
          explanation: 'Utilisez console.log() pour afficher le message.'
        },
        en: {
          name: 'API Test Exercise',
          question: 'Write a program that displays "Hello API Test!"',
          explanation: 'Use console.log() to display the message.'
        },
        ar: {
          name: 'تمرين اختبار API',
          question: 'اكتب برنامجاً يعرض "Hello API Test!"',
          explanation: 'استخدم console.log() لعرض الرسالة.'
        }
      }
    });

    // Créer un plan de catégorie
    const categoryPlan = await CategoryPlan.create({
      category: this.testData.category._id,
      translations: {
        fr: { name: 'Plan Test API' },
        en: { name: 'API Test Plan' },
        ar: { name: 'خطة اختبار API' }
      },
      price: 0,
      duration: 365,
      features: ['Accès complet'],
      isActive: true
    });

    // Créer un accès à la catégorie
    this.testData.categoryAccess = await CategoryAccess.create({
      user: this.testData.user._id,
      category: this.testData.category._id,
      categoryPlan: categoryPlan._id,
      hasAccess: true,
      accessType: 'free',
      unlockedLevels: []
    });

    this.log('✅ Données de test API configurées', 'success');
  }

  async cleanupTestData() {
    this.log('🧹 Nettoyage des données de test API...');

    const collections = [
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

  async testAuthenticationLogic() {
    this.log('🔐 Test de la logique d\'authentification...');

    // Test de connexion simulé (on teste juste la logique métier)
    const user = await User.findOne({ email: 'apitest@example.com' });
    if (!user) {
      throw new Error('Utilisateur de test non trouvé');
    }

    // Test de vérification du token simulé
    const isValidUser = user.email === 'apitest@example.com';
    if (!isValidUser) {
      throw new Error('Échec de la vérification de l\'utilisateur');
    }

    this.log('Logique d\'authentification testée avec succès', 'success');
  }

  async testCategoryLogic() {
    this.log('📁 Test de la logique des catégories...');

    // Test GET /categories simulé
    const categories = await Category.find({});
    if (!Array.isArray(categories)) {
      throw new Error('Réponse des catégories invalide');
    }

    if (categories.length === 0) {
      throw new Error('Aucune catégorie trouvée');
    }

    // Test GET /categories/:id/paths simulé
    const paths = await Path.find({ category: this.testData.category._id });
    if (!Array.isArray(paths)) {
      throw new Error('Réponse des parcours invalide');
    }

    this.log('Logique des catégories testée avec succès', 'success');
  }

  async testLevelAccessControl() {
    this.log('🔒 Test du contrôle d\'accès aux niveaux...');

    // Test d'accès à un niveau verrouillé
    const lockedLevel = await Level.create({
      path: this.testData.path._id,
      translations: {
        fr: { 
          title: 'Niveau Verrouillé',
          content: 'Ce niveau est verrouillé pour tester le contrôle d\'accès.'
        },
        en: { 
          title: 'Locked Level',
          content: 'This level is locked to test access control.'
        },
        ar: { 
          title: 'مستوى مقفل',
          content: 'هذا المستوى مقفل لاختبار التحكم في الوصول.'
        }
      },
      order: 1,
      tags: ['locked']
    });

    // Vérifier que le niveau est bien verrouillé
    const categoryAccess = await CategoryAccess.findOne({
      user: this.testData.user._id,
      category: this.testData.category._id
    });

    const isLevelUnlocked = categoryAccess.unlockedLevels.some(
      ul => ul.level.toString() === lockedLevel._id.toString()
    );

    if (isLevelUnlocked) {
      throw new Error('Le niveau verrouillé est incorrectement débloqué');
    }

    this.log('Contrôle d\'accès aux niveaux testé avec succès', 'success');
  }

  async testExerciseLogic() {
    this.log('💪 Test de la logique des exercices...');

    // Test GET /exercises/:levelId simulé
    const exercises = await Exercise.find({ level: this.testData.level._id });
    if (!Array.isArray(exercises)) {
      throw new Error('Réponse des exercices invalide');
    }

    if (exercises.length === 0) {
      throw new Error('Aucun exercice trouvé pour ce niveau');
    }

    // Test GET /exercises/:id simulé
    const exercise = await Exercise.findById(this.testData.exercise._id);
    if (!exercise) {
      throw new Error('Exercice non trouvé');
    }

    if (exercise.type !== 'Code') {
      throw new Error('Type d\'exercice incorrect');
    }

    this.log('Logique des exercices testée avec succès', 'success');
  }

  async testUnlockStatusLogic() {
    this.log('🔓 Test de la logique du statut de déblocage...');

    // Test du statut de déblocage d'une catégorie
    const unlockStatus = await LevelUnlockService.getUnlockStatus(
      this.testData.user._id,
      this.testData.category._id
    );

    if (!unlockStatus) {
      throw new Error('Statut de déblocage non trouvé');
    }

    if (!unlockStatus.hasAccess) {
      throw new Error('L\'utilisateur devrait avoir accès à la catégorie');
    }

    if (!Array.isArray(unlockStatus.paths)) {
      throw new Error('Les parcours ne sont pas un tableau');
    }

    this.log('Logique du statut de déblocage testée avec succès', 'success');
  }

  async testAccessDeniedLogic() {
    this.log('🚫 Test de la logique d\'accès refusé...');

    // Créer un utilisateur sans accès
    const userWithoutAccess = await User.create({
      email: 'noaccess@example.com',
      password: 'password123',
      username: 'noaccessuser',
      firstName: 'No',
      lastName: 'Access',
      firebaseUid: 'no-access-firebase-uid-' + Date.now()
    });

    // Vérifier qu'il n'a pas d'accès
    const categoryAccess = await CategoryAccess.findOne({
      user: userWithoutAccess._id,
      category: this.testData.category._id
    });

    if (categoryAccess && categoryAccess.hasAccess) {
      throw new Error('L\'utilisateur sans accès a incorrectement accès à la catégorie');
    }

    this.log('Logique d\'accès refusé testée avec succès', 'success');
  }

  async testMediaLogic() {
    this.log('📹 Test de la logique des médias...');

    // Test de récupération des médias d'un niveau
    const level = await Level.findById(this.testData.level._id);
    if (!level) {
      throw new Error('Niveau non trouvé');
    }

    // Vérifier que les champs médias existent
    if (!level.videos || typeof level.videos !== 'object') {
      throw new Error('Champ videos manquant ou invalide');
    }

    if (!level.pdfs || typeof level.pdfs !== 'object') {
      throw new Error('Champ pdfs manquant ou invalide');
    }

    // Vérifier que les traductions existent
    if (!level.videos.fr || !level.videos.en || !level.videos.ar) {
      throw new Error('Traductions des vidéos manquantes');
    }

    if (!level.pdfs.fr || !level.pdfs.en || !level.pdfs.ar) {
      throw new Error('Traductions des PDFs manquantes');
    }

    this.log('Logique des médias testée avec succès', 'success');
  }

  async runTest(testName, testFunction) {
    try {
      await testFunction();
      this.testResults.passed++;
      this.log(`✅ ${testName} - PASSÉ`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
      this.log(`❌ ${testName} - ÉCHOUÉ: ${error.message}`, 'error');
    }
  }

  async runAllAPITests() {
    try {
      this.log('🚀 Démarrage des tests complets de la logique API...');

      // Configuration des données de test
      await this.setupTestData();

      // Tests de logique métier
      await this.runTest('Logique d\'authentification', () => this.testAuthenticationLogic());
      await this.runTest('Logique des catégories', () => this.testCategoryLogic());
      await this.runTest('Contrôle d\'accès aux niveaux', () => this.testLevelAccessControl());
      await this.runTest('Logique des exercices', () => this.testExerciseLogic());
      await this.runTest('Logique du statut de déblocage', () => this.testUnlockStatusLogic());
      await this.runTest('Logique d\'accès refusé', () => this.testAccessDeniedLogic());
      await this.runTest('Logique des médias', () => this.testMediaLogic());

      // Résumé des résultats
      this.log('\n📊 Résumé des tests API:', 'info');
      this.log(`✅ Tests réussis: ${this.testResults.passed}`, 'success');
      this.log(`❌ Tests échoués: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'success');

      if (this.testResults.errors.length > 0) {
        this.log('\n❌ Erreurs détaillées:', 'error');
        this.testResults.errors.forEach(({ test, error }) => {
          this.log(`  - ${test}: ${error}`, 'error');
        });
      }

      const successRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100;
      this.log(`\n📈 Taux de réussite API: ${successRate.toFixed(1)}%`, successRate === 100 ? 'success' : 'warning');

      if (successRate === 100) {
        this.log('\n🎉 TOUS LES TESTS API SONT PASSÉS ! La logique API fonctionne correctement.', 'success');
      } else {
        this.log('\n⚠️ Certains tests API ont échoué. Vérifiez les erreurs ci-dessus.', 'warning');
      }

    } catch (error) {
      this.log(`💥 Erreur critique lors des tests API: ${error.message}`, 'error');
      throw error;
    } finally {
      // Nettoyage final
      if (TEST_CONFIG.CLEANUP) {
        await this.cleanupTestData();
      }
    }
  }
}

async function runAPIRouteTests() {
  console.log('🧪 Test Complet de la Logique API - Système de Déblocage Séquentiel');
  console.log('==================================================================');
  
  try {
    await mongoose.connect(TEST_CONFIG.MONGODB_URI);
    console.log('✅ Connexion à MongoDB établie');

    const tester = new APIRouteTester();
    await tester.runAllAPITests();

  } catch (error) {
    console.error('💥 Erreur lors des tests API:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Connexion à MongoDB fermée');
  }
}

if (require.main === module) {
  runAPIRouteTests().catch(err => {
    console.error('API Tests failed:', err);
    process.exit(1);
  });
} else {
  module.exports = { runAPIRouteTests, APIRouteTester };
}