/**
 * Script pour vérifier l'état de l'authentification admin
 * Vérifie si l'utilisateur admin existe et si le token est valide
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Importer le modèle User réel
const User = require('../models/User');

async function checkAuthStatus() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    console.log('✅ Connecté à MongoDB');

    // Vérifier les utilisateurs admin
    const adminUsers = await User.find({ roles: { $in: ['admin'] } });
    console.log(`\n👥 Utilisateurs admin trouvés: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log('❌ Aucun utilisateur admin trouvé !');
      console.log('💡 Exécutez: node src/scripts/createAdminUser.js');
      return;
    }

    adminUsers.forEach((user, index) => {
      console.log(`\n👤 Admin ${index + 1}:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Nom: ${user.firstName} ${user.lastName}`);
      console.log(`   🔑 Rôles: ${user.roles.join(', ')}`);
      console.log(`   ✅ Email vérifié: ${user.isVerified}`);
      console.log(`   🔥 Firebase UID: ${user.firebaseUid}`);
      console.log(`   📅 Créé: ${user.createdAt}`);
    });

    // Vérifier le JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log('\n⚠️ JWT_SECRET non défini dans .env');
      console.log('💡 Ajoutez JWT_SECRET=your_secret_key dans votre fichier .env');
    } else {
      console.log('\n🔐 JWT_SECRET configuré');
    }

    // Test de création de token
    if (jwtSecret && adminUsers.length > 0) {
      try {
        const testUser = adminUsers[0];
        const testToken = jwt.sign(
          { 
            userId: testUser._id, 
            email: testUser.email, 
            roles: testUser.roles,
            firebaseUid: testUser.firebaseUid
          },
          jwtSecret,
          { expiresIn: '24h' }
        );
        console.log('✅ Test de création de token réussi');
        console.log('🔑 Token de test créé (expire dans 24h)');
      } catch (tokenError) {
        console.log('❌ Erreur lors de la création du token:', tokenError.message);
      }
    }

    console.log('\n🎯 RECOMMANDATIONS:');
    console.log('1. Si aucun admin: node src/scripts/createAdminUser.js');
    console.log('2. Vérifiez que le serveur backend est démarré');
    console.log('3. Testez la connexion sur http://localhost:3000/admin/login');
    console.log('4. Vérifiez les logs du serveur pour les erreurs d\'authentification');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécution du script
if (require.main === module) {
  checkAuthStatus()
    .then(() => {
      console.log('✅ Vérification terminée');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = checkAuthStatus;
