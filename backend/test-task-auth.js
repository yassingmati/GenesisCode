/**
 * Script de test pour diagnostiquer les problèmes d'authentification des tasks
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

async function testTaskTemplatesAuth() {
  console.log('🔍 Test d\'authentification pour /api/admin/task-templates\n');

  // Test 1: Sans token
  console.log('1️⃣ Test sans token:');
  try {
    await axios.get(`${API_URL}/admin/task-templates`);
    console.log('   ❌ Erreur: Devrait retourner 401');
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('   ✅ Correctement protégé (401)');
    } else {
      console.log(`   ⚠️  Status inattendu: ${err.response?.status}`);
    }
  }

  // Test 2: Avec token admin depuis localStorage (simulé)
  console.log('\n2️⃣ Test avec token admin:');
  const adminToken = process.env.ADMIN_TOKEN || 'test-token';
  try {
    const response = await axios.get(`${API_URL}/admin/task-templates`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Succès:', response.status);
    console.log('   📊 Templates:', response.data.length);
  } catch (err) {
    console.log(`   ❌ Erreur: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
    if (err.response?.data?.error) {
      console.log('   📋 Détails:', err.response.data.error);
    }
  }

  // Test 3: Vérifier la connexion MongoDB
  console.log('\n3️⃣ Test de santé du serveur:');
  try {
    const health = await axios.get(`${API_BASE}/api/health`);
    console.log('   ✅ Serveur OK');
    console.log('   📊 Database:', health.data.database);
  } catch (err) {
    console.log('   ❌ Serveur non accessible');
  }
}

testTaskTemplatesAuth().catch(console.error);

