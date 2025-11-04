// src/scripts/testCategoryPlansEndpoint.js
// Script pour tester l'endpoint /api/category-payments/plans
const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint /api/category-payments/plans\n');
    
    const response = await axios.get('http://localhost:5000/api/category-payments/plans', {
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 500 // Accepter les erreurs 4xx pour voir la réponse
    });
    
    console.log('✅ Réponse reçue:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ Endpoint fonctionne correctement');
      console.log(`   ${response.data?.plans?.length || 0} plans trouvés`);
    } else {
      console.log('\n❌ Endpoint retourne une erreur:', response.status);
      console.log('Message:', response.data?.message || response.data);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

if (require.main === module) {
  testEndpoint();
}

module.exports = testEndpoint;

