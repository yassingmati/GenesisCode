/**
 * Script pour configurer directement dans MongoDB Atlas
 * Utilise l'URI MongoDB Atlas fournie directement
 */

const mongoose = require('mongoose');

// URI MongoDB Atlas fournie
const MONGODB_ATLAS_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';

// Charger les modèles
const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Configuration des prix
const PRICE_CONFIG = {
  classic: {
    'débutant': { price: 0, features: ['Accès gratuit à tous les contenus', 'Support communautaire', 'Certificat de participation'] },
    'beginner': { price: 0, features: ['Full access', 'Community support', 'Participation certificate'] },
    'intermédiaire': { price: 29.99, features: ['Accès complet', 'Support prioritaire', 'Certificat', 'Projets pratiques'] },
    'intermediate': { price: 29.99, features: ['Full access', 'Priority support', 'Certificate', 'Practical projects'] },
    'avancé': { price: 49.99, features: ['Accès complet', 'Support prioritaire', 'Certificat', 'Projets avancés', 'Mentoring'] },
    'advanced': { price: 49.99, features: ['Full access', 'Priority support', 'Certificate', 'Advanced projects', 'Mentoring'] },
    'fondamentale': { price: 19.99, features: ['Accès aux bases', 'Exercices pratiques', 'Support communautaire'] },
    'fondamental': { price: 19.99, features: ['Access to fundamentals', 'Practical exercises', 'Community support'] }
  },
  specific: {
    'javascript': { price: 39.99, features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'python': { price: 39.99, features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'java': { price: 39.99, features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'c++': { price: 39.99, features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] },
    'react': { price: 44.99, features: ['Accès complet au framework', 'Projets avancés', 'Support prioritaire'] },
    'typescript': { price: 44.99, features: ['Accès complet au langage', 'Projets avancés', 'Support prioritaire'] },
    'node.js': { price: 44.99, features: ['Accès complet au runtime', 'Projets avancés', 'Support prioritaire'] },
    'sql': { price: 29.99, features: ['Accès aux bases de données', 'Exercices pratiques', 'Support communautaire'] },
    'web': { price: 34.99, features: ['Développement web complet', 'Projets pratiques', 'Support communautaire'] },
    'données': { price: 34.99, features: ['Structures de données', 'Algorithmes', 'Support communautaire'] },
    'visuelle': { price: 24.99, features: ['Programmation visuelle', 'Projets créatifs', 'Support communautaire'] }
  },
  default: { price: 39.99, features: ['Accès complet à la catégorie', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] }
};

function getPriceConfig(category) {
  const nameFr = category.translations.fr.name.toLowerCase();
  const nameEn = category.translations.en.name.toLowerCase();
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

async function setupAdmin() {
  console.log('\n' + '='.repeat(60));
  console.log('👤 CRÉATION DU COMPTE ADMIN');
  console.log('='.repeat(60) + '\n');

  const adminEmail = 'admin2@test.com';
  const adminPassword = 'password123';

  try {
    // 1. Créer dans le modèle Admin
    console.log('📋 Création dans le modèle Admin...');
    let admin = await Admin.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('✅ Admin existe déjà');
      console.log(`   ID: ${admin._id}`);
    } else {
      admin = new Admin({
        email: adminEmail,
        password: adminPassword
      });
      await admin.save();
      console.log('✅ Admin créé');
      console.log(`   ID: ${admin._id}`);
    }

    // 2. Créer dans le modèle User
    console.log('\n📋 Création dans le modèle User...');
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('✅ Utilisateur existe déjà');
      console.log(`   ID: ${adminUser._id}`);
      
      if (!adminUser.roles || !adminUser.roles.includes('admin')) {
        console.log('🔄 Ajout du rôle admin...');
        if (!adminUser.roles) {
          adminUser.roles = [];
        }
        adminUser.roles.push('admin');
        adminUser.isVerified = true;
        adminUser.isProfileComplete = true;
        await adminUser.save();
        console.log('✅ Rôle admin ajouté');
      }
    } else {
      adminUser = new User({
        firebaseUid: `admin-atlas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: adminEmail,
        firstName: 'Admin',
        lastName: 'System',
        userType: 'student',
        roles: ['admin'],
        isVerified: true,
        isProfileComplete: true
      });
      await adminUser.save();
      console.log('✅ Utilisateur admin créé');
      console.log(`   ID: ${adminUser._id}`);
    }

    console.log('\n✅ Compte admin configuré avec succès');
    return { admin, adminUser };
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
}

async function setupPlans() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 CRÉATION DES PLANS PAR CATÉGORIE');
  console.log('='.repeat(60) + '\n');

  try {
    const categories = await Category.find({}).sort({ order: 1 });
    console.log(`📋 ${categories.length} catégorie(s) trouvée(s)\n`);

    let created = 0;
    let updated = 0;
    const plans = [];

    for (const category of categories) {
      try {
        const categoryNameFr = category.translations.fr.name;
        const categoryNameEn = category.translations.en.name;
        const config = getPriceConfig(category);

        // Vérifier si un plan existe
        let plan = await CategoryPlan.findOne({ category: category._id });

        if (plan) {
          // Mettre à jour
          plan.price = config.price;
          plan.features = config.features;
          plan.active = true;
          plan.translations = {
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
          };
          await plan.save();
          console.log(`🔄 Plan mis à jour: ${categoryNameFr} - ${config.price} TND`);
          updated++;
        } else {
          // Créer
          plan = new CategoryPlan({
            category: category._id,
            price: config.price,
            currency: 'TND',
            paymentType: 'one_time',
            accessDuration: 365,
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
            features: config.features,
            order: category.order || 0
          });
          await plan.save();
          console.log(`✅ Plan créé: ${categoryNameFr} - ${config.price} TND`);
          created++;
        }
        plans.push(plan);
      } catch (error) {
        console.error(`❌ Erreur pour ${category.translations.fr.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Plans créés: ${created}`);
    console.log(`🔄 Plans mis à jour: ${updated}`);
    console.log(`📝 Total: ${plans.length} plans`);
    console.log('='.repeat(60) + '\n');

    return plans;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
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

    // 1. Créer l'admin
    await setupAdmin();

    // 2. Créer les plans
    await setupPlans();

    console.log('='.repeat(60));
    console.log('✅ CONFIGURATION TERMINÉE AVEC SUCCÈS');
    console.log('='.repeat(60));
    console.log('\n🎯 RÉSUMÉ:');
    console.log('1. ✅ Compte admin créé/vérifié');
    console.log('2. ✅ Plans de catégories créés/mis à jour');
    console.log('\n📝 INFORMATIONS:');
    console.log('- Email admin: admin2@test.com');
    console.log('- Password admin: password123');
    console.log('- Les plans sont disponibles dans MongoDB Atlas');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    if (error.message) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

// Exécuter
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { setupAdmin, setupPlans };




