#!/usr/bin/env node

/**
 * Script pour vérifier et corriger l'accès à un level
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CategoryAccess = require('../models/CategoryAccess');
const Level = require('../models/Level');
const Path = require('../models/Path');

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

async function verifyAndFixAccess(levelId, userId = DEFAULT_USER_ID) {
  try {
    console.log(`\n🔍 Vérification de l'accès au level ${levelId}...\n`);

    // Récupérer le level
    const level = await Level.findById(levelId).populate('path');
    if (!level) {
      throw new Error(`Level ${levelId} introuvable`);
    }

    const pathId = level.path._id || level.path;
    const categoryId = level.path.category;

    console.log(`✅ Level trouvé: ${level.translations?.fr?.title || level.translations?.en?.title || 'Sans titre'}`);
    console.log(`   Path ID: ${pathId}`);
    console.log(`   Category ID: ${categoryId}`);

    // Récupérer l'accès à la catégorie
    const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
    
    if (!categoryAccess) {
      throw new Error(`Aucun accès à la catégorie trouvé pour l'utilisateur ${userId}`);
    }

    console.log(`✅ CategoryAccess trouvé: ${categoryAccess._id}`);
    console.log(`   Status: ${categoryAccess.status}`);
    console.log(`   Unlocked levels: ${categoryAccess.unlockedLevels.length}`);

    // Vérifier si le level est débloqué
    const isUnlocked = categoryAccess.hasUnlockedLevel(pathId, levelId);
    console.log(`\n🔓 Level débloqué: ${isUnlocked ? '✅ OUI' : '❌ NON'}`);

    if (!isUnlocked) {
      console.log(`\n🔧 Correction de l'accès...`);
      
      // Vérifier les types - s'assurer que pathId et levelId sont des ObjectIds
      const pathObjectId = mongoose.Types.ObjectId.isValid(pathId) 
        ? (typeof pathId === 'string' ? new mongoose.Types.ObjectId(pathId) : pathId)
        : pathId;
      
      const levelObjectId = mongoose.Types.ObjectId.isValid(levelId)
        ? (typeof levelId === 'string' ? new mongoose.Types.ObjectId(levelId) : levelId)
        : levelId;

      // Ajouter le level à unlockedLevels
      const existingUnlock = categoryAccess.unlockedLevels.find(
        unlock => unlock.path.toString() === pathObjectId.toString() && 
                  unlock.level.toString() === levelObjectId.toString()
      );

      if (!existingUnlock) {
        categoryAccess.unlockedLevels.push({
          path: pathObjectId,
          level: levelObjectId,
          unlockedAt: new Date()
        });
        await categoryAccess.save();
        console.log(`✅ Level ajouté à unlockedLevels`);
      } else {
        console.log(`⚠️  Level déjà dans unlockedLevels mais hasUnlockedLevel retourne false`);
        console.log(`   Vérification des types...`);
        console.log(`   Existing unlock path: ${existingUnlock.path} (type: ${typeof existingUnlock.path})`);
        console.log(`   Existing unlock level: ${existingUnlock.level} (type: ${typeof existingUnlock.level})`);
        console.log(`   Path ID: ${pathObjectId} (type: ${typeof pathObjectId})`);
        console.log(`   Level ID: ${levelObjectId} (type: ${typeof levelObjectId})`);
        
        // Forcer le rechargement depuis la base de données
        await categoryAccess.save();
        const reloaded = await CategoryAccess.findById(categoryAccess._id);
        const isUnlockedAfterReload = reloaded.hasUnlockedLevel(pathObjectId, levelObjectId);
        console.log(`   Après rechargement: ${isUnlockedAfterReload ? '✅ OUI' : '❌ NON'}`);
      }
    } else {
      console.log(`\n✅ Le level est déjà débloqué`);
    }

    // Afficher tous les levels débloqués pour ce path
    console.log(`\n📋 Levels débloqués pour ce path:`);
    const pathUnlocks = categoryAccess.unlockedLevels.filter(
      unlock => unlock.path.toString() === pathId.toString()
    );
    pathUnlocks.forEach(unlock => {
      console.log(`   - Level: ${unlock.level}, Débloqué le: ${unlock.unlockedAt}`);
    });

  } catch (error) {
    console.error(`\n❌ Erreur:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: node verifyAndFixLevelAccess.js <levelId> [userId]');
    console.error('   Exemple: node verifyAndFixLevelAccess.js 690a0abf4c12cb8f18cfad4f');
    process.exit(1);
  }

  const levelId = args[0];
  const userId = args[1] || DEFAULT_USER_ID;

  try {
    await connectDB();
    await verifyAndFixAccess(levelId, userId);
    console.log('\n🎉 Vérification terminée!');
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

module.exports = { verifyAndFixAccess };

