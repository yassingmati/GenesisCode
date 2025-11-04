#!/usr/bin/env node

/**
 * Script pour accorder l'accès à un path (parcours) pour un utilisateur
 * 
 * Usage:
 *   node grantPathAccess.js <pathName> [userId]
 * 
 * Exemple:
 *   node grantPathAccess.js "Programmation Débutant (Classique)"
 *   node grantPathAccess.js "Programmation Débutant (Classique)" 68f255f939d55ec4ff20c936
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CategoryAccess = require('../models/CategoryAccess');
const CategoryPlan = require('../models/CategoryPlan');
const Category = require('../models/Category');
const Path = require('../models/Path');
const LevelUnlockService = require('../services/levelUnlockService');

// ID utilisateur par défaut
const DEFAULT_USER_ID = '68f255f939d55ec4ff20c936';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion à la base de données établie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Déconnexion de la base de données');
  } catch (error) {
    console.error('❌ Erreur de déconnexion:', error);
  }
}

async function ensurePlanForCategory(category) {
  let plan = await CategoryPlan.findOne({ category: category._id, active: true });
  if (plan) return plan;

  // Créer un plan gratuit par défaut si aucun n'existe
  plan = new CategoryPlan({
    category: category._id,
    price: 0,
    currency: 'TND',
    paymentType: 'one_time',
    accessDuration: 365,
    active: true,
    translations: {
      fr: {
        name: `Accès ${category?.translations?.fr?.name || 'Catégorie'}`,
        description: `Accès complet à la catégorie ${category?.translations?.fr?.name || ''}`
      },
      en: {
        name: `Access ${category?.translations?.en?.name || 'Category'}`,
        description: `Complete access to ${category?.translations?.en?.name || 'category'}`
      },
      ar: {
        name: `الوصول إلى ${category?.translations?.ar?.name || 'الفئة'}`,
        description: `وصول كامل لفئة ${category?.translations?.ar?.name || ''}`
      }
    },
    features: [
      'Accès à tous les parcours de la catégorie',
      'Déblocage progressif des niveaux',
    ],
    order: category.order || 0
  });
  await plan.save();
  return plan;
}

async function grantPathAccess(pathName, userId = DEFAULT_USER_ID) {
  try {
    console.log(`\n🎯 Recherche du path "${pathName}"...\n`);

    // Rechercher le path par nom (dans les traductions)
    const pathNameNormalized = pathName.trim();
    const base = pathNameNormalized
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-zA-Z0-9\s_-]/g, '');
    const rx = new RegExp(base.replace(/\s+/g, '.*'), 'i');

    const paths = await Path.find({
      $or: [
        { 'translations.fr.name': { $regex: rx } },
        { 'translations.en.name': { $regex: rx } },
        { 'translations.ar.name': { $regex: rx } },
        { name: { $regex: rx } },
        { slug: { $regex: rx } }
      ]
    }).populate('category').lean();

    if (!paths.length) {
      throw new Error(`Aucun path trouvé pour: ${pathName}`);
    }

    // Trouver le path qui correspond le mieux
    let targetPath = paths.find(p => 
      /programmation|débutant|debutant|classique/i.test(
        (p?.translations?.fr?.name || p?.translations?.en?.name || p?.slug || '')
      )
    ) || paths[0];

    console.log(`✅ Path trouvé: ${targetPath.translations?.fr?.name || targetPath.translations?.en?.name || 'Sans nom'}`);
    console.log(`   Path ID: ${targetPath._id}`);
    
    if (!targetPath.category) {
      throw new Error('Le path n\'a pas de catégorie associée');
    }

    const category = targetPath.category;
    console.log(`   Catégorie: ${category.translations?.fr?.name || category.translations?.en?.name || 'Sans nom'}`);
    console.log(`   Catégorie ID: ${category._id || category}`);

    const categoryId = category._id || category;

    // Convertir userId en ObjectId si nécessaire
    const crypto = require('crypto');
    let userObjectId;
    if (mongoose.isValidObjectId(userId)) {
      userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    } else {
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    }

    // Vérifier que l'utilisateur existe
    const User = require('../models/User');
    if (mongoose.isValidObjectId(userId)) {
      const user = await User.findById(userObjectId);
      if (user) {
        console.log(`✅ Utilisateur trouvé: ${user.email || user.name || userId}`);
      } else {
        console.log(`⚠️  Utilisateur ${userId} introuvable, mais l'accès sera créé quand même`);
      }
    }

    // S'assurer qu'un plan existe pour la catégorie
    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) {
      throw new Error(`Catégorie ${categoryId} introuvable`);
    }

    const plan = await ensurePlanForCategory(categoryDoc);
    console.log(`✅ Plan trouvé/créé: ${plan.translations?.fr?.name || plan._id}`);

    // Créer ou mettre à jour l'accès à la catégorie
    let access = await CategoryAccess.findOne({ 
      user: userObjectId, 
      category: categoryId 
    });

    if (!access) {
      access = new CategoryAccess({
        user: userObjectId,
        category: categoryId,
        categoryPlan: plan._id,
        accessType: 'admin',
        status: 'active',
        expiresAt: null
      });
      await access.save();
      console.log(`✅ Accès créé: ${access._id}`);
    } else {
      access.categoryPlan = plan._id;
      access.accessType = 'admin';
      access.status = 'active';
      access.expiresAt = null;
      await access.save();
      console.log(`✅ Accès mis à jour: ${access._id}`);
    }

    // Débloquer les premiers niveaux de tous les paths de la catégorie
    console.log(`\n🔓 Déblocage des premiers niveaux...`);
    try {
      await LevelUnlockService.unlockFirstLevelsForCategory(userId, categoryId);
      console.log(`✅ Premiers niveaux débloqués pour tous les paths de la catégorie`);
    } catch (unlockError) {
      console.error(`⚠️  Erreur lors du déblocage des premiers niveaux:`, unlockError.message);
    }

    console.log(`\n🎉 Accès accordé avec succès!`);
    console.log(`   - Utilisateur: ${userId}`);
    console.log(`   - Catégorie: ${categoryDoc.translations?.fr?.name || categoryDoc.translations?.en?.name}`);
    console.log(`   - Path: ${targetPath.translations?.fr?.name || targetPath.translations?.en?.name}`);
    console.log(`   - Access ID: ${access._id}`);
    console.log(`   - Status: ${access.status}`);

    return access;

  } catch (error) {
    console.error(`\n❌ Erreur lors de l'attribution de l'accès:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Usage: node grantPathAccess.js <pathName> [userId]');
    console.error('   Exemple: node grantPathAccess.js "Programmation Débutant (Classique)"');
    process.exit(1);
  }

  const pathName = args[0];
  const userId = args[1] || DEFAULT_USER_ID;

  try {
    await connectDB();
    await grantPathAccess(pathName, userId);
    console.log('\n🎉 Opération terminée avec succès!');
  } catch (error) {
    console.error('\n💥 Erreur:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  main();
}

module.exports = { grantPathAccess };

