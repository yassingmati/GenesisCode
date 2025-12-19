// src/services/levelUnlockService.js
const CategoryAccess = require('../models/CategoryAccess');
const Path = require('../models/Path');
const Level = require('../models/Level');
const UserLevelProgress = require('../models/UserLevelProgress');
const UserProgress = require('../models/UserProgress');

class LevelUnlockService {

  /**
   * Vérifie et débloque automatiquement le niveau suivant
   */
  static async checkAndUnlockNextLevel(userId, completedLevelId) {
    try {
      console.log('🔓 Vérification du déblocage du niveau suivant...', { userId, completedLevelId });

      // Récupérer le niveau complété avec son parcours
      const completedLevel = await Level.findById(completedLevelId).populate('path');
      if (!completedLevel || !completedLevel.path) {
        console.log('⚠️ Niveau ou parcours non trouvé');
        return null;
      }

      const path = completedLevel.path;
      const categoryId = path.category;

      // Vérifier si l'utilisateur a accès à cette catégorie
      const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (!categoryAccess || !categoryAccess.isActive()) {
        console.log('⚠️ Pas d\'accès à la catégorie');
        return null;
      }

      // Récupérer tous les niveaux du parcours triés par ordre
      const allLevels = await Level.find({ path: path._id }).sort({ order: 1 });

      // Trouver l'index du niveau complété
      const completedIndex = allLevels.findIndex(level => level._id.toString() === completedLevelId.toString());
      if (completedIndex === -1) {
        console.log('⚠️ Niveau complété non trouvé dans la liste');
        return null;
      }

      // Vérifier s'il y a un niveau suivant
      const nextLevel = allLevels[completedIndex + 1];
      if (!nextLevel) {
        console.log('✅ Dernier niveau du parcours complété');
        return null;
      }

      // Vérifier si le niveau suivant est déjà débloqué
      if (categoryAccess.hasUnlockedLevel(path._id, nextLevel._id)) {
        console.log('✅ Niveau suivant déjà débloqué');
        return nextLevel;
      }

      // Débloquer le niveau suivant (opération atomique)
      await CategoryAccess.updateOne(
        {
          _id: categoryAccess._id,
          status: 'active',
          'unlockedLevels.level': { $ne: nextLevel._id }
        },
        {
          $addToSet: {
            unlockedLevels: {
              path: path._id,
              level: nextLevel._id,
              unlockedAt: new Date()
            }
          }
        }
      );

      console.log('🎉 Niveau suivant débloqué:', {
        userId,
        categoryId,
        pathId: path._id,
        nextLevelId: nextLevel._id,
        nextLevelOrder: nextLevel.order
      });

      return nextLevel;

    } catch (error) {
      console.error('❌ Erreur déblocage niveau suivant:', error);
      throw error;
    }
  }

  /**
   * Débloque automatiquement le premier niveau de tous les parcours d'une catégorie
   */
  static async unlockFirstLevelsForCategory(userId, categoryId) {
    try {
      console.log('🎁 Déblocage des premiers niveaux pour la catégorie...', { userId, categoryId });

      // Récupérer tous les parcours de la catégorie
      const paths = await Path.find({ category: categoryId }).populate('levels');

      for (const path of paths) {
        if (path.levels && path.levels.length > 0) {
          // Trier les niveaux par ordre
          const sortedLevels = path.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
          const firstLevel = sortedLevels[0];

          // Débloquer le premier niveau
          await this.unlockLevel(userId, categoryId, path._id, firstLevel._id);
        }
      }

      console.log('✅ Premiers niveaux débloqués pour la catégorie');

    } catch (error) {
      console.error('❌ Erreur déblocage premiers niveaux:', error);
      throw error;
    }
  }

