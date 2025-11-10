/**
 * Script pour vérifier et compléter la configuration dans MongoDB Atlas
 * Vérifie toutes les catégories et crée les plans manquants
 */

const mongoose = require('mongoose');

// URI MongoDB Atlas
const MONGODB_ATLAS_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Configuration des prix
const PRICE_CONFIG = {
  classic: {
    'débutant': { price: 0, name: 'Plan Débutant', features: ['Accès gratuit à tous les contenus', 'Support communautaire', 'Certificat de participation'] },
    'beginner': { price: 0, name: 'Beginner Plan', features: ['Full access', 'Community support', 'Participation certificate'] },
    'intermédiaire': { price: 29.99, name: 'Plan Intermédiaire', features: ['Accès complet', 'Support prioritaire', 'Certificat', 'Projets pratiques'] },
    'intermediate': { price: 29.99, name: 'Intermediate Plan', features: ['Full access', 'Priority support', 'Certificate', 'Practical projects'] },
    'avancé': { price: 49.99, name: 'Plan Avancé', features: ['Accès complet', 'Support prioritaire', 'Certificat', 'Projets avancés', 'Mentoring'] },
    'advanced': { price: 49.99, name: 'Advanced Plan', features: ['Full access', 'Priority support', 'Certificate', 'Advanced projects', 'Mentoring'] },
    'fondamentale': { price: 19.99, name: 'Plan Fondamental', features: ['Accès aux bases', 'Exercices pratiques', 'Support communautaire'] },
    'fondamental': { price: 19.99, name: 'Fundamental Plan', features: ['Access to fundamentals', 'Practical exercises', 'Community support'] }
  },
  specific: {
    'javascript': { price: 39.99, name: 'Plan JavaScript', features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'python': { price: 39.99, name: 'Plan Python', features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'java': { price: 39.99, name: 'Plan Java', features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'c++': { price: 39.99, name: 'Plan C++', features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'react': { price: 44.99, name: 'Plan React', features: ['Accès complet au framework', 'Projets avancés', 'Support prioritaire'] },
    'typescript': { price: 44.99, name: 'Plan TypeScript', features: ['Accès complet au langage', 'Projets avancés', 'Support prioritaire'] },
    'node.js': { price: 44.99, name: 'Plan Node.js', features: ['Accès complet au runtime', 'Projets avancés', 'Support prioritaire'] },
    'sql': { price: 29.99, name: 'Plan SQL', features: ['Accès aux bases de données', 'Exercices pratiques', 'Support communautaire'] },
    'web': { price: 34.99, name: 'Plan Développement Web', features: ['Développement web complet', 'Projets pratiques', 'Support communautaire'] },
    'données': { price: 34.99, name: 'Plan Structures de Données', features: ['Structures de données', 'Algorithmes', 'Support communautaire'] },
    'visuelle': { price: 24.99, name: 'Plan Programmation Visuelle', features: ['Programmation visuelle', 'Projets créatifs', 'Support communautaire'] }
  },
  default: { price: 39.99, name: 'Plan Standard', features: ['Accès complet à la catégorie', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] }
};

function getPriceConfig(category) {
  const nameFr = category.translations?.fr?.name?.toLowerCase() || '';
  const nameEn = category.translations?.en?.name?.toLowerCase() || '';
  const type = category.type;

  if (type === 'classic') {
    for (const [key, config] of Object.entries(PRICE_CONFIG.classic)) {
      if (nameFr.includes(key) || nameEn.includes(key)) {
        return config;
      }
    }
  }

  if (type === 'specific') {
    for (const [key, config] of Object.entries(PRICE_CONFIG.specific)) {
      if (nameFr.includes(key) || nameEn.includes(key)) {
        return config;
      }
    }
  }

  return PRICE_CONFIG.default;
}

async function main() {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    console.log(`   URI: ${MONGODB_ATLAS_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    await mongoose.connect(MONGODB_ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB Atlas\n');

    // Vérifier l'admin
    console.log('='.repeat(60));
    console.log('👤 VÉRIFICATION DU COMPTE ADMIN');
    console.log('='.repeat(60) + '\n');

    const adminEmail = 'admin2@test.com';
    const admin = await Admin.findOne({ email: adminEmail });
    const adminUser = await User.findOne({ email: adminEmail });

    console.log('📋 Admin:');
    if (admin) {
      console.log(`   ✅ Existe - ID: ${admin._id}`);
    } else {
      console.log('   ❌ N\'existe pas');
    }

    console.log('\n📋 User:');
    if (adminUser) {
      console.log(`   ✅ Existe - ID: ${adminUser._id}`);
      console.log(`   Rôles: ${adminUser.roles?.join(', ') || 'Aucun'}`);
    } else {
      console.log('   ❌ N\'existe pas');
    }

    // Vérifier les catégories et plans
    console.log('\n' + '='.repeat(60));
    console.log('📋 VÉRIFICATION DES CATÉGORIES ET PLANS');
    console.log('='.repeat(60) + '\n');

    const categories = await Category.find({}).sort({ order: 1 });
    const plans = await CategoryPlan.find({}).populate('category');

    console.log(`📊 Statistiques:`);
    console.log(`   Catégories: ${categories.length}`);
    console.log(`   Plans: ${plans.length}`);
    console.log(`   Catégories avec plan: ${plans.length}`);
    console.log(`   Catégories sans plan: ${categories.length - plans.length}\n`);

    // Identifier les catégories sans plan
    const categoriesWithPlans = new Set(plans.map(p => p.category?._id?.toString()).filter(Boolean));
    const categoriesWithoutPlans = categories.filter(c => !categoriesWithPlans.has(c._id.toString()));

    if (categoriesWithoutPlans.length > 0) {
      console.log('📋 Catégories sans plan:');
      categoriesWithoutPlans.forEach(cat => {
        const name = cat.translations?.fr?.name || cat.translations?.en?.name || 'N/A';
        console.log(`   - ${name}`);
      });
      console.log('');
    }

    // Créer les plans manquants
    let created = 0;
    if (categoriesWithoutPlans.length > 0) {
      console.log('🔧 Création des plans manquants...\n');
      
      for (const category of categoriesWithoutPlans) {
        try {
          const categoryNameFr = category.translations?.fr?.name || 'N/A';
          const categoryNameEn = category.translations?.en?.name || 'N/A';
          const config = getPriceConfig(category);

          const plan = new CategoryPlan({
            category: category._id,
            price: config.price,
            currency: 'TND',
            paymentType: 'one_time',
            accessDuration: 365,
            active: true,
            translations: {
              fr: {
                name: config.name || `Plan ${categoryNameFr}`,
                description: `Accès complet à tous les cours de la catégorie ${categoryNameFr}`
              },
              en: {
                name: `${categoryNameEn} Plan`,
                description: `Full access to all courses in the ${categoryNameEn} category`
              },
              ar: {
                name: `خطة ${category.translations?.ar?.name || categoryNameEn}`,
                description: `وصول كامل لجميع الدورات في فئة ${category.translations?.ar?.name || categoryNameEn}`
              }
            },
            features: config.features,
            order: category.order || 0
          });

          await plan.save();
          console.log(`✅ Plan créé: ${categoryNameFr} - ${config.price} TND`);
          created++;
        } catch (error) {
          console.error(`❌ Erreur pour ${category.translations?.fr?.name}:`, error.message);
        }
      }
    }

    // Afficher la liste complète
    console.log('\n' + '='.repeat(60));
    console.log('📋 LISTE COMPLÈTE DES PLANS');
    console.log('='.repeat(60) + '\n');

    const allPlans = await CategoryPlan.find({})
      .populate('category', 'translations type order')
      .sort({ order: 1 });

    allPlans.forEach((plan, index) => {
      const category = plan.category;
      if (!category) {
        console.log(`${index + 1}. [Catégorie supprimée] - ${plan.price} TND`);
        return;
      }
      
      const categoryName = category.translations?.fr?.name || category.translations?.en?.name || 'N/A';
      const planName = plan.translations?.fr?.name || plan.translations?.en?.name || 'Plan';
      const type = category.type === 'classic' ? '📚' : '💻';
      
      console.log(`${index + 1}. ${type} ${categoryName}`);
      console.log(`   Plan: ${planName}`);
      console.log(`   Prix: ${plan.price} ${plan.currency}`);
      console.log(`   Statut: ${plan.active ? 'Actif ✅' : 'Inactif ❌'}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('📊 RÉSUMÉ FINAL');
    console.log('='.repeat(60));
    console.log(`Admin: ${admin && adminUser ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`Catégories: ${categories.length}`);
    console.log(`Plans: ${allPlans.length}`);
    console.log(`Plans créés lors de cette exécution: ${created}`);
    console.log(`Plans actifs: ${allPlans.filter(p => p.active).length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Vérification terminée');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = main;


