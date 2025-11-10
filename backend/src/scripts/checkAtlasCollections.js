/**
 * Script pour vérifier les collections dans MongoDB Atlas
 * Compte les documents dans chaque collection importante
 */

const mongoose = require('mongoose');

// URI MongoDB Atlas
const MONGODB_ATLAS_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

async function checkCollections() {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    console.log(`   URI: ${MONGODB_ATLAS_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    await mongoose.connect(MONGODB_ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB Atlas\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('='.repeat(60));
    console.log('📊 COLLECTIONS DANS MONGODB ATLAS');
    console.log('='.repeat(60) + '\n');

    // Collections importantes à vérifier
    const importantCollections = [
      'admins',
      'users',
      'categoryplans',
      'plans',
      'categories',
      'subscriptions',
      'payments',
      'categoryaccesses'
    ];

    const results = {};

    for (const collectionName of importantCollections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        results[collectionName] = count;
        
        const icon = count > 0 ? '✅' : '❌';
        console.log(`${icon} ${collectionName}: ${count} document(s)`);
      } catch (error) {
        console.log(`❌ ${collectionName}: Erreur - ${error.message}`);
        results[collectionName] = -1;
      }
    }

    // Vérifier toutes les autres collections
    console.log('\n' + '='.repeat(60));
    console.log('📋 TOUTES LES COLLECTIONS');
    console.log('='.repeat(60) + '\n');

    for (const collection of collections) {
      const name = collection.name;
      if (!importantCollections.includes(name)) {
        try {
          const count = await db.collection(name).countDocuments();
          const icon = count > 0 ? '📄' : '📭';
          console.log(`${icon} ${name}: ${count} document(s)`);
        } catch (error) {
          console.log(`❌ ${name}: Erreur - ${error.message}`);
        }
      }
    }

    // Vérifier les données spécifiques
    console.log('\n' + '='.repeat(60));
    console.log('🔍 VÉRIFICATION DÉTAILLÉE');
    console.log('='.repeat(60) + '\n');

    // Vérifier les admins
    if (results['admins'] > 0) {
      const Admin = require('../models/Admin');
      const admins = await Admin.find({}).select('email createdAt');
      console.log('👤 Admins:');
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email} (ID: ${admin._id})`);
      });
      console.log('');
    }

    // Vérifier les categoryplans
    if (results['categoryplans'] > 0) {
      const CategoryPlan = require('../models/CategoryPlan');
      const Category = require('../models/Category'); // Charger le modèle Category
      const plans = await CategoryPlan.find({})
        .populate('category', 'translations')
        .sort({ order: 1 });
      console.log('📋 CategoryPlans:');
      plans.forEach((plan, index) => {
        const categoryName = plan.category?.translations?.fr?.name || plan.category?.translations?.en?.name || 'N/A';
        console.log(`   ${index + 1}. ${categoryName} - ${plan.price} ${plan.currency} (ID: ${plan._id})`);
      });
      console.log('');
    }

    // Vérifier les plans
    if (results['plans'] > 0) {
      const Plan = require('../models/Plan');
      const plans = await Plan.find({});
      console.log('📦 Plans:');
      plans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.name} - ${plan.priceMonthly ? plan.priceMonthly / 100 : 0} ${plan.currency} (ID: ${plan._id})`);
      });
      console.log('');
    }

    // Résumé
    console.log('='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`Admins: ${results['admins']}`);
    console.log(`Users: ${results['users']}`);
    console.log(`CategoryPlans: ${results['categoryplans']}`);
    console.log(`Plans: ${results['plans']}`);
    console.log(`Categories: ${results['categories']}`);
    console.log(`Subscriptions: ${results['subscriptions']}`);
    console.log(`Payments: ${results['payments']}`);
    console.log('='.repeat(60) + '\n');

    // Vérifier si les données sont dans la bonne base de données
    console.log('📁 Informations de la base de données:');
    console.log(`   Nom: ${db.databaseName}`);
    console.log(`   Collections: ${collections.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

if (require.main === module) {
  checkCollections()
    .then(() => {
      console.log('✅ Vérification terminée');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = checkCollections;

