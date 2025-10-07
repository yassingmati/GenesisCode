#!/usr/bin/env node

/**
 * Test de performance pour l'authentification
 * Mesure les temps de réponse des endpoints d'authentification
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Données de test
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

const performanceTest = async () => {
  console.log('🚀 Starting authentication performance test...\n');
  
  const results = [];
  
  // Test 1: Login endpoint
  console.log('📊 Testing login endpoint...');
  for (let i = 0; i < 5; i++) {
    const startTime = performance.now();
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testCredentials);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      results.push({
        test: 'login',
        duration: duration,
        status: response.status,
        success: true
      });
      
      console.log(`  ✅ Test ${i + 1}: ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      results.push({
        test: 'login',
        duration: duration,
        status: error.response?.status || 500,
        success: false,
        error: error.message
      });
      
      console.log(`  ❌ Test ${i + 1}: ${duration.toFixed(2)}ms (${error.message})`);
    }
  }
  
  // Calcul des statistiques
  const loginResults = results.filter(r => r.test === 'login' && r.success);
  if (loginResults.length > 0) {
    const avgDuration = loginResults.reduce((sum, r) => sum + r.duration, 0) / loginResults.length;
    const minDuration = Math.min(...loginResults.map(r => r.duration));
    const maxDuration = Math.max(...loginResults.map(r => r.duration));
    
    console.log('\n📈 Performance Statistics:');
    console.log(`  Average: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Min: ${minDuration.toFixed(2)}ms`);
    console.log(`  Max: ${maxDuration.toFixed(2)}ms`);
    
    // Évaluation des performances
    if (avgDuration < 1000) {
      console.log('  🎉 Excellent performance! (< 1s)');
    } else if (avgDuration < 2000) {
      console.log('  ✅ Good performance (< 2s)');
    } else if (avgDuration < 3000) {
      console.log('  ⚠️  Acceptable performance (< 3s)');
    } else {
      console.log('  ❌ Poor performance (> 3s)');
    }
  }
  
  console.log('\n🏁 Performance test completed!');
};

// Exécuter le test
if (require.main === module) {
  performanceTest().catch(console.error);
}

module.exports = performanceTest;
