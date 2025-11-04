#!/usr/bin/env node

/**
 * Migration script pour le système de déblocage séquentiel des niveaux
 * 
 * Ce script migre les données existantes pour implémenter le nouveau système :
 * - Seul le premier niveau du premier parcours est débloqué par défaut
 * - Les autres niveaux sont débloqués séquentiellement après complétion
 * - Préserve la progression existante des utilisateurs
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const CategoryAccess = require('../models/CategoryAccess');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const UserLevelProgress = require('../models/UserLevelProgress');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

// Import du service de déblocage
const LevelUnlockService = require('../services/levelUnlockService');

class SequentialUnlockMigration {
  
  constructor() {
    this.stats = {
      usersProcessed: 0,
      categoriesProcessed: 0,
      levelsUnlocked: 0,
      levelsLocked: 0,
      errors: 0
    };
  }

  /**
   * Connexion à la base de données
   */
  async connect() {
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

  /**
   * Déconnexion de la base de données
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('✅ Déconnexion de la base de données');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    }
  }

  /**
   * Sauvegarde de l'état avant migration
   */
  async createBackup() {
    try {
      console.log('📦 Création de la sauvegarde...');
      
      const backup = {
        timestamp: new Date(),
        categoryAccesses: await CategoryAccess.find().lean(),
        userLevelProgress: await UserLevelProgress.find().lean()
      };
      
      // Sauvegarder dans un fichier JSON
      const fs = require('fs');
      const backupPath = `backup_sequential_unlock_${Date.now()}.json`;
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
      
      console.log(`✅ Sauvegarde créée: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Erreur création sauvegarde:', error);
      throw error;
    }
  }

  /**
   * Migration principale
   */
  async migrate() {
    try {
      console.log('🚀 Début de la migration du système de déblocage séquentiel...');
      
      // Créer une sauvegarde
      const backupPath = await this.createBackup();
      
      // Récupérer tous les accès de catégories
      const categoryAccesses = await CategoryAccess.find()
        .populate('user category')
        .lean();
      
      console.log(`📊 ${categoryAccesses.length} accès de catégories trouvés`);
      
      for (const access of categoryAccesses) {
        await this.migrateUserCategoryAccess(access);
        this.stats.usersProcessed++;
      }
      
      console.log('✅ Migration terminée avec succès !');
      this.printStats();
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }

  /**
   * Migre l'accès d'un utilisateur pour une catégorie
   */
  async migrateUserCategoryAccess(access) {
    try {
      console.log(`👤 Migration utilisateur ${access.user} - Catégorie ${access.category}`);
      
      // 1. Sauvegarder l'état actuel des niveaux débloqués
      const currentUnlockedLevels = [...(access.unlockedLevels || [])];
      
      // 2. Vider les niveaux débloqués
      await CategoryAccess.updateOne(
        { _id: access._id },
        { $set: { unlockedLevels: [] } }
      );
      
      // 3. Trouver le premier parcours de la catégorie
      const firstPath = await Path.findOne({ category: access.category })
        .populate('levels')
        .sort({ order: 1 });
      
      if (!firstPath || !firstPath.levels || firstPath.levels.length === 0) {
        console.log(`⚠️ Aucun parcours/niveau trouvé pour la catégorie ${access.category}`);
        return;
      }
      
      // 4. Trier les niveaux et prendre le premier
      const sortedLevels = firstPath.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
      const firstLevel = sortedLevels[0];
      
      // 5. Débloquer le premier niveau
      await LevelUnlockService.unlockLevel(
        access.user,
        access.category,
        firstPath._id,
        firstLevel._id
      );
      
      this.stats.levelsUnlocked++;
      console.log(`🔓 Premier niveau débloqué: ${firstLevel._id}`);
      
      // 6. Restaurer la progression séquentielle basée sur UserLevelProgress
      await this.restoreSequentialProgress(access.user, access.category, firstPath._id);
      
      this.stats.categoriesProcessed++;
      
    } catch (error) {
      console.error(`❌ Erreur migration accès ${access._id}:`, error);
      this.stats.errors++;
    }
  }

  /**
   * Restaure la progression séquentielle basée sur les niveaux complétés
   */
  async restoreSequentialProgress(userId, categoryId, firstPathId) {
    try {
      // Récupérer tous les parcours de la catégorie
      const paths = await Path.find({ category: categoryId })
        .populate('levels')
        .sort({ order: 1 });
      
      for (const path of paths) {
        if (!path.levels || path.levels.length === 0) continue;
        
        // Trier les niveaux par ordre
        const sortedLevels = path.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Vérifier la progression séquentielle
        let lastCompletedIndex = -1;
        
        for (let i = 0; i < sortedLevels.length; i++) {
          const level = sortedLevels[i];
          
          // Vérifier si ce niveau est complété
          const isCompleted = await UserLevelProgress.findOne({
            user: userId,
            level: level._id,
            completed: true
          });
          
          if (isCompleted) {
            // Débloquer ce niveau s'il n'est pas déjà débloqué
            const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
            if (categoryAccess && !categoryAccess.hasUnlockedLevel(path._id, level._id)) {
              await LevelUnlockService.unlockLevel(userId, categoryId, path._id, level._id);
              this.stats.levelsUnlocked++;
              console.log(`🔓 Niveau complété débloqué: ${level._id}`);
            }
            
            lastCompletedIndex = i;
          } else {
            // Si ce niveau n'est pas complété, débloquer le suivant si le précédent est complété
            if (lastCompletedIndex === i - 1) {
              const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
              if (categoryAccess && !categoryAccess.hasUnlockedLevel(path._id, level._id)) {
                await LevelUnlockService.unlockLevel(userId, categoryId, path._id, level._id);
                this.stats.levelsUnlocked++;
                console.log(`🔓 Niveau suivant débloqué: ${level._id}`);
                break; // Arrêter après avoir débloqué le premier niveau non complété
              }
            } else {
              // Il y a un gap dans la progression, arrêter ici
              break;
            }
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur restauration progression séquentielle:', error);
      throw error;
    }
  }

  /**
   * Validation post-migration
   */
  async validate() {
    try {
      console.log('🔍 Validation de la migration...');
      
      const categoryAccesses = await CategoryAccess.find().populate('category');
      let validationErrors = 0;
      
      for (const access of categoryAccesses) {
        // Vérifier que chaque utilisateur a au moins le premier niveau débloqué
        const paths = await Path.find({ category: access.category._id })
          .populate('levels')
          .sort({ order: 1 });
        
        if (paths.length > 0) {
          const firstPath = paths[0];
          const sortedLevels = firstPath.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          if (sortedLevels.length > 0) {
            const firstLevel = sortedLevels[0];
            const hasFirstLevel = access.unlockedLevels.some(
              unlock => unlock.path.toString() === firstPath._id.toString() && 
                        unlock.level.toString() === firstLevel._id.toString()
            );
            
            if (!hasFirstLevel) {
              console.error(`❌ Utilisateur ${access.user} n'a pas le premier niveau débloqué pour ${access.category._id}`);
              validationErrors++;
            }
          }
        }
      }
      
      if (validationErrors === 0) {
        console.log('✅ Validation réussie - Tous les utilisateurs ont le premier niveau débloqué');
      } else {
        console.error(`❌ ${validationErrors} erreurs de validation trouvées`);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      throw error;
    }
  }

  /**
   * Affiche les statistiques de migration
   */
  printStats() {
    console.log('\n📊 Statistiques de migration:');
    console.log(`👥 Utilisateurs traités: ${this.stats.usersProcessed}`);
    console.log(`📚 Catégories traitées: ${this.stats.categoriesProcessed}`);
    console.log(`🔓 Niveaux débloqués: ${this.stats.levelsUnlocked}`);
    console.log(`🔒 Niveaux verrouillés: ${this.stats.levelsLocked}`);
    console.log(`❌ Erreurs: ${this.stats.errors}`);
  }

  /**
   * Rollback en cas d'erreur
   */
  async rollback(backupPath) {
    try {
      console.log('🔄 Rollback de la migration...');
      
      const fs = require('fs');
      const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      // Restaurer CategoryAccess
      for (const access of backup.categoryAccesses) {
        await CategoryAccess.updateOne(
          { _id: access._id },
          { $set: { unlockedLevels: access.unlockedLevels } }
        );
      }
      
      console.log('✅ Rollback terminé');
    } catch (error) {
      console.error('❌ Erreur lors du rollback:', error);
      throw error;
    }
  }
}

// Exécution du script
async function main() {
  const migration = new SequentialUnlockMigration();
  
  try {
    await migration.connect();
    
    // Vérifier les arguments de ligne de commande
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const validateOnly = args.includes('--validate');
    
    if (validateOnly) {
      await migration.validate();
    } else if (dryRun) {
      console.log('🧪 Mode dry-run - Aucune modification ne sera effectuée');
      // Ici on pourrait implémenter une simulation
    } else {
      await migration.migrate();
      await migration.validate();
    }
    
  } catch (error) {
    console.error('💥 Migration échouée:', error);
    process.exit(1);
  } finally {
    await migration.disconnect();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  main();
}

module.exports = SequentialUnlockMigration;
