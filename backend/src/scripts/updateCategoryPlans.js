/**
 * Script pour mettre à jour les plans de catégories avec des prix cohérents
 * Met à jour les plans existants avec des prix standardisés
 */

const mongoose = require('mongoose');
const path = require('path');
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

// Forcer l'utilisation de l'URI depuis les variables d'environnement
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI n\'est pas défini dans .env');
  console.error(`   Chemin .env: ${envPath}`);
  process.exit(1);
}

const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');

// Configuration des prix standardisés
const PRICE_CONFIG = {
  // Catégories classiques (niveaux)
  classic: {
    'débutant': { price: 0, name: 'Plan Débutant', description: 'Accès gratuit pour commencer votre parcours' },
    'beginner': { price: 0, name: 'Beginner Plan', description: 'Free access to start your journey' },
    'intermédiaire': { price: 29.99, name: 'Plan Intermédiaire', description: 'Accès complet avec support prioritaire' },
    'intermediate': { price: 29.99, name: 'Intermediate Plan', description: 'Full access with priority support' },
    'avancé': { price: 49.99, name: 'Plan Avancé', description: 'Accès premium avec mentoring' },
    'advanced': { price: 49.99, name: 'Advanced Plan', description: 'Premium access with mentoring' },
    'fondamentale': { price: 19.99, name: 'Plan Fondamental', description: 'Accès aux bases de la programmation' },
    'fondamental': { price: 19.99, name: 'Plan Fondamental', description: 'Access to programming fundamentals' }
  },
  // Catégories spécifiques (langages)
  specific: {
    'javascript': { price: 39.99, name: 'Plan JavaScript', description: 'Maîtrisez JavaScript de A à Z' },
    'python': { price: 39.99, name: 'Plan Python', description: 'Apprenez Python pour la data science et le web' },
    'java': { price: 39.99, name: 'Plan Java', description: 'Développement Java professionnel' },
    'c++': { price: 39.99, name: 'Plan C++', description: 'Programmation système en C++' },
    'react': { price: 44.99, name: 'Plan React', description: 'Développement frontend avec React' },
    'typescript': { price: 44.99, name: 'Plan TypeScript', description: 'TypeScript pour des applications robustes' },
    'node.js': { price: 44.99, name: 'Plan Node.js', description: 'Backend JavaScript avec Node.js' },
    'sql': { price: 29.99, name: 'Plan SQL', description: 'Maîtrisez les bases de données SQL' },
    'web': { price: 34.99, name: 'Plan Développement Web', description: 'Développement web complet' },
    'données': { price: 34.99, name: 'Plan Structures de Données', description: 'Algorithmes et structures de données' },
    'visuelle': { price: 24.99, name: 'Plan Programmation Visuelle', description: 'Programmation visuelle et créative' }
  },
  default: { price: 39.99, name: 'Plan Standard', description: 'Accès complet à la catégorie' }
};

// Fonctionnalités par type
const FEATURES = {
  free: [
    'Accès gratuit à tous les contenus',
    'Support communautaire',
    'Certificat de participation',
    'Exercices pratiques'
  ],
  standard: [
    'Accès complet à tous les cours',
    'Exercices pratiques',
    'Projets réels',
    'Support communautaire',
    'Certificat de completion'
  ],
  premium: [
    'Accès premium à tous les contenus',
    'Projets avancés',
    'Support prioritaire',
    'Mentoring personnalisé',
    'Certificat professionnel',
    'Accès à la communauté VIP'
  ]
};

function getPriceConfig(category) {
  const nameFr = category.translations.fr.name.toLowerCase();
  const nameEn = category.translations.en.name.toLowerCase();
  const type = category.type;

  // Chercher dans les catégories classiques
  if (type === 'classic') {
    for (const [key, config] of Object.entries(PRICE_CONFIG.classic)) {
      if (nameFr.includes(key) || nameEn.includes(key)) {
        return {
          price: config.price,
          name: config.name,
          description: config.description,
          features: config.price === 0 ? FEATURES.free : (config.price >= 40 ? FEATURES.premium : FEATURES.standard)
        };
      }
    }
  }

  // Chercher dans les catégories spécifiques
  if (type === 'specific') {
    for (const [key, config] of Object.entries(PRICE_CONFIG.specific)) {
      if (nameFr.includes(key) || nameEn.includes(key)) {
        return {
          price: config.price,
          name: config.name,
          description: config.description,
          features: FEATURES.standard
        };
      }
    }
  }

  // Par défaut
  return {
    price: PRICE_CONFIG.default.price,
    name: PRICE_CONFIG.default.name,
    description: PRICE_CONFIG.default.description,
    features: FEATURES.standard
  };
}

