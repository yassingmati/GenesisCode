#!/usr/bin/env node

/**
 * Script pour débloquer tous les niveaux d'une catégorie pour un utilisateur
 * 
 * Usage:
 *   node unlockAllLevelsForCategory.js <categoryId> [userId]
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CategoryAccess = require('../models/CategoryAccess');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
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

async function unlockAllLevelsForCategory(categoryId, userId = DEFAULT_USER_ID) {
  try {
    console.log(`\n🔓 Déblocage de tous les niveaux de la catégorie ${categoryId}...\n`);

    // Récupérer la catégorie
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error(`Catégorie ${categoryId} introuvable`);
    }

    console.log(`✅ Catégorie trouvée: ${category.translations?.fr?.name || category.translations?.en?.name || 'Sans nom'}`);

    // Récupérer l'accès à la catégorie
    const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
    if (!categoryAccess) {
      throw new Error(`Aucun accès à la catégorie trouvé pour l'utilisateur ${userId}`);
    }

    console.log(`✅ CategoryAccess trouvé: ${categoryAccess._id}`);

    // Récupérer tous les paths de la catégorie
    const paths = await Path.find({ category: categoryId });
    console.log(`✅ Paths trouvés: ${paths.length}`);

    let totalUnlocked = 0;

    // Pour chaque path, débloquer tous les niveaux
    for (const path of paths) {
      console.log(`\n📖 Traitement du path: ${path.translations?.fr?.name || path.translations?.en?.name || path._id}`);
      
      // Récupérer tous les niveaux du path
      const levels = await Level.find({ path: path._id }).sort({ order: 1 });
      console.log(`   Niveaux trouvés: ${levels.length}`);

      for (const level of levels) {
        // Vérifier si déjà débloqué
        const isUnlocked = categoryAccess.hasUnlockedLevel(path._id, level._id);
        
        if (!isUnlocked) {
          // Débloquer le niveau
          await LevelUnlockService.unlockLevel(userId, categoryId, path._id, level._id);
          console.log(`   ✅ Level ${level.order} débloqué: ${level.translations?.fr?.title || level.translations?.en?.title || level._id}`);
          totalUnlocked++;
        } else {
          console.log(`   ⏭️  Level ${level.order} déjà débloqué: ${level.translations?.fr?.title || level.translations?.en?.title || level._id}`);
        }
      }
    }

    // Recharger l'accès pour voir le résultat final
    const updatedAccess = await CategoryAccess.findById(categoryAccess._id);
    console.log(`\n🎉 Déblocage terminé!`);
    console.log(`   - Niveaux débloqués cette session: ${totalUnlocked}`);
    console.log(`   - Total niveaux débloqués: ${updatedAccess.unlockedLevels.length}`);

    return updatedAccess;

  } catch (error) {
    console.error(`\n❌ Erreur:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: node unlockAllLevelsForCategory.js <categoryId> [userId]');
    console.error('   Exemple: node unlockAllLevelsForCategory.js 690a0abf4c12cb8f18cfad44');
    process.exit(1);
  }

  const categoryId = args[0];
  const userId = args[1] || DEFAULT_USER_ID;

  try {
    await connectDB();
    await unlockAllLevelsForCategory(categoryId, userId);
    console.log('\n🎉 Opération terminée avec succès!');
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

module.exports = { unlockAllLevelsForCategory };

