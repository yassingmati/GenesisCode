// Script pour tester l'authentification admin et obtenir un token valide
require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function testAdminAuth() {
    console.log('🔐 Test d\'authentification admin...\n');
    console.log('API URL:', API_URL);

    // Credentials admin par défaut (à adapter selon votre configuration)
    const credentials = {
        email: 'admin2@test.com',
        password: 'password123'
    };

    try {
        console.log('📤 Tentative de connexion avec:', credentials.email);

        const response = await axios.post(`${API_URL}/api/admin/login`, credentials);

        if (response.data.success) {
            console.log('\n✅ Connexion réussie!');
            console.log('📋 Token admin:', response.data.token);
            console.log('\n📝 Pour utiliser ce token dans votre navigateur:');
            console.log('1. Ouvrez la console du navigateur (F12)');
            console.log('2. Exécutez cette commande:');
            console.log(`   localStorage.setItem('adminToken', '${response.data.token}')`);
            console.log('3. Rechargez la page');

            return response.data.token;
        } else {
            console.log('❌ Échec de connexion:', response.data.message);
        }
    } catch (error) {
        console.error('\n❌ Erreur lors de la connexion:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data?.message || error.response.statusText);
        } else if (error.request) {
            console.error('   Aucune réponse du serveur. Le backend est-il démarré?');
            console.error('   URL tentée:', `${API_URL}/api/admin/login`);
        } else {
            console.error('   ', error.message);
        }
    }
}

testAdminAuth();
