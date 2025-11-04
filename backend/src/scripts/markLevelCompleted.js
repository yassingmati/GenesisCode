#!/usr/bin/env node

/**
 * Script pour marquer un level comme terminé
 * 
 * Usage:
 *   node markLevelCompleted.js <levelId> [userId]
 * 
 * Exemple:
 *   node markLevelCompleted.js 690a0abf4c12cb8f18cfad48
 *   node markLevelCompleted.js 690a0abf4c12cb8f18cfad48 68f255f939d55ec4ff20c936
 */

const mongoose = require('mongoose');
require('dotenv').config();

const UserLevelProgress = require('../models/UserLevelProgress');
const Level = require('../models/Level');
const User = require('../models/User');
const LevelUnlockService = require('../services/levelUnlockService');

// ID utilisateur par défaut (utilisateur de test)
const DEFAULT_USER_ID = '68f255f939d55ec4ff20c936';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion à la base de données établie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Déconnexion de la base de données');
  } catch (error) {
    console.error('❌ Erreur de déconnexion:', error);
  }
}

async function markLevelCompleted(levelId, userId = DEFAULT_USER_ID) {
  try {
    console.log(`\n🎯 Marquage du level ${levelId} comme terminé pour l'utilisateur ${userId}...\n`);

    // Vérifier que le level existe
    const level = await Level.findById(levelId);
    if (!level) {
      throw new Error(`Level ${levelId} introuvable`);
    }
    console.log(`✅ Level trouvé: ${level.translations?.fr?.title || level.translations?.en?.title || 'Sans titre'}`);

    // Convertir userId en ObjectId si nécessaire
    const crypto = require('crypto');
    
    let userObjectId;
    if (mongoose.isValidObjectId(userId)) {
      userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    } else {
      // Créer un ObjectId déterministe à partir du userId string
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    }

    // Vérifier que l'utilisateur existe (si c'est un ObjectId valide)
    if (mongoose.isValidObjectId(userId)) {
      const user = await User.findById(userObjectId);
      if (user) {
        console.log(`✅ Utilisateur trouvé: ${user.email || user.name || userId}`);
      } else {
        console.log(`⚠️  Utilisateur ${userId} introuvable, mais le progrès sera créé quand même`);
      }
    }

    // Marquer le level comme complété
    const progress = await UserLevelProgress.findOneAndUpdate(
      { user: userObjectId, level: levelId },
      { 
        completed: true, 
        completedAt: new Date(),
        $inc: { xp: 50 } // Bonus XP pour compléter un niveau
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`\n✅ Level marqué comme terminé avec succès!`);
    console.log(`   - Progress ID: ${progress._id}`);
    console.log(`   - Completed: ${progress.completed}`);
    console.log(`   - Completed At: ${progress.completedAt}`);
    console.log(`   - XP: ${progress.xp || 50}`);

    // Débloquer automatiquement le niveau suivant
    try {
      console.log(`\n🔓 Déblocage du niveau suivant...`);
      const nextLevel = await LevelUnlockService.onLevelCompleted(userId, levelId);
      
      if (nextLevel) {
        console.log(`✅ Niveau suivant débloqué automatiquement: ${nextLevel._id}`);
      } else {
        console.log(`ℹ️  Aucun niveau suivant à débloquer`);
      }
    } catch (unlockError) {
      console.error(`⚠️  Erreur lors du déblocage du niveau suivant:`, unlockError.message);
    }

    return progress;

  } catch (error) {
    console.error(`\n❌ Erreur lors du marquage du level:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: node markLevelCompleted.js <levelId> [userId]');
    console.error('   Exemple: node markLevelCompleted.js 690a0abf4c12cb8f18cfad48');
    process.exit(1);
  }

  const levelId = args[0];
  const userId = args[1] || DEFAULT_USER_ID;

  try {
    await connectDB();
    await markLevelCompleted(levelId, userId);
    console.log('\n🎉 Opération terminée avec succès!');
  } catch (error) {
    console.error('\n💥 Erreur:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  main();
}

module.exports = { markLevelCompleted };

