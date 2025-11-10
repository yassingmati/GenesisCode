/**
 * Tests complets pour le système de subscriptions
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
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis');
    }
    
    let user = await User.findOne({ email: 'test-subscription-complete@test.com' });
    
    if (!user) {
      user = new User({
        firebaseUid: `test-subscription-complete-${Date.now()}`,
        email: 'test-subscription-complete@test.com',
        firstName: 'Test',
        lastName: 'Subscription',
        userType: 'student',
        isVerified: true,
        isProfileComplete: true
      });
      await user.save();
    }
    
    // Réinitialiser l'abonnement pour les tests
    user.subscription = {};
    await user.save();
    
    testUser = user;
    
    // Créer un token JWT
    userToken = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    return user;
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
    
    // D'abord annuler l'abonnement gratuit si actif
    const currentSub = await testGetMySubscription();
    if (currentSub.success && currentSub.subscription) {
      await testCancelSubscription();
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
    
    console.log('✅ Setup terminé');
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

