// Script de test pour vérifier la connexion MongoDB depuis Firebase Functions
const mongoose = require('mongoose');

// Simuler le chargement de la configuration Firebase Functions
let functionsConfig = null;
try {
  const functions = require('firebase-functions');
  functionsConfig = functions.config();
  console.log('✅ Firebase Functions config chargé');
} catch (err) {
  console.log('ℹ️  Mode local - utilisation de process.env');
  require('dotenv').config();
}

// Load environment variables from Firebase Functions config or process.env
const getEnvVar = (key, defaultValue = '') => {
  if (functionsConfig) {
    const keys = key.split('.');
    let value = functionsConfig;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    if (value !== undefined) {
      return value;
    }
  }
  const envValue = process.env[key] || process.env[key.replace('.', '_').toUpperCase()];
  return envValue || defaultValue;
};

async function testConnection() {
  try {
    const mongoURI = getEnvVar('mongodb.uri') || getEnvVar('MONGODB_URI');
    
    if (!mongoURI) {
      console.error('❌ URI MongoDB non trouvée');
      console.log('\n📋 Configuration actuelle:');
      if (functionsConfig) {
        console.log('   functions.config():', JSON.stringify(functionsConfig, null, 2));
      } else {
        console.log('   process.env.MONGODB_URI:', process.env.MONGODB_URI || 'Non défini');
      }
      process.exit(1);
    }

    console.log('🔗 Test de connexion MongoDB...');
    console.log(`   URI: ${mongoURI.replace(/:[^:@]+@/, ':****@')}\n`);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });

    console.log('✅ Connexion MongoDB réussie!');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);

    // Test simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📊 Collections trouvées: ${collections.length}`);
    collections.slice(0, 5).forEach(col => {
      console.log(`   - ${col.name}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Test terminé avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur de connexion MongoDB:');
    console.error(`   Message: ${error.message}`);
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 Vérifiez le mot de passe MongoDB dans la configuration');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Vérifiez Network Access dans MongoDB Atlas (0.0.0.0/0)');
    }
    process.exit(1);
  }
}

testConnection();

