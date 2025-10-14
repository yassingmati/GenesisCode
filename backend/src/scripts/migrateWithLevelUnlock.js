// src/scripts/migrateWithLevelUnlock.js
const mongoose = require('mongoose');
const CategoryPaymentMigration = require('../utils/migrateToCategoryPayment');
const LevelUnlockService = require('../services/levelUnlockService');
const CategoryAccess = require('../models/CategoryAccess');
const User = require('../models/User');
require('dotenv').config();

async function migrateWithLevelUnlock() {
  try {
    console.log('🚀 MIGRATION AVEC SYSTÈME DE DÉBLOCAGE DES NIVEAUX');
    console.log('==================================================');
    
    // 1. Connexion à la base de données
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion établie');
    
    // 2. Migration de base
    console.log('\n🔄 MIGRATION DE BASE...');
    await CategoryPaymentMigration.migrateToCategoryPayment();
    
    // 3. Déblocage des premiers niveaux pour tous les utilisateurs
    console.log('\n🎁 DÉBLOCAGE DES PREMIERS NIVEAUX...');
    const users = await User.find({ role: 'client' });
    const categoryAccesses = await CategoryAccess.find({ status: 'active' });
    
    console.log(`👥 ${users.length} utilisateurs trouvés`);
    console.log(`🎫 ${categoryAccesses.length} accès actifs trouvés`);
    
    let unlockedCount = 0;
    
    for (const access of categoryAccesses) {
      try {
        await LevelUnlockService.unlockFirstLevelsForCategory(
          access.user, 
          access.category
        );
        unlockedCount++;
        console.log(`✅ Premiers niveaux débloqués pour l'utilisateur ${access.user}`);
      } catch (error) {
        console.error(`❌ Erreur déblocage pour utilisateur ${access.user}:`, error);
      }
    }
    
    console.log(`🎉 ${unlockedCount} utilisateurs avec premiers niveaux débloqués`);
    
    // 4. Test du système
    console.log('\n🧪 TEST DU SYSTÈME...');
    if (users.length > 0 && categoryAccesses.length > 0) {
      const testUser = users[0];
      const testAccess = categoryAccesses[0];
      
      console.log(`🧪 Test avec utilisateur: ${testUser.email}`);
      console.log(`🧪 Test avec catégorie: ${testAccess.category}`);
      
      // Vérifier les niveaux débloqués
      const unlockedLevels = await LevelUnlockService.getUnlockedLevels(
        testUser._id, 
        testAccess.category
      );
      
      console.log(`🔓 Niveaux débloqués pour le test: ${unlockedLevels.length}`);
      
      // Tester le déblocage progressif
      if (unlockedLevels.length > 0) {
        const firstUnlockedLevel = unlockedLevels[0];
        console.log(`🔄 Test déblocage progressif avec niveau: ${firstUnlockedLevel.level}`);
        
        try {
          await LevelUnlockService.onLevelCompleted(testUser._id, firstUnlockedLevel.level);
          console.log('✅ Déblocage progressif testé avec succès');
        } catch (error) {
          console.error('❌ Erreur test déblocage progressif:', error);
        }
      }
    }
    
    // 5. Résumé final
    console.log('\n📊 RÉSUMÉ DE LA MIGRATION');
    console.log('==========================');
    
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalAccesses = await CategoryAccess.countDocuments({ status: 'active' });
    const totalUnlockedLevels = await CategoryAccess.aggregate([
      { $match: { status: 'active' } },
      { $project: { unlockedCount: { $size: '$unlockedLevels' } } },
      { $group: { _id: null, total: { $sum: '$unlockedCount' } } }
    ]);
    
    console.log(`👥 Utilisateurs: ${totalUsers}`);
    console.log(`🎫 Accès actifs: ${totalAccesses}`);
    console.log(`🔓 Niveaux débloqués au total: ${totalUnlockedLevels[0]?.total || 0}`);
    
    console.log('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log('=====================================');
    console.log('🎯 FONCTIONNALITÉS ACTIVÉES:');
    console.log('✅ Paiement par catégorie');
    console.log('✅ Déblocage automatique des premiers niveaux');
    console.log('✅ Déblocage progressif des niveaux suivants');
    console.log('✅ Accès gratuit au premier niveau de chaque parcours');
    console.log('✅ Intégration avec le système de progression existant');
    
    console.log('\n🔧 PROCHAINES ÉTAPES:');
    console.log('1. Tester l\'interface utilisateur: /category-plans');
    console.log('2. Vérifier les paiements avec Konnect');
    console.log('3. Tester le déblocage progressif en complétant des exercices');
    console.log('4. Configurer les prix des catégories selon vos besoins');
    
  } catch (error) {
    console.error('❌ ERREUR LORS DE LA MIGRATION:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
    process.exit(0);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateWithLevelUnlock();
}

module.exports = migrateWithLevelUnlock;
