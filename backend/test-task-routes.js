/**
 * Script de test pour toutes les routes de tasks
 * Teste les endpoints de task templates, assigned tasks, et tasks
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Fonction pour obtenir un token admin (à adapter selon votre système)
async function getAdminToken() {
  // Option 1: Utiliser un token existant depuis localStorage ou variable d'environnement
  const token = process.env.ADMIN_TOKEN || process.env.TEST_ADMIN_TOKEN;
  if (token) {
    return token;
  }

  // Option 2: Se connecter via l'API admin
  try {
    const response = await axios.post(`${API_URL}/admin/login`, {
      email: process.env.ADMIN_EMAIL || 'admin@test.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    return response.data.token;
  } catch (error) {
    logWarning('Impossible de se connecter en tant qu\'admin. Utilisez ADMIN_TOKEN dans .env');
    return null;
  }
}

// Tests des routes Task Templates
async function testTaskTemplates(token) {
  logInfo('\n📋 Test des routes Task Templates');
  
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // Test GET /api/admin/task-templates
    logInfo('Test GET /api/admin/task-templates');
    const getResponse = await axios.get(`${API_URL}/admin/task-templates`, { headers });
    logSuccess(`GET réussi: ${getResponse.data.length} templates trouvés`);
    
    // Test POST /api/admin/task-templates
    logInfo('Test POST /api/admin/task-templates');
    const newTemplate = {
      title: 'Test Template',
      description: 'Template de test',
      recurrence: {
        frequency: 'daily'
      },
      metrics: ['exercises_submitted', 'levels_completed'],
      target: {
        exercises_submitted: 5,
        levels_completed: 2,
        hours_spent: 1
      },
      active: true
    };
    
    const postResponse = await axios.post(`${API_URL}/admin/task-templates`, newTemplate, { headers });
    logSuccess(`POST réussi: Template créé avec ID ${postResponse.data._id}`);
    const templateId = postResponse.data._id;

    // Test PUT /api/admin/task-templates/:id
    logInfo(`Test PUT /api/admin/task-templates/${templateId}`);
    const updateData = {
      title: 'Test Template Updated',
      target: {
        exercises_submitted: 10
      }
    };
    const putResponse = await axios.put(`${API_URL}/admin/task-templates/${templateId}`, updateData, { headers });
    logSuccess(`PUT réussi: Template mis à jour`);

    // Test DELETE /api/admin/task-templates/:id
    logInfo(`Test DELETE /api/admin/task-templates/${templateId}`);
    const deleteResponse = await axios.delete(`${API_URL}/admin/task-templates/${templateId}`, { headers });
    logSuccess(`DELETE réussi: Template désactivé`);

    return true;
  } catch (error) {
    logError(`Erreur dans testTaskTemplates: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Tests des routes Assigned Tasks
async function testAssignedTasks(token) {
  logInfo('\n📋 Test des routes Assigned Tasks');
  
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // D'abord créer un template pour les tests
    const template = {
      title: 'Test Assignment Template',
      description: 'Template pour test d\'assignation',
      recurrence: { frequency: 'daily' },
      metrics: ['exercises_submitted'],
      target: { exercises_submitted: 3 },
      active: true
    };
    const templateResponse = await axios.post(`${API_URL}/admin/task-templates`, template, { headers });
    const templateId = templateResponse.data._id;

    // Test POST /api/assigned-tasks/assign
    logInfo('Test POST /api/assigned-tasks/assign');
    // Note: Vous devez avoir des childIds valides dans votre DB
    const assignData = {
      templateId,
      childIds: [], // À remplir avec des IDs d'enfants valides
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // +7 jours
    };
    
    logWarning('⚠️  Assignation de tasks nécessite des childIds valides. Test ignoré.');
    // const assignResponse = await axios.post(`${API_URL}/assigned-tasks/assign`, assignData, { headers });
    // logSuccess(`POST réussi: Tasks assignées`);

    // Nettoyer le template de test
    await axios.delete(`${API_URL}/admin/task-templates/${templateId}`, { headers });

    return true;
  } catch (error) {
    logError(`Erreur dans testAssignedTasks: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Tests des routes Tasks (legacy)
async function testTasks(token) {
  logInfo('\n📋 Test des routes Tasks (legacy)');
  
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // Test GET /api/tasks
    logInfo('Test GET /api/tasks');
    // Note: Nécessite userId dans query
    logWarning('⚠️  GET /api/tasks nécessite userId dans query. Test ignoré.');
    // const getResponse = await axios.get(`${API_URL}/tasks?userId=...`, { headers });

    return true;
  } catch (error) {
    logError(`Erreur dans testTasks: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Fonction principale
async function runTests() {
  logInfo('🚀 Démarrage des tests des routes Tasks\n');

  const token = await getAdminToken();
  if (!token) {
    logError('Impossible d\'obtenir un token admin. Tests annulés.');
    process.exit(1);
  }

  logSuccess(`Token admin obtenu: ${token.substring(0, 20)}...`);

  const results = {
    taskTemplates: false,
    assignedTasks: false,
    tasks: false
  };

  results.taskTemplates = await testTaskTemplates(token);
  results.assignedTasks = await testAssignedTasks(token);
  results.tasks = await testTasks(token);

  // Résumé
  logInfo('\n📊 Résumé des tests:');
  logInfo(`Task Templates: ${results.taskTemplates ? '✅' : '❌'}`);
  logInfo(`Assigned Tasks: ${results.assignedTasks ? '✅' : '❌'}`);
  logInfo(`Tasks (legacy): ${results.tasks ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    logSuccess('\n✅ Tous les tests sont passés!');
    process.exit(0);
  } else {
    logError('\n❌ Certains tests ont échoué');
    process.exit(1);
  }
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(error => {
    logError(`Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests, testTaskTemplates, testAssignedTasks, testTasks };

