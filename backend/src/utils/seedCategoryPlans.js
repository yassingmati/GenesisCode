// src/utils/seedCategoryPlans.js
const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const Category = require('../models/Category');

async function seedCategoryPlans() {
  try {
    console.log('🌱 Initialisation des plans d\'abonnement par catégorie...');

    // Récupérer toutes les catégories existantes
    const categories = await Category.find().lean();
    console.log(`📊 ${categories.length} catégories trouvées dans la base de données`);

    if (categories.length === 0) {
      console.log('❌ Aucune catégorie trouvée. Création de catégories par défaut...');
      
      // Créer des catégories par défaut si aucune n'existe
      const defaultCategories = [
        {
          translations: {
            fr: { name: 'Débutant' },
            en: { name: 'Beginner' },
            ar: { name: 'مبتدئ' }
          },
          order: 1
        },
        {
          translations: {
            fr: { name: 'Intermédiaire' },
            en: { name: 'Intermediate' },
            ar: { name: 'متوسط' }
          },
          order: 2
        },
        {
          translations: {
            fr: { name: 'Avancé' },
            en: { name: 'Advanced' },
            ar: { name: 'متقدم' }
          },
          order: 3
        }
      ];

      for (const catData of defaultCategories) {
        await Category.create(catData);
      }
      
      // Récupérer les catégories créées
      const newCategories = await Category.find().lean();
      categories.push(...newCategories);
    }

    // Supprimer tous les anciens plans
    console.log('🗑️ Suppression des anciens plans...');
    await Plan.deleteMany({});
    console.log('✅ Anciens plans supprimés');

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
      }
    ];

    // Créer un plan pour chaque catégorie
    for (const category of categories) {
      const categoryName = category.translations?.fr?.name || category.translations?.en?.name || 'Catégorie';
      
      // Plan par catégorie
      plans.push({
        _id: `category_${category._id}`,
        name: `Premium ${categoryName}`,
        description: `Accès complet aux parcours ${categoryName}`,
        priceMonthly: getCategoryPrice(categoryName),
        currency: 'TND',
        interval: 'month',
        features: [
          `Tous les parcours ${categoryName}`,
          'Exercices illimités',
          'Support communautaire',
          'Téléchargement des PDFs',
          'Certificats de completion'
        ],
        type: 'category',
        targetId: category._id,
        targetType: 'category',
        allowedCategories: [category._id],
        unlockFirstLesson: true,
        previewMode: false,
        active: true,
        sortOrder: getCategorySortOrder(categoryName)
      });
    }

    // Plan global premium
    plans.push({
      _id: 'global_premium',
      name: 'Premium Global',
      description: 'Accès complet à tous les parcours et catégories',
      priceMonthly: 4999, // 49.99 TND
      currency: 'TND',
      interval: 'month',
      features: [
        'Accès à tous les parcours',
        'Toutes les catégories',
        'Toutes les langues (FR, EN, AR)',
        'Exercices illimités',
        'Support prioritaire',
        'Téléchargement des PDFs',
        'Certificats de completion',
        'Accès aux nouvelles fonctionnalités'
      ],
      type: 'global',
      unlockFirstLesson: true,
      previewMode: false,
      active: true,
      isPopular: true,
      sortOrder: 1
    });

    // Créer les plans
    console.log('📋 Création des nouveaux plans...');
    for (const planData of plans) {
      await Plan.create(planData);
      console.log(`✅ Plan créé: ${planData.name}`);
    }

    console.log('🎉 Plans d\'abonnement par catégorie initialisés avec succès!');
    console.log(`📊 Total: ${plans.length} plans créés`);

    // Afficher le résumé
    console.log('\n📋 Résumé des plans créés:');
    const createdPlans = await Plan.find({ active: true }).sort({ sortOrder: 1 }).lean();
    createdPlans.forEach(plan => {
      const price = plan.priceMonthly ? `${(plan.priceMonthly / 100).toFixed(2)} TND` : 'Gratuit';
      console.log(`  - ${plan.name} (${plan.type}) - ${price}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des plans:', error);
    throw error;
  }
}

function getCategoryPrice(categoryName) {
  const name = categoryName.toLowerCase();
  if (name.includes('débutant') || name.includes('beginner')) return 1999; // 19.99 TND
  if (name.includes('intermédiaire') || name.includes('intermediate')) return 2999; // 29.99 TND
  if (name.includes('avancé') || name.includes('advanced')) return 3999; // 39.99 TND
  return 2499; // 24.99 TND par défaut
}

function getCategorySortOrder(categoryName) {
  const name = categoryName.toLowerCase();
  if (name.includes('débutant') || name.includes('beginner')) return 2;
  if (name.includes('intermédiaire') || name.includes('intermediate')) return 3;
  if (name.includes('avancé') || name.includes('advanced')) return 4;
  return 5;
}

// Exécuter si appelé directement
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis')
    .then(() => {
      console.log('🔗 Connecté à MongoDB');
      return seedCategoryPlans();
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

module.exports = seedCategoryPlans;
