/**
 * Tests pour le flux d'abonnement
 */

// Charger les variables d'environnement depuis backend/.env
const { loadEnv } = require('./load-env');
loadEnv();

// Charger les helpers pour les modules
require('./test-helpers');

// Charger les modules
let mongoose, User, Plan;
try {
  mongoose = require('mongoose');
  User = require('./backend/src/models/User');
  Plan = require('./backend/src/models/Plan');
} catch (error) {
  console.error('Erreur lors du chargement des modules:', error.message);
  const path = require('path');
  const backendModelsPath = path.join(__dirname, 'backend', 'src', 'models');
  mongoose = require('mongoose');
  User = require(path.join(backendModelsPath, 'User'));
  Plan = require(path.join(backendModelsPath, 'Plan'));
}

// Variables globales
let userToken = null;
let testUser = null;
let testPlanId = null;
let freePlanId = null;
let paidPlanId = null;

/**
 * Créer ou récupérer un utilisateur de test
 */
async function getTestUser() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    }
    
    // Chercher ou créer un utilisateur de test
    let user = await User.findOne({ email: 'test-subscription@test.com' });
    
    if (!user) {
      user = new User({
        firebaseUid: `test-subscription-${Date.now()}`,
        email: 'test-subscription@test.com',
        firstName: 'Test',
        lastName: 'Subscription',
        userType: 'student',
        isVerified: true,
        isProfileComplete: true
      });
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
    // Essayer de se connecter
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test-subscription@test.com',
        password: 'test123' // Note: peut ne pas fonctionner selon l'authentification
      })
    });
    
    const data = await response.json();
    
    if (data.token) {
      userToken = data.token;
      return userToken;
    }
    
    // Si l'authentification échoue, créer un token manuellement (pour les tests)
    // En production, il faudrait utiliser l'API d'authentification réelle
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'devsecret';
    
    if (testUser) {
      userToken = jwt.sign(
        { id: testUser._id, email: testUser.email },
        jwtSecret,
        { expiresIn: '1d' }
      );
      return userToken;
    }
    
    return null;
  } catch (error) {
    console.warn('Impossible de créer un token utilisateur:', error.message);
    return null;
  }
}

/**
 * Créer des plans de test
 */
async function createTestPlans() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    }
    
    // Créer un plan gratuit
    let freePlan = await Plan.findOne({ _id: 'plan-free-test-001' });
    if (!freePlan) {
      freePlan = new Plan({
        _id: 'plan-free-test-001',
        name: 'Plan Gratuit Test',
        description: 'Plan gratuit pour les tests',
        priceMonthly: 0,
        currency: 'TND',
        interval: 'month',
        features: ['Accès gratuit'],
        active: true
      });
      await freePlan.save();
    }
    freePlanId = freePlan._id;
    
    // Créer un plan payant
    let paidPlan = await Plan.findOne({ _id: 'plan-paid-test-001' });
    if (!paidPlan) {
      paidPlan = new Plan({
        _id: 'plan-paid-test-001',
        name: 'Plan Payant Test',
        description: 'Plan payant pour les tests',
        priceMonthly: 5000, // 50.00 TND
        currency: 'TND',
        interval: 'month',
        features: ['Accès premium', 'Support prioritaire'],
        active: true
      });
      await paidPlan.save();
    }
    paidPlanId = paidPlan._id;
    
    return { freePlanId, paidPlanId };
  } catch (error) {
    console.error('Erreur lors de la création des plans de test:', error);
    throw error;
  }
}

/**
 * Test 3.1: S'abonner à un plan gratuit
 */
