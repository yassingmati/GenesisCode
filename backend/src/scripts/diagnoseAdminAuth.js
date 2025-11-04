// src/scripts/diagnoseAdminAuth.js
// Script de diagnostic pour vérifier l'authentification admin
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');
const User = require('../models/User');

async function diagnose() {
  try {
    console.log('🔍 Diagnostic de l\'authentification admin...\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier les secrets JWT
    const userSecret = process.env.JWT_SECRET || 'devsecret';
    const adminSecret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
    
    console.log('🔐 Configuration JWT:');
    console.log(`   JWT_SECRET: ${userSecret.substring(0, 10)}...${userSecret.length > 10 ? ' (' + userSecret.length + ' chars)' : ''}`);
    console.log(`   JWT_ADMIN_SECRET: ${adminSecret.substring(0, 10)}...${adminSecret.length > 10 ? ' (' + adminSecret.length + ' chars)' : ''}`);
    console.log(`   Secrets identiques: ${userSecret === adminSecret ? 'Oui ⚠️' : 'Non ✅'}\n`);

    // Vérifier les admins
    console.log('👤 Comptes Admin:');
    const admins = await Admin.find({}).select('email createdAt').lean();
    console.log(`   Admins (Admin model): ${admins.length}`);
    admins.forEach((admin, i) => {
      console.log(`   ${i + 1}. ${admin.email} (ID: ${admin._id})`);
      
      // Générer un token pour cet admin
      const token = jwt.sign({ id: admin._id }, adminSecret, { expiresIn: '1d' });
      console.log(`      Token: ${token.substring(0, 50)}...`);
      console.log(`      Pour tester: curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/courses/categories?type=specific`);
    });

    const userAdmins = await User.find({ roles: 'admin' }).select('email roles').lean();
    console.log(`\n   Utilisateurs avec rôle admin: ${userAdmins.length}`);
    userAdmins.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (ID: ${user._id})`);
      const token = jwt.sign({ id: user._id }, userSecret, { expiresIn: '1d' });
      console.log(`      Token: ${token.substring(0, 50)}...`);
    });

    // Générer un token de test
    if (admins.length > 0) {
      const testAdmin = admins[0];
      const testToken = jwt.sign({ id: testAdmin._id }, adminSecret, { expiresIn: '1d' });
      
      console.log('\n📋 Instructions pour tester:');
      console.log('1. Connectez-vous en tant qu\'admin via l\'interface admin');
      console.log('2. Vérifiez que le token est stocké dans localStorage:');
      console.log('   - Ouvrez la console du navigateur (F12)');
      console.log('   - Tapez: localStorage.getItem("adminToken")');
      console.log('   - Le token devrait être présent');
      console.log('\n3. Si le token n\'est pas présent, connectez-vous à nouveau:');
      console.log(`   - Email: ${testAdmin.email}`);
      console.log('   - Utilisez le mot de passe de l\'admin');
      console.log('\n4. Pour tester manuellement avec curl:');
      console.log(`   curl -H "Authorization: Bearer ${testToken}" http://localhost:5000/api/courses/categories?type=specific`);
    }

    console.log('\n✅ Diagnostic terminé');
    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  diagnose();
}

module.exports = diagnose;

