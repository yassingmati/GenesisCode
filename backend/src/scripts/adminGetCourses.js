// src/scripts/adminGetCourses.js
// Script pour se connecter en tant qu'admin et récupérer les catégories, paths, levels et exercices
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');
const User = require('../models/User');
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');

// Fonction pour obtenir un token admin
async function getAdminToken() {
  try {
    // Essayer d'abord avec le modèle Admin
    const admin = await Admin.findOne({ email: 'admin@genesis.com' });
    if (admin) {
      const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: admin._id }, secret, { expiresIn: '1d' });
      return { token, admin: { id: admin._id, email: admin.email, type: 'admin' } };
    }

    // Sinon, essayer avec User ayant le rôle admin
    const userAdmin = await User.findOne({ roles: 'admin' });
    if (userAdmin) {
      const secret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: userAdmin._id }, secret, { expiresIn: '1d' });
      return { token, admin: { id: userAdmin._id, email: userAdmin.email, type: 'user' } };
    }

    // Si aucun admin trouvé, créer un admin temporaire
    console.log('⚠️  Aucun admin trouvé, création d\'un admin temporaire...');
    const newAdmin = new Admin({
      email: 'temp-admin@genesis.com',
      password: 'temp123456'
    });
    await newAdmin.save();
    const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign({ id: newAdmin._id }, secret, { expiresIn: '1d' });
    return { token, admin: { id: newAdmin._id, email: newAdmin.email, type: 'admin' } };
  } catch (error) {
    console.error('Erreur lors de la création du token admin:', error);
    throw error;
  }
}

// Fonction pour récupérer toutes les catégories
async function getCategories() {
  const categories = await Category.find({})
    .sort({ order: 1, createdAt: -1 })
    .lean()
    .exec();
  
  return categories.map(cat => ({
    id: cat._id,
    name: {
      fr: cat.translations?.fr?.name || '',
      en: cat.translations?.en?.name || '',
      ar: cat.translations?.ar?.name || ''
    },
    type: cat.type || 'classic',
    order: cat.order || 0,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt
  }));
}

// Fonction pour récupérer tous les paths avec leurs catégories
async function getPaths() {
  const paths = await Path.find({})
    .populate('category', 'translations type order')
    .sort({ order: 1 })
    .lean()
    .exec();
  
  return paths.map(path => ({
    id: path._id,
    name: {
      fr: path.translations?.fr?.name || '',
      en: path.translations?.en?.name || '',
      ar: path.translations?.ar?.name || ''
    },
    description: {
      fr: path.translations?.fr?.description || '',
      en: path.translations?.en?.description || '',
      ar: path.translations?.ar?.description || ''
    },
    category: {
      id: path.category?._id,
      name: {
        fr: path.category?.translations?.fr?.name || '',
        en: path.category?.translations?.en?.name || '',
        ar: path.category?.translations?.ar?.name || ''
      },
      type: path.category?.type || 'classic'
    },
    order: path.order || 0,
    levelsCount: path.levels?.length || 0,
    createdAt: path.createdAt,
    updatedAt: path.updatedAt
  }));
}

// Fonction pour récupérer tous les levels avec leurs paths
async function getLevels() {
  const levels = await Level.find({})
    .populate('path', 'translations category')
    .sort({ order: 1 })
    .lean()
    .exec();
  
  return levels.map(level => ({
    id: level._id,
    title: {
      fr: level.translations?.fr?.title || '',
      en: level.translations?.en?.title || '',
      ar: level.translations?.ar?.title || ''
    },
    content: {
      fr: level.translations?.fr?.content || '',
      en: level.translations?.en?.content || '',
      ar: level.translations?.ar?.content || ''
    },
    path: {
      id: level.path?._id,
      name: {
        fr: level.path?.translations?.fr?.name || '',
        en: level.path?.translations?.en?.name || '',
        ar: level.path?.translations?.ar?.name || ''
      }
    },
    order: level.order || 0,
    exercisesCount: level.exercises?.length || 0,
    videos: level.videos || {},
    pdfs: level.pdfs || {},
    createdAt: level.createdAt,
    updatedAt: level.updatedAt
  }));
}

