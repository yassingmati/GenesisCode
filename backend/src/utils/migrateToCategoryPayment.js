// src/utils/migrateToCategoryPayment.js
const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');
const CategoryAccess = require('../models/CategoryAccess');
const Path = require('../models/Path');
const Level = require('../models/Level');
const User = require('../models/User');

class CategoryPaymentMigration {
  
  /**
   * Migre les données vers le nouveau système de paiement par catégorie
   */
  static async migrateToCategoryPayment() {
    try {
      console.log('🚀 Début de la migration vers le système de paiement par catégorie...');
      
      // 1. Créer des plans pour chaque catégorie existante
      await this.createCategoryPlans();
      
      // 2. Nettoyer les anciens accès
      await this.cleanupOldAccesses();
      
      // 3. Créer les accès gratuits pour les utilisateurs existants
      await this.createFreeAccesses();
      
      console.log('✅ Migration terminée avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }
  
  /**
   * Crée des plans pour chaque catégorie
   */
  static async createCategoryPlans() {
    try {
      console.log('📋 Création des plans de catégories...');
      
      const categories = await Category.find();
      let createdCount = 0;
      
      for (const category of categories) {
        // Vérifier si un plan existe déjà
        const existingPlan = await CategoryPlan.findOne({ category: category._id });
        if (existingPlan) {
          console.log(`⚠️ Plan déjà existant pour la catégorie ${category.translations.fr.name}`);
          continue;
        }
        
        // Créer un plan par défaut pour la catégorie
        const categoryPlan = new CategoryPlan({
          category: category._id,
          price: 0, // Gratuit par défaut
          currency: 'TND',
          paymentType: 'one_time',
          accessDuration: 365, // 1 an
          active: true,
          translations: {
            fr: {
              name: `Accès ${category.translations.fr.name}`,
              description: `Accès complet à la catégorie ${category.translations.fr.name}`
            },
            en: {
              name: `Access ${category.translations.en.name}`,
              description: `Complete access to ${category.translations.en.name} category`
            },
            ar: {
              name: `الوصول إلى ${category.translations.ar.name}`,
              description: `وصول كامل لفئة ${category.translations.ar.name}`
            }
          },
          features: [
            'Accès à tous les parcours de la catégorie',
            'Déblocage progressif des niveaux',
            'Contenu multilingue',
            'Support technique'
          ],
          order: category.order || 0
        });
        
        await categoryPlan.save();
        createdCount++;
        console.log(`✅ Plan créé pour ${category.translations.fr.name}`);
      }
      
      console.log(`📊 ${createdCount} plans de catégories créés`);
      return createdCount;
      
    } catch (error) {
      console.error('❌ Erreur création plans catégories:', error);
      throw error;
    }
  }
  
  /**
   * Nettoie les anciens accès
   */
  static async cleanupOldAccesses() {
    try {
      console.log('🧹 Nettoyage des anciens accès...');
      
      // Supprimer les anciens accès de cours
      const CourseAccess = require('../models/CourseAccess');
      const deletedAccesses = await CourseAccess.deleteMany({});
      console.log(`🗑️ ${deletedAccesses.deletedCount} anciens accès supprimés`);
      
      // Nettoyer les abonnements existants
      const User = require('../models/User');
      const users = await User.find({ 'subscription.planId': { $exists: true } });
      
      for (const user of users) {
        user.subscription = undefined;
        await user.save();
      }
      
      console.log(`👥 ${users.length} utilisateurs nettoyés`);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur nettoyage anciens accès:', error);
      throw error;
    }
  }
  
  /**
   * Crée les accès gratuits pour les utilisateurs existants
   */
  static async createFreeAccesses() {
    try {
      console.log('🎁 Création des accès gratuits...');
      
      const users = await User.find();
      const categories = await Category.find();
      let accessCount = 0;
      
      for (const user of users) {
        for (const category of categories) {
          // Vérifier si l'utilisateur a déjà accès à cette catégorie
          const existingAccess = await CategoryAccess.findOne({
            user: user._id,
            category: category._id
          });
          
          if (existingAccess) continue;
          
          // Récupérer le plan de la catégorie
          const categoryPlan = await CategoryPlan.findOne({ category: category._id });
          if (!categoryPlan) continue;
          
          // Créer l'accès gratuit
          const access = new CategoryAccess({
            user: user._id,
            category: category._id,
            categoryPlan: categoryPlan._id,
            accessType: 'free',
            status: 'active'
          });
          
          await access.save();
          accessCount++;
          
          // Débloquer le premier niveau de chaque parcours
          await this.unlockFirstLevels(user._id, category._id);
        }
      }
      
      console.log(`🎁 ${accessCount} accès gratuits créés`);
      return accessCount;
      
    } catch (error) {
      console.error('❌ Erreur création accès gratuits:', error);
      throw error;
    }
  }
  
  /**
   * Débloque le premier niveau de chaque parcours d'une catégorie
   */
  static async unlockFirstLevels(userId, categoryId) {
    try {
      const paths = await Path.find({ category: categoryId }).populate('levels');
      
      for (const path of paths) {
        if (path.levels && path.levels.length > 0) {
          // Trier les niveaux par ordre
          const sortedLevels = path.levels.sort((a, b) => (a.order || 0) - (b.order || 0));
          const firstLevel = sortedLevels[0];
          
          // Débloquer le premier niveau
          const access = await CategoryAccess.findOne({
            user: userId,
            category: categoryId
          });
          
          if (access) {
            await access.unlockLevel(path._id, firstLevel._id);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur déblocage premiers niveaux:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour les prix des plans de catégories
   */
  static async updateCategoryPrices(prices) {
    try {
      console.log('💰 Mise à jour des prix des catégories...');
      
      for (const [categoryId, price] of Object.entries(prices)) {
        const categoryPlan = await CategoryPlan.findOne({ category: categoryId });
        if (categoryPlan) {
          categoryPlan.price = price;
          await categoryPlan.save();
          console.log(`💰 Prix mis à jour pour la catégorie ${categoryId}: ${price} TND`);
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour prix:', error);
      throw error;
    }
  }
  
  /**
   * Affiche un résumé de la migration
   */
  static async getMigrationSummary() {
    try {
      const categories = await Category.countDocuments();
      const categoryPlans = await CategoryPlan.countDocuments();
      const categoryAccesses = await CategoryAccess.countDocuments();
      const users = await User.countDocuments();
      
      return {
        categories,
        categoryPlans,
        categoryAccesses,
        users,
        migrationComplete: categoryPlans === categories
      };
      
    } catch (error) {
      console.error('❌ Erreur résumé migration:', error);
      throw error;
    }
  }
}

module.exports = CategoryPaymentMigration;






