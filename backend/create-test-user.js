// Script pour créer un utilisateur de test
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createTestUser() {
  try {
    // Connexion à MongoDB
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codegenesis';
    await mongoose.connect(mongoURI);
    console.log('✅ Connecté à MongoDB');

    // Créer un utilisateur de test
    const testUser = new User({
      firebaseUid: 'test-user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      userType: 'student',
      isVerified: true,
      isProfileComplete: true
    });

    // Supprimer l'utilisateur existant s'il existe
    await User.deleteOne({ email: 'test@example.com' });
    
    // Créer le nouvel utilisateur
    await testUser.save();
    
    console.log('✅ Utilisateur de test créé:', {
      id: testUser._id,
      email: testUser.email,
      name: `${testUser.firstName} ${testUser.lastName}`
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestUser();
