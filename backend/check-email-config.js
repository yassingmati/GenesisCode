// Script pour vérifier la configuration email
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const nodemailer = require('nodemailer');

console.log('🔍 Vérification de la configuration email...\n');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('Variables d\'environnement:');
console.log('  EMAIL_USER:', emailUser ? emailUser : '❌ NON DÉFINI');
console.log('  EMAIL_PASS:', emailPass ? '✅ DÉFINI' : '❌ NON DÉFINI');
console.log('');

if (!emailUser || !emailPass) {
  console.error('❌ Configuration email incomplète!');
  console.error('');
  console.error('Pour configurer le service email:');
  console.error('1. Ajoutez EMAIL_USER et EMAIL_PASS dans backend/.env');
  console.error('2. Utilisez un mot de passe d\'application Gmail (pas votre mot de passe de connexion)');
  console.error('3. Voir CONFIGURATION_EMAIL.md pour plus de détails');
  process.exit(1);
}

console.log('✅ Variables d\'environnement configurées');
console.log('');

// Tester la connexion
console.log('🔗 Test de connexion au service email...');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('');
    console.error('Vérifiez:');
    console.error('  - EMAIL_USER est correct');
    console.error('  - EMAIL_PASS est un mot de passe d\'application Gmail');
    console.error('  - La validation en 2 étapes est activée sur Gmail');
    console.error('  - Le mot de passe d\'application est correct');
    process.exit(1);
  } else {
    console.log('✅ Connexion réussie!');
    console.log('');
    console.log('Le service email est correctement configuré.');
    console.log('Vous pouvez maintenant envoyer des emails.');
    process.exit(0);
  }
});

