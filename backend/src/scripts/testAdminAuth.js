// src/scripts/testAdminAuth.js
// Script pour tester l'authentification admin et récupérer les catégories
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

const Admin = require('../models/Admin');

async function testAdminAuth() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer un admin
    const admin = await Admin.findOne({ email: 'admin@genesis.com' });
    if (!admin) {
      console.log('❌ Admin non trouvé');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Générer un token admin
    const adminSecret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign({ id: admin._id }, adminSecret, { expiresIn: '1d' });
    
    console.log('🔐 Token admin généré');
    console.log(`   Secret utilisé: ${adminSecret}`);
    console.log(`   Admin ID: ${admin._id}`);
    console.log(`   Token (premiers 50 chars): ${token.substring(0, 50)}...\n`);

    // Tester l'API avec le token
    const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
    
    console.log('📡 Test de l\'API avec le token admin...\n');

    // Test 1: Récupérer les catégories classic
    try {
      console.log('1️⃣ Test GET /api/courses/categories?type=classic');
      const response1 = await axios.get(`${API_BASE}/api/courses/categories?type=classic`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   ✅ Succès: ${response1.data.length} catégories classic trouvées\n`);
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
    }

    // Test 2: Récupérer les catégories specific
    try {
      console.log('2️⃣ Test GET /api/courses/categories?type=specific');
      const response2 = await axios.get(`${API_BASE}/api/courses/categories?type=specific`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   ✅ Succès: ${response2.data.length} catégories specific trouvées\n`);
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
    }

    // Test 3: Récupérer toutes les catégories
    try {
      console.log('3️⃣ Test GET /api/courses/categories');
      const response3 = await axios.get(`${API_BASE}/api/courses/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   ✅ Succès: ${response3.data.length} catégories trouvées\n`);
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
    }

    // Test 4: Récupérer les paths
    try {
      console.log('4️⃣ Test GET /api/courses/paths');
      const response4 = await axios.get(`${API_BASE}/api/courses/paths`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`   ✅ Succès: ${response4.data.length} paths trouvés\n`);
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.response?.status} - ${err.response?.data?.message || err.message}\n`);
    }

    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter
if (require.main === module) {
  testAdminAuth();
}

module.exports = testAdminAuth;

