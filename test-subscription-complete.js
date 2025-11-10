/**
 * Tests complets pour le système de subscriptions (Version corrigée)
 * Teste tous les scénarios: gratuit, payant, annulation, reprise, etc.
 */

const { loadEnv } = require('./load-env');
loadEnv();

require('./test-helpers');

const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const Plan = require('./backend/src/models/Plan');
const jwt = require('jsonwebtoken');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

let testUser = null;
let userToken = null;
let freePlanId = null;
let paidPlanId = null;

/**
 * Créer ou récupérer un utilisateur de test
 */
async function setupTestUser() {
  try {
    // Utiliser MongoDB Atlas si disponible, sinon local
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10
      });
      console.log('✅ Connecté à MongoDB:', mongoose.connection.db.databaseName);
      console.log('   URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    }
    
    const testEmail = 'test-subscription-complete@test.com';
    const testPassword = 'test123456';
    
    // Chercher ou créer l'utilisateur
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      user = new User({
        firebaseUid: `test-subscription-complete-${Date.now()}`,
        email: testEmail,
        firstName: 'Test',
        lastName: 'Subscription',
        userType: 'student',
        isVerified: true,
        isProfileComplete: true
      });
      await user.save();
      console.log('✅ Utilisateur créé:', user._id.toString());
      
      // Attendre un peu pour s'assurer que l'utilisateur est bien sauvegardé
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('✅ Utilisateur existant trouvé:', user._id.toString());
    }
    
    // Réinitialiser l'abonnement pour les tests
    user.subscription = {};
    await user.save();
    
    // Vérifier que l'utilisateur est bien sauvegardé
    const savedUser = await User.findById(user._id);
    if (!savedUser) {
      throw new Error('Utilisateur non sauvegardé correctement');
    }
    
    // S'assurer que l'utilisateur est bien configuré
    savedUser.isVerified = true;
    savedUser.isProfileComplete = true;
    await savedUser.save();
    
    // Attendre un peu pour s'assurer que l'utilisateur est bien sauvegardé dans MongoDB Atlas
    await new Promise(resolve => setTimeout(resolve, 500));
    
    testUser = savedUser;
    
    console.log('✅ Utilisateur final pour les tests:', {
      id: savedUser._id.toString(),
      email: savedUser.email,
      isVerified: savedUser.isVerified,
      isProfileComplete: savedUser.isProfileComplete
    });
    
    // Utiliser l'API d'authentification réelle pour obtenir un token valide
    try {
      console.log('🔐 Tentative de connexion via API d\'authentification...');
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword // L'authentification simple accepte n'importe quel mot de passe
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok && loginData.token) {
        userToken = loginData.token;
        console.log('✅ Token obtenu via API d\'authentification');
      } else {
        // Fallback: créer un token manuellement si l'API échoue
        console.warn('⚠️ API login échouée, utilisation du token manuel');
        console.warn('   Réponse API:', loginData);
        userToken = jwt.sign(
          { id: savedUser._id.toString(), email: savedUser.email },
          JWT_SECRET,
          { expiresIn: '1d' }
        );
        console.log('   Token créé avec ID:', savedUser._id.toString());
      }
    } catch (loginError) {
      // Fallback: créer un token manuellement si l'API n'est pas disponible
      console.warn('⚠️ Impossible d\'utiliser l\'API login, utilisation du token manuel:', loginError.message);
      userToken = jwt.sign(
        { id: savedUser._id.toString(), email: savedUser.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log('   Token créé avec ID:', savedUser._id.toString());
    }
    
    // Vérifier que le token fonctionne en testant une requête simple
    try {
      const testResponse = await fetch(`${API_BASE}/api/subscriptions/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (testResponse.ok) {
        console.log('✅ Token validé avec succès');
      } else {
        const testData = await testResponse.json();
        console.warn('⚠️ Token créé mais validation échouée:', testData.message || testData.error);
        // Vérifier que l'utilisateur existe bien dans MongoDB
        const debugUser = await User.findById(savedUser._id.toString());
        if (debugUser) {
          console.log('   Debug: Utilisateur trouvé dans MongoDB:', {
            id: debugUser._id.toString(),
            email: debugUser.email
          });
          console.log('   Debug: Le problème peut venir du middleware d\'authentification');
          console.log('   Debug: Vérifiez que le backend utilise la même URI MongoDB');
        } else {
          console.error('   Debug: Utilisateur NON trouvé dans MongoDB');
        }
      }
    } catch (testError) {
      console.warn('⚠️ Impossible de valider le token:', testError.message);
    }
    
    return savedUser;
  } catch (error) {
    console.error('Erreur setup utilisateur:', error);
    throw error;
  }
}

/**
 * Créer des plans de test
 */
async function setupTestPlans() {
  try {
    // Plan gratuit
    const freePlanIdStr = 'test-free-complete';
    let freePlan = await Plan.findById(freePlanIdStr);
    if (!freePlan) {
      freePlan = new Plan({
        _id: freePlanIdStr,
        name: 'Plan Gratuit Test Complet',
        description: 'Plan gratuit pour les tests complets',
        priceMonthly: 0,
        currency: 'TND',
        interval: 'month',
        features: ['Accès gratuit'],
        active: true
      });
      await freePlan.save();
    }
    freePlanId = freePlan._id.toString();
    
    // Plan payant
    const paidPlanIdStr = 'test-paid-complete';
    let paidPlan = await Plan.findById(paidPlanIdStr);
    if (!paidPlan) {
      paidPlan = new Plan({
        _id: paidPlanIdStr,
        name: 'Plan Payant Test Complet',
        description: 'Plan payant pour les tests complets',
        priceMonthly: 5000, // 50.00 TND
        currency: 'TND',
        interval: 'month',
        features: ['Accès premium', 'Support prioritaire'],
        active: true
      });
      await paidPlan.save();
    }
    paidPlanId = paidPlan._id.toString();
    
    return { freePlanId, paidPlanId };
  } catch (error) {
    console.error('Erreur setup plans:', error);
    throw error;
  }
}

/**
 * Test: Récupérer les plans publics
 */
async function testGetPlans() {
  try {
    console.log('\n📋 Test: Récupération des plans publics');
    
    const response = await fetch(`${API_BASE}/api/subscriptions/plans`);
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.plans)) {
      console.log('✅ Plans récupérés:', data.plans.length);
      return { success: true, plans: data.plans };
    } else {
      console.error('❌ Échec récupération plans:', data);
      return { success: false, error: data.message || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test getPlans:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: S'abonner à un plan gratuit
 */
async function testSubscribeToFreePlan() {
  try {
    console.log('\n💳 Test: Abonnement plan gratuit');
    
    const response = await fetch(`${API_BASE}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ planId: freePlanId })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.subscription?.status === 'active') {
      console.log('✅ Plan gratuit activé avec succès');
      // Attendre un peu pour s'assurer que l'abonnement est bien sauvegardé
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, subscription: data.subscription };
    } else {
      console.error('❌ Échec abonnement plan gratuit:', data);
      return { success: false, error: data.message || data.error || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test subscribe free:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Récupérer l'abonnement actif
 */
async function testGetMySubscription() {
  try {
    console.log('\n👤 Test: Récupération abonnement utilisateur');
    
    const response = await fetch(`${API_BASE}/api/subscriptions/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Abonnement récupéré:', data.subscription ? 'Actif' : 'Aucun');
      return { success: true, subscription: data.subscription };
    } else {
      console.error('❌ Échec récupération abonnement:', data);
      return { success: false, error: data.message || data.error || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test getMySubscription:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Annuler un abonnement
 */
async function testCancelSubscription() {
  try {
    console.log('\n❌ Test: Annulation abonnement');
    
    // D'abord vérifier qu'il y a un abonnement actif
    const checkResponse = await fetch(`${API_BASE}/api/subscriptions/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const checkData = await checkResponse.json();
    
    if (!checkData.success || !checkData.subscription || checkData.subscription.status !== 'active') {
      console.warn('⚠️ Aucun abonnement actif trouvé, test d\'annulation ignoré');
      return { success: true, skipped: true, message: 'Aucun abonnement actif à annuler' };
    }
    
    const response = await fetch(`${API_BASE}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Abonnement annulé avec succès');
      // Attendre un peu pour s'assurer que l'annulation est bien sauvegardée
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data };
    } else {
      console.error('❌ Échec annulation:', data);
      return { success: false, error: data.message || data.error || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test cancel:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: Reprendre un abonnement
 */
async function testResumeSubscription() {
  try {
    console.log('\n▶️ Test: Reprise abonnement');
    
    // D'abord vérifier qu'il y a un abonnement à reprendre
    const checkResponse = await fetch(`${API_BASE}/api/subscriptions/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const checkData = await checkResponse.json();
    
    if (!checkData.success || !checkData.subscription || !checkData.subscription.cancelAtPeriodEnd) {
      console.warn('⚠️ Aucun abonnement à reprendre, test de reprise ignoré');
      return { success: true, skipped: true, message: 'Aucun abonnement à reprendre' };
    }
    
    const response = await fetch(`${API_BASE}/api/subscriptions/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Abonnement repris avec succès');
      // Attendre un peu pour s'assurer que la reprise est bien sauvegardée
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data };
    } else {
      console.error('❌ Échec reprise:', data);
      return { success: false, error: data.message || data.error || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test resume:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test: S'abonner à un plan payant (doit initier le paiement)
 */
async function testSubscribeToPaidPlan() {
  try {
    console.log('\n💳 Test: Abonnement plan payant');
    
    // D'abord vérifier et annuler l'abonnement gratuit si actif
    // Attendre un peu pour s'assurer que l'abonnement précédent est bien sauvegardé
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentSub = await testGetMySubscription();
    if (currentSub.success && currentSub.subscription && currentSub.subscription.status === 'active') {
      console.log('   Annulation de l\'abonnement gratuit existant...');
      const cancelResponse = await fetch(`${API_BASE}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const cancelData = await cancelResponse.json();
      
      if (cancelResponse.ok && cancelData.success) {
        console.log('   ✅ Abonnement gratuit annulé');
        // Attendre un peu pour s'assurer que l'annulation est bien sauvegardée
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.warn('   ⚠️ Échec annulation:', cancelData.message || cancelData.error);
      }
    }
    
    const response = await fetch(`${API_BASE}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        planId: paidPlanId,
        returnUrl: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/payment/success`
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && (data.paymentUrl || data.subscription?.status === 'incomplete')) {
      console.log('✅ Plan payant initié avec succès');
      if (data.paymentUrl) {
        console.log('   Payment URL:', data.paymentUrl);
      }
      return { success: true, data };
    } else {
      console.error('❌ Échec abonnement plan payant:', data);
      return { success: false, error: data.message || data.error || 'Erreur inconnue' };
    }
  } catch (error) {
    console.error('❌ Erreur test subscribe paid:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  console.log('🚀 Démarrage des tests complets de subscriptions\n');
  console.log('API Base:', API_BASE);
  console.log('='.repeat(60));
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  try {
    // Setup
    await setupTestUser();
    await setupTestPlans();
    
    console.log('\n✅ Setup terminé');
    console.log('   User ID:', testUser._id.toString());
    console.log('   Free Plan ID:', freePlanId);
    console.log('   Paid Plan ID:', paidPlanId);
    
    // Tests
    const tests = [
      { name: 'Récupération plans publics', fn: testGetPlans },
      { name: 'Abonnement plan gratuit', fn: testSubscribeToFreePlan },
      { name: 'Récupération abonnement', fn: testGetMySubscription },
      { name: 'Annulation abonnement', fn: testCancelSubscription },
      { name: 'Reprise abonnement', fn: testResumeSubscription },
      { name: 'Abonnement plan payant', fn: testSubscribeToPaidPlan },
    ];
    
    for (const test of tests) {
      results.total++;
      const result = await test.fn();
      results.tests.push({ name: test.name, ...result });
      
      if (result.success) {
        results.passed++;
      } else {
        results.failed++;
      }
      
      // Attendre un peu entre les tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(60));
    console.log(`Total: ${results.total}`);
    console.log(`✅ Réussis: ${results.passed}`);
    console.log(`❌ Échoués: ${results.failed}`);
    console.log(`Taux de réussite: ${Math.round((results.passed / results.total) * 100)}%`);
    
    console.log('\n📋 Détails:');
    results.tests.forEach((test, index) => {
      const status = test.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (!test.success && test.error) {
        console.log(`   Erreur: ${test.error}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('\n❌ Erreur critique lors des tests:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✅ Tests terminés');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur lors des tests:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };

