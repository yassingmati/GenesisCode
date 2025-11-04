#!/usr/bin/env node

/**
 * Script de test pour le système de déblocage séquentiel des niveaux
 * 
 * Ce script teste le flux complet :
 * 1. Création d'un accès à une catégorie
 * 2. Vérification que seul le premier niveau du premier parcours est débloqué
 * 3. Simulation de complétion d'un niveau
 * 4. Vérification que le niveau suivant est débloqué
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles et services
const CategoryAccess = require('../models/CategoryAccess');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const UserLevelProgress = require('../models/UserLevelProgress');
const User = require('../models/User');
const LevelUnlockService = require('../services/levelUnlockService');
const CategoryPaymentService = require('../services/categoryPaymentService');

class SequentialUnlockTest {
  
  constructor() {
    this.testData = {
      userId: null,
      categoryId: null,
      pathId: null,
      levelIds: []
    };
  }

  /**
   * Connexion à la base de données
   */
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ Connexion à la base de données établie');
    } catch (error) {
      console.error('❌ Erreur de connexion à la base de données:', error);
      throw error;
    }
  }

  /**
   * Déconnexion de la base de données
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ Déconnexion de la base de données');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    }
  }

  /**
   * Créer des données de test
   */
  async createTestData() {
    try {
      console.log('🧪 Création des données de test...');
      
      // Créer un utilisateur de test
      const testUser = new User({
        email: 'test@sequential-unlock.com',
        name: 'Test User',
        password: 'test123'
      });
      await testUser.save();
      this.testData.userId = testUser._id;
      console.log(`👤 Utilisateur de test créé: ${testUser._id}`);
      
      // Créer une catégorie de test
      const testCategory = new Category({
        translations: {
          fr: { name: 'Test Sequential Unlock' },
          en: { name: 'Test Sequential Unlock' },
          ar: { name: 'اختبار فتح التسلسل' }
        },
        type: 'classic',
        order: 0
      });
      await testCategory.save();
      this.testData.categoryId = testCategory._id;
      console.log(`📚 Catégorie de test créée: ${testCategory._id}`);
      
      // Créer un parcours de test
      const testPath = new Path({
        translations: {
          fr: { name: 'Parcours Test', description: 'Description du parcours test' },
          en: { name: 'Test Path', description: 'Test path description' },
          ar: { name: 'مسار الاختبار', description: 'وصف مسار الاختبار' }
        },
        category: testCategory._id,
        order: 0
      });
      await testPath.save();
      this.testData.pathId = testPath._id;
      console.log(`🛤️ Parcours de test créé: ${testPath._id}`);
      
      // Créer 3 niveaux de test
      for (let i = 0; i < 3; i++) {
        const testLevel = new Level({
          translations: {
            fr: { title: `Niveau ${i + 1}`, content: `Contenu du niveau ${i + 1}` },
            en: { title: `Level ${i + 1}`, content: `Level ${i + 1} content` },
            ar: { title: `المستوى ${i + 1}`, content: `محتوى المستوى ${i + 1}` }
          },
          path: testPath._id,
          order: i
        });
        await testLevel.save();
        this.testData.levelIds.push(testLevel._id);
        console.log(`📖 Niveau ${i + 1} créé: ${testLevel._id}`);
      }
      
      // Mettre à jour le parcours avec les niveaux
      await Path.findByIdAndUpdate(testPath._id, {
        levels: this.testData.levelIds
      });
      
      console.log('✅ Données de test créées avec succès');
      
    } catch (error) {
      console.error('❌ Erreur création données de test:', error);
      throw error;
    }
  }

  /**
   * Test 1: Création d'un accès et vérification du premier niveau débloqué
   */
  async testFirstLevelUnlock() {
    try {
      console.log('\n🧪 Test 1: Vérification du déblocage du premier niveau...');
      
      // Créer un accès gratuit à la catégorie
      const access = await CategoryPaymentService.grantFreeAccess(
        this.testData.userId,
        this.testData.categoryId,
        null // Pas de plan spécifique pour le test
      );
      
      console.log(`✅ Accès créé: ${access._id}`);
      
      // Vérifier que seul le premier niveau est débloqué
      const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(
        this.testData.userId,
        this.testData.categoryId
      );
      
      const unlockedLevels = categoryAccess.unlockedLevels;
      console.log(`🔓 Niveaux débloqués: ${unlockedLevels.length}`);
      
      if (unlockedLevels.length !== 1) {
        throw new Error(`Attendu 1 niveau débloqué, trouvé ${unlockedLevels.length}`);
      }
      
      const firstUnlockedLevel = unlockedLevels[0];
      if (firstUnlockedLevel.level.toString() !== this.testData.levelIds[0].toString()) {
        throw new Error('Le premier niveau débloqué n\'est pas le bon');
      }
      
      console.log('✅ Test 1 réussi: Seul le premier niveau est débloqué');
      
    } catch (error) {
      console.error('❌ Test 1 échoué:', error);
      throw error;
    }
  }

  /**
   * Test 2: Vérification que les autres niveaux sont verrouillés
   */
  async testOtherLevelsLocked() {
    try {
      console.log('\n🧪 Test 2: Vérification que les autres niveaux sont verrouillés...');
      
      // Vérifier l'accès au deuxième niveau (doit être refusé)
      const access2 = await LevelUnlockService.checkLevelAccess(
        this.testData.userId,
        this.testData.categoryId,
        this.testData.pathId,
        this.testData.levelIds[1]
      );
      
      if (access2.hasAccess) {
        throw new Error('Le deuxième niveau ne devrait pas être accessible');
      }
      
      console.log('✅ Test 2 réussi: Les autres niveaux sont bien verrouillés');
      
    } catch (error) {
      console.error('❌ Test 2 échoué:', error);
      throw error;
    }
  }

  /**
   * Test 3: Simulation de complétion d'un niveau et déblocage du suivant
   */
  async testLevelCompletionAndUnlock() {
    try {
      console.log('\n🧪 Test 3: Simulation de complétion et déblocage du niveau suivant...');
      
      // Marquer le premier niveau comme complété
      await UserLevelProgress.findOneAndUpdate(
        { user: this.testData.userId, level: this.testData.levelIds[0] },
        { 
          completed: true, 
          completedAt: new Date(),
          xp: 50
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      console.log('✅ Premier niveau marqué comme complété');
      
      // Déclencher le déblocage du niveau suivant
      const nextLevel = await LevelUnlockService.onLevelCompleted(
        this.testData.userId,
        this.testData.levelIds[0]
      );
      
      if (!nextLevel) {
        throw new Error('Aucun niveau suivant n\'a été débloqué');
      }
      
      if (nextLevel._id.toString() !== this.testData.levelIds[1].toString()) {
        throw new Error('Le mauvais niveau suivant a été débloqué');
      }
      
      console.log('✅ Test 3 réussi: Le niveau suivant a été débloqué automatiquement');
      
    } catch (error) {
      console.error('❌ Test 3 échoué:', error);
      throw error;
    }
  }

  /**
   * Test 4: Vérification du statut de déblocage
   */
  async testUnlockStatus() {
    try {
      console.log('\n🧪 Test 4: Vérification du statut de déblocage...');
      
      const unlockStatus = await LevelUnlockService.getUnlockStatus(
        this.testData.userId,
        this.testData.categoryId
      );
      
      if (!unlockStatus.hasAccess) {
        throw new Error('L\'utilisateur devrait avoir accès à la catégorie');
      }
      
      if (unlockStatus.paths.length !== 1) {
        throw new Error('Il devrait y avoir un seul parcours');
      }
      
      const pathStatus = unlockStatus.paths[0];
      if (pathStatus.levels.length !== 3) {
        throw new Error('Il devrait y avoir 3 niveaux');
      }
      
      // Vérifier que les 2 premiers niveaux sont débloqués
      const unlockedCount = pathStatus.levels.filter(level => level.isUnlocked).length;
      if (unlockedCount !== 2) {
        throw new Error(`Attendu 2 niveaux débloqués, trouvé ${unlockedCount}`);
      }
      
      console.log('✅ Test 4 réussi: Le statut de déblocage est correct');
      
    } catch (error) {
      console.error('❌ Test 4 échoué:', error);
      throw error;
    }
  }

  /**
   * Nettoyage des données de test
   */
  async cleanup() {
    try {
      console.log('\n🧹 Nettoyage des données de test...');
      
      // Supprimer dans l'ordre inverse des dépendances
      await UserLevelProgress.deleteMany({ user: this.testData.userId });
      await CategoryAccess.deleteMany({ user: this.testData.userId });
      await Level.deleteMany({ _id: { $in: this.testData.levelIds } });
      await Path.deleteMany({ _id: this.testData.pathId });
      await Category.deleteMany({ _id: this.testData.categoryId });
      await User.deleteMany({ _id: this.testData.userId });
      
      console.log('✅ Données de test nettoyées');
      
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  }

  /**
   * Exécution de tous les tests
   */
  async runAllTests() {
    try {
      await this.createTestData();
      await this.testFirstLevelUnlock();
      await this.testOtherLevelsLocked();
      await this.testLevelCompletionAndUnlock();
      await this.testUnlockStatus();
      
      console.log('\n🎉 Tous les tests sont passés avec succès !');
      console.log('✅ Le système de déblocage séquentiel fonctionne correctement');
      
    } catch (error) {
      console.error('\n💥 Tests échoués:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Exécution du script
async function main() {
  const test = new SequentialUnlockTest();
  
  try {
    await test.connect();
    await test.runAllTests();
  } catch (error) {
    console.error('💥 Test échoué:', error);
    process.exit(1);
  } finally {
    await test.disconnect();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  main();
}

module.exports = SequentialUnlockTest;
