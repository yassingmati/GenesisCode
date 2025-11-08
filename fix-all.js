// Script complet pour corriger tous les problèmes et configurer l'application
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readEnvFile(envPath) {
  try {
    return fs.readFileSync(envPath, 'utf8');
  } catch {
    return '';
  }
}

function updateEnvFile(envPath, key, value) {
  let content = readEnvFile(envPath);
  const lines = content.split('\n');
  let updated = false;
  
  const newLines = lines.map(line => {
    if (line.startsWith(`${key}=`)) {
      updated = true;
      return `${key}=${value}`;
    }
    return line;
  });
  
  if (!updated) {
    newLines.push(`${key}=${value}`);
  }
  
  fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
  return updated;
}

async function fixAll() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('     CORRECTION COMPLÈTE - CodeGenesis', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const issues = [];
  const fixes = [];

  // 1. Vérifier les dépendances
  log('1️⃣ Vérification des dépendances...', 'blue');
  const backendPath = path.join(__dirname, 'backend');
  const nodeModulesPath = path.join(backendPath, 'node_modules');
  
  if (!checkFileExists(nodeModulesPath)) {
    log('   ⚠️  node_modules manquant, installation...', 'yellow');
    try {
      execSync('npm install', { cwd: backendPath, stdio: 'inherit' });
      log('   ✅ Dépendances installées', 'green');
      fixes.push('Dépendances installées');
    } catch (err) {
      log('   ❌ Erreur installation dépendances', 'red');
      issues.push('Dépendances non installées');
    }
  } else {
    log('   ✅ Dépendances présentes', 'green');
  }

  // 2. Vérifier le fichier .env
  log('\n2️⃣ Vérification du fichier .env...', 'blue');
  const envPath = path.join(backendPath, '.env');
  
  if (!checkFileExists(envPath)) {
    log('   ⚠️  Fichier .env manquant, création...', 'yellow');
    const defaultEnv = `PORT=5000
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/codegenesis
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
`;
    fs.writeFileSync(envPath, defaultEnv, 'utf8');
    log('   ✅ Fichier .env créé avec valeurs par défaut', 'green');
    fixes.push('Fichier .env créé');
  } else {
    log('   ✅ Fichier .env présent', 'green');
    
    // Vérifier MongoDB URI
    const envContent = readEnvFile(envPath);
    if (envContent.includes('mongodb://localhost:27017')) {
      log('   ⚠️  MongoDB configuré pour localhost (non connecté)', 'yellow');
      log('   💡 Pour utiliser MongoDB Atlas, exécutez: node setup-mongodb-atlas.js', 'cyan');
      issues.push('MongoDB non connecté (localhost)');
    } else if (envContent.includes('mongodb+srv://')) {
      log('   ✅ MongoDB Atlas configuré', 'green');
    } else {
      log('   ⚠️  MONGODB_URI non configuré', 'yellow');
      issues.push('MongoDB URI non configuré');
    }
  }

  // 3. Vérifier les dossiers uploads
  log('\n3️⃣ Vérification des dossiers uploads...', 'blue');
  const uploadsPath = path.join(backendPath, 'src', 'uploads');
  const videosPath = path.join(uploadsPath, 'videos');
  const pdfsPath = path.join(uploadsPath, 'pdfs');
  
  try {
    if (!checkFileExists(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      log('   ✅ Dossier uploads créé', 'green');
      fixes.push('Dossier uploads créé');
    }
    if (!checkFileExists(videosPath)) {
      fs.mkdirSync(videosPath, { recursive: true });
      log('   ✅ Dossier uploads/videos créé', 'green');
    }
    if (!checkFileExists(pdfsPath)) {
      fs.mkdirSync(pdfsPath, { recursive: true });
      log('   ✅ Dossier uploads/pdfs créé', 'green');
    }
    log('   ✅ Dossiers uploads OK', 'green');
  } catch (err) {
    log(`   ⚠️  Erreur création dossiers: ${err.message}`, 'yellow');
  }

  // 4. Vérifier les fichiers critiques
  log('\n4️⃣ Vérification des fichiers critiques...', 'blue');
  const criticalFiles = [
    'backend/src/index.js',
    'backend/src/controllers/authController.js',
    'backend/src/routes/authRoutes.js',
    'backend/src/middlewares/mongoCheckMiddleware.js'
  ];
  
  let allFilesOk = true;
  for (const file of criticalFiles) {
    if (checkFileExists(file)) {
      log(`   ✅ ${path.basename(file)}`, 'green');
    } else {
      log(`   ❌ ${file} manquant`, 'red');
      allFilesOk = false;
      issues.push(`Fichier manquant: ${file}`);
    }
  }
  
  if (allFilesOk) {
    log('   ✅ Tous les fichiers critiques présents', 'green');
  }

  // 5. Vérifier le port
  log('\n5️⃣ Vérification du port 5000...', 'blue');
  try {
    const result = execSync('netstat -ano | findstr :5000', { encoding: 'utf8', stdio: 'pipe' });
    if (result.trim()) {
      log('   ⚠️  Port 5000 déjà utilisé', 'yellow');
      log('   💡 Pour arrêter les processus: Get-Process -Name node | Stop-Process -Force', 'cyan');
      issues.push('Port 5000 déjà utilisé');
    } else {
      log('   ✅ Port 5000 disponible', 'green');
    }
  } catch {
    log('   ✅ Port 5000 disponible', 'green');
  }

  // Résumé
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('                        RÉSUMÉ', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  if (fixes.length > 0) {
    log('✅ Corrections appliquées:', 'green');
    fixes.forEach(fix => log(`   - ${fix}`, 'green'));
  }

  if (issues.length > 0) {
    log('\n⚠️  Problèmes détectés:', 'yellow');
    issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
  } else {
    log('\n✅ Aucun problème détecté!', 'green');
  }

  log('\n📋 Prochaines étapes:', 'cyan');
  log('1. Si MongoDB n\'est pas connecté:', 'white');
  log('   - Exécutez: node setup-mongodb-atlas.js', 'white');
  log('   - OU configurez manuellement backend/.env', 'white');
  log('2. Redémarrez le serveur:', 'white');
  log('   cd backend && npm run dev', 'white');
  log('3. Testez la connexion:', 'white');
  log('   node test-server.js', 'white');

  log('\n✅ Correction terminée!\n', 'green');
}

fixAll().catch(err => {
  log(`\n❌ Erreur: ${err.message}`, 'red');
  process.exit(1);
});

