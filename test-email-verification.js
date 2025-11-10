/**
 * Tests pour la vérification email
 */

// Charger les variables d'environnement depuis backend/.env
const { loadEnv } = require('./load-env');
loadEnv();

// Charger les helpers pour les modules
require('./test-helpers');

// Charger les modules
let mongoose, User, jwt;
try {
  mongoose = require('mongoose');
  User = require('./backend/src/models/User');
  jwt = require('jsonwebtoken');
} catch (error) {
  console.error('Erreur lors du chargement des modules:', error.message);
  const path = require('path');
  const backendModelsPath = path.join(__dirname, 'backend', 'src', 'models');
  mongoose = require('mongoose');
  User = require(path.join(backendModelsPath, 'User'));
  jwt = require('jsonwebtoken');
}
// Note: Le service email est utilisé par le backend, pas directement dans les tests
// Les tests vérifient que l'API envoie correctement les emails

// Variables globales
let userToken = null;
let testUser = null;
let verificationToken = null;

/**
 * Créer ou récupérer un utilisateur de test non vérifié
 */
async function getUnverifiedTestUser() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    }
    
    // Chercher ou créer un utilisateur de test non vérifié
    let user = await User.findOne({ email: 'test-email@test.com' });
    
    if (!user) {
      user = new User({
        firebaseUid: `test-email-${Date.now()}`,
        email: 'test-email@test.com',
        firstName: 'Test',
        lastName: 'Email',
        userType: 'student',
        isVerified: false, // Non vérifié
        isProfileComplete: false
      });
      await user.save();
    } else {
      // S'assurer que l'utilisateur n'est pas vérifié pour les tests
      user.isVerified = false;
      await user.save();
    }
    
    testUser = user;
    return user;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur de test:', error);
    throw error;
  }
}

/**
 * Créer un token JWT pour l'utilisateur de test
 */
async function getUserToken(apiBaseUrl) {
  try {
    if (!testUser) {
      await getUnverifiedTestUser();
    }
    
    // Créer un token JWT manuellement pour les tests
    const jwtSecret = process.env.JWT_SECRET || 'devsecret';
    
    userToken = jwt.sign(
      { id: testUser._id, email: testUser.email },
      jwtSecret,
      { expiresIn: '1d' }
    );
    
    return userToken;
  } catch (error) {
    console.warn('Impossible de créer un token utilisateur:', error.message);
    return null;
  }
}

/**
 * Test 4.1: Envoyer un email de vérification
 */
