// src/scripts/fullMigration.js
const mongoose = require('mongoose');
const CategoryPaymentMigration = require('../utils/migrateToCategoryPayment');
const cleanupOldSystem = require('./cleanupOldSystem');
require('dotenv').config();

async function runFullMigration() {
  try {
    console.log('🚀 DÉBUT DE LA MIGRATION COMPLÈTE');
    console.log('=====================================');
    
    // 1. Connexion à la base de données
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion établie');
    
    // 2. Résumé avant migration
    console.log('\n📊 RÉSUMÉ AVANT MIGRATION:');
    const beforeSummary = await CategoryPaymentMigration.getMigrationSummary();
    console.log(beforeSummary);
    
    // 3. Nettoyage de l'ancien système
    console.log('\n🧹 NETTOYAGE DE L\'ANCIEN SYSTÈME...');
    await cleanupOldSystem();
    
    // 4. Migration vers le nouveau système
    console.log('\n🔄 MIGRATION VERS LE NOUVEAU SYSTÈME...');
    await CategoryPaymentMigration.migrateToCategoryPayment();
    
    // 5. Résumé après migration
    console.log('\n📊 RÉSUMÉ APRÈS MIGRATION:');
    const afterSummary = await CategoryPaymentMigration.getMigrationSummary();
    console.log(afterSummary);
    
    // 6. Instructions finales
    console.log('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS !');
    console.log('=====================================');
    console.log('📋 PROCHAINES ÉTAPES:');
    console.log('1. Vérifiez que tous les plans de catégories sont créés');
    console.log('2. Configurez les prix des catégories selon vos besoins');
    console.log('3. Testez le système de paiement');
    console.log('4. Mettez à jour l\'interface utilisateur');
    console.log('\n🔧 COMMANDES UTILES:');
    console.log('- Voir les plans: GET /api/category-payments/plans');
    console.log('- Tester un paiement: POST /api/category-payments/init-payment');
    console.log('- Vérifier l\'accès: GET /api/category-payments/access/:categoryId/:pathId/:levelId');
    
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

// Exécuter la migration complète
if (require.main === module) {
  runFullMigration();
}

module.exports = runFullMigration;






