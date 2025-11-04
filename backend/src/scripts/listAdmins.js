// src/scripts/listAdmins.js
// Script pour lister tous les comptes admin qui ont accès au panel admin
const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('../models/Admin');
const User = require('../models/User');

async function listAdmins() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer les admins du modèle Admin
    const adminAccounts = await Admin.find({})
      .select('email createdAt updatedAt')
      .lean()
      .exec();

    // Récupérer les utilisateurs avec le rôle admin
    const userAdmins = await User.find({ roles: 'admin' })
      .select('email firstName lastName roles isVerified isProfileComplete createdAt updatedAt')
      .lean()
      .exec();

    console.log('📊 Comptes Admin avec accès au panel:\n');
    
    console.log(`🔐 Admins (Admin model): ${adminAccounts.length}`);
    adminAccounts.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.email}`);
      console.log(`     ID: ${admin._id}`);
      console.log(`     Créé le: ${admin.createdAt}`);
    });

    console.log(`\n👤 Utilisateurs avec rôle admin (User model): ${userAdmins.length}`);
    userAdmins.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email}`);
      console.log(`     ID: ${user._id}`);
      console.log(`     Nom: ${user.firstName || ''} ${user.lastName || ''}`);
      console.log(`     Roles: ${JSON.stringify(user.roles)}`);
      console.log(`     Vérifié: ${user.isVerified ? 'Oui' : 'Non'}`);
      console.log(`     Profil complet: ${user.isProfileComplete ? 'Oui' : 'Non'}`);
      console.log(`     Créé le: ${user.createdAt}`);
    });

    console.log(`\n✅ Total: ${adminAccounts.length + userAdmins.length} comptes admin`);
    console.log(`   - ${adminAccounts.length} admins (Admin model)`);
    console.log(`   - ${userAdmins.length} utilisateurs avec rôle admin (User model)`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  listAdmins();
}

module.exports = listAdmins;

