/**
 * Script pour créer un utilisateur admin valide
 * Utilise ce script si votre token admin a expiré ou si l'utilisateur admin n'existe plus
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importer le modèle User réel
const User = require('../models/User');

async function createAdminUser() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('⚠️ Utilisateur admin existe déjà');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nom:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🔑 Rôles:', existingAdmin.roles);
      console.log('🔥 Firebase UID:', existingAdmin.firebaseUid);
      
      // Vérifier si c'est un admin
      if (existingAdmin.roles.includes('admin')) {
        console.log('✅ Cet utilisateur a déjà les droits admin');
        console.log('\n🎯 INSTRUCTIONS:');
        console.log('1. Allez sur http://localhost:3000/admin/login');
        console.log('2. Connectez-vous avec Firebase Auth');
        console.log('3. Utilisez cet email:', existingAdmin.email);
      } else {
        console.log('⚠️ Cet utilisateur n\'a pas les droits admin');
        console.log('🔄 Ajout des droits admin...');
        existingAdmin.roles.push('admin');
        await existingAdmin.save();
        console.log('✅ Droits admin ajoutés !');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Créer l'utilisateur admin avec Firebase UID
    const adminUser = new User({
      firebaseUid: 'admin-system-' + Date.now(), // UID unique pour l'admin
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'System',
      userType: 'student', // Type par défaut
      roles: ['admin'], // Rôle admin
      isVerified: true,
      isProfileComplete: true
    });

    await adminUser.save();
    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nom:', adminUser.firstName, adminUser.lastName);
    console.log('🔑 Rôles:', adminUser.roles);
    console.log('🔥 Firebase UID:', adminUser.firebaseUid);

    console.log('\n🎯 INSTRUCTIONS:');
    console.log('1. Allez sur http://localhost:3000/admin/login');
    console.log('2. Connectez-vous avec Firebase Auth');
    console.log('3. Utilisez cet email:', adminUser.email);
    console.log('4. Accédez à la page Subscription pour tester');
    console.log('\n⚠️ IMPORTANT:');
    console.log('Ce système utilise Firebase Auth. Vous devez vous connecter via Firebase.');
    console.log('Si vous n\'avez pas accès à Firebase, contactez le développeur.');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécution du script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;
