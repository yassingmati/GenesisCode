#!/usr/bin/env node

/**
 * Script pour tester et corriger l'accès aux niveaux
 * 
 * Usage:
 *   node testAndFixAccess.js <categoryId> [userId]
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CategoryAccess = require('../models/CategoryAccess');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const LevelUnlockService = require('../services/levelUnlockService');
const AccessControlService = require('../services/accessControlService');

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

async function testAndFixAccess(categoryId, userId = DEFAULT_USER_ID) {
  try {
    console.log(`\n🧪 Test de l'accès pour la catégorie ${categoryId}...\n`);

    // Récupérer la catégorie
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new Error(`Catégorie ${categoryId} introuvable`);
    }

    console.log(`✅ Catégorie: ${category.translations?.fr?.name || category.translations?.en?.name || 'Sans nom'}`);

    // Récupérer l'accès à la catégorie
    let categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
    if (!categoryAccess) {
      throw new Error(`Aucun accès à la catégorie trouvé pour l'utilisateur ${userId}`);
    }

    console.log(`✅ CategoryAccess trouvé: ${categoryAccess._id}`);
    console.log(`   Status: ${categoryAccess.status}`);
    console.log(`   Unlocked levels: ${categoryAccess.unlockedLevels.length}\n`);

    // Récupérer tous les paths de la catégorie
    const paths = await Path.find({ category: categoryId });
    console.log(`📋 Paths trouvés: ${paths.length}\n`);

    let totalErrors = 0;
    let totalFixed = 0;
    let totalOk = 0;

    // Tester l'accès pour chaque path
    for (const path of paths) {
      console.log(`\n📖 Path: ${path.translations?.fr?.name || path.translations?.en?.name || path._id}`);
      console.log(`   Path ID: ${path._id}`);
      
      // Récupérer tous les niveaux du path
      const levels = await Level.find({ path: path._id }).sort({ order: 1 });
      console.log(`   Niveaux trouvés: ${levels.length}`);

      for (const level of levels) {
        const levelTitle = level.translations?.fr?.title || level.translations?.en?.title || level._id;
        console.log(`\n   🔍 Test du level ${level.order}: ${levelTitle}`);
        console.log(`      Level ID: ${level._id}`);

        // Vérifier dans CategoryAccess
        const isUnlockedInDB = categoryAccess.hasUnlockedLevel(path._id, level._id);
        console.log(`      ✅ Débloqué dans DB: ${isUnlockedInDB ? 'OUI' : 'NON'}`);

        // Tester l'accès via AccessControlService
        try {
          const access = await AccessControlService.checkUserAccess(userId, path._id, level._id);
          const hasAccess = access.hasAccess;
          console.log(`      ✅ Accès via AccessControlService: ${hasAccess ? 'OUI' : 'NON'}`);
          console.log(`         Reason: ${access.reason || 'N/A'}`);
          console.log(`         Source: ${access.source || 'N/A'}`);

          if (!hasAccess) {
            totalErrors++;
            console.log(`      ❌ PROBLÈME DÉTECTÉ: L'accès est refusé!`);
            
            // Si le level est débloqué dans DB mais pas accessible, corriger
            if (isUnlockedInDB && !hasAccess) {
              console.log(`      🔧 Correction: Le level est débloqué dans DB mais pas accessible`);
              
              // Vider le cache
              try {
                const accessCache = require('../utils/accessCache');
                const cacheKeys = [
                  `${userId}:${path._id}:${level._id}:`,
                  `${userId}:${path._id}:${level._id}`,
                  `${userId}:${path._id}:`,
                  `${userId}:${path._id}`
                ];
                cacheKeys.forEach(key => accessCache.del(key));
                console.log(`      🗑️ Cache invalidé`);
              } catch (cacheError) {
                console.log(`      ⚠️ Erreur invalidation cache: ${cacheError.message}`);
              }

              // Re-débloquer le level pour s'assurer qu'il est bien dans DB
              try {
                await LevelUnlockService.unlockLevel(userId, categoryId, path._id, level._id);
                console.log(`      ✅ Level re-débloqué`);
                totalFixed++;
              } catch (unlockError) {
                console.log(`      ❌ Erreur re-déblocage: ${unlockError.message}`);
              }
            } else if (!isUnlockedInDB) {
              console.log(`      🔧 Correction: Le level n'est pas débloqué dans DB`);
              
              // Débloquer le level
              try {
                await LevelUnlockService.unlockLevel(userId, categoryId, path._id, level._id);
                console.log(`      ✅ Level débloqué`);
                totalFixed++;
              } catch (unlockError) {
                console.log(`      ❌ Erreur déblocage: ${unlockError.message}`);
              }
            }

            // Re-tester l'accès après correction
            console.log(`      🔄 Re-test de l'accès...`);
            const accessAfterFix = await AccessControlService.checkUserAccess(userId, path._id, level._id);
            if (accessAfterFix.hasAccess) {
              console.log(`      ✅ Accès corrigé avec succès!`);
              totalOk++;
            } else {
              console.log(`      ❌ Accès toujours refusé après correction`);
              console.log(`         Reason: ${accessAfterFix.reason || 'N/A'}`);
            }
          } else {
            totalOk++;
            console.log(`      ✅ Accès OK`);
          }
        } catch (testError) {
          totalErrors++;
          console.log(`      ❌ Erreur lors du test: ${testError.message}`);
        }
      }

      // Recharger categoryAccess pour avoir les données à jour
      categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
    }

    // Résumé final
    console.log(`\n\n📊 RÉSUMÉ DU TEST`);
    console.log(`==================`);
    console.log(`✅ Accès OK: ${totalOk}`);
    console.log(`❌ Erreurs détectées: ${totalErrors}`);
    console.log(`🔧 Problèmes corrigés: ${totalFixed}`);
    
    // Afficher les levels débloqués
    const finalAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
    console.log(`\n📋 Total niveaux débloqués: ${finalAccess.unlockedLevels.length}`);

    return {
      ok: totalOk,
      errors: totalErrors,
      fixed: totalFixed,
      totalUnlocked: finalAccess.unlockedLevels.length
    };

  } catch (error) {
    console.error(`\n❌ Erreur:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: node testAndFixAccess.js <categoryId> [userId]');
    console.error('   Exemple: node testAndFixAccess.js 690a0abf4c12cb8f18cfad44');
    process.exit(1);
  }

  const categoryId = args[0];
  const userId = args[1] || DEFAULT_USER_ID;

  try {
    await connectDB();
    const result = await testAndFixAccess(categoryId, userId);
    
    if (result.errors === 0) {
      console.log('\n🎉 Tous les tests sont passés! Aucune erreur détectée.');
    } else {
      console.log(`\n⚠️ ${result.errors} erreur(s) détectée(s), ${result.fixed} corrigée(s).`);
    }
    
    console.log('\n✅ Test terminé!');
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

module.exports = { testAndFixAccess };

