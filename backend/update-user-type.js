/**
 * Script pour mettre à jour le type d'utilisateur d'un email spécifique
 * Modifie le userType de l'utilisateur avec l'email donné
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Importer le modèle User
const User = require('./src/models/User');

async function updateUserType() {
  try {
    const email = 'yassine1.gmatii@gmail.com';
    const newUserType = 'parent';

    console.log('🔗 Connexion à MongoDB...');
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      console.error('❌ MONGODB_URI non définie dans les variables d\'environnement');
      console.log('\n💡 Pour exécuter ce script, vous devez:');
      console.log('   1. Créer un fichier .env dans le dossier backend/');
      console.log('   2. Ajouter la ligne: MONGODB_URI=votre_uri_mongodb');
      console.log('   3. Ou définir la variable d\'environnement MONGODB_URI');
      console.log('\n   Exemple:');
      console.log('   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/codegenesis');
      process.exit(1);
    }
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ Connecté à MongoDB');

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ Utilisateur avec l'email ${email} introuvable`);
      await mongoose.disconnect();
      return;
    }

    console.log('📧 Email trouvé:', user.email);
    console.log('👤 Nom:', user.firstName, user.lastName);
    console.log('📝 Type actuel:', user.userType);
    console.log('🆔 ID:', user._id.toString());

    // Vérifier si le type est déjà "parent"
    if (user.userType === newUserType) {
      console.log(`✅ L'utilisateur a déjà le type "${newUserType}"`);
      await mongoose.disconnect();
      return;
    }

    // Mettre à jour le type
    user.userType = newUserType;
    await user.save();

    console.log(`✅ Type d'utilisateur mis à jour avec succès !`);
    console.log(`📝 Nouveau type: ${user.userType}`);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécution du script
if (require.main === module) {
  updateUserType()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = updateUserType;

