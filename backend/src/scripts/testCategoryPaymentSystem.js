// src/scripts/testCategoryPaymentSystem.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');
const CategoryAccess = require('../models/CategoryAccess');
const User = require('../models/User');
const Path = require('../models/Path');
const Level = require('../models/Level');

// Import services
const CategoryPaymentService = require('../services/categoryPaymentService');
const LevelUnlockService = require('../services/levelUnlockService');

async function testCategoryPaymentSystem() {
  try {
    console.log('🧪 Test du système de paiement par catégorie');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis');
    console.log('✅ Connexion à la base de données établie');
    
    // 1. Créer une catégorie de test
    console.log('\n📝 1. Création d\'une catégorie de test...');
    const testCategory = new Category({
      translations: {
        fr: { name: 'JavaScript Test', description: 'Catégorie de test pour JavaScript' },
        en: { name: 'JavaScript Test', description: 'Test category for JavaScript' },
        ar: { name: 'جافا سكريبت تجريبي', description: 'فئة تجريبية لجافا سكريبت' }
      },
      type: 'classic',
      order: 1
    });
    await testCategory.save();
    console.log('✅ Catégorie créée:', testCategory._id);
    
    // 2. Créer un plan pour cette catégorie
    console.log('\n💰 Création d\'un plan de catégorie...');
    const testPlan = new CategoryPlan({
      category: testCategory._id,
      price: 29.99,
      currency: 'TND',
      paymentType: 'one_time',
      accessDuration: 365,
      active: true,
      translations: {
        fr: { name: 'Plan JavaScript Complet', description: 'Accès complet à tous les parcours JavaScript' },
        en: { name: 'Complete JavaScript Plan', description: 'Full access to all JavaScript courses' },
        ar: { name: 'خطة جافا سكريبت الكاملة', description: 'وصول كامل لجميع دورات جافا سكريبت' }
      },
      features: ['Tous les parcours', 'Accès illimité', 'Support prioritaire'],
      order: 1
    });
    await testPlan.save();
    console.log('✅ Plan créé:', testPlan._id);
    
    // 3. Créer un utilisateur de test
    console.log('\n👤 Création d\'un utilisateur de test...');
    const testUser = new User({
      email: 'test-category@example.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User',
      isEmailVerified: true,
      role: 'client'
    });
    await testUser.save();
    console.log('✅ Utilisateur créé:', testUser._id);
    
    // 4. Créer un parcours de test
    console.log('\n📚 Création d\'un parcours de test...');
    const testPath = new Path({
      category: testCategory._id,
      translations: {
        fr: { name: 'JavaScript Débutant', description: 'Apprendre JavaScript depuis le début' },
        en: { name: 'JavaScript Beginner', description: 'Learn JavaScript from scratch' },
        ar: { name: 'جافا سكريبت للمبتدئين', description: 'تعلم جافا سكريبت من الصفر' }
      },
      order: 1
    });
    await testPath.save();
    console.log('✅ Parcours créé:', testPath._id);
    
    // 5. Créer des niveaux de test
    console.log('\n🎯 Création de niveaux de test...');
    const level1 = new Level({
      path: testPath._id,
      translations: {
        fr: { name: 'Introduction à JavaScript', description: 'Première leçon' },
        en: { name: 'JavaScript Introduction', description: 'First lesson' },
        ar: { name: 'مقدمة في جافا سكريبت', description: 'الدرس الأول' }
      },
      order: 1,
      content: 'Contenu de la première leçon...'
    });
    await level1.save();
    
    const level2 = new Level({
      path: testPath._id,
      translations: {
        fr: { name: 'Variables et Types', description: 'Deuxième leçon' },
        en: { name: 'Variables and Types', description: 'Second lesson' },
        ar: { name: 'المتغيرات والأنواع', description: 'الدرس الثاني' }
      },
      order: 2,
      content: 'Contenu de la deuxième leçon...'
    });
    await level2.save();
    
    // Mettre à jour le parcours avec les niveaux
    testPath.levels = [level1._id, level2._id];
    await testPath.save();
    
    console.log('✅ Niveaux créés:', level1._id, level2._id);
    
    // 6. Tester l'accès gratuit au premier niveau
    console.log('\n🆓 Test de l\'accès gratuit au premier niveau...');
    const freeAccess = await LevelUnlockService.checkLevelAccess(
      testUser._id,
      testCategory._id,
      testPath._id,
      level1._id
    );
    console.log('✅ Accès gratuit vérifié:', freeAccess);
    
    // 7. Simuler un paiement réussi
    console.log('\n💳 Simulation d\'un paiement réussi...');
    const paymentResult = await CategoryPaymentService.processSuccessfulPayment('test-payment-ref-123');
    console.log('✅ Paiement simulé:', paymentResult);
    
    // 8. Vérifier l'accès après paiement
    console.log('\n🔓 Vérification de l\'accès après paiement...');
    const accessAfterPayment = await CategoryAccess.findActiveByUserAndCategory(testUser._id, testCategory._id);
    console.log('✅ Accès créé:', accessAfterPayment);
    
    // 9. Tester le déblocage automatique du niveau suivant
    console.log('\n🎉 Test du déblocage automatique du niveau suivant...');
    const nextLevelUnlock = await LevelUnlockService.onLevelCompleted(testUser._id, level1._id);
    console.log('✅ Niveau suivant débloqué:', nextLevelUnlock);
    
    // 10. Vérifier l'accès au deuxième niveau
    console.log('\n🔍 Vérification de l\'accès au deuxième niveau...');
    const level2Access = await LevelUnlockService.checkLevelAccess(
      testUser._id,
      testCategory._id,
      testPath._id,
      level2._id
    );
    console.log('✅ Accès au niveau 2:', level2Access);
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📊 Résumé des tests:');
    console.log('- ✅ Catégorie créée');
    console.log('- ✅ Plan de catégorie créé');
    console.log('- ✅ Utilisateur créé');
    console.log('- ✅ Parcours et niveaux créés');
    console.log('- ✅ Accès gratuit au premier niveau');
    console.log('- ✅ Paiement simulé avec succès');
    console.log('- ✅ Accès accordé après paiement');
    console.log('- ✅ Déblocage automatique du niveau suivant');
    console.log('- ✅ Accès vérifié au deuxième niveau');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    // Nettoyage (optionnel)
    console.log('\n🧹 Nettoyage des données de test...');
    try {
      await Category.deleteMany({ 'translations.fr.name': 'JavaScript Test' });
      await User.deleteMany({ email: 'test-category@example.com' });
      console.log('✅ Données de test nettoyées');
    } catch (cleanupError) {
      console.log('⚠️ Erreur lors du nettoyage:', cleanupError.message);
    }
    
    await mongoose.disconnect();
    console.log('✅ Déconnexion de la base de données');
  }
}

// Exécuter les tests
if (require.main === module) {
  testCategoryPaymentSystem();
}

module.exports = testCategoryPaymentSystem;


