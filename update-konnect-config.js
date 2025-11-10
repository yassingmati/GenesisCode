/**
 * Script pour mettre à jour la configuration Konnect dans backend/.env
 */

const fs = require('fs');
const path = require('path');

const KONNECT_CONFIG = {
  KONNECT_RECEIVER_WALLET_ID: '689f41076a8310ca27901216',
  // Note: L'API Konnect utilise api.sandbox.konnect.network, pas dashboard
  KONNECT_BASE_URL: 'https://api.sandbox.konnect.network',
  KONNECT_API_KEY: '689f41026a8310ca2790119a:tyoTF3caVuyYo09BxMIViXOXRdVz5wHA'
};

const envPath = path.resolve(__dirname, 'backend', '.env');

try {
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env non trouvé:', envPath);
    process.exit(1);
  }
  
  // Lire le fichier .env
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Mettre à jour ou ajouter chaque variable Konnect
  for (const [key, value] of Object.entries(KONNECT_CONFIG)) {
    if (envContent.includes(`${key}=`)) {
      // Remplacer la valeur existante
      const regex = new RegExp(`^${key}=.*$`, 'gm');
      envContent = envContent.replace(regex, `${key}=${value}`);
      console.log(`✅ ${key} mis à jour dans backend/.env`);
    } else {
      // Ajouter la variable si elle n'existe pas
      envContent += `\n${key}=${value}\n`;
      console.log(`✅ ${key} ajouté dans backend/.env`);
    }
  }
  
  // Écrire le fichier .env mis à jour
  fs.writeFileSync(envPath, envContent, 'utf-8');
  
  console.log('\n✅ Fichier backend/.env mis à jour avec succès');
  console.log('   Configuration Konnect:');
  console.log(`   - KONNECT_RECEIVER_WALLET_ID: ${KONNECT_CONFIG.KONNECT_RECEIVER_WALLET_ID}`);
  console.log(`   - KONNECT_BASE_URL: ${KONNECT_CONFIG.KONNECT_BASE_URL}`);
  console.log(`   - KONNECT_API_KEY: ${KONNECT_CONFIG.KONNECT_API_KEY.substring(0, 20)}...`);
  
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour:', error.message);
  process.exit(1);
}

