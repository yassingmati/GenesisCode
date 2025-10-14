// src/admin/controllers/categoryPlanController.js
const CategoryPlan = require('../../models/CategoryPlan');
const Category = require('../../models/Category');
const CategoryAccess = require('../../models/CategoryAccess');

class CategoryPlanController {
  
  /**
   * Récupère tous les plans de catégories avec leurs catégories
   */
  static async getAllCategoryPlans(req, res) {
    try {
      const plans = await CategoryPlan.find()
        .populate('category', 'translations type')
        .sort({ order: 1, createdAt: -1 });
      
      const plansWithStats = await Promise.all(
        plans.map(async (plan) => {
          // Compter les utilisateurs avec accès actif
          const activeAccessCount = await CategoryAccess.countDocuments({
            category: plan.category._id,
            status: 'active',
            $or: [
              { expiresAt: { $gt: new Date() } },
              { expiresAt: null }
            ]
          });
          
          return {
            ...plan.toObject(),
            activeUsersCount: activeAccessCount
          };
        })
      );
      
      return res.json({
        success: true,
        plans: plansWithStats
      });
      
    } catch (error) {
      console.error('Error getting category plans:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des plans',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Récupère le plan d'une catégorie spécifique
   */
  static async getCategoryPlan(req, res) {
    try {
      const { categoryId } = req.params;
      
      const plan = await CategoryPlan.findOne({ category: categoryId })
        .populate('category', 'translations type');
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan de catégorie non trouvé'
        });
      }
      
      // Compter les utilisateurs avec accès actif
      const activeAccessCount = await CategoryAccess.countDocuments({
        category: categoryId,
        status: 'active',
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: null }
        ]
      });
      
      return res.json({
        success: true,
        plan: {
          ...plan.toObject(),
          activeUsersCount: activeAccessCount
        }
      });
      
    } catch (error) {
      console.error('Error getting category plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Crée un nouveau plan pour une catégorie
   */
  static async createCategoryPlan(req, res) {
    try {
      const {
        categoryId,
        price,
        currency = 'TND',
        paymentType = 'one_time',
        accessDuration = 365,
        active = true,
        translations = {},
        features = [],
        order = 0
      } = req.body;
      
      // Vérifier que la catégorie existe
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
      
      // Vérifier qu'il n'y a pas déjà un plan pour cette catégorie
      const existingPlan = await CategoryPlan.findOne({ category: categoryId });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'Un plan existe déjà pour cette catégorie'
        });
      }
      
      // Créer le plan
      const plan = new CategoryPlan({
        category: categoryId,
        price,
        currency,
        paymentType,
        accessDuration,
        active,
        translations,
        features,
        order
      });
      
      await plan.save();
      await plan.populate('category', 'translations type');
      
      return res.status(201).json({
        success: true,
        message: 'Plan créé avec succès',
        plan: plan
      });
      
    } catch (error) {
      console.error('Error creating category plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Met à jour un plan de catégorie
   */
  static async updateCategoryPlan(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const plan = await CategoryPlan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan non trouvé'
        });
      }
      
      // Mettre à jour le plan
      Object.assign(plan, updateData);
      await plan.save();
      await plan.populate('category', 'translations type');
      
      return res.json({
        success: true,
        message: 'Plan mis à jour avec succès',
        plan: plan
      });
      
    } catch (error) {
      console.error('Error updating category plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Supprime un plan de catégorie
   */
  static async deleteCategoryPlan(req, res) {
    try {
      const { id } = req.params;
      
      const plan = await CategoryPlan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan non trouvé'
        });
      }
      
      // Vérifier s'il y a des accès actifs
      const activeAccessCount = await CategoryAccess.countDocuments({
        category: plan.category,
        status: 'active'
      });
      
      if (activeAccessCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Impossible de supprimer le plan. ${activeAccessCount} utilisateur(s) ont encore accès à cette catégorie.`,
          activeUsersCount: activeAccessCount
        });
      }
      
      await CategoryPlan.findByIdAndDelete(id);
      
      return res.json({
        success: true,
        message: 'Plan supprimé avec succès'
      });
      
    } catch (error) {
      console.error('Error deleting category plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du plan',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Récupère les statistiques des plans
   */
  static async getCategoryPlanStats(req, res) {
    try {
      const stats = await CategoryPlan.aggregate([
        {
          $lookup: {
            from: 'categoryaccesses',
            localField: 'category',
            foreignField: 'category',
            as: 'accesses'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        {
          $project: {
            category: 1,
            price: 1,
            currency: 1,
            paymentType: 1,
            active: 1,
            categoryName: { $arrayElemAt: ['$categoryInfo.translations.fr.name', 0] },
            totalAccesses: { $size: '$accesses' },
            activeAccesses: {
              $size: {
                $filter: {
                  input: '$accesses',
                  cond: {
                    $and: [
                      { $eq: ['$$this.status', 'active'] },
                      {
                        $or: [
                          { $gt: ['$$this.expiresAt', new Date()] },
                          { $eq: ['$$this.expiresAt', null] }
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        {
          $sort: { activeAccesses: -1 }
        }
      ]);
      
      return res.json({
        success: true,
        stats: stats
      });
      
    } catch (error) {
      console.error('Error getting category plan stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Active/Désactive un plan
   */
  static async toggleCategoryPlanStatus(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      
      const plan = await CategoryPlan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan non trouvé'
        });
      }
      
      plan.active = active;
      await plan.save();
      
      return res.json({
        success: true,
        message: `Plan ${active ? 'activé' : 'désactivé'} avec succès`,
        plan: plan
      });
      
    } catch (error) {
      console.error('Error toggling category plan status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du changement de statut',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = CategoryPlanController;


