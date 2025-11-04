#!/usr/bin/env node

/**
 * Script pour trouver un path ou une catégorie dans la base de données
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Path = require('../models/Path');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion à la base de données établie');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    throw error;
  }
}

async function search(searchTerm) {
  try {
    console.log(`\n🔍 Recherche de: "${searchTerm}"\n`);

    // Rechercher dans les catégories
    const categories = await Category.find({
      $or: [
        { 'translations.fr.name': { $regex: searchTerm, $options: 'i' } },
        { 'translations.en.name': { $regex: searchTerm, $options: 'i' } },
        { 'translations.ar.name': { $regex: searchTerm, $options: 'i' } }
      ]
    }).lean();

    console.log(`📚 Catégories trouvées (${categories.length}):`);
    categories.forEach(cat => {
      console.log(`   - ID: ${cat._id}`);
      console.log(`     Nom FR: ${cat.translations?.fr?.name || 'N/A'}`);
      console.log(`     Nom EN: ${cat.translations?.en?.name || 'N/A'}`);
      console.log(`     Type: ${cat.type || 'N/A'}`);
      console.log('');
    });

    // Rechercher dans les paths
    const paths = await Path.find({
      $or: [
        { 'translations.fr.name': { $regex: searchTerm, $options: 'i' } },
        { 'translations.en.name': { $regex: searchTerm, $options: 'i' } },
        { 'translations.ar.name': { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('category', 'translations').lean();

    console.log(`🛤️  Paths trouvés (${paths.length}):`);
    paths.forEach(path => {
      console.log(`   - ID: ${path._id}`);
      console.log(`     Nom FR: ${path.translations?.fr?.name || 'N/A'}`);
      console.log(`     Nom EN: ${path.translations?.en?.name || 'N/A'}`);
      console.log(`     Catégorie: ${path.category?.translations?.fr?.name || path.category?.translations?.en?.name || path.category || 'N/A'}`);
      console.log('');
    });

    // Si rien n'est trouvé, lister toutes les catégories et paths
    if (categories.length === 0 && paths.length === 0) {
      console.log('\n📋 Liste de toutes les catégories:');
      const allCategories = await Category.find().lean();
      allCategories.forEach(cat => {
        console.log(`   - ${cat.translations?.fr?.name || cat.translations?.en?.name || 'N/A'} (${cat._id})`);
      });

      console.log('\n📋 Liste de tous les paths:');
      const allPaths = await Path.find().populate('category', 'translations').lean();
      allPaths.forEach(path => {
        console.log(`   - ${path.translations?.fr?.name || path.translations?.en?.name || 'N/A'} (${path._id})`);
        console.log(`     Catégorie: ${path.category?.translations?.fr?.name || path.category?.translations?.en?.name || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

async function main() {
  const searchTerm = process.argv[2] || 'Débutant';
  
  try {
    await connectDB();
    await search(searchTerm);
  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}