async function updateCategoryPlans(force = false) {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI n\'est pas défini dans .env');
      console.error(`   Vérifiez le fichier: ${envPath}`);
      process.exit(1);
    }
    console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB Atlas\n');

    // Récupérer toutes les catégories
    const categories = await Category.find({}).sort({ order: 1, 'translations.fr.name': 1 });
    console.log(`📋 ${categories.length} catégorie(s) trouvée(s)\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const results = [];

    for (const category of categories) {
      try {
        const categoryNameFr = category.translations.fr.name;
        const categoryNameEn = category.translations.en.name;
        
        // Obtenir la configuration du prix
        const config = getPriceConfig(category);

        // Vérifier si un plan existe
        let plan = await CategoryPlan.findOne({ category: category._id });

        if (plan) {
          // Mettre à jour le plan existant
          const oldPrice = plan.price;
          plan.price = config.price;
          plan.features = config.features;
          plan.active = true;
          plan.translations = {
            fr: {
              name: config.name,
              description: config.description
            },
            en: {
              name: `${categoryNameEn} Plan`,
              description: `Full access to ${categoryNameEn} category`
            },
            ar: {
              name: `خطة ${category.translations.ar.name}`,
              description: `وصول كامل لفئة ${category.translations.ar.name}`
            }
          };
          plan.order = category.order || 0;
          
          await plan.save();
          
          const priceChanged = oldPrice !== config.price;
          console.log(`🔄 Plan mis à jour: ${categoryNameFr}`);
          console.log(`   Prix: ${oldPrice} TND → ${config.price} TND ${priceChanged ? '✅' : ''}`);
          updated++;
          results.push({ category: categoryNameFr, action: 'updated', oldPrice, newPrice: config.price });
        } else {
          // Créer un nouveau plan
          plan = new CategoryPlan({
            category: category._id,
            price: config.price,
            currency: 'TND',
            paymentType: 'one_time',
            accessDuration: 365,
            active: true,
            translations: {
              fr: {
                name: config.name,
                description: config.description
              },
              en: {
                name: `${categoryNameEn} Plan`,
                description: `Full access to ${categoryNameEn} category`
              },
              ar: {
                name: `خطة ${category.translations.ar.name}`,
                description: `وصول كامل لفئة ${category.translations.ar.name}`
              }
            },
            features: config.features,
            order: category.order || 0
          });
          
          await plan.save();
          console.log(`✅ Plan créé: ${categoryNameFr} - Prix: ${config.price} TND`);
          created++;
          results.push({ category: categoryNameFr, action: 'created', price: config.price });
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${category.translations.fr.name}:`, error.message);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Plans créés: ${created}`);
    console.log(`🔄 Plans mis à jour: ${updated}`);
    console.log(`⏭️  Plans ignorés: ${skipped}`);
    console.log(`📝 Total: ${categories.length} catégories`);
    console.log('='.repeat(60) + '\n');

    // Afficher la liste complète des plans
    console.log('📋 LISTE COMPLÈTE DES PLANS:');
    console.log('-'.repeat(60));
    
    const allPlans = await CategoryPlan.find({})
      .populate('category', 'translations type order')
      .sort({ order: 1, 'category.translations.fr.name': 1 });
    
    allPlans.forEach((plan, index) => {
      const category = plan.category;
      if (!category) {
        console.log(`${index + 1}. [Catégorie supprimée] - ${plan.price} TND`);
        return;
      }
      
      const categoryName = category.translations?.fr?.name || category.translations?.en?.name || 'N/A';
      const planName = plan.translations?.fr?.name || plan.translations?.en?.name || 'Plan';
      const type = category.type === 'classic' ? '📚 Classique' : '💻 Spécifique';
      
      console.log(`${index + 1}. ${categoryName} ${type}`);
      console.log(`   Plan: ${planName}`);
      console.log(`   Prix: ${plan.price} ${plan.currency}`);
      console.log(`   Durée: ${plan.accessDuration} jours`);
      console.log(`   Fonctionnalités: ${plan.features.length}`);
      console.log(`   Statut: ${plan.active ? 'Actif ✅' : 'Inactif ❌'}`);
      console.log('');
    });
    
    console.log('-'.repeat(60) + '\n');

    return { created, updated, skipped, results };

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  const force = process.argv.includes('--force');
  
  updateCategoryPlans(force)
    .then(({ created, updated, skipped }) => {
      console.log('✅ Script terminé avec succès');
      console.log(`   Créés: ${created}, Mis à jour: ${updated}, Ignorés: ${skipped}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = updateCategoryPlans;

