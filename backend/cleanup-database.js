const mongoose = require('mongoose');
require('dotenv').config();

// Collections à supprimer (sécurisé - vides ou obsolètes)
const COLLECTIONS_TO_DELETE = [
  'userdrafts',           // 0 docs - Non utilisée
  'sharedcalendars',      // 0 docs - Fonctionnalité non implémentée  
  'categoryaccesses',     // 0 docs - Remplacée par nouveau système
  'rewards',              // 0 docs - Système de récompenses non utilisé
  'useractivities',       // 0 docs - Tracking d'activité non utilisé
  'subscriptions',        // 0 docs - Ancien système d'abonnement
  'payments',             // 0 docs - Ancien système de paiement
  'progresses'            // 0 docs - Doublon de userprogresses
];

// Collections avec données à vérifier avant suppression
const COLLECTIONS_TO_REVIEW = [
  'plans',                // 7 docs - Ancien système
  'pathplans'            // 16 docs - Plans par parcours obsolètes
];

async function cleanupDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    console.log('🔍 Connexion à MongoDB établie\n');
    
    const db = mongoose.connection.db;
    
    console.log('📊 ANALYSE AVANT NETTOYAGE:');
    console.log('============================');
    
    // Analyser toutes les collections
    const allCollections = [...COLLECTIONS_TO_DELETE, ...COLLECTIONS_TO_REVIEW];
    for (const collectionName of allCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`📁 ${collectionName}: ${count} documents`);
      } catch (error) {
        console.log(`📁 ${collectionName}: Collection n'existe pas`);
      }
    }
    
    console.log('\n🗑️  NETTOYAGE DES COLLECTIONS VIDES:');
    console.log('=====================================');
    
    // Supprimer les collections vides (sécurisé)
    for (const collectionName of COLLECTIONS_TO_DELETE) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count === 0) {
          await db.collection(collectionName).drop();
          console.log(`✅ ${collectionName} supprimée (vide)`);
        } else {
          console.log(`⚠️  ${collectionName} a ${count} documents - PAS SUPPRIMÉE`);
        }
      } catch (error) {
        if (error.code === 26) {
          console.log(`ℹ️  ${collectionName} n'existe pas`);
        } else {
          console.log(`❌ Erreur avec ${collectionName}: ${error.message}`);
        }
      }
    }
    
    console.log('\n⚠️  COLLECTIONS AVEC DONNÉES À RÉVISER:');
    console.log('=======================================');
    
    for (const collectionName of COLLECTIONS_TO_REVIEW) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`📁 ${collectionName}: ${count} documents - VÉRIFICATION MANUELLE REQUISE`);
          
          // Afficher un échantillon des données
          const sample = await db.collection(collectionName).find().limit(2).toArray();
          console.log(`   Échantillon:`, JSON.stringify(sample, null, 2));
        }
      } catch (error) {
        console.log(`📁 ${collectionName}: Collection n'existe pas`);
      }
    }
    
    console.log('\n📊 ANALYSE APRÈS NETTOYAGE:');
    console.log('============================');
    
    const remainingCollections = await db.listCollections().toArray();
    for (const collection of remainingCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📁 ${collection.name}: ${count} documents`);
    }
    
    console.log(`\n🎉 NETTOYAGE TERMINÉ!`);
    console.log(`📈 Collections restantes: ${remainingCollections.length}`);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await mongoose.disconnect();
  }
}

// Fonction pour supprimer les collections avec données (ATTENTION!)
async function deleteCollectionsWithData() {
  console.log('⚠️  ATTENTION: Cette fonction supprime des collections avec des données!');
  console.log('⚠️  Assurez-vous d\'avoir une sauvegarde avant de continuer!');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Voulez-vous vraiment supprimer les collections avec données? (tapez "SUPPRIMER" pour confirmer): ', async (answer) => {
    if (answer === 'SUPPRIMER') {
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
        const db = mongoose.connection.db;
        
        for (const collectionName of COLLECTIONS_TO_REVIEW) {
          try {
            await db.collection(collectionName).drop();
            console.log(`✅ ${collectionName} supprimée`);
          } catch (error) {
            console.log(`❌ Erreur avec ${collectionName}: ${error.message}`);
          }
        }
        
        await mongoose.disconnect();
        console.log('🎉 Suppression terminée!');
      } catch (error) {
        console.error('❌ Erreur:', error.message);
      }
    } else {
      console.log('❌ Suppression annulée');
    }
    rl.close();
  });
}

// Exécution
const args = process.argv.slice(2);
if (args.includes('--delete-all')) {
  deleteCollectionsWithData();
} else {
  cleanupDatabase();
}



