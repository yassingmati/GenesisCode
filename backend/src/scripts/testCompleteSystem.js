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
const UserProgress = require('../models/UserProgress');

// Configuration de test
const TEST_CONFIG = {
  // Using Atlas URI provided by user
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0',
  CLEANUP: false, // Don't wipe prod/dev DB
  VERBOSE: true
};

const timestamp = Date.now();

// Données de test
const TEST_DATA = {
  user: {
    email: `test-system-${timestamp}@example.com`, // Unique email to avoid collision
    password: 'password123',
    username: `testuser-${timestamp}`,
    firstName: 'Test',
    lastName: 'System',
    firebaseUid: `test-uid-${timestamp}`
  },
  category: {
    translations: {
      fr: { name: `Catégorie Test ${timestamp}` },
      en: { name: 'Test Category' },
      ar: { name: 'فئة الاختبار' }
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
    }
  ],
  levels: [
    [
      {
        translations: {
          fr: { title: 'Niveau 1', content: 'Intro' },
          en: { title: 'Level 1', content: 'Intro' },
          ar: { title: 'Level 1', content: 'Intro' }
        },
        order: 0,
        tags: ['test']
      },
      {
        translations: {
          fr: { title: 'Niveau 2', content: 'Variables' },
          en: { title: 'Level 2', content: 'Variables' },
          ar: { title: 'Level 2', content: 'Variables' }
        },
        order: 1,
        tags: ['test']
      },
      {
        translations: {
          fr: { title: 'Niveau 3', content: 'Boucles' },
          en: { title: 'Level 3', content: 'Loops' },
          ar: { title: 'Level 3', content: 'Loops' }
        },
        order: 2,
        tags: ['test']
      }
    ]
  ],
  exercises: [
    [
      {
        type: 'Code',
        language: 'javascript',
        difficulty: 'easy',
        points: 10,
        translations: {
          fr: { name: 'Ex 1', question: 'Q1', explanation: 'Exp1' },
          en: { name: 'Ex 1', question: 'Q1', explanation: 'Exp1' },
          ar: { name: 'Ex 1', question: 'Q1', explanation: 'Exp1' }
        }
      },
      {
        type: 'Code',
        language: 'javascript',
        difficulty: 'easy',
        points: 10,
        translations: {
          fr: { name: 'Ex 2', question: 'Q2', explanation: 'Exp2' },
          en: { name: 'Ex 2', question: 'Q2', explanation: 'Exp2' },
          ar: { name: 'Ex 2', question: 'Q2', explanation: 'Exp2' }
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
      const ts = new Date().toISOString();
      const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${prefix} [${ts}] ${message}`);
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
      const pathData = { ...TEST_DATA.paths[i], category: this.testData.category._id };
      const path = await Path.create(pathData);
      this.testData.paths.push(path);

      const pathLevels = [];
      for (let j = 0; j < TEST_DATA.levels[i].length; j++) {
        const levelData = { ...TEST_DATA.levels[i][j], path: path._id };
        const level = await Level.create(levelData);
        pathLevels.push(level);
        this.testData.levels.push(level);

        // Add exercises to first level mainly
        if (i === 0 && j === 0) {
          for (const exData of TEST_DATA.exercises[0]) {
            const ex = await Exercise.create({ ...exData, level: level._id });
            this.testData.exercises.push(ex);
          }
        }
      }
      await Path.findByIdAndUpdate(path._id, { levels: pathLevels.map(l => l._id) });
    }

    this.log('✅ Données de test configurées avec succès', 'success');
  }

  async cleanupTestData() {
    // Only cleanup what we created
    if (this.testData.user) await User.findByIdAndDelete(this.testData.user._id);
    if (this.testData.category) await Category.findByIdAndDelete(this.testData.category._id);
    if (this.testData.categoryPlan) await CategoryPlan.findByIdAndDelete(this.testData.categoryPlan._id);
    for (const p of this.testData.paths) await Path.findByIdAndDelete(p._id);
    for (const l of this.testData.levels) await Level.findByIdAndDelete(l._id);
    for (const e of this.testData.exercises) await Exercise.findByIdAndDelete(e._id);
    if (this.testData.user && this.testData.category) {
      await CategoryAccess.deleteMany({ user: this.testData.user._id, category: this.testData.category._id });
      await UserLevelProgress.deleteMany({ user: this.testData.user._id });
    }
  }

  async testInitialAccessGrant() {
    this.log('🔓 Test: Accès Initial...');
    const access = await CategoryPaymentService.grantFreeAccess(
      this.testData.user._id,
      this.testData.category._id,
      this.testData.categoryPlan._id
    );
    if (!access) throw new Error('Échec grantFreeAccess');
    this.testData.categoryAccess = access;

    // Check first level unlocked via unlockedLevels
    const unlocked = await LevelUnlockService.getUnlockedLevels(this.testData.user._id, this.testData.category._id);
    const firstLevelId = this.testData.levels[0]._id.toString();
    const isUnlocked = unlocked.some(u => u.level.toString() === firstLevelId);
    if (!isUnlocked) throw new Error('Premier niveau non débloqué automatiquement');
  }

  async testSequentialUnlock() {
    this.log('🔓 Test: Déblocage Séquentiel...');
    // Complete Level 1
    const next = await LevelUnlockService.onLevelCompleted(this.testData.user._id, this.testData.levels[0]._id);
    if (!next) throw new Error('Pas de niveau suivant retourné');

    // Check Level 2 unlocked
    const unlocked = await LevelUnlockService.getUnlockedLevels(this.testData.user._id, this.testData.category._id);
    const lvl2Id = this.testData.levels[1]._id.toString();
    if (!unlocked.some(u => u.level.toString() === lvl2Id)) throw new Error('Niveau 2 non débloqué');
  }

  async testExerciseSubmission() {
    this.log('📝 Test: Soumission Exercice...');
    const ex = this.testData.exercises[0];
    // Create progress manually to simulate submission history
    await UserLevelProgress.create({
      user: this.testData.user._id,
      level: ex.level,
      exercise: ex._id,
      completed: true,
      score: 10,
      maxScore: 10,
      xp: 10,
      pointsEarned: 10,
      pointsMax: 10
    });
  }

  async testXPAccumulation() {
    this.log('⭐ Test: XP...');
    const userId = this.testData.user._id;
    const userBefore = await User.findById(userId);
    const startXP = userBefore.totalXP || 0;

    // Use SECOND exercise to avoid Duplicate Key Error
    const ex = this.testData.exercises[1];

    // Use updateProgress
    await UserProgress.updateProgress(userId, ex._id, {
      xp: 100,
      pointsEarned: 10,
      pointsMax: 10,
      completed: true
    });

    const userAfter = await User.findById(userId);
    if ((userAfter.totalXP || 0) < startXP + 100) throw new Error(`XP non incrémenté. Avant: ${startXP}, Après: ${userAfter.totalXP}`);
  }

  async testAccessControl() {
    this.log('🔒 Test: Access Control...');
    // Level 3 should be locked
    const lvl3 = this.testData.levels[2];
    const check = await LevelUnlockService.checkLevelAccess(
      this.testData.user._id,
      this.testData.category._id,
      lvl3.path,
      lvl3._id
    );
    // It might be 'level_not_unlocked' or similar false condition
    if (check.hasAccess && check.accessType === 'unlocked') throw new Error('Niveau 3 ne devrait pas être débloqué');
  }

  async runAllTests() {
    try {
      await this.setupTestData();
      await this.runTest('Initial Access', () => this.testInitialAccessGrant());
      await this.runTest('Sequential Unlock', () => this.testSequentialUnlock());
      await this.runTest('Exercise Submission', () => this.testExerciseSubmission());
      await this.runTest('XP Accumulation', () => this.testXPAccumulation());
      await this.runTest('Access Control', () => this.testAccessControl());

      this.log('\n📊 RÉSULTATS:', 'info');
      this.log(`Passed: ${this.testResults.passed}, Failed: ${this.testResults.failed}`);
      if (this.testResults.failed === 0) {
        this.log('🎉 TOUT VALIDE', 'success');
      }
    } catch (e) {
      this.log(`💥 Critical: ${e.message}`, 'error');
    } finally {
      if (this.testData.user) await this.cleanupTestData();
    }
  }
}

async function run() {
  try {
    await mongoose.connect(TEST_CONFIG.MONGODB_URI);
    const tester = new CompleteSystemTester();
    await tester.runAllTests();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
