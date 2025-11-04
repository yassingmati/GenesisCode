// src/scripts/listCategoryPlans.js
// Script pour lister tous les plans de catégories
const mongoose = require('mongoose');
require('dotenv').config();

// Charger les modèles
require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');

async function listCategoryPlans() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    const plans = await CategoryPlan.find({})
      .populate('category', 'translations type')
      .sort({ order: 1 })
      .lean()
      .exec();

    console.log('📋 Plans de catégories créés:\n');
    
    if (plans.length === 0) {
      console.log('⚠️ Aucun plan trouvé');
    } else {
      plans.forEach((plan, i) => {
        const catName = plan.category?.translations?.fr?.name || 
                       plan.category?.translations?.en?.name || 
                       'N/A';
        const catType = plan.category?.type || 'N/A';
        console.log(`  ${i + 1}. ${catName} (${catType})`);
        console.log(`     Prix: ${plan.price} ${plan.currency}`);
        console.log(`     Type de paiement: ${plan.paymentType}`);
        console.log(`     Durée d'accès: ${plan.accessDuration} jours`);
        console.log(`     Statut: ${plan.active ? '✅ Actif' : '❌ Inactif'}`);
        console.log(`     Plan ID: ${plan._id}`);
        console.log('');
      });
      console.log(`✅ Total: ${plans.length} plans`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  listCategoryPlans();
}

module.exports = listCategoryPlans;

