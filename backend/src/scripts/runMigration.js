// src/scripts/runMigration.js
const mongoose = require('mongoose');
const CategoryPaymentMigration = require('../utils/migrateToCategoryPayment');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion établie');
    
    console.log('📊 Résumé avant migration:');
    const beforeSummary = await CategoryPaymentMigration.getMigrationSummary();
    console.log(beforeSummary);
    
    console.log('\n🚀 Lancement de la migration...');
    await CategoryPaymentMigration.migrateToCategoryPayment();

    // Backfill Category.type to 'classic' for legacy categories
    console.log('\n🛠️ Backfill Category.type = classic quand manquant...');
    const Category = require('../models/Category');
    const result = await Category.updateMany(
      { $or: [ { type: { $exists: false } }, { type: null } ] },
      { $set: { type: 'classic' } }
    );
    const matched = result.matchedCount ?? result.n ?? 0;
    const modified = result.modifiedCount ?? result.nModified ?? 0;
    console.log(`✅ Backfill terminé: matched=${matched}, modified=${modified}`);
    
    console.log('\n📊 Résumé après migration:');
    const afterSummary = await CategoryPaymentMigration.getMigrationSummary();
    console.log(afterSummary);
    
    console.log('\n✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
