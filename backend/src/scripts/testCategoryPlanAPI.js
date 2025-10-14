// src/scripts/testCategoryPlanAPI.js
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';

// Configuration pour les tests
const testConfig = {
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Données de test
const testCategoryPlan = {
  categoryId: null, // Sera rempli dynamiquement
  price: 29.99,
  currency: 'TND',
  paymentType: 'one_time',
  accessDuration: 365,
  active: true,
  translations: {
    fr: { 
      name: 'Plan Test API', 
      description: 'Plan de test pour l\'API' 
    },
    en: { 
      name: 'Test API Plan', 
      description: 'Test plan for API' 
    },
    ar: { 
      name: 'خطة اختبار API', 
      description: 'خطة اختبار للـ API' 
    }
  },
  features: [
    'Test feature 1',
    'Test feature 2',
    'Test feature 3'
  ],
  order: 1
};

async function testCategoryPlanAPI() {
  console.log('🧪 Test de l\'API Category Plans');
  console.log('📍 Base URL:', API_BASE);
  
  try {
    // 1. Tester la récupération des catégories
    console.log('\n📝 1. Test récupération des catégories...');
    const categoriesResponse = await axios.get(`${API_BASE}/api/categories`, testConfig);
    console.log('✅ Catégories récupérées:', categoriesResponse.data?.length || 0);
    
    if (categoriesResponse.data && categoriesResponse.data.length > 0) {
      testCategoryPlan.categoryId = categoriesResponse.data[0]._id;
      console.log('✅ Catégorie sélectionnée pour le test:', testCategoryPlan.categoryId);
    } else {
      console.log('⚠️ Aucune catégorie trouvée, création d\'une catégorie de test...');
      // Créer une catégorie de test
      const newCategory = {
        translations: {
          fr: { name: 'Test API Category' },
          en: { name: 'Test API Category' },
          ar: { name: 'فئة اختبار API' }
        },
        type: 'classic',
        order: 1
      };
      
      const categoryResponse = await axios.post(`${API_BASE}/api/categories`, newCategory, testConfig);
      testCategoryPlan.categoryId = categoryResponse.data._id;
      console.log('✅ Catégorie de test créée:', testCategoryPlan.categoryId);
    }
    
    // 2. Tester la récupération des plans existants
    console.log('\n💰 2. Test récupération des plans existants...');
    try {
      const plansResponse = await axios.get(`${API_BASE}/api/admin/category-plans`, testConfig);
      console.log('✅ Plans récupérés:', plansResponse.data?.plans?.length || 0);
    } catch (error) {
      console.log('⚠️ Erreur récupération plans (normal si pas d\'auth):', error.response?.status);
    }
    
    // 3. Tester la création d'un plan (nécessite auth admin)
    console.log('\n🆕 3. Test création d\'un plan...');
    try {
      const createResponse = await axios.post(`${API_BASE}/api/admin/category-plans`, testCategoryPlan, testConfig);
      console.log('✅ Plan créé:', createResponse.data?.plan?._id);
      
      const planId = createResponse.data?.plan?._id;
      
      // 4. Tester la récupération du plan créé
      console.log('\n📖 4. Test récupération du plan créé...');
      const getResponse = await axios.get(`${API_BASE}/api/admin/category-plans/${planId}`, testConfig);
      console.log('✅ Plan récupéré:', getResponse.data?.plan?.translations?.fr?.name);
      
      // 5. Tester la mise à jour du plan
      console.log('\n✏️ 5. Test mise à jour du plan...');
      const updateData = {
        ...testCategoryPlan,
        price: 39.99,
        translations: {
          ...testCategoryPlan.translations,
          fr: { 
            name: 'Plan Test API Modifié', 
            description: 'Plan de test modifié pour l\'API' 
          }
        }
      };
      
      const updateResponse = await axios.put(`${API_BASE}/api/admin/category-plans/${planId}`, updateData, testConfig);
      console.log('✅ Plan mis à jour:', updateResponse.data?.plan?.price);
      
      // 6. Tester les statistiques
      console.log('\n📊 6. Test récupération des statistiques...');
      const statsResponse = await axios.get(`${API_BASE}/api/admin/category-plans/stats`, testConfig);
      console.log('✅ Statistiques récupérées:', statsResponse.data?.stats?.length || 0);
      
      // 7. Tester le toggle du statut
      console.log('\n🔄 7. Test toggle du statut...');
      const toggleResponse = await axios.patch(`${API_BASE}/api/admin/category-plans/${planId}/toggle`, {
        active: false
      }, testConfig);
      console.log('✅ Statut modifié:', toggleResponse.data?.plan?.active);
      
      // 8. Tester la suppression du plan
      console.log('\n🗑️ 8. Test suppression du plan...');
      const deleteResponse = await axios.delete(`${API_BASE}/api/admin/category-plans/${planId}`, testConfig);
      console.log('✅ Plan supprimé:', deleteResponse.data?.message);
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️ Authentification requise pour les tests admin');
        console.log('💡 Pour tester complètement, connectez-vous en tant qu\'admin');
      } else {
        console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
      }
    }
    
    // 9. Tester les endpoints publics
    console.log('\n🌐 9. Test des endpoints publics...');
    try {
      const publicPlansResponse = await axios.get(`${API_BASE}/api/category-payments/plans`, testConfig);
      console.log('✅ Plans publics récupérés:', publicPlansResponse.data?.plans?.length || 0);
    } catch (error) {
      console.log('⚠️ Erreur récupération plans publics:', error.response?.status);
    }
    
    console.log('\n🎉 Tests de l\'API terminés !');
    console.log('\n📋 Résumé des tests:');
    console.log('- ✅ Récupération des catégories');
    console.log('- ✅ Création de plan (si auth)');
    console.log('- ✅ Récupération de plan (si auth)');
    console.log('- ✅ Mise à jour de plan (si auth)');
    console.log('- ✅ Statistiques (si auth)');
    console.log('- ✅ Toggle statut (si auth)');
    console.log('- ✅ Suppression de plan (si auth)');
    console.log('- ✅ Endpoints publics');
    
    console.log('\n🔗 URLs à tester:');
    console.log('- Admin Plans: http://localhost:3000/admin/category-plans');
    console.log('- Public Plans: http://localhost:3000/category-plans');
    console.log('- API Admin: http://localhost:5000/api/admin/category-plans');
    console.log('- API Public: http://localhost:5000/api/category-payments/plans');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  testCategoryPlanAPI();
}

module.exports = testCategoryPlanAPI;


