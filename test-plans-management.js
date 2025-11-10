/**
 * Tests pour la gestion des plans
 */

// Charger les variables d'environnement depuis backend/.env
const { loadEnv } = require('./load-env');
loadEnv();
const testAdminCreation = require('./test-admin-creation');

// Variables globales
let adminToken = null;
let createdPlanId = null;
let testPlanData = {
  _id: 'plan-test-001',
  name: 'Plan Test',
  description: 'Plan de test pour les tests automatisés',
  priceCents: 1000,
  currency: 'TND',
  interval: 'month',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  active: true
};

/**
 * Obtenir le token admin
 */
async function getAdminToken(apiBaseUrl) {
  if (adminToken) return adminToken;
  
  try {
    // Essayer de s'authentifier
    const response = await fetch(`${apiBaseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin2@test.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    if (data.token) {
      adminToken = data.token;
      return adminToken;
    }
  } catch (error) {
    console.warn('Impossible de s\'authentifier comme admin:', error.message);
  }
  
  return null;
}

/**
 * Test 2.1: Créer un plan via API admin
 */
async function testCreatePlan(apiBaseUrl, logResult) {
  try {
    const token = await getAdminToken(apiBaseUrl);
    if (!token) {
      logResult('plansManagement', 'Création plan via API', false,
        'Token admin manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPlanData)
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 201,
      hasPlan: !!data.plan,
      planIdCorrect: data.plan?._id === testPlanData._id,
      nameCorrect: data.plan?.name === testPlanData.name
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('plansManagement', 'Création plan via API', allPassed,
      allPassed ? 'Plan créé avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, planId: data.plan?._id }
    );
    
    if (data.plan?._id) {
      createdPlanId = data.plan._id;
    }
    
    return data;
  } catch (error) {
    logResult('plansManagement', 'Création plan via API', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 2.2: Modifier un plan
 */
async function testUpdatePlan(apiBaseUrl, logResult) {
  try {
    if (!createdPlanId) {
      logResult('plansManagement', 'Modification plan', false,
        'Aucun plan créé pour la modification', { error: 'Plan ID manquant' }
      );
      return null;
    }
    
    const token = await getAdminToken(apiBaseUrl);
    if (!token) {
      logResult('plansManagement', 'Modification plan', false,
        'Token admin manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const updateData = {
      name: 'Plan Test Modifié',
      priceCents: 2000,
      description: 'Plan modifié pour les tests'
    };
    
    const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans/${createdPlanId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasPlan: !!data.plan,
      nameUpdated: data.plan?.name === updateData.name,
      priceUpdated: data.plan?.priceMonthly === updateData.priceCents
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('plansManagement', 'Modification plan', allPassed,
      allPassed ? 'Plan modifié avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status }
    );
    
    return data;
  } catch (error) {
    logResult('plansManagement', 'Modification plan', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 2.3: Désactiver un plan
 */
async function testDeactivatePlan(apiBaseUrl, logResult) {
  try {
    if (!createdPlanId) {
      logResult('plansManagement', 'Désactivation plan', false,
        'Aucun plan créé pour la désactivation', { error: 'Plan ID manquant' }
      );
      return null;
    }
    
    const token = await getAdminToken(apiBaseUrl);
    if (!token) {
      logResult('plansManagement', 'Désactivation plan', false,
        'Token admin manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans/${createdPlanId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasPlan: !!data.plan,
      planDeactivated: data.plan?.active === false
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('plansManagement', 'Désactivation plan', allPassed,
      allPassed ? 'Plan désactivé avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status }
    );
    
    return data;
  } catch (error) {
    logResult('plansManagement', 'Désactivation plan', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 2.4: Lister les plans (admin)
 */
async function testListPlansAdmin(apiBaseUrl, logResult) {
  try {
    const token = await getAdminToken(apiBaseUrl);
    if (!token) {
      logResult('plansManagement', 'Liste plans admin', false,
        'Token admin manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasPlans: !!data.plans || Array.isArray(data),
      isArray: Array.isArray(data.plans) || Array.isArray(data)
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    const planCount = data.plans?.length || (Array.isArray(data) ? data.length : 0);
    
    logResult('plansManagement', 'Liste plans admin', allPassed,
      allPassed ? `Liste des plans récupérée (${planCount} plans)` : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, planCount }
    );
    
    return data;
  } catch (error) {
    logResult('plansManagement', 'Liste plans admin', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 2.5: Lister les plans (public)
 */
async function testListPlansPublic(apiBaseUrl, logResult) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/subscriptions/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasPlans: !!data.plans || data.success,
      isArray: Array.isArray(data.plans) || Array.isArray(data),
      onlyActive: true // Les plans publics devraient être actifs uniquement
    };
    
    // Vérifier que seuls les plans actifs sont retournés
    if (data.plans && Array.isArray(data.plans)) {
      checks.onlyActive = data.plans.every(plan => plan.active !== false);
    }
    
    const allPassed = Object.values(checks).every(v => v);
    
    const planCount = data.plans?.length || 0;
    
    logResult('plansManagement', 'Liste plans public', allPassed,
      allPassed ? `Liste des plans publics récupérée (${planCount} plans actifs)` : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status, planCount }
    );
    
    return data;
  } catch (error) {
    logResult('plansManagement', 'Liste plans public', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Test 2.6: Réactiver un plan
 */
async function testReactivatePlan(apiBaseUrl, logResult) {
  try {
    if (!createdPlanId) {
      logResult('plansManagement', 'Réactivation plan', false,
        'Aucun plan créé pour la réactivation', { error: 'Plan ID manquant' }
      );
      return null;
    }
    
    const token = await getAdminToken(apiBaseUrl);
    if (!token) {
      logResult('plansManagement', 'Réactivation plan', false,
        'Token admin manquant', { error: 'Impossible de s\'authentifier' }
      );
      return null;
    }
    
    const response = await fetch(`${apiBaseUrl}/api/admin/subscriptions/plans/${createdPlanId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active: true })
    });
    
    const data = await response.json();
    
    const checks = {
      statusOk: response.status === 200,
      hasPlan: !!data.plan,
      planActivated: data.plan?.active === true
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    logResult('plansManagement', 'Réactivation plan', allPassed,
      allPassed ? 'Plan réactivé avec succès' : `Échec: ${data.message || 'Erreur inconnue'}`,
      { checks, responseStatus: response.status }
    );
    
    return data;
  } catch (error) {
    logResult('plansManagement', 'Réactivation plan', false,
      `Erreur: ${error.message}`, { error: error.message }
    );
    throw error;
  }
}

/**
 * Exécuter tous les tests de gestion des plans
 */
async function runTests(apiBaseUrl, logResult) {
  try {
    // Obtenir le token admin d'abord
    await getAdminToken(apiBaseUrl);
    
    // Test 2.1: Créer un plan
    await testCreatePlan(apiBaseUrl, logResult);
    
    // Test 2.4: Lister les plans (admin)
    await testListPlansAdmin(apiBaseUrl, logResult);
    
    // Test 2.5: Lister les plans (public)
    await testListPlansPublic(apiBaseUrl, logResult);
    
    // Test 2.2: Modifier un plan
    await testUpdatePlan(apiBaseUrl, logResult);
    
    // Test 2.3: Désactiver un plan
    await testDeactivatePlan(apiBaseUrl, logResult);
    
    // Vérifier que le plan n'est plus dans la liste publique
    await testListPlansPublic(apiBaseUrl, logResult);
    
    // Test 2.6: Réactiver le plan
    await testReactivatePlan(apiBaseUrl, logResult);
    
    return { createdPlanId, adminToken };
  } catch (error) {
    console.error('Erreur lors des tests plans:', error);
    throw error;
  }
}

module.exports = { runTests, getCreatedPlanId: () => createdPlanId, getAdminToken };

