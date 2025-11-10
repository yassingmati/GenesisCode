/**
 * Script pour mettre à jour MONGODB_URI dans backend/.env
 */

const fs = require('fs');
const path = require('path');

const MONGODB_ATLAS_URI = 'mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0';
const envPath = path.resolve(__dirname, 'backend', '.env');

try {
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env non trouvé:', envPath);
    process.exit(1);
  }
  
  // Lire le fichier .env
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Vérifier si MONGODB_URI existe déjà
  if (envContent.includes('MONGODB_URI=')) {
    // Remplacer l'URI existante
    envContent = envContent.replace(
      /MONGODB_URI=.*/g,
      `MONGODB_URI=${MONGODB_ATLAS_URI}`
    );
    console.log('✅ MONGODB_URI mis à jour dans backend/.env');
  } else {
    // Ajouter MONGODB_URI si elle n'existe pas
    envContent += `\nMONGODB_URI=${MONGODB_ATLAS_URI}\n`;
    console.log('✅ MONGODB_URI ajouté dans backend/.env');
  }
  
  // Écrire le fichier .env mis à jour
  fs.writeFileSync(envPath, envContent, 'utf-8');
  
  console.log('✅ Fichier backend/.env mis à jour avec succès');
  console.log('   URI:', MONGODB_ATLAS_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour:', error.message);
  process.exit(1);
}

