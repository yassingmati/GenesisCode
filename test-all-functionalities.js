// Script de test pour toutes les fonctionnalités
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://codegenesis-backend.onrender.com';

// Fonction pour tester avec token
async function testWithAuth(endpoint, method = 'GET', data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Tests
async function runTests() {
  console.log('🧪 Début des tests des fonctionnalités...\n');
  
  // Test 1: Health check
  console.log('1️⃣  Test Health Check...');
  const health = await testWithAuth('/api/health');
  console.log(health.success ? '✅ Health check OK' : `❌ Health check failed: ${health.error}`);
  console.log('');
  
  // Test 2: Login (nécessaire pour les autres tests)
  console.log('2️⃣  Test Login...');
  const login = await testWithAuth('/api/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'test123'
  });
  let token = null;
  if (login.success && login.data.token) {
    token = login.data.token;
    console.log('✅ Login réussi');
  } else {
    console.log(`❌ Login failed: ${login.error}`);
    console.log('⚠️  Les tests suivants nécessitent une authentification');
  }
  console.log('');
  
  if (token) {
    // Test 3: Profile
    console.log('3️⃣  Test Profile...');
    const profile = await testWithAuth('/api/users/profile', 'GET', null, token);
    console.log(profile.success ? '✅ Profile OK' : `❌ Profile failed: ${profile.error}`);
    console.log('');
    
    // Test 4: Update Profile
    console.log('4️⃣  Test Update Profile...');
    const updateProfile = await testWithAuth('/api/users/profile', 'PUT', {
      firstName: 'Test',
      lastName: 'User'
    }, token);
    console.log(updateProfile.success ? '✅ Update Profile OK' : `❌ Update Profile failed: ${updateProfile.error}`);
    console.log('');
    
    // Test 5: Categories
    console.log('5️⃣  Test Categories...');
    const categories = await testWithAuth('/api/courses/categories', 'GET', null, token);
    console.log(categories.success ? `✅ Categories OK (${categories.data?.length || 0} catégories)` : `❌ Categories failed: ${categories.error}`);
    console.log('');
    
    // Test 6: Notifications
    console.log('6️⃣  Test Notifications...');
    const notifications = await testWithAuth('/api/notifications', 'GET', null, token);
    console.log(notifications.success ? `✅ Notifications OK (${notifications.data?.length || 0} notifications)` : `❌ Notifications failed: ${notifications.error}`);
    console.log('');
    
    // Test 7: Subscriptions
    console.log('7️⃣  Test Subscriptions...');
    const subscriptions = await testWithAuth('/api/subscriptions/me', 'GET', null, token);
    console.log(subscriptions.success ? '✅ Subscriptions OK' : `❌ Subscriptions failed: ${subscriptions.error}`);
    console.log('');
    
    // Test 8: Category Plans
    console.log('8️⃣  Test Category Plans...');
    const categoryPlans = await testWithAuth('/api/category-payments/plans', 'GET');
    console.log(categoryPlans.success ? `✅ Category Plans OK (${categoryPlans.data?.plans?.length || 0} plans)` : `❌ Category Plans failed: ${categoryPlans.error}`);
    console.log('');
  }
  
  console.log('✅ Tests terminés');
}

// Exécuter les tests
runTests().catch(console.error);

