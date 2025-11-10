/**
 * Script complet pour configurer les plans et l'admin
 * - Crée/met à jour les plans pour toutes les catégories
 * - Crée/met à jour le compte admin
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Configuration des prix par type de catégorie
const PRICE_CONFIG = {
  classic: {
    'Débutant': { price: 0, features: ['Accès complet', 'Support communautaire', 'Certificat de participation'] },
    'Beginner': { price: 0, features: ['Full access', 'Community support', 'Participation certificate'] },
    'Intermédiaire': { price: 29.99, features: ['Accès complet', 'Support prioritaire', 'Certificat', 'Projets pratiques'] },
    'Intermediate': { price: 29.99, features: ['Full access', 'Priority support', 'Certificate', 'Practical projects'] },
    'Avancé': { price: 49.99, features: ['Accès complet', 'Support prioritaire', 'Certificat', 'Projets avancés', 'Mentoring'] },
    'Advanced': { price: 49.99, features: ['Full access', 'Priority support', 'Certificate', 'Advanced projects', 'Mentoring'] }
  },
  specific: {
    default: { price: 39.99, features: ['Accès complet au langage', 'Exercices pratiques', 'Projets réels', 'Support communautaire'] }
  }
};

async function setupAdmin() {
  console.log('\n' + '='.repeat(60));
  console.log('👤 CONFIGURATION DU COMPTE ADMIN');
  console.log('='.repeat(60) + '\n');

  const adminEmail = 'admin2@test.com';
  const adminPassword = 'password123';

  try {
    // 1. Créer dans le modèle Admin
    console.log('📋 Vérification du modèle Admin...');
    let admin = await Admin.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('✅ Admin existe déjà dans le modèle Admin');
      console.log(`   ID: ${admin._id}`);
    } else {
      admin = new Admin({
        email: adminEmail,
        password: adminPassword
      });
      await admin.save();
      console.log('✅ Admin créé dans le modèle Admin');
      console.log(`   ID: ${admin._id}`);
    }

    // 2. Créer dans le modèle User
    console.log('\n📋 Vérification du modèle User...');
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log('✅ Utilisateur admin existe déjà');
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
      } else {
        console.log('✅ L\'utilisateur a déjà le rôle admin');
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

    console.log('\n' + '='.repeat(60));
    console.log('✅ COMPTE ADMIN CONFIGURÉ');
    console.log('='.repeat(60));
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('='.repeat(60) + '\n');

    return { admin, adminUser };
  } catch (error) {
    console.error('❌ Erreur lors de la configuration de l\'admin:', error.message);
    throw error;
  }
}

async function setupPlans(forceUpdate = false) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 CONFIGURATION DES PLANS PAR CATÉGORIE');
  console.log('='.repeat(60) + '\n');

  try {
    // Récupérer toutes les catégories
    const categories = await Category.find({}).sort({ order: 1, 'translations.fr.name': 1 });
    console.log(`📋 ${categories.length} catégorie(s) trouvée(s)\n`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const plans = [];

    for (const category of categories) {
      try {
        const categoryNameFr = category.translations.fr.name;
        const categoryNameEn = category.translations.en.name;
        
        // Vérifier si un plan existe déjà
        let existingPlan = await CategoryPlan.findOne({ category: category._id });

        // Déterminer le prix et les fonctionnalités
        let price = PRICE_CONFIG.specific.default.price;
        let features = [...PRICE_CONFIG.specific.default.features];
        let paymentType = 'one_time';
        let accessDuration = 365;

        if (category.type === 'classic') {
          // Prix pour les catégories classiques
          const nameLowerFr = categoryNameFr.toLowerCase();
          const nameLowerEn = categoryNameEn.toLowerCase();
          
          if (nameLowerFr.includes('débutant') || nameLowerEn.includes('beginner')) {
            price = PRICE_CONFIG.classic['Débutant']?.price || 0;
            features = PRICE_CONFIG.classic['Débutant']?.features || features;
          } else if (nameLowerFr.includes('intermédiaire') || nameLowerEn.includes('intermediate')) {
            price = PRICE_CONFIG.classic['Intermédiaire']?.price || 29.99;
            features = PRICE_CONFIG.classic['Intermédiaire']?.features || features;
          } else if (nameLowerFr.includes('avancé') || nameLowerEn.includes('advanced')) {
            price = PRICE_CONFIG.classic['Avancé']?.price || 49.99;
            features = PRICE_CONFIG.classic['Avancé']?.features || features;
          }
        } else {
          // Pour les catégories spécifiques
          features = [
            `Accès complet à ${categoryNameFr}`,
            'Exercices pratiques',
            'Projets réels',
            'Support communautaire',
            'Certificat de completion'
          ];
        }

        if (existingPlan) {
          if (forceUpdate) {
            // Mettre à jour le plan existant
            existingPlan.price = price;
            existingPlan.features = features;
            existingPlan.active = true;
            existingPlan.translations = {
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
            await existingPlan.save();
            console.log(`🔄 Plan mis à jour pour: ${categoryNameFr} - Prix: ${price} TND`);
            updated++;
          } else {
            console.log(`⏭️  Plan existe déjà pour: ${categoryNameFr} - Prix: ${existingPlan.price} TND`);
            skipped++;
          }
          plans.push(existingPlan);
          continue;
        }

        // Créer un nouveau plan
        const plan = new CategoryPlan({
          category: category._id,
          price: price,
          currency: 'TND',
          paymentType: paymentType,
          accessDuration: accessDuration,
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
        plans.push(plan);
      } catch (error) {
        console.error(`❌ Erreur pour ${category.translations.fr.name}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES PLANS');
    console.log('='.repeat(60));
    console.log(`✅ Plans créés: ${created}`);
    console.log(`🔄 Plans mis à jour: ${updated}`);
    console.log(`⏭️  Plans ignorés: ${skipped}`);
    console.log(`📝 Total de catégories: ${categories.length}`);
    console.log(`💰 Total de plans: ${plans.length}`);
    console.log('='.repeat(60) + '\n');

    // Afficher la liste des plans (avec populate)
    if (plans.length > 0) {
      console.log('📋 LISTE DES PLANS:');
      console.log('-'.repeat(60));
      
      // Récupérer tous les plans avec les catégories populées
      const allPlans = await CategoryPlan.find({})
        .populate('category', 'translations type order')
        .sort({ order: 1 });
      
      allPlans.forEach((plan, index) => {
        const category = plan.category;
        const categoryName = category?.translations?.fr?.name || category?.translations?.en?.name || 'N/A';
        const planName = plan.translations?.fr?.name || plan.translations?.en?.name || 'Plan';
        console.log(`${index + 1}. ${categoryName}`);
        console.log(`   Plan: ${planName}`);
        console.log(`   Prix: ${plan.price} ${plan.currency}`);
        console.log(`   Type: ${plan.paymentType}`);
        console.log(`   Durée: ${plan.accessDuration} jours`);
        console.log(`   Statut: ${plan.active ? 'Actif ✅' : 'Inactif ❌'}`);
        console.log(`   Fonctionnalités: ${plan.features.length}`);
        console.log('');
      });
      console.log('-'.repeat(60) + '\n');
    }

    return plans;
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des plans:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔗 Connexion à MongoDB Atlas...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI n\'est pas défini dans .env');
      process.exit(1);
    }
    console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB Atlas\n');

    // 1. Configurer l'admin
    await setupAdmin();

    // 2. Configurer les plans
    await setupPlans(false); // false = ne pas forcer la mise à jour des plans existants

    console.log('='.repeat(60));
    console.log('✅ CONFIGURATION TERMINÉE AVEC SUCCÈS');
    console.log('='.repeat(60));
    console.log('\n🎯 RÉSUMÉ:');
    console.log('1. ✅ Compte admin créé/vérifié');
    console.log('2. ✅ Plans de catégories créés/vérifiés');
    console.log('\n📝 INSTRUCTIONS:');
    console.log('- Connectez-vous avec: admin2@test.com / password123');
    console.log('- Utilisez POST /api/admin/login pour l\'authentification');
    console.log('- Les plans sont disponibles via GET /api/category-payment/plans');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB Atlas');
  }
}

// Exécuter si appelé directement
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

