// src/scripts/testCategoryPlansService.js
// Script pour tester le service CategoryPaymentService
const mongoose = require('mongoose');
require('dotenv').config();

const CategoryPaymentService = require('../services/categoryPaymentService');
const CategoryPlan = require('../models/CategoryPlan');
const Category = require('../models/Category');

async function testService() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    console.log('📋 Test de CategoryPaymentService.getAllCategoryPlans()...\n');
    
    const plans = await CategoryPaymentService.getAllCategoryPlans();
    
    console.log(`✅ ${plans.length} plans récupérés\n`);
    
    plans.forEach((plan, i) => {
      console.log(`Plan ${i + 1}:`);
      console.log(`  ID: ${plan.id || plan._id}`);
      console.log(`  Name: ${plan.name}`);
      console.log(`  Price: ${plan.price} ${plan.currency}`);
      console.log(`  Active: ${plan.active}`);
      console.log('');
    });

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    console.log('✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Stack:', error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  testService();
}

module.exports = testService;

