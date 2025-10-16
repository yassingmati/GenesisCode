// src/utils/seedCategoryPlans.js
const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');

class CategoryPlanSeeder {
  
  /**
   * Crée des plans de catégories avec des prix spécifiques
   */
  static async seedCategoryPlans() {
    try {
      console.log('🌱 Création des plans de catégories...');
      // S'assurer que toutes les catégories ont un type par défaut
      const backfill = await Category.updateMany(
        { $or: [ { type: { $exists: false } }, { type: null } ] },
        { $set: { type: 'classic' } }
      );
      const matched = backfill.matchedCount ?? backfill.n ?? 0;
      const modified = backfill.modifiedCount ?? backfill.nModified ?? 0;
      if (modified > 0) {
        console.log(`🛠️ Backfill Category.type -> classic (matched=${matched}, modified=${modified})`);
      }
      
      const categories = await Category.find();
      const plans = [];
      
      for (const category of categories) {
        // Vérifier si un plan existe déjà
        const existingPlan = await CategoryPlan.findOne({ category: category._id });
        if (existingPlan) {
          console.log(`⚠️ Plan déjà existant pour ${category.translations.fr.name}`);
          continue;
        }
        
        // Définir le prix selon la catégorie (exemple)
        let price = 0;
        let features = [];
        
        // Logique de prix basée sur le nom de la catégorie
        const categoryName = category.translations.fr.name.toLowerCase();
        
        if (categoryName.includes('débutant') || categoryName.includes('introduction')) {
          price = 0; // Gratuit pour les débutants
          features = [
            'Accès gratuit à tous les contenus',
            'Support communautaire',
            'Certificat de participation'
          ];
        } else if (categoryName.includes('intermédiaire')) {
          price = 5000; // 50 TND
          features = [
            'Accès à tous les parcours de la catégorie',
            'Exercices interactifs',
            'Support technique',
            'Certificat de completion'
          ];
        } else if (categoryName.includes('avancé') || categoryName.includes('expert')) {
          price = 10000; // 100 TND
          features = [
            'Accès premium à tous les contenus',
            'Projets pratiques',
            'Mentoring personnalisé',
            'Certificat professionnel',
            'Accès à la communauté VIP'
          ];
        } else {
          price = 3000; // 30 TND par défaut
          features = [
            'Accès à tous les parcours de la catégorie',
            'Contenu multilingue',
            'Support technique',
            'Certificat de completion'
          ];
        }
        
        const categoryPlan = new CategoryPlan({
          category: category._id,
          price: price,
          currency: 'TND',
          paymentType: 'one_time',
          accessDuration: 365, // 1 an
          active: true,
          translations: {
            fr: {
              name: `Accès ${category.translations.fr.name}`,
              description: `Accès complet à la catégorie ${category.translations.fr.name} avec tous ses parcours et niveaux`
            },
            en: {
              name: `Access ${category.translations.en.name}`,
              description: `Complete access to ${category.translations.en.name} category with all its paths and levels`
            },
            ar: {
              name: `الوصول إلى ${category.translations.ar.name}`,
              description: `وصول كامل لفئة ${category.translations.ar.name} مع جميع مساراتها ومستوياتها`
            }
          },
          features: features,
          order: category.order || 0
        });
        
        await categoryPlan.save();
        plans.push(categoryPlan);
        console.log(`✅ Plan créé pour ${category.translations.fr.name}: ${price} TND`);
      }
      
      console.log(`🌱 ${plans.length} plans de catégories créés`);
      return plans;
      
    } catch (error) {
      console.error('❌ Erreur création plans catégories:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour les prix des plans existants
   */
  static async updateCategoryPrices(priceUpdates) {
    try {
      console.log('💰 Mise à jour des prix des catégories...');
      
      let updatedCount = 0;
      
      for (const [categoryId, price] of Object.entries(priceUpdates)) {
        const categoryPlan = await CategoryPlan.findOne({ category: categoryId });
        if (categoryPlan) {
          categoryPlan.price = price;
          await categoryPlan.save();
          updatedCount++;
          console.log(`💰 Prix mis à jour: ${price} TND`);
        }
      }
      
      console.log(`✅ ${updatedCount} prix mis à jour`);
      return updatedCount;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour prix:', error);
      throw error;
    }
  }
  
  /**
   * Affiche un résumé des plans créés
   */
  static async getPlansSummary() {
    try {
      const plans = await CategoryPlan.find().populate('category');
      
      console.log('\n📊 RÉSUMÉ DES PLANS DE CATÉGORIES:');
      console.log('=====================================');
      
      plans.forEach(plan => {
        const category = plan.category;
        console.log(`📁 ${category.translations.fr.name}`);
        console.log(`   💰 Prix: ${plan.price} ${plan.currency}`);
        console.log(`   🎯 Type: ${plan.paymentType}`);
        console.log(`   ⏱️ Durée: ${plan.accessDuration} jours`);
        console.log(`   ✅ Actif: ${plan.active ? 'Oui' : 'Non'}`);
        console.log(`   🎁 Fonctionnalités: ${plan.features.length}`);
        console.log('');
      });
      
      return plans;
      
    } catch (error) {
      console.error('❌ Erreur résumé plans:', error);
      throw error;
    }
  }
}

module.exports = CategoryPlanSeeder;