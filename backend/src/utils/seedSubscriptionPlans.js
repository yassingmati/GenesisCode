// src/utils/seedSubscriptionPlans.js
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Path = require('../models/Path');
const Category = require('../models/Category');

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Initialisation des plans d\'abonnement...');

    // Récupérer les catégories et parcours existants
    const categories = await Category.find().lean();
    const paths = await Path.find().populate('category').lean();

    const plans = [
      // Plan gratuit
      {
        _id: 'free',
        name: 'Gratuit',
        description: 'Accès à la première leçon de chaque parcours',
        priceMonthly: null,
        currency: 'TND',
        interval: null,
        features: [
          'Première leçon de chaque parcours',
          'Accès limité aux exercices',
          'Support communautaire'
        ],
        type: 'global',
        unlockFirstLesson: true,
        previewMode: true,
        active: true,
        sortOrder: 0
      },

      // Plan global
      {
        _id: 'global_premium',
        name: 'Premium Global',
        description: 'Accès complet à tous les parcours et langues',
        priceMonthly: 2999, // 29.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          'Accès à tous les parcours',
          'Toutes les langues (FR, EN, AR)',
          'Exercices illimités',
          'Support prioritaire',
          'Téléchargement des PDFs',
          'Certificats de completion'
        ],
        type: 'global',
        unlockFirstLesson: true,
        previewMode: false,
        active: true,
        isPopular: true,
        sortOrder: 1
      },

      // Plan par catégorie - Débutant
      {
        _id: 'debutant_premium',
        name: 'Premium Débutant',
        description: 'Accès complet aux parcours débutants',
        priceMonthly: 1999, // 19.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          'Tous les parcours débutants',
          'Exercices progressifs',
          'Support communautaire',
          'Téléchargement des PDFs'
        ],
        type: 'category',
        unlockFirstLesson: true,
        previewMode: false,
        active: true,
        sortOrder: 2
      },

      // Plan par catégorie - Intermédiaire
      {
        _id: 'intermediaire_premium',
        name: 'Premium Intermédiaire',
        description: 'Accès complet aux parcours intermédiaires',
        priceMonthly: 2499, // 24.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          'Tous les parcours intermédiaires',
          'Projets pratiques',
          'Support prioritaire',
          'Téléchargement des PDFs'
        ],
        type: 'category',
        unlockFirstLesson: true,
        previewMode: false,
        active: true,
        sortOrder: 3
      },

      // Plan par catégorie - Avancé
      {
        _id: 'avance_premium',
        name: 'Premium Avancé',
        description: 'Accès complet aux parcours avancés',
        priceMonthly: 3499, // 34.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          'Tous les parcours avancés',
          'Projets complexes',
          'Support expert',
          'Téléchargement des PDFs',
          'Certificats avancés'
        ],
        type: 'category',
        unlockFirstLesson: true,
        previewMode: false,
        active: true,
        sortOrder: 4
      }
    ];

    // Ajouter des plans par parcours spécifiques
    for (const path of paths) {
      const categoryName = path.category?.translations?.fr?.name || 'Parcours';
      const pathName = path.translations?.fr?.name || 'Parcours';
      
      plans.push({
        _id: `path_${path._id}`,
        name: `Premium ${pathName}`,
        description: `Accès complet au parcours ${pathName}`,
        priceMonthly: 999, // 9.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          `Accès complet au parcours ${pathName}`,
          'Tous les exercices',
          'Support communautaire',
          'Téléchargement des PDFs'
        ],
        type: 'path',
        targetId: path._id,
        targetType: 'path',
        allowedPaths: [path._id],
        unlockFirstLesson: true,
        previewMode: false,
        active: true,
        sortOrder: 10 + plans.length
      });
    }

    // Ajouter des plans par langue
    const languages = ['fr', 'en', 'ar'];
    for (const lang of languages) {
      const langName = lang === 'fr' ? 'Français' : lang === 'en' ? 'English' : 'العربية';
      
      plans.push({
        _id: `lang_${lang}`,
        name: `Premium ${langName}`,
        description: `Accès complet en ${langName}`,
        priceMonthly: 1499, // 14.99 TND
        currency: 'TND',
        interval: 'month',
        features: [
          `Tous les parcours en ${langName}`,
          'Exercices dans cette langue',
          'Support communautaire',
          'Téléchargement des PDFs'
        ],
        type: 'language',
        allowedLanguages: [lang],
        unlockFirstLesson: true,
        previewMode: false,
        active: true,
        sortOrder: 20 + plans.length
      });
    }

    // Supprimer les plans existants
    await Plan.deleteMany({});
    console.log('🗑️ Anciens plans supprimés');

    // Créer les nouveaux plans
    for (const planData of plans) {
      // Associer les catégories aux plans par catégorie
      if (planData.type === 'category') {
        const category = categories.find(cat => {
          const name = cat.translations?.fr?.name?.toLowerCase() || '';
          if (planData._id.includes('debutant')) return name.includes('débutant') || name.includes('débutant');
          if (planData._id.includes('intermediaire')) return name.includes('intermédiaire') || name.includes('intermediaire');
          if (planData._id.includes('avance')) return name.includes('avancé') || name.includes('avance');
          return false;
        });
        
        if (category) {
          planData.targetId = category._id;
          planData.allowedCategories = [category._id];
        }
      }

      await Plan.create(planData);
      console.log(`✅ Plan créé: ${planData.name}`);
    }

    console.log('🎉 Plans d\'abonnement initialisés avec succès!');
    console.log(`📊 Total: ${plans.length} plans créés`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des plans:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis')
    .then(() => {
      console.log('🔗 Connecté à MongoDB');
      return seedSubscriptionPlans();
    })
    .then(() => {
      console.log('✅ Initialisation terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = seedSubscriptionPlans;
