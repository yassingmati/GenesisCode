/**
 * Script de vérification de l'environnement
 * Vérifie que toutes les variables d'environnement nécessaires sont configurées
 */

// Charger les variables d'environnement depuis backend/.env
const { loadEnv } = require('./load-env');
loadEnv();

const requiredEnvVars = {
  mongodb: {
    name: 'MONGODB_URI',
    description: 'Connection string MongoDB',
    required: true
  },
  jwtSecret: {
    name: 'JWT_SECRET',
    description: 'Secret JWT pour utilisateurs',
    required: true
  },
  adminJWTSecret: {
    name: 'JWT_ADMIN_SECRET',
    description: 'Secret JWT pour admins',
    required: true
  },
  emailUser: {
    name: 'EMAIL_USER',
    description: 'Email Gmail pour envoi',
    required: true
  },
  emailPass: {
    name: 'EMAIL_PASS',
    description: 'Mot de passe application Gmail',
    required: true
  },
  serverUrl: {
    name: 'SERVER_URL',
    description: 'URL du backend',
    required: false,
    default: 'http://localhost:5000'
  },
  clientUrl: {
    name: 'CLIENT_URL',
    description: 'URL du frontend',
    required: false,
    default: 'http://localhost:3000'
  }
};

function checkEnvironment() {
  console.log('🔍 Vérification de l\'environnement...\n');
  
  let allOk = true;
  const results = {};
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[config.name];
    const isSet = !!value;
    const isRequired = config.required !== false;
    
    if (!isSet && isRequired) {
      console.log(`❌ ${config.name}: NON DÉFINI (requis)`);
      console.log(`   Description: ${config.description}`);
      allOk = false;
      results[key] = { ok: false, message: 'Non défini (requis)' };
    } else if (!isSet && !isRequired) {
      console.log(`⚠️  ${config.name}: NON DÉFINI (optionnel, défaut: ${config.default})`);
      console.log(`   Description: ${config.description}`);
      results[key] = { ok: true, message: `Non défini (utilisera ${config.default})` };
    } else {
      // Masquer les valeurs sensibles
      let displayValue = value;
      if (key === 'mongodb') {
        displayValue = value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      } else if (key === 'jwtSecret' || key === 'adminJWTSecret' || key === 'emailPass') {
        displayValue = value.substring(0, 10) + '...';
      }
      
      console.log(`✅ ${config.name}: DÉFINI`);
      console.log(`   Valeur: ${displayValue}`);
      results[key] = { ok: true, message: 'Défini' };
    }
    console.log('');
  }
  
  console.log('='.repeat(60));
  if (allOk) {
    console.log('✅ Toutes les variables d\'environnement requises sont configurées');
  } else {
    console.log('❌ Certaines variables d\'environnement requises sont manquantes');
    console.log('\n📝 Instructions:');
    console.log('1. Copiez backend/env.example vers backend/.env');
    console.log('2. Remplissez les valeurs manquantes');
    console.log('3. Pour Gmail, créez un mot de passe d\'application:');
    console.log('   https://myaccount.google.com/apppasswords');
  }
  console.log('='.repeat(60) + '\n');
  
  return { allOk, results };
}

// Test de connexion MongoDB
async function testMongoConnection() {
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  MONGODB_URI non défini - test de connexion ignoré\n');
    return false;
  }
  
  console.log('🔗 Test de connexion MongoDB...\n');
  
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connexion MongoDB réussie\n');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    console.log('');
    return false;
  }
}

// Test de connexion au backend
async function testBackendConnection() {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  console.log(`🔗 Test de connexion au backend (${serverUrl})...\n`);
  
  try {
    const response = await fetch(`${serverUrl}/api/subscriptions/plans`).catch(() => null);
    
    if (response && response.ok) {
      console.log('✅ Backend accessible\n');
      return true;
    } else {
      console.log('❌ Backend non accessible');
      console.log('   Assurez-vous que le backend est démarré sur', serverUrl);
      console.log('');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('');
    return false;
  }
}

// Test de configuration email
async function testEmailConfig() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Configuration email incomplète - test ignoré\n');
    return false;
  }
  
  console.log('📧 Test de configuration email...\n');
  
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Tester la configuration (sans envoyer d'email)
    await transporter.verify();
    console.log('✅ Configuration email valide\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur de configuration email:', error.message);
    console.log('   Vérifiez que EMAIL_USER et EMAIL_PASS sont corrects');
    console.log('   Pour Gmail, utilisez un mot de passe d\'application');
    console.log('');
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VÉRIFICATION DE L\'ENVIRONNEMENT');
  console.log('='.repeat(60) + '\n');
  
  const envCheck = checkEnvironment();
  
  if (!envCheck.allOk) {
    console.log('❌ Configuration incomplète - certains tests peuvent échouer\n');
    process.exit(1);
  }
  
  // Tests optionnels
  const mongoOk = await testMongoConnection();
  const backendOk = await testBackendConnection();
  const emailOk = await testEmailConfig();
  
  console.log('='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`Variables d'environnement: ${envCheck.allOk ? '✅' : '❌'}`);
  console.log(`Connexion MongoDB: ${mongoOk ? '✅' : '❌'}`);
  console.log(`Connexion Backend: ${backendOk ? '✅' : '❌'}`);
  console.log(`Configuration Email: ${emailOk ? '✅' : '❌'}`);
  console.log('='.repeat(60) + '\n');
  
  if (envCheck.allOk && mongoOk && backendOk && emailOk) {
    console.log('✅ Tout est prêt pour exécuter les tests!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Certains tests peuvent échouer\n');
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = { checkEnvironment, testMongoConnection, testBackendConnection, testEmailConfig };