async function testSendVerificationEmail(apiBaseUrl, logResult) {
  try {
    if (!testUser) {
      await getUnverifiedTestUser();
    }
    
    if (!userToken) {
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('emailVerification', 'Envoi email vérification', false,
        'Token utilisateur manquant', { error: 'Impossible de créer un token' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      emailSent: data.message?.includes('envoyé') || data.message?.includes('sent') || response.status === 200
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('emailVerification', 'Envoi email vérification', allPassed,
      allPassed ? 'Email de vérification envoyé avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, data, note: 'Vérifier les logs serveur et la boîte de réception' }
    );
    
    // Créer un token de vérification pour les tests suivants
    if (testUser) {
      const jwtSecret = process.env.JWT_SECRET || 'devsecret';
      verificationToken = jwt.sign(
        { id: testUser._id, email: testUser.email },
        jwtSecret,
        { expiresIn: '1h' }
      );
    }
    
    return data;
  } catch (error) {
    logResult('emailVerification', 'Envoi email vérification', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 4.2: Vérifier le contenu de l'email (simulation)
 * Note: Ce test vérifie que l'email peut être envoyé, mais ne peut pas vérifier le contenu réel
 */
async function testEmailContent(logResult) {
  try {
    if (!testUser) {
      await getUnverifiedTestUser();
    }
    
    // Vérifier la configuration email
    const hasEmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    const hasServerUrl = !!process.env.SERVER_URL;
    const hasClientUrl = !!process.env.CLIENT_URL;
    
    const checks = {
      hasEmailConfig,
      hasServerUrl,
      hasClientUrl,
      canSendEmail: hasEmailConfig && hasServerUrl && hasClientUrl
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('emailVerification', 'Contenu email', allPassed,
      allPassed ? 'Configuration email correcte' : 'Configuration email incomplète',
      { 
        checks, 
        note: 'Pour vérifier le contenu réel, consulter la boîte de réception de test-email@test.com',
        expectedSubject: 'Vérification de votre email',
        expectedLinkFormat: `${process.env.SERVER_URL}/api/auth/verify-email?token=...`
      }
    );
    
    return checks;
  } catch (error) {
    logResult('emailVerification', 'Contenu email', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 4.3: Cliquer sur le lien de vérification
 */
async function testVerifyEmailLink(apiBaseUrl, logResult) {
  try {
    if (!testUser) {
      await getUnverifiedTestUser();
    }
    
    if (!verificationToken) {
      // Créer un token de vérification
      const jwtSecret = process.env.JWT_SECRET || 'devsecret';
      verificationToken = jwt.sign(
        { id: testUser._id, email: testUser.email },
        jwtSecret,
        { expiresIn: '1h' }
      );
    }
    
    // Simuler le clic sur le lien de vérification
    const verifyUrl = `${apiBaseUrl}/api/auth/verify-email?token=${verificationToken}`;
    
    const response = await fetch(verifyUrl, {
      method: 'GET',
      redirect: 'manual' // Ne pas suivre les redirections automatiquement
    });
    
    // Vérifier que l'utilisateur est maintenant vérifié
    // Recharger l'utilisateur depuis la base de données
    const updatedUser = await User.findById(testUser._id);
    
    const checks = {
      statusOk: response.status === 302 || response.status === 200, // Redirection ou succès
      userVerified: updatedUser.isVerified === true,
      hasRedirect: response.headers.get('location')?.includes('verified-success') || response.status === 302
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('emailVerification', 'Clic lien vérification', allPassed,
      allPassed ? 'Email vérifié avec succès' : `Échec: ${response.status}`,
      { 
        checks, 
        responseStatus: response.status,
        redirectLocation: response.headers.get('location'),
        userVerified: updatedUser.isVerified
      }
    );
    
    return { response, user: updatedUser };
  } catch (error) {
    logResult('emailVerification', 'Clic lien vérification', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 4.4: Vérifier le statut après vérification
 */
async function testVerifyStatusAfterVerification(apiBaseUrl, logResult) {
  try {
    if (!testUser) {
      await getUnverifiedTestUser();
    }
    
    if (!userToken) {
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('emailVerification', 'Statut après vérification', false,
        'Token utilisateur manquant', { error: 'Impossible de créer un token' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Vérifier directement dans la base de données aussi
    const dbUser = await User.findById(testUser._id);
    
    const checks = {
      statusOk: response.status === 200,
      hasUser: !!data.user || !!data,
      isVerified: data.user?.isVerified === true || dbUser?.isVerified === true,
      hasProfile: !!data.user || !!data
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('emailVerification', 'Statut après vérification', allPassed,
      allPassed ? 'Statut de vérification confirmé' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { 
        checks, 
        responseStatus: response.status,
        isVerified: data.user?.isVerified || dbUser?.isVerified
      }
    );
    
    return data;
  } catch (error) {
    logResult('emailVerification', 'Statut après vérification', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 4.5: Réenvoyer un email de vérification pour un utilisateur déjà vérifié
 */
async function testResendVerificationEmailForVerifiedUser(apiBaseUrl, logResult) {
  try {
    if (!testUser) {
      await getUnverifiedTestUser();
    }
    
    // S'assurer que l'utilisateur est vérifié
    testUser.isVerified = true;
    await testUser.save();
    
    if (!userToken) {
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('emailVerification', 'Réenvoi email utilisateur vérifié', false,
        'Token utilisateur manquant', { error: 'Impossible de créer un token' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusError: response.status === 400,
      errorMessage: data.message?.includes('already verified') || data.message?.includes('déjà vérifié') || response.status === 400
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('emailVerification', 'Réenvoi email utilisateur vérifié', allPassed,
      allPassed ? 'Réenvoi refusé correctement (utilisateur déjà vérifié)' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { 
        checks, 
        responseStatus: response.status,
        expectedBehavior: 'Doit retourner une erreur 400'
      }
    );
    
    // Remettre l'utilisateur en non vérifié pour d'autres tests
    testUser.isVerified = false;
    await testUser.save();
    
    return data;
  } catch (error) {
    logResult('emailVerification', 'Réenvoi email utilisateur vérifié', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Exécuter tous les tests de vérification email
 */
async function runTests(apiBaseUrl, logResult) {
  try {
    // Préparer l'environnement
    await getUnverifiedTestUser();
    await getUserToken(apiBaseUrl);
    
    // Test 4.1: Envoyer un email de vérification
    await testSendVerificationEmail(apiBaseUrl, logResult);
    
    // Test 4.2: Vérifier le contenu de l'email
    await testEmailContent(logResult);
    
    // Test 4.3: Cliquer sur le lien de vérification
    await testVerifyEmailLink(apiBaseUrl, logResult);
    
    // Test 4.4: Vérifier le statut après vérification
    await testVerifyStatusAfterVerification(apiBaseUrl, logResult);
    
    // Test 4.5: Réenvoyer un email pour un utilisateur déjà vérifié
    await testResendVerificationEmailForVerifiedUser(apiBaseUrl, logResult);
    
    return { userToken, testUser, verificationToken };
  } catch (error) {
    console.error('Erreur lors des tests email:', error);
    throw error;
  }
}

module.exports = { runTests, getUserToken, getUnverifiedTestUser };

