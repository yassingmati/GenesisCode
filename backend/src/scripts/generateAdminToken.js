/**
 * Script pour générer un token JWT valide pour l'utilisateur admin
 * Utilise ce script pour obtenir un token temporaire pour tester l'interface admin
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Importer le modèle User réel
const User = require('../models/User');

async function generateAdminToken() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    console.log('✅ Connecté à MongoDB');

    // Trouver l'utilisateur admin
    const adminUser = await User.findOne({ 
      email: 'admin@test.com',
      roles: { $in: ['admin'] }
    });

    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé !');
      console.log('💡 Exécutez d\'abord: node src/scripts/createAdminUser.js');
      return;
    }

    console.log('👤 Utilisateur admin trouvé:');
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   👤 Nom: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   🔑 Rôles: ${adminUser.roles.join(', ')}`);

    // Vérifier JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here';
    console.log('🔐 JWT_SECRET utilisé:', jwtSecret);

    // Générer le token avec la structure attendue par le middleware
    const token = jwt.sign(
      { 
        id: adminUser._id,  // Le middleware attend 'id', pas 'userId'
        email: adminUser.email, 
        roles: adminUser.roles,
        firebaseUid: adminUser.firebaseUid,
        isAdmin: true
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('\n🔑 Token JWT généré avec succès !');
    console.log('⏰ Expire dans: 24 heures');
    console.log('\n📋 INSTRUCTIONS:');
    console.log('1. Ouvrez les outils de développement de votre navigateur (F12)');
    console.log('2. Allez dans l\'onglet "Application" ou "Storage"');
    console.log('3. Dans "Local Storage", ajoutez/modifiez:');
    console.log('   Clé: adminToken');
    console.log('   Valeur: [COLLER LE TOKEN CI-DESSOUS]');
    console.log('\n🔑 TOKEN JWT:');
    console.log('=' .repeat(80));
    console.log(token);
    console.log('=' .repeat(80));
    
    console.log('\n🎯 ÉTAPES SUIVANTES:');
    console.log('1. Copiez le token ci-dessus');
    console.log('2. Ouvrez http://localhost:3000/admin/Subscription');
    console.log('3. Si vous voyez encore l\'erreur, collez le token dans localStorage');
    console.log('4. Rafraîchissez la page');

  } catch (error) {
    console.error('❌ Erreur lors de la génération du token:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécution du script
if (require.main === module) {
  generateAdminToken()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = generateAdminToken;
