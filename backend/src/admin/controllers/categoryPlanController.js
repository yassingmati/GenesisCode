// src/admin/controllers/categoryPlanController.js
const Plan = require('../../models/Plan');
const Category = require('../../models/Category');
const CategoryAccess = require('../../models/CategoryAccess');

class CategoryPlanController {

  /**
   * Récupère tous les plans de catégories avec leurs catégories
   * Supporte pagination et recherche
   */
  static async getAllCategoryPlans(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const skip = (page - 1) * limit;

      // Construire la requête de base
      const query = { type: 'Category' };

      // Ajouter la recherche si présente
      if (search) {
        query.$or = [
          { 'translations.fr.name': { $regex: search, $options: 'i' } },
          { 'translations.en.name': { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ];
      }

      // Récupérer le total pour la pagination
      const total = await Plan.countDocuments(query);

      // Récupérer les plans
      const plans = await Plan.find(query)
        .populate('targetId', 'translations type name') // Populate Category info
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const plansWithStats = await Promise.all(
        plans.map(async (plan) => {
          // Compter les utilisateurs avec accès actif seulement si la catégorie existe
          let activeAccessCount = 0;

          if (plan.targetId) {
            try {
              activeAccessCount = await CategoryAccess.countDocuments({
                category: plan.targetId._id || plan.targetId,
                status: 'active',
                $or: [
                  { expiresAt: { $gt: new Date() } },
                  { expiresAt: null }
                ]
              });
            } catch (err) {
              console.error('Error counting category access:', err);
              activeAccessCount = 0;
            }
          }

          return {
            ...plan,
            category: plan.targetId, // Mapper targetId vers category pour compatibilité frontend
            activeUsersCount: activeAccessCount
          };
        })
      );

      return res.json({
        success: true,
        plans: plansWithStats,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error getting category plans:', error);
      console.error('Error stack:', error.stack);
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

      const plan = await Plan.findOne({
        type: 'Category',
        targetId: categoryId
      }).populate('targetId', 'translations type name');

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
          category: plan.targetId, // Compatibilité
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
      const existingPlan = await Plan.findOne({
        type: 'Category',
        targetId: categoryId
      });

      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: 'Un plan existe déjà pour cette catégorie'
        });
      }

      // Créer le plan avec le Modèle Plan unifié
      const planId = `cat-${categoryId}-${Date.now()}`; // Générer un ID unique string
      const name = translations.fr?.name || category.name || `Plan ${categoryId}`;

      const plan = new Plan({
        _id: planId,
        name: name,
        description: translations.fr?.description || '',
        priceMonthly: parseFloat(price), // Stocker tel quel pour l'instant
        currency,
        interval: paymentType === 'monthly' ? 'month' : (paymentType === 'yearly' ? 'year' : null),
        active,
        features,

        // Champs unifiés
        type: 'Category',
        targetId: categoryId,
        translations,
        accessDuration: paymentType === 'one_time' ? accessDuration : undefined
      });

      await plan.save();
      await plan.populate('targetId', 'translations type name');

      const planObj = plan.toObject();
      planObj.category = planObj.targetId; // Compatibilité

      return res.status(201).json({
        success: true,
        message: 'Plan créé avec succès',
        plan: planObj
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

      const plan = await Plan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan non trouvé'
        });
      }

      // Mapper les champs de updateData vers le modèle Plan
      if (updateData.price) plan.priceMonthly = parseFloat(updateData.price);
      if (updateData.currency) plan.currency = updateData.currency;
      if (updateData.paymentType) {
        plan.interval = updateData.paymentType === 'monthly' ? 'month' : (updateData.paymentType === 'yearly' ? 'year' : null);
      }
      if (updateData.accessDuration) plan.accessDuration = updateData.accessDuration;
      if (updateData.active !== undefined) plan.active = updateData.active;
      if (updateData.features) plan.features = updateData.features;
      if (updateData.translations) {
        plan.translations = updateData.translations;
        // Mettre à jour les champs racine pour la compatibilité
        if (updateData.translations.fr?.name) plan.name = updateData.translations.fr.name;
        if (updateData.translations.fr?.description) plan.description = updateData.translations.fr.description;
      }

      await plan.save();
      await plan.populate('targetId', 'translations type name');

      const planObj = plan.toObject();
      planObj.category = planObj.targetId;

      return res.json({
        success: true,
        message: 'Plan mis à jour avec succès',
        plan: planObj
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

      const plan = await Plan.findById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan non trouvé'
        });
      }

      // Vérifier s'il y a des accès actifs
      const activeAccessCount = await CategoryAccess.countDocuments({
        category: plan.targetId,
        status: 'active'
      });

      if (activeAccessCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Impossible de supprimer le plan. ${activeAccessCount} utilisateur(s) ont encore accès à cette catégorie.`,
          activeUsersCount: activeAccessCount
        });
      }

      await Plan.findByIdAndDelete(id);

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
      // Pour l'instant, stats simplifiées basées sur Plan
      const plans = await Plan.find({ type: 'Category' }).lean();

      const stats = {
        totalPlans: plans.length,
        activePlans: plans.filter(p => p.active).length,
        // Active accesses calcul serait trop lourd ici sans agrégation complexe
        // Sur le frontend on utilise les compteurs individuels
      };

      return res.json({
        success: true,
        stats: stats // Retourner format attendu ou adapter frontend
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

      const plan = await Plan.findById(id);
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
