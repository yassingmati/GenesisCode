// Script pour configurer MongoDB Atlas dans backend/.env
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupMongoDBAtlas() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('      CONFIGURATION MONGODB ATLAS - CodeGenesis');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('D\'après MongoDB Atlas:');
  console.log('  Cluster: cluster0.whxj5zj.mongodb.net');
  console.log('  Utilisateur: discord\n');

  // Demander le mot de passe
  const password = await question('Entrez le mot de passe pour l\'utilisateur "discord": ');
  
  if (!password) {
    console.error('❌ Mot de passe requis');
    process.exit(1);
  }

  // Construire l'URI
  const mongoURI = `mongodb+srv://discord:${password}@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0`;

  // Lire le fichier .env actuel
  const envPath = path.join(__dirname, 'backend', '.env');
  let envContent = '';

  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    console.error('❌ Erreur lecture fichier .env:', err.message);
    process.exit(1);
  }

  // Remplacer ou ajouter MONGODB_URI
  const lines = envContent.split('\n');
  let updated = false;
  const newLines = lines.map(line => {
    if (line.startsWith('MONGODB_URI=') || line.startsWith('MONGO_URI=')) {
      updated = true;
      return `MONGODB_URI=${mongoURI}`;
    }
    return line;
  });

  // Si MONGODB_URI n'existe pas, l'ajouter
  if (!updated) {
    newLines.push(`MONGODB_URI=${mongoURI}`);
  }

  // Écrire le fichier .env
  try {
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
    console.log('\n✅ Fichier .env mis à jour avec succès!');
    console.log(`\nURI MongoDB Atlas configurée:`);
    console.log(`mongodb+srv://discord:***@cluster0.whxj5zj.mongodb.net/codegenesis`);
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Vérifiez que Network Access est configuré dans MongoDB Atlas (0.0.0.0/0)');
    console.log('2. Redémarrez le serveur: cd backend && npm start');
    console.log('3. Testez la connexion: node test-server.js');
    console.log('\n✅ Configuration terminée!\n');
  } catch (err) {
    console.error('❌ Erreur écriture fichier .env:', err.message);
    process.exit(1);
  }

  rl.close();
}

setupMongoDBAtlas().catch(console.error);