async function testSubscribeToFreePlan(apiBaseUrl, logResult) {
  try {
    if (!freePlanId) {
      await createTestPlans();
    }
    
    if (!userToken) {
      await getTestUser();
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('subscription', 'Abonnement plan gratuit', false,
        'Token utilisateur manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planId: freePlanId
      })
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      subscriptionActive: data.subscription?.status === 'active' || data.message?.includes('activé'),
      hasPlanId: !!data.subscription?.planId || !!data.planId
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('subscription', 'Abonnement plan gratuit', allPassed,
      allPassed ? 'Abonnement plan gratuit activé avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, data }
    );
    
    return data;
  } catch (error) {
    logResult('subscription', 'Abonnement plan gratuit', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 3.2: S'abonner à un plan payant
 */
async function testSubscribeToPaidPlan(apiBaseUrl, logResult) {
  try {
    if (!paidPlanId) {
      await createTestPlans();
    }
    
    if (!userToken) {
      await getTestUser();
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('subscription', 'Abonnement plan payant', false,
        'Token utilisateur manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planId: paidPlanId
      })
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasPaymentUrl: !!data.paymentUrl || !!data.message,
      subscriptionIncomplete: data.subscription?.status === 'incomplete' || data.message?.includes('Paiement')
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('subscription', 'Abonnement plan payant', allPassed,
      allPassed ? 'Abonnement plan payant initié avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, data }
    );
    
    return data;
  } catch (error) {
    logResult('subscription', 'Abonnement plan payant', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 3.3: Récupérer l'abonnement
 */
async function testGetSubscription(apiBaseUrl, logResult) {
  try {
    if (!userToken) {
      await getTestUser();
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('subscription', 'Récupération abonnement', false,
        'Token utilisateur manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/subscriptions/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasResponse: !!data,
      hasSubscription: !!data.subscription || data.success !== false
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('subscription', 'Récupération abonnement', allPassed,
      allPassed ? 'Abonnement récupéré avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, hasSubscription: !!data.subscription }
    );
    
    return data;
  } catch (error) {
    logResult('subscription', 'Récupération abonnement', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 3.4: Annuler un abonnement
 */
async function testCancelSubscription(apiBaseUrl, logResult) {
  try {
    if (!userToken) {
      await getTestUser();
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('subscription', 'Annulation abonnement', false,
        'Token utilisateur manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      cancellationScheduled: data.cancelAtPeriodEnd === true || data.message?.includes('annulé') || data.message?.includes('programmée')
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('subscription', 'Annulation abonnement', allPassed,
      allPassed ? 'Annulation d\'abonnement programmée avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, data }
    );
    
    return data;
  } catch (error) {
    logResult('subscription', 'Annulation abonnement', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 3.5: Reprendre un abonnement
 */
async function testResumeSubscription(apiBaseUrl, logResult) {
  try {
    if (!userToken) {
      await getTestUser();
      await getUserToken(apiBaseUrl);
    }
    
    if (!userToken) {
      logResult('subscription', 'Reprise abonnement', false,
        'Token utilisateur manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/subscriptions/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      subscriptionResumed: data.cancelAtPeriodEnd === false || data.message?.includes('repri') || data.message?.includes('activé')
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('subscription', 'Reprise abonnement', allPassed,
      allPassed ? 'Abonnement repris avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, data }
    );
    
    return data;
  } catch (error) {
    logResult('subscription', 'Reprise abonnement', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Exécuter tous les tests de subscription
 */
async function runTests(apiBaseUrl, logResult) {
  try {
    // Préparer l'environnement
    await getTestUser();
    await createTestPlans();
    await getUserToken(apiBaseUrl);
    
    // Test 3.1: S'abonner à un plan gratuit
    await testSubscribeToFreePlan(apiBaseUrl, logResult);
    
    // Test 3.3: Récupérer l'abonnement
    await testGetSubscription(apiBaseUrl, logResult);
    
    // Test 3.4: Annuler un abonnement
    await testCancelSubscription(apiBaseUrl, logResult);
    
    // Test 3.5: Reprendre un abonnement
    await testResumeSubscription(apiBaseUrl, logResult);
    
    // Test 3.2: S'abonner à un plan payant (après avoir annulé le gratuit)
    await testSubscribeToPaidPlan(apiBaseUrl, logResult);
    
    return { userToken, testUser, freePlanId, paidPlanId };
  } catch (error) {
    console.error('Erreur lors des tests subscription:', error);
    throw error;
  }
}

module.exports = { runTests, getUserToken, getTestUser };

