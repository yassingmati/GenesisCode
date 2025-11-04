// Vérifier l'accès aux catégories dans la base de données
const mongoose = require('mongoose');
const CategoryAccess = require('./src/models/CategoryAccess');
const User = require('./src/models/User');
const Category = require('./src/models/Category');

const userId = '68f6460c74ab496c1885e395';
const categoryId = '68f258d68ffd13c2ba35e4a5'; // Débutant

async function checkCategoryAccess() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codegenesis');
    console.log('✅ Connexion à la base de données réussie');

    // Vérifier l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    console.log(`✅ Utilisateur trouvé: ${user.email}`);

    // Vérifier la catégorie
    const category = await Category.findById(categoryId);
    if (!category) {
      console.log('❌ Catégorie non trouvée');
      return;
    }
    console.log(`✅ Catégorie trouvée: ${category.translations?.fr?.name || 'Sans nom'}`);

    // Vérifier les accès aux catégories de l'utilisateur
    const categoryAccesses = await CategoryAccess.find({ user: userId });
    console.log(`\n📋 Accès aux catégories trouvés: ${categoryAccesses.length}`);
    
    if (categoryAccesses.length > 0) {
      categoryAccesses.forEach((access, index) => {
        console.log(`\n${index + 1}. Accès ID: ${access._id}`);
        console.log(`   Catégorie: ${access.category}`);
        console.log(`   Status: ${access.status}`);
        console.log(`   Access Type: ${access.accessType}`);
        console.log(`   Purchased At: ${access.purchasedAt}`);
        console.log(`   Expires At: ${access.expiresAt || 'Jamais'}`);
        console.log(`   Is Active: ${access.isActive()}`);
        console.log(`   Unlocked Levels: ${access.unlockedLevels?.length || 0}`);
      });
    } else {
      console.log('❌ Aucun accès aux catégories trouvé');
    }

    // Vérifier l'accès spécifique à la catégorie "Débutant"
    const debutantAccess = await CategoryAccess.findActiveByUserAndCategory(userId, categoryId);
    if (debutantAccess) {
      console.log(`\n✅ Accès à la catégorie "Débutant" trouvé:`);
      console.log(`   Status: ${debutantAccess.status}`);
      console.log(`   Access Type: ${debutantAccess.accessType}`);
      console.log(`   Is Active: ${debutantAccess.isActive()}`);
      console.log(`   Unlocked Levels: ${debutantAccess.unlockedLevels?.length || 0}`);
    } else {
      console.log(`\n❌ Aucun accès actif à la catégorie "Débutant" trouvé`);
    }

    // Vérifier tous les accès actifs de l'utilisateur
    const activeAccesses = await CategoryAccess.findActiveByUser(userId);
    console.log(`\n📋 Accès actifs trouvés: ${activeAccesses.length}`);
    
    if (activeAccesses.length > 0) {
      activeAccesses.forEach((access, index) => {
        console.log(`\n${index + 1}. Accès actif:`);
        console.log(`   Catégorie: ${access.category?.translations?.fr?.name || access.category}`);
        console.log(`   Status: ${access.status}`);
        console.log(`   Access Type: ${access.accessType}`);
        console.log(`   Is Active: ${access.isActive()}`);
      });
    } else {
      console.log('❌ Aucun accès actif trouvé');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de la base de données');
  }
}

checkCategoryAccess();
