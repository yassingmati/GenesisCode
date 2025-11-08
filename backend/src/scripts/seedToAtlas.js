// src/scripts/seedToAtlas.js
// Script pour vérifier la connexion MongoDB Atlas et exécuter le seed
const mongoose = require('mongoose');
require('dotenv').config();

const seedAllCategories = require('./seedAllCategoriesComplete');

async function checkAndSeedToAtlas() {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI n\'est pas défini dans backend/.env');
      console.log('\n📋 Pour configurer MongoDB Atlas:');
      console.log('1. Exécutez: node setup-mongodb-atlas.js');
      console.log('2. Ou modifiez manuellement backend/.env avec:');
      console.log('   MONGODB_URI=mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0');
      process.exit(1);
    }

    // Vérifier si c'est une connexion Atlas ou locale
    const isAtlas = mongoURI.includes('mongodb+srv://') || mongoURI.includes('@cluster');
    const isLocal = mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1');

    console.log('🔍 Vérification de la configuration MongoDB...\n');
    
    if (isLocal) {
      console.log('⚠️  ATTENTION: Vous êtes connecté à MongoDB LOCAL (Compass)');
      console.log('   URI actuelle:', mongoURI.replace(/:[^:@]+@/, ':****@'));
      console.log('\n📋 Pour se connecter à MongoDB Atlas:');
      console.log('1. Exécutez: node setup-mongodb-atlas.js');
      console.log('2. Ou modifiez backend/.env avec votre URI Atlas');
      console.log('\n❌ Le seed ne sera pas exécuté vers Atlas.');
      process.exit(1);
    }

    if (!isAtlas) {
      console.log('⚠️  URI MongoDB non reconnue comme Atlas ou Local');
      console.log('   URI:', mongoURI.replace(/:[^:@]+@/, ':****@'));
      console.log('\nVoulez-vous continuer quand même? (o/n)');
      // Pour l'instant, on continue
    }

    console.log('✅ Connexion à MongoDB Atlas détectée');
    console.log('   Cluster:', mongoURI.match(/@([^/]+)/)?.[1] || 'Non détecté');
    console.log('   Base de données: codegenesis\n');

    // Tester la connexion
    console.log('🔗 Test de connexion à MongoDB Atlas...');
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000
      });
      console.log('✅ Connexion réussie à MongoDB Atlas!\n');
    } catch (error) {
      console.error('❌ Erreur de connexion à MongoDB Atlas:', error.message);
      if (error.message.includes('authentication failed')) {
        console.log('\n💡 Vérifiez le mot de passe dans backend/.env');
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Vérifiez Network Access dans MongoDB Atlas (0.0.0.0/0)');
      }
      process.exit(1);
    }

    // Exécuter le seed
    console.log('🌱 Exécution du seed vers MongoDB Atlas...\n');
    await seedAllCategories();

    console.log('\n✅ Seed terminé avec succès vers MongoDB Atlas!');
    console.log('📊 Vérifiez vos données dans MongoDB Atlas Data Explorer');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  checkAndSeedToAtlas();
}

module.exports = checkAndSeedToAtlas;

