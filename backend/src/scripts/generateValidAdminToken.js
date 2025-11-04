// src/scripts/generateValidAdminToken.js
// Script pour générer un token JWT valide pour l'admin
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');

async function generateValidAdminToken() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer un admin
    const admin = await Admin.findOne({ email: 'admin@genesis.com' });
    if (!admin) {
      console.log('❌ Admin non trouvé');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Générer un token admin valide
    const adminSecret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign(
      { 
        id: admin._id,
        email: admin.email,
        roles: ['admin']
      },
      adminSecret,
      { expiresIn: '30d' } // Token valide pour 30 jours
    );
    
    console.log('🔐 Token admin généré avec succès\n');
    console.log('Token (à copier dans refreshAdminToken.js):');
    console.log(token);
    console.log('\n📋 Instructions:');
    console.log('1. Copiez le token ci-dessus');
    console.log('2. Remplacez FRESH_ADMIN_TOKEN dans frontend/src/utils/refreshAdminToken.js');
    console.log('3. Redémarrez le serveur frontend');

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter
if (require.main === module) {
  generateValidAdminToken();
}

module.exports = generateValidAdminToken;

