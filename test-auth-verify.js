/**
 * Script de test pour vérifier l'authentification
 */

const { loadEnv } = require('./load-env');
loadEnv();

require('./test-helpers');

const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, 'backend', 'src', 'models', 'User'));
const jwt = require('jsonwebtoken');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function testAuth() {
  try {
    // Connecter à MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    }
    
    const testEmail = 'test-auth-verify@test.com';
    
    // Créer ou récupérer l'utilisateur
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      user = new User({
        firebaseUid: `test-auth-verify-${Date.now()}`,
        email: testEmail,
        firstName: 'Test',
        lastName: 'Auth',
        userType: 'student',
        isVerified: true,
        isProfileComplete: true
      });
      await user.save();
    }
    
    console.log('✅ Utilisateur créé/trouvé:', user._id.toString());
    
    // Vérifier que l'utilisateur existe dans la base
    const verifyUser = await User.findById(user._id);
    console.log('✅ Utilisateur vérifié dans la base:', verifyUser ? 'OUI' : 'NON');
    
    // Créer un token comme dans authController
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('✅ Token créé');
    
    // Décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token décodé, ID:', decoded.id, 'Type:', typeof decoded.id);
    
    // Vérifier que l'utilisateur peut être trouvé avec cet ID
    const foundUser = await User.findById(decoded.id);
    console.log('✅ Utilisateur trouvé avec decoded.id:', foundUser ? 'OUI' : 'NON');
    
    if (!foundUser) {
      // Essayer avec string
      const foundUserString = await User.findById(decoded.id.toString());
      console.log('✅ Utilisateur trouvé avec decoded.id.toString():', foundUserString ? 'OUI' : 'NON');
      
      // Essayer avec ObjectId
      const mongoose = require('mongoose');
      const foundUserObjectId = await User.findById(new mongoose.Types.ObjectId(decoded.id));
      console.log('✅ Utilisateur trouvé avec ObjectId:', foundUserObjectId ? 'OUI' : 'NON');
    }
    
    // Tester l'API
    console.log('\n📡 Test de l\'API avec le token...');
    const response = await fetch(`${API_BASE}/api/subscriptions/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📡 Réponse API:', response.status, data);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testAuth();

