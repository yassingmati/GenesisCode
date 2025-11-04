#!/usr/bin/env node

/**
 * Script pour débloquer les premiers niveaux d'une catégorie pour un utilisateur
 * 
 * Usage:
 *   node unlockFirstLevelsForCategory.js <categoryId> [userId]
 */

const mongoose = require('mongoose');
require('dotenv').config();

const LevelUnlockService = require('../services/levelUnlockService');

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

async function unlockFirstLevels(categoryId, userId = DEFAULT_USER_ID) {
  try {
    console.log(`\n🔓 Déblocage des premiers niveaux pour la catégorie ${categoryId}...\n`);
    
    await LevelUnlockService.unlockFirstLevelsForCategory(userId, categoryId);
    
    console.log(`✅ Premiers niveaux débloqués avec succès!`);
    
  } catch (error) {
    console.error(`❌ Erreur:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: node unlockFirstLevelsForCategory.js <categoryId> [userId]');
    process.exit(1);
  }

  const categoryId = args[0];
  const userId = args[1] || DEFAULT_USER_ID;

  try {
    await connectDB();
    await unlockFirstLevels(categoryId, userId);
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

module.exports = { unlockFirstLevels };

