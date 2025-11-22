/**
 * Script de test pour vérifier que les médias s'affichent correctement sur Render
 */

const axios = require('axios');

const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL || 'https://codegenesis-backend.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://codegenesis-platform.web.app';

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
 * Tester la récupération d'un niveau
 */
async function testLevelRetrieval(levelId, token) {
  try {
    logInfo(`Test récupération niveau ${levelId}...`);
    
    const response = await axios.get(
      `${RENDER_BACKEND_URL}/api/courses/levels/${levelId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data) {
      logSuccess('Niveau récupéré avec succès');
      logInfo(`Titre: ${response.data.title || 'N/A'}`);
      logInfo(`Vidéos: ${JSON.stringify(response.data.videos || {})}`);
      logInfo(`PDFs: ${JSON.stringify(response.data.pdfs || {})}`);
      return response.data;
    }
    
    return null;
  } catch (error) {
    logError(`Erreur récupération niveau: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

/**
 * Tester l'accès à une vidéo
 */
async function testVideoAccess(levelId, lang, token) {
  try {
    logInfo(`Test accès vidéo ${lang} pour niveau ${levelId}...`);
    
    const url = `${RENDER_BACKEND_URL}/api/courses/levels/${levelId}/video?lang=${lang}&token=${token}`;
    const response = await axios.head(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      validateStatus: (status) => status < 500
    });
    
    if (response.status === 200 || response.status === 206) {
      logSuccess(`Vidéo ${lang} accessible`);
      logInfo(`Content-Type: ${response.headers['content-type']}`);
      logInfo(`Content-Length: ${response.headers['content-length'] || 'Non spécifié'}`);
      return true;
    } else if (response.status === 404) {
      logWarning(`Vidéo ${lang} non trouvée (404)`);
      return false;
    } else {
      logError(`Erreur accès vidéo: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logWarning(`Vidéo ${lang} non trouvée (404)`);
      return false;
    }
    logError(`Erreur test vidéo: ${error.message}`);
    return false;
  }
}

/**
 * Tester l'accès à un PDF
 */
async function testPDFAccess(levelId, lang, token) {
  try {
    logInfo(`Test accès PDF ${lang} pour niveau ${levelId}...`);
    
    const url = `${RENDER_BACKEND_URL}/api/courses/levels/${levelId}/pdf?lang=${lang}&token=${token}`;
    const response = await axios.head(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      validateStatus: (status) => status < 500
    });
    
    if (response.status === 200) {
      logSuccess(`PDF ${lang} accessible`);
      logInfo(`Content-Type: ${response.headers['content-type']}`);
      logInfo(`Content-Length: ${response.headers['content-length'] || 'Non spécifié'}`);
      return true;
    } else if (response.status === 404) {
      logWarning(`PDF ${lang} non trouvé (404)`);
      if (error.response && error.response.data) {
        logInfo(`Détails: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    } else {
      logError(`Erreur accès PDF: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logWarning(`PDF ${lang} non trouvé (404)`);
      if (error.response.data) {
        logInfo(`Détails: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
    logError(`Erreur test PDF: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 TEST DES MÉDIAS SUR RENDER', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  // Vérifier que le backend est accessible
  try {
    logInfo('Vérification de la connexion au backend Render...');
    await axios.get(`${RENDER_BACKEND_URL}/health`);
    logSuccess('Backend Render accessible');
  } catch (error) {
    logError(`Backend Render non accessible: ${error.message}`);
    process.exit(1);
  }
  
  // Demander le token et levelId
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const token = await new Promise((resolve) => {
    rl.question('Entrez votre token JWT (ou appuyez sur Entrée pour utiliser ADMIN_TOKEN): ', (answer) => {
      resolve(answer.trim() || process.env.ADMIN_TOKEN || null);
    });
  });
  
  if (!token) {
    logError('Token requis pour les tests');
    rl.close();
    process.exit(1);
  }
  
  const levelId = await new Promise((resolve) => {
    rl.question('Entrez l\'ID du niveau à tester (ex: 690c7be344d3becb125f0bd1): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
  
  if (!levelId) {
    logError('ID de niveau requis');
    process.exit(1);
  }
  
  logInfo(`Test du niveau: ${levelId}\n`);
  
  // Test 1: Récupérer les données du niveau
  const level = await testLevelRetrieval(levelId, token);
  
  if (!level) {
    logError('Impossible de récupérer le niveau');
    process.exit(1);
  }
  
  // Test 2: Tester l'accès aux vidéos
  log('\n' + '-'.repeat(60), 'yellow');
  log('📹 TEST DES VIDÉOS', 'yellow');
  log('-'.repeat(60) + '\n', 'yellow');
  
  const videoResults = {};
  for (const lang of ['fr', 'en', 'ar']) {
    if (level.videos && level.videos[lang]) {
      videoResults[lang] = await testVideoAccess(levelId, lang, token);
    } else {
      logWarning(`Pas de vidéo ${lang} configurée`);
      videoResults[lang] = null;
    }
  }
  
  // Test 3: Tester l'accès aux PDFs
  log('\n' + '-'.repeat(60), 'yellow');
  log('📄 TEST DES PDFs', 'yellow');
  log('-'.repeat(60) + '\n', 'yellow');
  
  const pdfResults = {};
  for (const lang of ['fr', 'en', 'ar']) {
    if (level.pdfs && level.pdfs[lang]) {
      pdfResults[lang] = await testPDFAccess(levelId, lang, token);
    } else {
      logWarning(`Pas de PDF ${lang} configuré`);
      pdfResults[lang] = null;
    }
  }
  
  // Résumé
  log('\n' + '='.repeat(60), 'blue');
  log('📊 RÉSUMÉ DES TESTS', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  log('Vidéos:', 'cyan');
  Object.entries(videoResults).forEach(([lang, result]) => {
    if (result === null) {
      log(`  ${lang}: Non configuré`, 'yellow');
    } else if (result) {
      log(`  ${lang}: ✅ Accessible`, 'green');
    } else {
      log(`  ${lang}: ❌ Non accessible`, 'red');
    }
  });
  
  log('\nPDFs:', 'cyan');
  Object.entries(pdfResults).forEach(([lang, result]) => {
    if (result === null) {
      log(`  ${lang}: Non configuré`, 'yellow');
    } else if (result) {
      log(`  ${lang}: ✅ Accessible`, 'green');
    } else {
      log(`  ${lang}: ❌ Non accessible`, 'red');
    }
  });
  
  const allVideosOk = Object.values(videoResults).every(r => r === null || r === true);
  const allPDFsOk = Object.values(pdfResults).every(r => r === null || r === true);
  
  if (allVideosOk && allPDFsOk) {
    log('\n✅ Tous les médias configurés sont accessibles!', 'green');
  } else {
    log('\n⚠️  Certains médias ne sont pas accessibles', 'yellow');
    log('💡 Solution: Uploader les fichiers manquants via l\'interface admin', 'cyan');
  }
  
  process.exit(0);
}

// Exécuter le script
main().catch(error => {
  logError(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});

