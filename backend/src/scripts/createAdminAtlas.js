/**
 * Script pour créer un compte admin dans MongoDB Atlas
 * Crée un utilisateur admin avec email admin2@test.com et password password123
 */

const mongoose = require('mongoose');
const path = require('path');
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

// Forcer l'utilisation de l'URI depuis les variables d'environnement
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI n\'est pas défini dans .env');
  console.error(`   Chemin .env: ${envPath}`);
  process.exit(1);
}

const User = require('../models/User');
const Admin = require('../models/Admin');

async function createAdminAtlas() {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI n\'est pas défini dans .env');
      console.error(`   Vérifiez le fichier: ${envPath}`);
      process.exit(1);
    }
    console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB Atlas\n');

    const adminEmail = 'admin2@test.com';
    const adminPassword = 'password123';

    // 1. Créer dans le modèle Admin (pour l'authentification admin)
    console.log('📋 Création du compte admin dans le modèle Admin...\n');
    
    let admin = await Admin.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('⚠️  Admin existe déjà dans le modèle Admin');
      console.log(`   Email: ${admin.email}`);
      console.log(`   ID: ${admin._id}\n`);
    } else {
      admin = new Admin({
        email: adminEmail,
        password: adminPassword // Sera hashé automatiquement par le pre-save hook
      });
      await admin.save();
      console.log('✅ Admin créé dans le modèle Admin');
      console.log(`   Email: ${admin.email}`);
      console.log(`   ID: ${admin._id}\n`);
    }

    // 2. Créer dans le modèle User (pour l'accès au système)
    console.log('📋 Création du compte admin dans le modèle User...\n');
    
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('⚠️  Utilisateur admin existe déjà dans le modèle User');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Rôles: ${adminUser.roles.join(', ') || 'Aucun'}\n`);
      
      // Vérifier si l'utilisateur a le rôle admin
      if (!adminUser.roles.includes('admin')) {
        console.log('🔄 Ajout du rôle admin...');
        if (!adminUser.roles) {
          adminUser.roles = [];
        }
        adminUser.roles.push('admin');
        await adminUser.save();
        console.log('✅ Rôle admin ajouté\n');
      } else {
        console.log('✅ L\'utilisateur a déjà le rôle admin\n');
      }
    } else {
      adminUser = new User({
        firebaseUid: `admin-atlas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'System',
        userType: 'student',
        roles: ['admin'],
        isVerified: true,
        isProfileComplete: true
      });
      await adminUser.save();
      console.log('✅ Utilisateur admin créé dans le modèle User');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Rôles: ${adminUser.roles.join(', ')}\n`);
    }

    console.log('='.repeat(60));
    console.log('✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS');
    console.log('='.repeat(60));
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`\n📋 Modèle Admin:`);
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`\n📋 Modèle User:`);
    console.log(`   ID: ${adminUser._id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Rôles: ${adminUser.roles.join(', ')}`);
    console.log(`   Vérifié: ${adminUser.isVerified ? 'Oui' : 'Non'}`);
    console.log(`   Profil complet: ${adminUser.isProfileComplete ? 'Oui' : 'Non'}`);
    console.log('='.repeat(60));
    console.log('\n🎯 INSTRUCTIONS:');
    console.log('1. Vous pouvez maintenant vous connecter avec:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('2. Utilisez l\'endpoint: POST /api/admin/login');
    console.log('3. Ou connectez-vous via l\'interface admin');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createAdminAtlas()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = createAdminAtlas;

