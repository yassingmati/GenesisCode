// Script pour configurer MongoDB Atlas et exécuter le seed
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const password = 'dxDKTKLRgG4PG5SG';
const mongoURI = `mongodb+srv://discord:${password}@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0`;

// Chemin du fichier .env
const envPath = path.join(__dirname, '..', '..', '.env');

console.log('🔧 Configuration de MongoDB Atlas...\n');

// Lire le fichier .env
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
  console.log('✅ Fichier .env mis à jour avec MongoDB Atlas!');
  console.log(`   URI: mongodb+srv://discord:***@cluster0.whxj5zj.mongodb.net/codegenesis\n`);
} catch (err) {
  console.error('❌ Erreur écriture fichier .env:', err.message);
  process.exit(1);
}

// Maintenant exécuter le seed
console.log('🌱 Exécution du seed vers MongoDB Atlas...\n');

// Recharger les variables d'environnement
delete require.cache[require.resolve('dotenv')];
process.env.MONGODB_URI = mongoURI;

// Importer et exécuter le seed
const seedToAtlas = require('./seedToAtlas');
seedToAtlas().catch(err => {
  console.error('❌ Erreur lors du seed:', err);
  process.exit(1);
});

