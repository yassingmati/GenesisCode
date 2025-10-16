// src/scripts/cleanupOldSystem.js
const mongoose = require('mongoose');
require('dotenv').config();

// Modèles à nettoyer
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const CourseAccess = require('../models/CourseAccess');
const User = require('../models/User');

async function cleanupOldSystem() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion établie');
    
    console.log('🧹 Nettoyage de l\'ancien système de paiement...');
    
    // 1. Supprimer tous les accès de cours
    console.log('🗑️ Suppression des accès de cours...');
    const courseAccessResult = await CourseAccess.deleteMany({});
    console.log(`✅ ${courseAccessResult.deletedCount} accès de cours supprimés`);
    
    // 2. Supprimer tous les abonnements
    console.log('🗑️ Suppression des abonnements...');
    const subscriptionResult = await Subscription.deleteMany({});
    console.log(`✅ ${subscriptionResult.deletedCount} abonnements supprimés`);
    
    // 3. Supprimer tous les plans
    console.log('🗑️ Suppression des plans...');
    const planResult = await Plan.deleteMany({});
    console.log(`✅ ${planResult.deletedCount} plans supprimés`);
    
    // 4. Nettoyer les utilisateurs
    console.log('👥 Nettoyage des utilisateurs...');
    const users = await User.find({ 'subscription.planId': { $exists: true } });
    
    for (const user of users) {
      user.subscription = undefined;
      await user.save();
    }
    console.log(`✅ ${users.length} utilisateurs nettoyés`);
    
    console.log('✅ Nettoyage terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
    process.exit(0);
  }
}

// Exécuter le nettoyage si le script est appelé directement
if (require.main === module) {
  cleanupOldSystem();
}

module.exports = cleanupOldSystem;






