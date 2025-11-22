/**
 * Script de test pour l'upload et la récupération de vidéos et PDFs
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

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
 * Obtenir un token admin
 */
async function getAdminToken() {
  try {
    logInfo('Tentative d\'authentification admin...');
    
    // Essayer plusieurs emails admin possibles
    const adminEmails = [
      'admin@test.com',
      'admin2@test.com',
      'admin@genesis.com',
      'admin@codegenesis.com'
    ];
    
    for (const email of adminEmails) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
          email,
          password: 'password123'
        });
        
        if (response.data && response.data.token) {
          logSuccess(`Authentification réussie avec ${email}`);
          return response.data.token;
        }
      } catch (err) {
        // Continuer avec le prochain email
        continue;
      }
    }
    
    logWarning('Impossible de s\'authentifier avec les emails par défaut');
    logInfo('Vous devrez peut-être créer un admin ou utiliser un token existant');
    return null;
  } catch (error) {
    logError(`Erreur lors de l'authentification: ${error.message}`);
    return null;
  }
}

/**
 * Créer un niveau de test
 */
async function createTestLevel(token) {
  try {
    logInfo('Création d\'un niveau de test...');
    
    // Récupérer les catégories
    const categoriesResponse = await axios.get(`${API_BASE_URL}/api/courses/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!categoriesResponse.data || categoriesResponse.data.length === 0) {
      logError('Aucune catégorie trouvée. Impossible de créer un niveau.');
      return null;
    }
    
    const category = categoriesResponse.data[0];
    logInfo(`Utilisation de la catégorie: ${category.name || category._id}`);
    
    // Récupérer ou créer un path
    let pathId;
    const pathsResponse = await axios.get(
      `${API_BASE_URL}/api/courses/categories/${category._id}/paths`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (pathsResponse.data && pathsResponse.data.length > 0) {
      pathId = pathsResponse.data[0]._id;
      logInfo(`Path existant trouvé: ${pathId}`);
    } else {
      // Créer un path de test
      logInfo('Création d\'un path de test...');
      const pathResponse = await axios.post(
        `${API_BASE_URL}/api/courses/paths`,
        {
          category: category._id,
          translations: {
            fr: { name: 'Path de Test', description: 'Path créé pour les tests' },
            en: { name: 'Test Path', description: 'Path created for testing' },
            ar: { name: 'مسار الاختبار', description: 'مسار تم إنشاؤه للاختبار' }
          },
          order: 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      pathId = pathResponse.data._id;
      logSuccess(`Path créé: ${pathId}`);
    }
    
    // Créer un niveau de test
    logInfo('Création d\'un niveau de test...');
    const levelResponse = await axios.post(
      `${API_BASE_URL}/api/courses/levels`,
      {
        path: pathId,
        translations: {
          fr: { title: 'Niveau de Test', content: 'Ce niveau a été créé pour tester l\'upload de médias' },
          en: { title: 'Test Level', content: 'This level was created to test media uploads' },
          ar: { title: 'مستوى الاختبار', content: 'تم إنشاء هذا المستوى لاختبار تحميل الوسائط' }
        },
        order: 0,
        videos: {},
        pdfs: {}
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    logSuccess(`Niveau créé: ${levelResponse.data._id}`);
    return levelResponse.data._id;
  } catch (error) {
    logError(`Erreur lors de la création du niveau: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

/**
 * Obtenir ou créer un niveau de test
 */
async function getOrCreateTestLevel(token) {
  try {
    logInfo('Recherche d\'un niveau existant...');
    
    // Essayer de récupérer les catégories
    const categoriesResponse = await axios.get(`${API_BASE_URL}/api/courses/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (categoriesResponse.data && categoriesResponse.data.length > 0) {
      const category = categoriesResponse.data[0];
      logInfo(`Catégorie trouvée: ${category.name || category._id}`);
      
      // Récupérer les paths de cette catégorie
      const pathsResponse = await axios.get(
        `${API_BASE_URL}/api/courses/categories/${category._id}/paths`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (pathsResponse.data && pathsResponse.data.length > 0) {
        const path = pathsResponse.data[0];
        logInfo(`Path trouvé: ${path.name || path._id}`);
        
        // Récupérer les niveaux de ce path
        const levelsResponse = await axios.get(
          `${API_BASE_URL}/api/courses/paths/${path._id}/levels`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (levelsResponse.data && levelsResponse.data.length > 0) {
          const level = levelsResponse.data[0];
          logSuccess(`Niveau trouvé: ${level.title || level._id}`);
          return level._id;
        }
      }
    }
    
    logWarning('Aucun niveau existant trouvé');
    logInfo('Création d\'un niveau de test...');
    return await createTestLevel(token);
  } catch (error) {
    logError(`Erreur lors de la recherche de niveau: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    logInfo('Tentative de création d\'un niveau de test...');
    return await createTestLevel(token);
  }
}

/**
 * Créer des fichiers de test
 */
function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  // Créer un fichier PDF de test minimal
  const pdfPath = path.join(testDir, 'test.pdf');
  if (!fs.existsSync(pdfPath)) {
    // PDF minimal valide (header PDF)
    const pdfContent = Buffer.from(
      '%PDF-1.4\n' +
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n' +
      'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n' +
      'trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n174\n%%EOF'
    );
    fs.writeFileSync(pdfPath, pdfContent);
    logSuccess('Fichier PDF de test créé');
  }
  
  // Créer un fichier vidéo de test minimal (MP4 header)
  const videoPath = path.join(testDir, 'test.mp4');
  if (!fs.existsSync(videoPath)) {
    // MP4 minimal (juste le header, pas une vraie vidéo)
    const mp4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
      0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
      0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
      0x6D, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x08
    ]);
    fs.writeFileSync(videoPath, mp4Header);
    logSuccess('Fichier vidéo de test créé (header MP4 minimal)');
  }
  
  return {
    pdfPath,
    videoPath
  };
}

/**
 * Tester l'upload d'une vidéo
 */
async function testUploadVideo(levelId, token, videoPath) {
  try {
    logInfo(`Upload de la vidéo pour le niveau ${levelId}...`);
    
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoPath));
    formData.append('lang', 'fr');
    
    const response = await axios.post(
      `${API_BASE_URL}/api/courses/levels/${levelId}/video`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    if (response.status === 200 || response.status === 201) {
      logSuccess('Upload vidéo réussi!');
      logInfo(`Réponse: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } else {
      logError(`Upload vidéo échoué: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur lors de l'upload vidéo: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

/**
 * Tester l'upload d'un PDF
 */
async function testUploadPDF(levelId, token, pdfPath) {
  try {
    logInfo(`Upload du PDF pour le niveau ${levelId}...`);
    
    const formData = new FormData();
    formData.append('pdf', fs.createReadStream(pdfPath));
    formData.append('lang', 'fr');
    
    const response = await axios.post(
      `${API_BASE_URL}/api/courses/levels/${levelId}/pdf`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    if (response.status === 200 || response.status === 201) {
      logSuccess('Upload PDF réussi!');
      logInfo(`Réponse: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } else {
      logError(`Upload PDF échoué: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur lors de l'upload PDF: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

/**
 * Tester la récupération d'une vidéo
 */
async function testRetrieveVideo(levelId, token) {
  try {
    logInfo(`Récupération de la vidéo pour le niveau ${levelId}...`);
    
    const response = await axios.get(
      `${API_BASE_URL}/api/courses/levels/${levelId}/video?lang=fr`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'stream',
        validateStatus: (status) => status < 500 // Accepter 200, 206, 404, etc.
      }
    );
    
    if (response.status === 200 || response.status === 206) {
      logSuccess('Récupération vidéo réussie!');
      logInfo(`Status: ${response.status}`);
      logInfo(`Content-Type: ${response.headers['content-type']}`);
      logInfo(`Content-Length: ${response.headers['content-length'] || 'Non spécifié'}`);
      
      // Sauvegarder la vidéo récupérée pour vérification
      const outputPath = path.join(__dirname, 'test-files', 'retrieved-video.mp4');
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      
      return new Promise((resolve) => {
        writer.on('finish', () => {
          logSuccess(`Vidéo sauvegardée dans: ${outputPath}`);
          resolve(true);
        });
        writer.on('error', (err) => {
          logError(`Erreur lors de l'écriture: ${err.message}`);
          resolve(false);
        });
      });
    } else if (response.status === 404) {
      logWarning('Vidéo non trouvée (404)');
      return false;
    } else {
      logError(`Récupération vidéo échouée: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logWarning('Vidéo non trouvée (404)');
      return false;
    }
    logError(`Erreur lors de la récupération vidéo: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${error.response.data ? JSON.stringify(error.response.data) : 'Pas de données'}`);
    }
    return false;
  }
}

/**
 * Tester la récupération d'un PDF
 */
async function testRetrievePDF(levelId, token) {
  try {
    logInfo(`Récupération du PDF pour le niveau ${levelId}...`);
    
    const response = await axios.get(
      `${API_BASE_URL}/api/courses/levels/${levelId}/pdf?lang=fr`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'stream',
        validateStatus: (status) => status < 500
      }
    );
    
    if (response.status === 200) {
      logSuccess('Récupération PDF réussie!');
      logInfo(`Status: ${response.status}`);
      logInfo(`Content-Type: ${response.headers['content-type']}`);
      logInfo(`Content-Length: ${response.headers['content-length'] || 'Non spécifié'}`);
      
      // Sauvegarder le PDF récupéré pour vérification
      const outputPath = path.join(__dirname, 'test-files', 'retrieved.pdf');
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      
      return new Promise((resolve) => {
        writer.on('finish', () => {
          logSuccess(`PDF sauvegardé dans: ${outputPath}`);
          resolve(true);
        });
        writer.on('error', (err) => {
          logError(`Erreur lors de l'écriture: ${err.message}`);
          resolve(false);
        });
      });
    } else if (response.status === 404) {
      logWarning('PDF non trouvé (404)');
      return false;
    } else {
      logError(`Récupération PDF échouée: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logWarning('PDF non trouvé (404)');
      return false;
    }
    logError(`Erreur lors de la récupération PDF: ${error.message}`);
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError(`Data: ${error.response.data ? JSON.stringify(error.response.data) : 'Pas de données'}`);
    }
    return false;
  }
}

/**
 * Fonction principale
 */
async function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🧪 TEST D\'UPLOAD ET RÉCUPÉRATION DE MÉDIAS', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  // Vérifier que le backend est accessible
  try {
    logInfo('Vérification de la connexion au backend...');
    await axios.get(`${API_BASE_URL}/health`);
    logSuccess('Backend accessible');
  } catch (error) {
    logError(`Backend non accessible: ${error.message}`);
    logError(`Assurez-vous que le backend est démarré sur ${API_BASE_URL}`);
    process.exit(1);
  }
  
  // Obtenir le token admin
  let token = await getAdminToken();
  if (!token) {
    logError('Impossible d\'obtenir un token admin');
    logInfo('Vous pouvez passer un token en variable d\'environnement: ADMIN_TOKEN=...');
    const envToken = process.env.ADMIN_TOKEN;
    if (envToken) {
      logInfo('Utilisation du token depuis ADMIN_TOKEN');
      token = envToken;
    } else {
      logError('Aucun token admin disponible. Arrêt.');
      process.exit(1);
    }
  }
  
  // Obtenir un levelId depuis les arguments de ligne de commande ou créer un niveau de test
  let levelId = process.argv[2];
  
  if (!levelId) {
    levelId = await getOrCreateTestLevel(token);
    if (!levelId) {
      logError('Impossible d\'obtenir ou de créer un niveau. Arrêt.');
      logInfo('Vous pouvez passer un ID de niveau en argument: node test-upload-media.js <levelId>');
      process.exit(1);
    }
  } else {
    logInfo(`Utilisation du niveau fourni: ${levelId}`);
  }
  
  logInfo(`Utilisation du niveau: ${levelId}\n`);
  
  // Créer les fichiers de test
  const { pdfPath, videoPath } = createTestFiles();
  
  // Tests
  const results = {
    uploadVideo: false,
    uploadPDF: false,
    retrieveVideo: false,
    retrievePDF: false
  };
  
  // Test 1: Upload vidéo
  log('\n' + '-'.repeat(60), 'yellow');
  log('📹 TEST 1: UPLOAD VIDÉO', 'yellow');
  log('-'.repeat(60) + '\n', 'yellow');
  results.uploadVideo = await testUploadVideo(levelId, token, videoPath);
  
  // Test 2: Upload PDF
  log('\n' + '-'.repeat(60), 'yellow');
  log('📄 TEST 2: UPLOAD PDF', 'yellow');
  log('-'.repeat(60) + '\n', 'yellow');
  results.uploadPDF = await testUploadPDF(levelId, token, pdfPath);
  
  // Attendre un peu avant de récupérer
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Récupération vidéo
  log('\n' + '-'.repeat(60), 'yellow');
  log('📹 TEST 3: RÉCUPÉRATION VIDÉO', 'yellow');
  log('-'.repeat(60) + '\n', 'yellow');
  results.retrieveVideo = await testRetrieveVideo(levelId, token);
  
  // Test 4: Récupération PDF
  log('\n' + '-'.repeat(60), 'yellow');
  log('📄 TEST 4: RÉCUPÉRATION PDF', 'yellow');
  log('-'.repeat(60) + '\n', 'yellow');
  results.retrievePDF = await testRetrievePDF(levelId, token);
  
  // Résumé
  log('\n' + '='.repeat(60), 'blue');
  log('📊 RÉSUMÉ DES TESTS', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSÉ`);
    } else {
      logError(`${test}: ÉCHOUÉ`);
    }
  });
  
  const allPassed = Object.values(results).every(r => r);
  if (allPassed) {
    log('\n✅ Tous les tests sont passés!', 'green');
  } else {
    log('\n⚠️  Certains tests ont échoué', 'yellow');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Exécuter le script
main().catch(error => {
  logError(`Erreur fatale: ${error.message}`);
  console.error(error);
  process.exit(1);
});

