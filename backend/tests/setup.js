const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Charger tous les modèles nécessaires pour les tests
require('../src/models/User');
require('../src/models/Category');
require('../src/models/Path');
require('../src/models/Level');
require('../src/models/Exercise');
require('../src/models/Plan');
require('../src/models/CourseAccess');
require('../src/models/CategoryAccess');
require('../src/models/CategoryPlan');
require('../src/models/Subscription');
require('../src/models/UserLevelProgress');

let mongoServer;

// Avant tous les tests
beforeAll(async () => {
  // Démarrer MongoDB Memory Server avec timeout plus long
  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'jest-test-db'
    },
    binary: {
      version: '6.0.14',
      skipMD5: true
    }
  });
  const mongoUri = mongoServer.getUri();
  
  // Connecter Mongoose
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  console.log('✅ MongoDB Memory Server started for tests');
}, 120000); // Timeout de 2 minutes pour le téléchargement initial

// Avant chaque test
beforeEach(async () => {
  // Nettoyer toutes les collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Après tous les tests
afterAll(async () => {
  // Fermer la connexion Mongoose
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Arrêter MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('✅ MongoDB Memory Server stopped');
});

// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.APP_BASE_URL = 'http://localhost:5000';

