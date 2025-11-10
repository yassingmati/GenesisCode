/**
 * Tests pour la création d'admin
 */

// Charger les variables d'environnement depuis backend/.env
const { loadEnv } = require('./load-env');
loadEnv();

// Charger les helpers pour les modules
require('./test-helpers');

// Charger les modules
let mongoose, User, Admin;
try {
  mongoose = require('mongoose');
  User = require('./backend/src/models/User');
  Admin = require('./backend/src/models/Admin');
} catch (error) {
  console.error('Erreur lors du chargement des modules:', error.message);
  // Utiliser des chemins alternatifs si nécessaire
  const path = require('path');
  const backendModelsPath = path.join(__dirname, 'backend', 'src', 'models');
  mongoose = require('mongoose');
  User = require(path.join(backendModelsPath, 'User'));
  Admin = require(path.join(backendModelsPath, 'Admin'));
}

// Variables globales pour stocker les données de test
let adminToken = null;
let adminUser = null;
let createdAdminId = null;

/**
 * Test 1.1: Création admin via script
 */
async function testAdminCreationViaScript(logResult) {
  try {
    // Connecter à MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    }
    
    // Vérifier si l'admin existe déjà
    let admin = await User.findOne({ email: 'admin@test.com' });
    
    if (!admin) {
      // Créer l'admin
      admin = new User({
        firebaseUid: `admin-system-${Date.now()}`,
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'System',
        userType: 'student',
        roles: ['admin'],
        isVerified: true,
        isProfileComplete: true
      });
      await admin.save();
    } else {
      // Vérifier que l'admin a les droits
      if (!admin.roles.includes('admin')) {
        admin.roles.push('admin');
        await admin.save();
      }
    }
    
    // Vérifications
    const checks = {
      exists: !!admin,
      hasAdminRole: admin.roles.includes('admin'),
      isVerified: admin.isVerified === true,
      emailCorrect: admin.email === 'admin@test.com'
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('adminCreation', 'Création admin via script', allPassed, 
      allPassed ? 'Admin créé avec succès' : 'Échec de la création admin',
      { checks, adminId: admin._id.toString() }
    );
    
    adminUser = admin;
    return admin;
  } catch (error) {
    logResult('adminCreation', 'Création admin via script', false, 
      `Erreur: ${error.message}`, { error: error.message, stack: error.stack }
    );
    throw error;
  }
}

/**
 * Test 1.2: Création admin via API
 */
async function testAdminCreationViaAPI(apiBaseUrl, logResult) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/admin/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin2@test.com',
        password: 'password123'
      }),
      signal: AbortSignal.timeout(10000) // Timeout de 10 secondes
    }).catch(err => {
      logResult('adminCreation', 'Création admin via API', false,
        `Erreur de connexion: ${err.message}. Vérifiez que le backend est démarré.`, 
        { error: err.message, apiBaseUrl }
      );
      return null;
    });
    
    if (!response) {
      return null;
    }
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      logResult('adminCreation', 'Création admin via API', false,
        `Réponse invalide (${response.status}): ${text.substring(0, 100)}`, 
        { responseStatus: response.status, responseText: text }
      );
      return null;
    }
    
    const checks = {
      statusOk: response.status === 201,
      hasToken: !!data.token,
      hasAdmin: !!data.admin,
      emailCorrect: data.admin?.email === 'admin2@test.com'
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('adminCreation', 'Création admin via API', allPassed,
      allPassed ? 'Admin créé via API avec succès' : `Échec (${response.status}): ${data.message || JSON.stringify(data).substring(0, 100)}`,
      { checks, responseStatus: response.status, data }
    );
    
    if (data.token) {
      adminToken = data.token;
      createdAdminId = data.admin?.id;
    }
    
    return data;
  } catch (error) {
    logResult('adminCreation', 'Création admin via API', false,
      `Erreur: ${error.message}`, { error: error.message, stack: error.stack }
    );
    return null;
  }
}

/**
 * Test 1.3: Authentification admin
 */
async function testAdminAuthentication(apiBaseUrl, logResult) {
  try {
    // Essayer d'abord avec admin@test.com
    let response = await fetch(`${apiBaseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123' // Note: peut ne pas fonctionner si Firebase est utilisé
      })
    });
    
    let data = await response.json();
    
    // Si ça ne fonctionne pas, utiliser admin2@test.com créé via API
    if (!response.ok || !data.token) {
      response = await fetch(`${apiBaseUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin2@test.com',
          password: 'password123'
        })
      });
      data = await response.json();
    }
    
    const checks = {
      statusOk: response.status === 200,
      hasToken: !!data.token,
      hasAdmin: !!data.admin
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('adminCreation', 'Authentification admin', allPassed,
      allPassed ? 'Authentification admin réussie' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status }
    );
    
    if (data.token) {
      adminToken = data.token;
    }
    
    return data;
  } catch (error) {
    logResult('adminCreation', 'Authentification admin', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 1.4: Liste des admins
 */
async function testListAdmins(apiBaseUrl, logResult) {
  try {
    if (!adminToken) {
      // Essayer de s'authentifier d'abord
      await testAdminAuthentication(apiBaseUrl, () => {});
    }
    
    if (!adminToken) {
      logResult('adminCreation', 'Liste des admins', false,
        'Token admin manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/admin/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasAdmins: !!data.admins || !!data.success,
      hasList: Array.isArray(data.admins) || Array.isArray(data)
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('adminCreation', 'Liste des admins', allPassed,
      allPassed ? `Liste des admins récupérée (${data.admins?.length || 0} admins)` : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, adminCount: data.admins?.length || 0 }
    );
    
    return data;
  } catch (error) {
    logResult('adminCreation', 'Liste des admins', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Exécuter tous les tests de création d'admin
 */
async function runTests(apiBaseUrl, logResult) {
  try {
    // Test 1.1: Création via script
    await testAdminCreationViaScript(logResult);
    
    // Test 1.2: Création via API
    await testAdminCreationViaAPI(apiBaseUrl, logResult);
    
    // Test 1.3: Authentification
    await testAdminAuthentication(apiBaseUrl, logResult);
    
    // Test 1.4: Liste des admins
    await testListAdmins(apiBaseUrl, logResult);
    
    // Retourner le token admin pour les autres tests
    return { adminToken, adminUser };
  } catch (error) {
    console.error('Erreur lors des tests admin:', error);
    throw error;
  } finally {
    // Ne pas déconnecter MongoDB car d'autres tests peuvent en avoir besoin
    // await mongoose.disconnect();
  }
}

module.exports = { runTests, getAdminToken: () => adminToken, getAdminUser: () => adminUser };

