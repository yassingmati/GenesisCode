/**
 * Script pour créer des plans selon catégorie
 */

const { loadEnv } = require('./load-env');
loadEnv();

require('./test-helpers');

const mongoose = require('mongoose');
const Category = require('./backend/src/models/Category');
const CategoryPlan = require('./backend/src/models/CategoryPlan');
const Plan = require('./backend/src/models/Plan');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';

/**
 * Créer des plans selon catégorie
 */
async function createPlansByCategory() {
  try {
    // Connexion à MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10
      });
      console.log('✅ Connecté à MongoDB:', mongoose.connection.db.databaseName);
    }
    
    // Récupérer toutes les catégories
    const categories = await Category.find({ active: true }).limit(10);
    console.log(`\n📋 Catégories trouvées: ${categories.length}`);
    
    if (categories.length === 0) {
      console.log('⚠️ Aucune catégorie trouvée. Création d\'une catégorie de test...');
      
      // Créer une catégorie de test
      const testCategory = new Category({
        translations: {
          fr: { name: 'Catégorie Test Plans' },
          en: { name: 'Test Plans Category' },
          ar: { name: 'فئة خطط الاختبار' }
        },
        active: true,
        order: 1
      });
      await testCategory.save();
      categories.push(testCategory);
      console.log('✅ Catégorie de test créée:', testCategory._id.toString());
    }
    
    // Créer des plans pour chaque catégorie
    for (const category of categories) {
      console.log(`\n📦 Traitement de la catégorie: ${category.translations?.fr?.name || category.translations?.en?.name || 'Sans nom'}`);
      
      // Vérifier si un plan existe déjà pour cette catégorie
      // Note: CategoryPlan a un index unique sur category, donc un seul plan par catégorie
      let categoryPlan = await CategoryPlan.findOne({ category: category._id });
      
      if (!categoryPlan) {
        // Créer un plan pour cette catégorie (gratuit par défaut)
        categoryPlan = new CategoryPlan({
          category: category._id,
          price: 0,
          currency: 'TND',
          paymentType: 'one_time',
          accessDuration: 365,
          active: true,
          translations: {
            fr: {
              name: `Plan - ${category.translations?.fr?.name || 'Catégorie'}`,
              description: `Accès à la catégorie ${category.translations?.fr?.name || 'Catégorie'}`
            },
            en: {
              name: `Plan - ${category.translations?.en?.name || 'Category'}`,
              description: `Access to ${category.translations?.en?.name || 'Category'} category`
            },
            ar: {
              name: `خطة - ${category.translations?.ar?.name || 'فئة'}`,
              description: `وصول إلى فئة ${category.translations?.ar?.name || 'فئة'}`
            }
          },
          features: ['Accès gratuit', 'Contenu de base'],
          order: 1
        });
        await categoryPlan.save();
        console.log('✅ Plan créé pour la catégorie:', categoryPlan._id.toString());
      } else {
        console.log('ℹ️ Plan existant trouvé pour la catégorie:', categoryPlan._id.toString());
        // Mettre à jour le plan existant si nécessaire
        if (categoryPlan.price === 0) {
          console.log('   Plan gratuit trouvé, possibilité de créer un plan payant via Plan général');
        }
      }
    }
    
    // Créer aussi des plans généraux (Plan) pour les abonnements
    console.log('\n📋 Création des plans généraux...');
    
    const generalPlans = [
      {
        _id: 'free',
        name: 'Plan Gratuit',
        description: 'Plan gratuit avec accès limité',
        priceMonthly: 0,
        currency: 'TND',
        interval: 'month',
        features: ['Accès gratuit', 'Contenu de base'],
        active: true
      },
      {
        _id: 'basic',
        name: 'Plan Basique',
        description: 'Plan basique avec accès standard',
        priceMonthly: 3000, // 30.00 TND
        currency: 'TND',
        interval: 'month',
        features: ['Accès standard', 'Support email'],
        active: true
      },
      {
        _id: 'pro',
        name: 'Plan Pro',
        description: 'Plan professionnel avec accès complet',
        priceMonthly: 5000, // 50.00 TND
        currency: 'TND',
        interval: 'month',
        features: ['Accès complet', 'Support prioritaire', 'Contenu premium'],
        active: true
      }
    ];
    
    for (const planData of generalPlans) {
      let plan = await Plan.findById(planData._id);
      if (!plan) {
        plan = new Plan(planData);
        await plan.save();
        console.log(`✅ Plan général créé: ${plan._id}`);
      } else {
        console.log(`ℹ️ Plan général existant: ${plan._id}`);
      }
    }
    
    console.log('\n✅ Plans créés avec succès!');
    
    // Afficher un résumé
    const allCategoryPlans = await CategoryPlan.find({ active: true });
    const allGeneralPlans = await Plan.find({ active: true });
    
    console.log('\n📊 Résumé:');
    console.log(`   Plans par catégorie: ${allCategoryPlans.length}`);
    console.log(`   Plans généraux: ${allGeneralPlans.length}`);
    
    return { categoryPlans: allCategoryPlans, generalPlans: allGeneralPlans };
  } catch (error) {
    console.error('❌ Erreur lors de la création des plans:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  createPlansByCategory()
    .then(() => {
      console.log('\n✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur lors de l\'exécution:', error);
      process.exit(1);
    });
}

module.exports = { createPlansByCategory };

