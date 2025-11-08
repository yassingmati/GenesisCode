// Script pour tester la connexion MongoDB Atlas
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testMongoDBConnection() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('     TEST DE CONNEXION MONGODB ATLAS', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  // Vérifier que MONGODB_URI est défini
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoURI) {
    log('❌ MONGODB_URI non défini dans les variables d\'environnement', 'red');
    log('💡 Vérifiez que le fichier backend/.env contient MONGODB_URI', 'yellow');
    process.exit(1);
  }

  // Afficher l'URI (masquer le mot de passe)
  const uriDisplay = mongoURI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@');
  log(`📄 URI MongoDB chargée: ${uriDisplay}`, 'cyan');

  // Vérifier si c'est MongoDB Atlas ou localhost
  if (mongoURI.includes('mongodb://localhost') || mongoURI.includes('127.0.0.1')) {
    log('⚠️  URI pointe vers localhost au lieu de MongoDB Atlas', 'yellow');
    log('💡 Pour utiliser MongoDB Atlas, configurez: node setup-mongodb.js', 'cyan');
  } else if (mongoURI.includes('mongodb+srv://')) {
    log('✅ URI MongoDB Atlas détectée', 'green');
  }

  // Tester la connexion
  log('\n🔗 Tentative de connexion à MongoDB...', 'cyan');
  
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    });

    log('✅ Connecté à MongoDB avec succès!', 'green');
    
    // Vérifier la connexion
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    log(`📊 État de la connexion: ${states[dbState]} (${dbState})`, 'cyan');
    
    // Tester une opération simple
    log('\n🧪 Test d\'opération MongoDB...', 'cyan');
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`✅ Collections trouvées: ${collections.length}`, 'green');
    
    if (collections.length > 0) {
      log('   Collections:', 'cyan');
      collections.forEach(col => log(`   - ${col.name}`, 'white'));
    }

    // Fermer la connexion
    await mongoose.connection.close();
    log('\n✅ Test de connexion MongoDB réussi!', 'green');
    log('\n📋 Résumé:', 'cyan');
    log('✅ MongoDB Atlas est correctement configuré', 'green');
    log('✅ La connexion fonctionne', 'green');
    log('✅ Le serveur peut maintenant se connecter à MongoDB', 'green');
    
    process.exit(0);
  } catch (err) {
    log('\n❌ Erreur de connexion MongoDB:', 'red');
    log(`   ${err.message}`, 'red');
    
    // Afficher des suggestions selon le type d'erreur
    if (err.message.includes('authentication failed') || err.message.includes('Authentication failed')) {
      log('\n💡 Problème d\'authentification:', 'yellow');
      log('   - Vérifiez que le mot de passe dans backend/.env est correct', 'white');
      log('   - Vérifiez que l\'utilisateur "discord" existe dans MongoDB Atlas', 'white');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      log('\n💡 Problème de connexion réseau:', 'yellow');
      log('   - Vérifiez que Network Access est configuré dans MongoDB Atlas (0.0.0.0/0)', 'white');
      log('   - Vérifiez votre connexion internet', 'white');
      log('   - Vérifiez que le cluster MongoDB Atlas est actif', 'white');
    } else if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
      log('\n💡 Problème de timeout:', 'yellow');
      log('   - Vérifiez votre connexion internet', 'white');
      log('   - Vérifiez que le cluster MongoDB Atlas est actif', 'white');
      log('   - Essayez d\'augmenter le timeout dans backend/src/index.js', 'white');
    }
    
    process.exit(1);
  }
}

testMongoDBConnection().catch(err => {
  log(`\n❌ Erreur fatale: ${err.message}`, 'red');
  process.exit(1);
});

