// src/scripts/seedCategoryPlans.js
// Script pour créer des plans pour chaque catégorie
const mongoose = require('mongoose');
require('dotenv').config();

// Charger les modèles
const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');

async function seedCategoryPlans() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les catégories
    const categories = await Category.find({}).lean().exec();
    console.log(`📋 ${categories.length} catégories trouvées\n`);

    if (categories.length === 0) {
      console.log('⚠️ Aucune catégorie trouvée. Veuillez d\'abord créer des catégories.');
      await mongoose.disconnect();
      return;
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Prix par défaut pour chaque catégorie (en TND)
    const defaultPrices = {
      'Programmation': 99,
      'Algorithmes': 79,
      'Web': 89,
      'Mobile': 119,
      'Data Science': 149,
      'Cybersécurité': 129,
      'IA & Machine Learning': 169,
      'DevOps': 109,
      'Base de données': 89,
      'Autre': 59
    };

    for (const category of categories) {
      try {
        // Vérifier si un plan existe déjà
        const existingPlan = await CategoryPlan.findOne({ category: category._id }).lean().exec();
        
        if (existingPlan) {
          console.log(`⏭️  Plan déjà existant pour: ${category.translations?.fr?.name || category.translations?.en?.name || 'Catégorie sans nom'}`);
          skippedCount++;
          continue;
        }

        // Déterminer le prix par défaut
        const categoryName = category.translations?.fr?.name || category.translations?.en?.name || 'Autre';
        const defaultPrice = defaultPrices[categoryName] || 79;

        // Créer un plan pour cette catégorie
        const plan = new CategoryPlan({
          category: category._id,
          price: defaultPrice,
          currency: 'TND',
          paymentType: 'one_time',
          accessDuration: 365, // 1 an
          active: true,
          translations: {
            fr: {
              name: `Accès ${category.translations?.fr?.name || categoryName}`,
              description: `Accès complet à la catégorie ${category.translations?.fr?.name || categoryName} pour une durée d'un an. Profitez de tous les contenus, exercices et ressources de cette catégorie.`
            },
            en: {
              name: `Access ${category.translations?.en?.name || categoryName}`,
              description: `Complete access to the ${category.translations?.en?.name || categoryName} category for one year. Enjoy all content, exercises and resources in this category.`
            },
            ar: {
              name: `الوصول إلى ${category.translations?.ar?.name || categoryName}`,
              description: `وصول كامل لفئة ${category.translations?.ar?.name || categoryName} لمدة سنة واحدة. استمتع بجميع المحتويات والتمارين والموارد في هذه الفئة.`
            }
          },
          features: [
            'Accès à tous les parcours de la catégorie',
            'Déblocage progressif des niveaux',
            'Contenu multilingue (FR, EN, AR)',
            'Exercices interactifs et pratiques',
            'Support technique inclus',
            'Accès à vie aux ressources téléchargées'
          ],
          order: category.order || 0
        });

        await plan.save();
        console.log(`✅ Plan créé pour: ${category.translations?.fr?.name || categoryName} (${defaultPrice} TND)`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Erreur lors de la création du plan pour ${category.translations?.fr?.name || 'catégorie'}:`, error.message);
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`   ✅ ${createdCount} plans créés`);
    console.log(`   ⏭️  ${skippedCount} plans déjà existants (ignorés)`);
    console.log(`   📝 ${updatedCount} plans mis à jour`);

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    console.log('✅ Script terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  seedCategoryPlans();
}

module.exports = seedCategoryPlans;

