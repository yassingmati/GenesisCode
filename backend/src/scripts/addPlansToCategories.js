/**
 * Script pour ajouter des plans à toutes les catégories
 * Crée un plan pour chaque catégorie existante dans la base de données
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');

// Configuration des prix par type de catégorie
const PRICE_CONFIG = {
  classic: {
    'Débutant': { price: 0, features: ['Accès complet', 'Support communautaire'] },
    'Intermediate': { price: 29.99, features: ['Accès complet', 'Support prioritaire', 'Certificat'] },
    'Advanced': { price: 49.99, features: ['Accès complet', 'Support prioritaire', 'Certificat', 'Projets avancés'] }
  },
  specific: {
    default: { price: 39.99, features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels'] }
  }
};

async function addPlansToCategories() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les catégories
    const categories = await Category.find({}).sort({ order: 1 });
    console.log(`📋 ${categories.length} catégorie(s) trouvée(s)\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const category of categories) {
      try {
        // Vérifier si un plan existe déjà pour cette catégorie
        const existingPlan = await CategoryPlan.findOne({ category: category._id });

        if (existingPlan) {
          console.log(`⏭️  Plan existe déjà pour: ${category.translations.fr.name} (${category.translations.en.name})`);
          skipped++;
          continue;
        }

        // Déterminer le prix et les fonctionnalités
        let price = PRICE_CONFIG.specific.default.price;
        let features = [...PRICE_CONFIG.specific.default.features];
        const categoryNameFr = category.translations.fr.name;
        const categoryNameEn = category.translations.en.name;

        if (category.type === 'classic') {
          // Prix pour les catégories classiques
          if (PRICE_CONFIG.classic[categoryNameFr]) {
            price = PRICE_CONFIG.classic[categoryNameFr].price;
            features = PRICE_CONFIG.classic[categoryNameFr].features;
          } else if (PRICE_CONFIG.classic[categoryNameEn]) {
            price = PRICE_CONFIG.classic[categoryNameEn].price;
            features = PRICE_CONFIG.classic[categoryNameEn].features;
          }
        } else {
          // Pour les catégories spécifiques, ajuster le prix selon le langage
          price = PRICE_CONFIG.specific.default.price;
          features = [
            `Accès complet à ${categoryNameFr}`,
            'Exercices pratiques',
            'Projets réels',
            'Support communautaire'
          ];
        }

        // Créer le plan
        const plan = new CategoryPlan({
          category: category._id,
          price: price,
          currency: 'TND',
          paymentType: price === 0 ? 'one_time' : 'one_time',
          accessDuration: 365, // 1 an
          active: true,
          translations: {
            fr: {
              name: `Plan ${categoryNameFr}`,
              description: `Accès complet à tous les cours de la catégorie ${categoryNameFr}`
            },
            en: {
              name: `${categoryNameEn} Plan`,
              description: `Full access to all courses in the ${categoryNameEn} category`
            },
            ar: {
              name: `خطة ${category.translations.ar.name}`,
              description: `وصول كامل لجميع الدورات في فئة ${category.translations.ar.name}`
            }
          },
          features: features,
          order: category.order || 0
        });

        await plan.save();
        console.log(`✅ Plan créé pour: ${categoryNameFr} (${categoryNameEn}) - Prix: ${price} TND`);
        created++;
      } catch (error) {
        console.error(`❌ Erreur lors de la création du plan pour ${category.translations.fr.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Plans créés: ${created}`);
    console.log(`⏭️  Plans ignorés (existent déjà): ${skipped}`);
    console.log(`📝 Total de catégories: ${categories.length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  addPlansToCategories()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = addPlansToCategories;


