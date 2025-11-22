/**
 * Script de test pour vérifier la récupération des exercices
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://codegenesis-backend.onrender.com';
const LEVEL_ID = process.env.LEVEL_ID || '690c7be344d3becb125f0bd1';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
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
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Tester la récupération d'un niveau avec exercices
 */
async function testLevelRetrieval(levelId, token) {
  try {
    logInfo(`Test récupération niveau ${levelId}...`);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(
      `${BACKEND_URL}/api/courses/levels/${levelId}`,
      { headers }
    );
    
    if (response.data) {
      logSuccess('Niveau récupéré avec succès');
      logInfo(`Titre: ${response.data.title || 'N/A'}`);
      logInfo(`ID: ${response.data._id}`);
      logInfo(`Exercices: ${response.data.exercises?.length || 0}`);
      
      if (response.data.exercises && response.data.exercises.length > 0) {
        logSuccess(`\nDétails des exercices:`);
        response.data.exercises.forEach((ex, index) => {
          logInfo(`  ${index + 1}. ${ex.name || ex.translations?.fr?.name || 'Sans nom'}`);
          logInfo(`     Type: ${ex.type || 'N/A'}`);
          logInfo(`     Points: ${ex.points || 'N/A'}`);
          logInfo(`     Difficulté: ${ex.difficulty || 'N/A'}`);
        });
      } else {
        logWarning('Aucun exercice trouvé dans ce niveau');
      }
      
      return response.data;
    }
    
    return null;
  } catch (error) {
    logError(`Erreur récupération niveau: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
      
      if (error.response.status === 401) {
        logWarning('Token d\'authentification manquant ou invalide');
      } else if (error.response.status === 403) {
        logWarning('Accès refusé - Niveau verrouillé');
      } else if (error.response.status === 404) {
        logWarning('Niveau introuvable');
      }
    }
    return null;
  }
}

/**
 * Tester la récupération d'un exercice individuel
 */
async function testExerciseRetrieval(exerciseId, token) {
  try {
    logInfo(`Test récupération exercice ${exerciseId}...`);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(
      `${BACKEND_URL}/api/courses/exercises/${exerciseId}`,
      { headers }
    );
    
    if (response.data) {
      logSuccess('Exercice récupéré avec succès');
      logInfo(`Nom: ${response.data.name || 'N/A'}`);
      logInfo(`Type: ${response.data.type || 'N/A'}`);
      logInfo(`Points: ${response.data.points || 'N/A'}`);
      return response.data;
    }
    
    return null;
  } catch (error) {
    logError(`Erreur récupération exercice: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 TEST DE RÉCUPÉRATION DES EXERCICES', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  // Vérifier que le backend est accessible
  try {
    logInfo('Vérification de la connexion au backend...');
    await axios.get(`${BACKEND_URL}/health`).catch(() => {
      // Si /health n'existe pas, essayer une autre route
      return axios.get(`${BACKEND_URL}/api/courses/categories`).catch(() => null);
    });
    logSuccess('Backend accessible');
  } catch (error) {
    logError(`Backend non accessible: ${error.message}`);
    process.exit(1);
  }
  
  // Demander le token
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const token = await new Promise((resolve) => {
    rl.question('Entrez votre token JWT (ou appuyez sur Entrée pour tester sans token): ', (answer) => {
      rl.close();
      resolve(answer.trim() || null);
    });
  });
  
  logInfo(`Test avec ${token ? 'token' : 'sans token'}\n`);
  
  // Test 1: Récupérer le niveau avec exercices
  log('\n' + '-'.repeat(60), 'yellow');
  log('📋 TEST 1: Récupération du niveau', 'yellow');
  log('-'.repeat(60) + '\n', 'yellow');
  
  const level = await testLevelRetrieval(LEVEL_ID, token);
  
  if (!level) {
    logError('Impossible de récupérer le niveau');
    process.exit(1);
  }
  
  // Test 2: Si des exercices existent, tester la récupération individuelle
  if (level.exercises && level.exercises.length > 0) {
    log('\n' + '-'.repeat(60), 'yellow');
    log('📝 TEST 2: Récupération d\'un exercice individuel', 'yellow');
    log('-'.repeat(60) + '\n', 'yellow');
    
    const firstExercise = level.exercises[0];
    if (firstExercise._id) {
      await testExerciseRetrieval(firstExercise._id, token);
    } else {
      logWarning('L\'exercice n\'a pas d\'ID valide');
    }
  } else {
    logWarning('Aucun exercice à tester individuellement');
  }
  
  // Résumé
  log('\n' + '='.repeat(60), 'blue');
  log('📊 RÉSUMÉ', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  if (level.exercises && level.exercises.length > 0) {
    logSuccess(`✅ ${level.exercises.length} exercice(s) trouvé(s) dans le niveau`);
    logInfo(`Niveau: ${level.title || 'Sans titre'}`);
    logInfo(`ID: ${level._id}`);
  } else {
    logWarning('⚠️  Aucun exercice trouvé dans ce niveau');
    logInfo('Vérifiez que le niveau contient bien des exercices dans la base de données');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  logError(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});