// Fonction pour récupérer tous les exercices avec leurs levels
async function getExercises() {
  const exercises = await Exercise.find({})
    .populate('level', 'translations path')
    .sort({ createdAt: 1 })
    .lean()
    .exec();
  
  return exercises.map(ex => ({
    id: ex._id,
    name: {
      fr: ex.translations?.fr?.name || '',
      en: ex.translations?.en?.name || '',
      ar: ex.translations?.ar?.name || ''
    },
    question: {
      fr: ex.translations?.fr?.question || '',
      en: ex.translations?.en?.question || '',
      ar: ex.translations?.ar?.question || ''
    },
    type: ex.type,
    points: ex.points || 10,
    difficulty: ex.difficulty || 'medium',
    level: {
      id: ex.level?._id,
      title: {
        fr: ex.level?.translations?.fr?.title || '',
        en: ex.level?.translations?.en?.title || '',
        ar: ex.level?.translations?.ar?.title || ''
      }
    },
    createdAt: ex.createdAt,
    updatedAt: ex.updatedAt
  }));
}

// Fonction principale
async function main() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Obtenir un token admin
    console.log('🔐 Connexion en tant qu\'admin...');
    const { token, admin } = await getAdminToken();
    console.log(`✅ Connecté en tant qu'admin: ${admin.email} (${admin.type})\n`);
    console.log(`📝 Token admin: ${token.substring(0, 50)}...\n`);

    // Récupérer les catégories
    console.log('📂 Récupération des catégories...');
    const categories = await getCategories();
    console.log(`✅ ${categories.length} catégories trouvées\n`);
    
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.name.fr} (${cat.name.en})`);
      console.log(`     ID: ${cat.id}`);
      console.log(`     Type: ${cat.type}`);
      console.log(`     Ordre: ${cat.order}`);
    });

    // Récupérer les paths
    console.log('\n📁 Récupération des paths...');
    const paths = await getPaths();
    console.log(`✅ ${paths.length} paths trouvés\n`);
    
    paths.forEach((path, index) => {
      console.log(`  ${index + 1}. ${path.name.fr} (${path.name.en})`);
      console.log(`     ID: ${path.id}`);
      console.log(`     Catégorie: ${path.category.name.fr}`);
      console.log(`     Description: ${path.description.fr.substring(0, 50)}...`);
      console.log(`     Niveaux: ${path.levelsCount}`);
      console.log(`     Ordre: ${path.order}`);
    });

    // Récupérer les levels
    console.log('\n📄 Récupération des levels...');
    const levels = await getLevels();
    console.log(`✅ ${levels.length} levels trouvés\n`);
    
    levels.forEach((level, index) => {
      console.log(`  ${index + 1}. ${level.title.fr} (${level.title.en})`);
      console.log(`     ID: ${level.id}`);
      console.log(`     Path: ${level.path.name.fr}`);
      console.log(`     Contenu: ${level.content.fr.substring(0, 50)}...`);
      console.log(`     Exercices: ${level.exercisesCount}`);
      console.log(`     Ordre: ${level.order}`);
    });

    // Récupérer les exercices
    console.log('\n🎯 Récupération des exercices...');
    const exercises = await getExercises();
    console.log(`✅ ${exercises.length} exercices trouvés\n`);
    
    exercises.forEach((ex, index) => {
      console.log(`  ${index + 1}. ${ex.question.fr.substring(0, 50)}...`);
      console.log(`     ID: ${ex.id}`);
      console.log(`     Type: ${ex.type}`);
      console.log(`     Level: ${ex.level.title.fr}`);
      console.log(`     Points: ${ex.points}`);
      console.log(`     Difficulté: ${ex.difficulty}`);
    });

    // Résumé
    console.log('\n📊 Résumé:');
    console.log(`  - ${categories.length} catégories`);
    console.log(`  - ${paths.length} paths`);
    console.log(`  - ${levels.length} levels`);
    console.log(`  - ${exercises.length} exercices`);

    // Structure hiérarchique
    console.log('\n🌳 Structure hiérarchique:');
    for (const category of categories) {
      console.log(`\n📂 ${category.name.fr}`);
      const categoryPaths = paths.filter(p => p.category.id.toString() === category.id.toString());
      for (const path of categoryPaths) {
        console.log(`  📁 ${path.name.fr}`);
        const pathLevels = levels.filter(l => l.path.id.toString() === path.id.toString());
        for (const level of pathLevels) {
          console.log(`    📄 ${level.title.fr}`);
          const levelExercises = exercises.filter(e => e.level.id.toString() === level.id.toString());
          console.log(`      🎯 ${levelExercises.length} exercices`);
          levelExercises.forEach(ex => {
            console.log(`        - ${ex.type}: ${ex.question.fr.substring(0, 40)}...`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = main;

