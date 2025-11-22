/**
 * Script pour vérifier la configuration (admin et plans)
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// Charger tous les modèles
const Category = require('../models/Category');
const CategoryPlan = require('../models/CategoryPlan');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function verifySetup() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier l'admin
    console.log('='.repeat(60));
    console.log('👤 VÉRIFICATION DU COMPTE ADMIN');
    console.log('='.repeat(60) + '\n');

    const adminEmail = 'admin2@test.com';
    
    const admin = await Admin.findOne({ email: adminEmail });
    const adminUser = await User.findOne({ email: adminEmail });

    console.log('📋 Modèle Admin:');
    if (admin) {
      console.log('   ✅ Admin existe');
      console.log(`   ID: ${admin._id}`);
      console.log(`   Email: ${admin.email}`);
    } else {
      console.log('   ❌ Admin n\'existe pas');
    }

    console.log('\n📋 Modèle User:');
    if (adminUser) {
      console.log('   ✅ Utilisateur existe');
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Rôles: ${adminUser.roles?.join(', ') || 'Aucun'}`);
      console.log(`   Vérifié: ${adminUser.isVerified ? 'Oui' : 'Non'}`);
      console.log(`   Profil complet: ${adminUser.isProfileComplete ? 'Oui' : 'Non'}`);
    } else {
      console.log('   ❌ Utilisateur n\'existe pas');
    }

    // Vérifier les plans
    console.log('\n' + '='.repeat(60));
    console.log('📋 VÉRIFICATION DES PLANS');
    console.log('='.repeat(60) + '\n');

    const categories = await Category.find({}).sort({ order: 1 });
    const plans = await CategoryPlan.find({}).populate('category', 'translations type order').sort({ order: 1 });

    console.log(`📊 Statistiques:`);
    console.log(`   Catégories: ${categories.length}`);
    console.log(`   Plans: ${plans.length}`);
    console.log(`   Plans actifs: ${plans.filter(p => p.active).length}`);
    console.log(`   Plans inactifs: ${plans.filter(p => !p.active).length}`);

    console.log('\n📋 Liste des Plans:');
    console.log('-'.repeat(60));
    
    plans.forEach((plan, index) => {
      const category = plan.category;
      if (!category) {
        console.log(`${index + 1}. [Catégorie supprimée] - ${plan.price} TND`);
        return;
      }
      
      const categoryName = category.translations?.fr?.name || category.translations?.en?.name || 'N/A';
      const planName = plan.translations?.fr?.name || plan.translations?.en?.name || 'Plan';
      const type = category.type === 'classic' ? '📚' : '💻';
      const status = plan.active ? '✅' : '❌';
      
      console.log(`${index + 1}. ${type} ${categoryName} - ${plan.price} TND ${status}`);
      console.log(`   Plan: ${planName}`);
    });
    
    console.log('-'.repeat(60) + '\n');

    // Vérifier les catégories sans plan
    const categoriesWithPlans = new Set(plans.map(p => p.category?._id?.toString()).filter(Boolean));
    const categoriesWithoutPlans = categories.filter(c => !categoriesWithPlans.has(c._id.toString()));

    if (categoriesWithoutPlans.length > 0) {
      console.log('⚠️  Catégories sans plan:');
      categoriesWithoutPlans.forEach(cat => {
        const name = cat.translations?.fr?.name || cat.translations?.en?.name || 'N/A';
        console.log(`   - ${name}`);
      });
      console.log('');
    }

    // Résumé
    console.log('='.repeat(60));
    console.log('✅ VÉRIFICATION TERMINÉE');
    console.log('='.repeat(60));
    console.log(`Admin: ${admin && adminUser ? '✅ Configuré' : '❌ Non configuré'}`);
    console.log(`Plans: ${plans.length}/${categories.length} catégories ont un plan`);
    console.log(`Plans actifs: ${plans.filter(p => p.active).length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  verifySetup()
    .then(() => {
      console.log('✅ Vérification terminée');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = verifySetup;




