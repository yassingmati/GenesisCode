// Script final pour corriger TOUS les problèmes automatiquement
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

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

function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function fixEverything() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('     CORRECTION AUTOMATIQUE COMPLÈTE - CodeGenesis', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  const fixes = [];
  const backendPath = path.join(__dirname, 'backend');
  const envPath = path.join(backendPath, '.env');

  // 1. Arrêter tous les processus Node.js
  log('1️⃣ Arrêt des processus Node.js existants...', 'blue');
  try {
    execSync('Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue', { shell: 'powershell.exe' });
    log('   ✅ Processus Node.js arrêtés', 'green');
    fixes.push('Processus Node.js arrêtés');
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (err) {
    log('   ⚠️  Aucun processus Node.js à arrêter', 'yellow');
  }

  // 2. Vérifier et créer les dossiers nécessaires
  log('\n2️⃣ Vérification des dossiers...', 'blue');
  const uploadsPath = path.join(backendPath, 'src', 'uploads');
  const videosPath = path.join(uploadsPath, 'videos');
  const pdfsPath = path.join(uploadsPath, 'pdfs');
  
  try {
    [uploadsPath, videosPath, pdfsPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`   ✅ Dossier créé: ${path.basename(dir)}`, 'green');
      }
    });
    log('   ✅ Tous les dossiers OK', 'green');
  } catch (err) {
    log(`   ⚠️  Erreur création dossiers: ${err.message}`, 'yellow');
  }

  // 3. Vérifier MongoDB Configuration
  log('\n3️⃣ Configuration MongoDB...', 'blue');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('mongodb://localhost:27017')) {
      log('   ⚠️  MongoDB configuré pour localhost (non connecté)', 'yellow');
      log('   💡 Voulez-vous configurer MongoDB Atlas maintenant?', 'cyan');
      
      const useAtlas = await question('   Configurer MongoDB Atlas? (o/n): ');
      
      if (useAtlas.toLowerCase() === 'o' || useAtlas.toLowerCase() === 'oui' || useAtlas.toLowerCase() === 'y' || useAtlas.toLowerCase() === 'yes') {
        const password = await question('   Entrez le mot de passe pour l\'utilisateur "discord": ');
        
        if (password) {
          const mongoURI = `mongodb+srv://discord:${password}@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0`;
          
          // Mettre à jour .env
          const lines = envContent.split('\n');
          const newLines = lines.map(line => {
            if (line.startsWith('MONGODB_URI=') || line.startsWith('MONGO_URI=')) {
              return `MONGODB_URI=${mongoURI}`;
            }
            return line;
          });
          
          fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
          log('   ✅ MongoDB Atlas configuré dans .env', 'green');
          fixes.push('MongoDB Atlas configuré');
          
          log('\n   ⚠️  IMPORTANT: Vérifiez Network Access dans MongoDB Atlas', 'yellow');
          log('   - Allez sur https://cloud.mongodb.com/', 'cyan');
          log('   - Network Access → Autoriser 0.0.0.0/0', 'cyan');
        } else {
          log('   ⚠️  Configuration MongoDB Atlas annulée', 'yellow');
        }
      } else {
        log('   ⚠️  MongoDB reste configuré pour localhost', 'yellow');
        log('   💡 Pour utiliser MongoDB Atlas plus tard: node setup-mongodb-atlas.js', 'cyan');
      }
    } else if (envContent.includes('mongodb+srv://')) {
      log('   ✅ MongoDB Atlas déjà configuré', 'green');
    } else {
      log('   ⚠️  MONGODB_URI non configuré', 'yellow');
      log('   💡 Pour configurer: node setup-mongodb-atlas.js', 'cyan');
    }
  } else {
    log('   ⚠️  Fichier .env manquant, création...', 'yellow');
    const defaultEnv = `PORT=5000
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/codegenesis
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
`;
    fs.writeFileSync(envPath, defaultEnv, 'utf8');
    log('   ✅ Fichier .env créé', 'green');
    fixes.push('Fichier .env créé');
  }

  // 4. Vérifier les dépendances
  log('\n4️⃣ Vérification des dépendances...', 'blue');
  const nodeModulesPath = path.join(backendPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('   ⚠️  Dépendances manquantes, installation...', 'yellow');
    try {
      execSync('npm install', { cwd: backendPath, stdio: 'inherit' });
      log('   ✅ Dépendances installées', 'green');
      fixes.push('Dépendances installées');
    } catch (err) {
      log('   ❌ Erreur installation dépendances', 'red');
    }
  } else {
    log('   ✅ Dépendances présentes', 'green');
  }

  // Résumé
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('                        RÉSUMÉ', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  if (fixes.length > 0) {
    log('✅ Corrections appliquées:', 'green');
    fixes.forEach(fix => log(`   - ${fix}`, 'green'));
  }

  log('\n📋 Prochaines étapes:', 'cyan');
  log('1. Si MongoDB Atlas configuré, vérifiez Network Access:', 'white');
  log('   - MongoDB Atlas → Network Access → Autoriser 0.0.0.0/0', 'white');
  log('2. Démarrez le serveur:', 'white');
  log('   cd backend && npm run dev', 'white');
  log('3. Testez la connexion:', 'white');
  log('   node test-server.js', 'white');

  log('\n✅ Toutes les corrections sont terminées!\n', 'green');
}

fixEverything().catch(err => {
  log(`\n❌ Erreur: ${err.message}`, 'red');
  process.exit(1);
});

