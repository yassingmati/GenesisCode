// src/scripts/testCategoryPlans.js
// Script pour tester la récupération des plans de catégories
const mongoose = require('mongoose');
require('dotenv').config();

const CategoryPlan = require('../models/CategoryPlan');
const Category = require('../models/Category');
const CategoryAccess = require('../models/CategoryAccess');

async function testCategoryPlans() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    console.log('📋 Test de récupération des plans...\n');
    
    const plans = await CategoryPlan.find()
      .populate('category', 'translations type')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    console.log(`✅ ${plans.length} plans trouvés\n`);
    
    const plansWithStats = await Promise.all(
      plans.map(async (plan, index) => {
        console.log(`Plan ${index + 1}:`);
        console.log(`  ID: ${plan._id}`);
        console.log(`  Category: ${plan.category ? plan.category.translations?.fr?.name || 'N/A' : 'No category'}`);
        console.log(`  Category ID: ${plan.category ? plan.category._id : 'N/A'}`);
        
        let activeAccessCount = 0;
        
        if (plan.category && plan.category._id) {
          try {
            activeAccessCount = await CategoryAccess.countDocuments({
              category: plan.category._id,
              status: 'active',
              $or: [
                { expiresAt: { $gt: new Date() } },
                { expiresAt: null }
              ]
            });
            console.log(`  ✅ Active users count: ${activeAccessCount}`);
          } catch (err) {
            console.log(`  ❌ Error counting category access: ${err.message}`);
            activeAccessCount = 0;
          }
        } else {
          console.log(`  ⚠️ No category found for this plan`);
        }
        
        console.log('');
        
        return {
          ...plan,
          activeUsersCount: activeAccessCount
        };
      })
    );
    
    console.log(`✅ ${plansWithStats.length} plans avec statistiques calculées\n`);
    console.log('✅ Test terminé avec succès');

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Stack:', error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  testCategoryPlans();
}

module.exports = testCategoryPlans;

