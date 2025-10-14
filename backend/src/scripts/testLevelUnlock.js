// src/scripts/testLevelUnlock.js
const mongoose = require('mongoose');
const LevelUnlockService = require('../services/levelUnlockService');
const CategoryPaymentService = require('../services/categoryPaymentService');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const User = require('../models/User');
const CategoryAccess = require('../models/CategoryAccess');
require('dotenv').config();

async function testLevelUnlock() {
  try {
    console.log('🧪 TEST DU SYSTÈME DE DÉBLOCAGE DES NIVEAUX');
    console.log('==========================================');
    
    // Connexion à la base de données
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion établie');
    
    // 1. Récupérer une catégorie de test
    const category = await Category.findOne();
    if (!category) {
      console.log('❌ Aucune catégorie trouvée');
      return;
    }
    console.log(`📁 Catégorie de test: ${category.translations.fr.name}`);
    
    // 2. Récupérer un parcours de cette catégorie
    const path = await Path.findOne({ category: category._id }).populate('levels');
    if (!path) {
      console.log('❌ Aucun parcours trouvé pour cette catégorie');
      return;
    }
    console.log(`🛤️ Parcours de test: ${path.translations.fr.name}`);
    console.log(`📚 Niveaux disponibles: ${path.levels.length}`);
    
    // 3. Créer un utilisateur de test
    let testUser = await User.findOne({ email: 'test@levelunlock.com' });
    if (!testUser) {
      testUser = new User({
        email: 'test@levelunlock.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client'
      });
      await testUser.save();
      console.log('👤 Utilisateur de test créé');
    } else {
      console.log('👤 Utilisateur de test existant');
    }
    
    // 4. Créer un accès à la catégorie
    let categoryAccess = await CategoryAccess.findOne({
      user: testUser._id,
      category: category._id
    });
    
    if (!categoryAccess) {
      // Créer un plan de catégorie
      const CategoryPlan = require('../models/CategoryPlan');
      let categoryPlan = await CategoryPlan.findOne({ category: category._id });
      
      if (!categoryPlan) {
        categoryPlan = new CategoryPlan({
          category: category._id,
          price: 0, // Gratuit pour le test
          currency: 'TND',
          paymentType: 'one_time',
          accessDuration: 365,
          active: true,
          translations: {
            fr: { name: 'Test Plan', description: 'Plan de test' },
            en: { name: 'Test Plan', description: 'Test plan' },
            ar: { name: 'Test Plan', description: 'Test plan' }
          },
          features: ['Test feature']
        });
        await categoryPlan.save();
        console.log('📋 Plan de catégorie créé');
      }
      
      categoryAccess = new CategoryAccess({
        user: testUser._id,
        category: category._id,
        categoryPlan: categoryPlan._id,
        accessType: 'free',
        status: 'active'
      });
      await categoryAccess.save();
      console.log('🎫 Accès à la catégorie créé');
    } else {
      console.log('🎫 Accès à la catégorie existant');
    }
    
    // 5. Tester le déblocage des premiers niveaux
    console.log('\n🎁 TEST: Déblocage des premiers niveaux');
    await LevelUnlockService.unlockFirstLevelsForCategory(testUser._id, category._id);
    
    // Vérifier les niveaux débloqués
    const unlockedLevels = await LevelUnlockService.getUnlockedLevels(testUser._id, category._id);
    console.log(`✅ Niveaux débloqués: ${unlockedLevels.length}`);
    
    // 6. Tester l'accès aux niveaux
    console.log('\n🔍 TEST: Vérification de l\'accès aux niveaux');
    for (const level of path.levels.slice(0, 3)) { // Tester les 3 premiers niveaux
      const access = await LevelUnlockService.checkLevelAccess(
        testUser._id,
        category._id,
        path._id,
        level._id
      );
      
      console.log(`Niveau ${level.order}: ${access.hasAccess ? '✅ Accès' : '❌ Refusé'} (${access.reason || access.accessType})`);
    }
    
    // 7. Tester le déblocage progressif
    console.log('\n🔄 TEST: Déblocage progressif');
    if (path.levels.length >= 2) {
      const firstLevel = path.levels[0];
      const secondLevel = path.levels[1];
      
      console.log(`Complétion du niveau ${firstLevel.order}...`);
      await LevelUnlockService.onLevelCompleted(testUser._id, firstLevel._id);
      
      // Vérifier si le niveau suivant est débloqué
      const nextLevelAccess = await LevelUnlockService.checkLevelAccess(
        testUser._id,
        category._id,
        path._id,
        secondLevel._id
      );
      
      console.log(`Niveau ${secondLevel.order}: ${nextLevelAccess.hasAccess ? '✅ Débloqué automatiquement' : '❌ Pas débloqué'}`);
    }
    
    // 8. Afficher le résumé final
    console.log('\n📊 RÉSUMÉ DU TEST');
    console.log('==================');
    console.log(`👤 Utilisateur: ${testUser.email}`);
    console.log(`📁 Catégorie: ${category.translations.fr.name}`);
    console.log(`🛤️ Parcours: ${path.translations.fr.name}`);
    console.log(`📚 Niveaux totaux: ${path.levels.length}`);
    console.log(`🔓 Niveaux débloqués: ${unlockedLevels.length}`);
    
    const finalAccess = await CategoryAccess.findActiveByUserAndCategory(testUser._id, category._id);
    if (finalAccess) {
      console.log(`🎫 Accès actif: ${finalAccess.isActive() ? 'Oui' : 'Non'}`);
      console.log(`🔓 Niveaux dans l'accès: ${finalAccess.unlockedLevels.length}`);
    }
    
    console.log('\n✅ Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testLevelUnlock();
}

module.exports = testLevelUnlock;


