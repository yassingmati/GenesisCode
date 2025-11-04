#!/usr/bin/env node

/**
 * Script pour vérifier si un utilisateur existe
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const DEFAULT_USER_ID = '68f255f939d55ec4ff20c936';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion à la base de données établie');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    throw error;
  }
}

async function checkUser(userId = DEFAULT_USER_ID) {
  try {
    console.log(`\n🔍 Vérification de l'utilisateur ${userId}...\n`);

    // Essayer de trouver l'utilisateur
    let user = null;
    
    // Essayer comme ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
      if (user) {
        console.log(`✅ Utilisateur trouvé (ObjectId):`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        return user;
      }
    }

    // Essayer de trouver par email ou autre champ
    user = await User.findOne({
      $or: [
        { email: userId },
        { _id: userId }
      ]
    });

    if (user) {
      console.log(`✅ Utilisateur trouvé (par email/id):`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      return user;
    }

    // Lister tous les utilisateurs
    console.log(`\n❌ Utilisateur introuvable. Liste des utilisateurs disponibles:`);
    const allUsers = await User.find().limit(10).select('_id email name');
    allUsers.forEach(u => {
      console.log(`   - ID: ${u._id}, Email: ${u.email || 'N/A'}, Name: ${u.name || 'N/A'}`);
    });

    return null;

  } catch (error) {
    console.error(`❌ Erreur:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0] || DEFAULT_USER_ID;

  try {
    await connectDB();
    await checkUser(userId);
  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkUser };

