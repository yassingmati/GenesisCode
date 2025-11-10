/**
 * Script de test pour vérifier la connexion Konnect
 */

const { loadEnv } = require('./load-env');
loadEnv();

const axios = require('axios');

const KONNECT_API_KEY = process.env.KONNECT_API_KEY;
const KONNECT_BASE_URL = process.env.KONNECT_BASE_URL || 'https://api.sandbox.konnect.network';
const KONNECT_RECEIVER_WALLET_ID = process.env.KONNECT_RECEIVER_WALLET_ID;

async function testKonnectConnection() {
  console.log('🔍 Test de connexion Konnect\n');
  console.log('Configuration:');
  console.log(`  API Key: ${KONNECT_API_KEY ? KONNECT_API_KEY.substring(0, 20) + '...' : 'NON DÉFINIE'}`);
  console.log(`  Base URL: ${KONNECT_BASE_URL}`);
  console.log(`  Receiver Wallet ID: ${KONNECT_RECEIVER_WALLET_ID || 'NON DÉFINI'}\n`);
  
  if (!KONNECT_API_KEY) {
    console.error('❌ KONNECT_API_KEY non définie');
    return false;
  }
  
  if (!KONNECT_RECEIVER_WALLET_ID) {
    console.error('❌ KONNECT_RECEIVER_WALLET_ID non défini');
    return false;
  }
  
  try {
    // Test avec un petit montant (1 TND = 100 centimes)
    const testPayload = {
      receiverWalletId: KONNECT_RECEIVER_WALLET_ID,
      token: 'TND',
      amount: 100, // 1 TND
      type: 'immediate',
      returnUrl: 'http://localhost:3000/payment/success',
      return_url: 'http://localhost:3000/payment/success',
      merchant_order_id: `test-${Date.now()}`,
      description: 'Test de connexion Konnect',
      email: 'test@example.com'
    };
    
    console.log('📤 Envoi de la requête de test...');
    const url = `${KONNECT_BASE_URL.replace(/\/$/, '')}/api/v2/payments/init-payment`;
    
    const response = await axios.post(url, testPayload, {
      headers: {
        'x-api-key': KONNECT_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Connexion Konnect réussie!');
    console.log('Réponse:', JSON.stringify(response.data, null, 2));
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de connexion Konnect:');
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('  Message:', error.message);
    }
    return false;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  testKonnectConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testKonnectConnection };

