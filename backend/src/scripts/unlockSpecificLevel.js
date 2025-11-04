#!/usr/bin/env node

/**
 * Script pour débloquer un level spécifique pour un utilisateur
 * 
 * Usage:
 *   node unlockSpecificLevel.js <levelId> [userId] [pathId] [categoryId]
 */

const mongoose = require('mongoose');
require('dotenv').config();

const LevelUnlockService = require('../services/levelUnlockService');
const Level = require('../models/Level');
const Path = require('../models/Path');
const Category = require('../models/Category');

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

async function unlockSpecificLevel(levelId, userId = DEFAULT_USER_ID, pathId = null, categoryId = null) {
  try {
    console.log(`\n🔓 Déblocage du level ${levelId}...\n`);

    // Récupérer le level pour obtenir le path et la catégorie si non fournis
    const level = await Level.findById(levelId).populate('path');
    if (!level) {
      throw new Error(`Level ${levelId} introuvable`);
    }

    console.log(`✅ Level trouvé: ${level.translations?.fr?.title || level.translations?.en?.title || 'Sans titre'}`);

    const resolvedPathId = pathId || level.path._id || level.path;
    const path = await Path.findById(resolvedPathId).populate('category');
    if (!path) {
      throw new Error(`Path ${resolvedPathId} introuvable`);
    }

    const resolvedCategoryId = categoryId || path.category._id || path.category;
    console.log(`✅ Path trouvé: ${path.translations?.fr?.name || path.translations?.en?.name || 'Sans nom'}`);
    console.log(`✅ Catégorie ID: ${resolvedCategoryId}`);

    // Débloquer le level
    await LevelUnlockService.unlockLevel(userId, resolvedCategoryId, resolvedPathId, levelId);

    console.log(`\n🎉 Level débloqué avec succès!`);
    console.log(`   - Level: ${level.translations?.fr?.title || level.translations?.en?.title || levelId}`);
    console.log(`   - Path: ${path.translations?.fr?.name || path.translations?.en?.name || resolvedPathId}`);
    console.log(`   - Utilisateur: ${userId}`);

  } catch (error) {
    console.error(`\n❌ Erreur:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: node unlockSpecificLevel.js <levelId> [userId] [pathId] [categoryId]');
    console.error('   Exemple: node unlockSpecificLevel.js 690a0abf4c12cb8f18cfad4f');
    process.exit(1);
  }

  const levelId = args[0];
  const userId = args[1] || DEFAULT_USER_ID;
  const pathId = args[2] || null;
  const categoryId = args[3] || null;

  try {
    await connectDB();
    await unlockSpecificLevel(levelId, userId, pathId, categoryId);
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

module.exports = { unlockSpecificLevel };