  /**
   * Débloque un niveau spécifique
   */
  static async unlockLevel(userId, categoryId, pathId, levelId) {
    try {
      const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (!categoryAccess) {
        throw new Error('Accès à la catégorie non trouvé');
      }

      // Débloquer le niveau (opération atomique)
      await CategoryAccess.updateOne(
        {
          _id: categoryAccess._id,
          status: 'active',
          'unlockedLevels.level': { $ne: levelId }
        },
        {
          $addToSet: {
            unlockedLevels: {
              path: pathId,
              level: levelId,
              unlockedAt: new Date()
            }
          }
        }
      );

      // Vider le cache pour cet utilisateur et ce path/level
      try {
        const accessCache = require('../utils/accessCache');
        // Invalider tous les caches pour cet utilisateur et ce path/level
        const cacheKeys = [
          `${userId}:${pathId}:${levelId}:`,
          `${userId}:${pathId}:${levelId}`,
          `${userId}:${pathId}:`,
          `${userId}:${pathId}`
        ];
        cacheKeys.forEach(key => accessCache.del(key));
        console.log('🗑️ Cache invalidé pour le level débloqué');
      } catch (cacheError) {
        console.warn('⚠️ Erreur invalidation cache:', cacheError.message);
      }

      console.log('🔓 Niveau débloqué:', {
        userId,
        categoryId,
        pathId,
        levelId
      });

      return categoryAccess;

    } catch (error) {
      console.error('❌ Erreur déblocage niveau:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur a accès à un niveau
   */
  static async checkLevelAccess(userId, categoryId, pathId, levelId) {
    try {
      // Vérifier l'accès à la catégorie
      const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (!categoryAccess || !categoryAccess.isActive()) {
        return { hasAccess: false, reason: 'no_category_access' };
      }

      // Vérifier si le niveau est débloqué
      if (categoryAccess.hasUnlockedLevel(pathId, levelId)) {
        return { hasAccess: true, accessType: 'unlocked' };
      }

      // Vérifier si c'est le premier niveau (gratuit)
      const path = await Path.findById(pathId).populate('levels');
      if (path && path.levels && path.levels.length > 0) {
        const sortedLevels = path.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
        const firstLevel = sortedLevels[0];

        if (firstLevel._id.toString() === levelId.toString()) {
          // Débloquer automatiquement le premier niveau
          await this.unlockLevel(userId, categoryId, pathId, levelId);
          return { hasAccess: true, accessType: 'free_first_level' };
        }
      }

      return { hasAccess: false, reason: 'level_not_unlocked' };

    } catch (error) {
      console.error('❌ Erreur vérification accès niveau:', error);
      return { hasAccess: false, reason: 'error' };
    }
  }

  /**
   * Récupère les niveaux débloqués pour un utilisateur dans une catégorie
   */
  static async getUnlockedLevels(userId, categoryId) {
    try {
      const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (!categoryAccess) {
        return [];
      }

      return categoryAccess.unlockedLevels;

    } catch (error) {
      console.error('❌ Erreur récupération niveaux débloqués:', error);
      return [];
    }
  }

  /**
   * Récupère le prochain niveau à débloquer pour un parcours
   */
  static async getNextLevelToUnlock(userId, categoryId, pathId) {
    try {
      const categoryAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
      if (!categoryAccess) {
        return null;
      }

      // Récupérer tous les niveaux du parcours triés par ordre
      const allLevels = await Level.find({ path: pathId }).sort({ order: 1 });

      // Trouver le premier niveau non débloqué
      for (const level of allLevels) {
        if (!categoryAccess.hasUnlockedLevel(pathId, level._id)) {
          return level;
        }
      }

      return null; // Tous les niveaux sont débloqués

    } catch (error) {
      console.error('❌ Erreur récupération prochain niveau:', error);
      return null;
    }
  }

  /**
   * Intègre avec le système de progression existant
   */
  static async onLevelCompleted(userId, levelId) {
    try {
      console.log('🎯 Niveau complété, vérification du déblocage...', { userId, levelId });

      // Débloquer le niveau suivant
      const nextLevel = await this.checkAndUnlockNextLevel(userId, levelId);

      if (nextLevel) {
        console.log('🎉 Niveau suivant débloqué automatiquement:', nextLevel._id);

        // Optionnel : envoyer une notification à l'utilisateur
        // await NotificationService.sendLevelUnlocked(userId, nextLevel);
      } else {
        // Si pas de niveau suivant, on vérifie si le parcours est terminé pour donner un badge
        await this.checkPathCompletionAndAwardBadge(userId, levelId);
      }

      return nextLevel;

    } catch (error) {
      console.error('❌ Erreur traitement niveau complété:', error);
      throw error;
    }
  }

  /**
   * Vérifie si le parcours est terminé et donne un badge
   */
  static async checkPathCompletionAndAwardBadge(userId, completedLevelId) {
    try {
      const completedLevel = await Level.findById(completedLevelId).populate('path');
      if (!completedLevel || !completedLevel.path) return;

      const path = completedLevel.path;
      const totalLevels = await Level.countDocuments({ path: path._id });
      const completedLevels = await UserLevelProgress.countDocuments({
        user: userId,
        level: { $in: await Level.find({ path: path._id }).distinct('_id') },
        completed: true
      });

      if (completedLevels >= totalLevels) {
        const User = require('../models/User'); // Lazy load to avoid circular dependency
        const badgeId = `PATH_${path._id}`;

        const user = await User.findById(userId);
        if (user && !user.badges.includes(badgeId)) {
          await User.findByIdAndUpdate(userId, { $addToSet: { badges: badgeId } });
          console.log(`🏆 Badge de parcours accordé: ${badgeId}`);
        } else {
          console.log(`ℹ️ Badge déjà acquis ou utilisateur introuvable`);
        }
      }
    } catch (err) {
      console.error('❌ Erreur badge parcours:', err);
    }
  }
}

module.exports = LevelUnlockService;







