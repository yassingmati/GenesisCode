/**
 * Script pour vérifier les logs d'envoi d'email
 * Aide à vérifier si les emails ont été envoyés avec succès
 */

// Charger les variables d'environnement depuis backend/.env
const { loadEnv } = require('./load-env');
loadEnv();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Vérifier la configuration email
 */
function checkEmailConfig() {
  console.log('\n📧 Vérification de la configuration email...\n');
  
  const config = {
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    serverUrl: process.env.SERVER_URL,
    clientUrl: process.env.CLIENT_URL
  };
  
  const checks = {
    emailUser: !!config.emailUser,
    emailPass: !!config.emailPass,
    serverUrl: !!config.serverUrl,
    clientUrl: !!config.clientUrl
  };
  
  console.log('Configuration:');
  console.log(`  EMAIL_USER: ${checks.emailUser ? '✅ Défini' : '❌ Non défini'}`);
  if (checks.emailUser) {
    console.log(`    Valeur: ${config.emailUser}`);
  }
  console.log(`  EMAIL_PASS: ${checks.emailPass ? '✅ Défini' : '❌ Non défini'}`);
  console.log(`  SERVER_URL: ${checks.serverUrl ? '✅ Défini' : '❌ Non défini'}`);
  if (checks.serverUrl) {
    console.log(`    Valeur: ${config.serverUrl}`);
  }
  console.log(`  CLIENT_URL: ${checks.clientUrl ? '✅ Défini' : '❌ Non défini'}`);
  if (checks.clientUrl) {
    console.log(`    Valeur: ${config.clientUrl}`);
  }
  
  const allOk = Object.values(checks).every(v => v);
  
  console.log('\n' + '='.repeat(60));
  if (allOk) {
    console.log('✅ Configuration email complète');
  } else {
    console.log('❌ Configuration email incomplète');
    console.log('\n📝 Instructions:');
    console.log('1. Vérifiez que EMAIL_USER et EMAIL_PASS sont définis dans backend/.env');
    console.log('2. Pour Gmail, créez un mot de passe d\'application:');
    console.log('   https://myaccount.google.com/apppasswords');
  }
  console.log('='.repeat(60) + '\n');
  
  return allOk;
}

/**
 * Tester la connexion SMTP
 */
async function testSMTPConnection() {
  console.log('🔗 Test de connexion SMTP...\n');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Configuration email manquante\n');
    return false;
  }
  
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion SMTP:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifiez que EMAIL_USER et EMAIL_PASS sont corrects');
    console.log('2. Pour Gmail, utilisez un mot de passe d\'application');
    console.log('3. Vérifiez que "Accès aux applications moins sécurisées" est activé');
    console.log('4. Vérifiez votre connexion internet\n');
    return false;
  }
}

/**
 * Vérifier les logs du backend
 */
function checkBackendLogs() {
  console.log('📋 Vérification des logs du backend...\n');
  
  console.log('💡 Instructions pour vérifier les logs:');
  console.log('1. Ouvrez le terminal où le backend est en cours d\'exécution');
  console.log('2. Cherchez les messages suivants:');
  console.log('   - "Email de vérification envoyé à ..."');
  console.log('   - "Verification email sent to ..."');
  console.log('   - Erreurs SMTP ou nodemailer');
  console.log('3. Si vous voyez des erreurs, notez-les ci-dessous\n');
  
  return question('Avez-vous vu des messages d\'envoi d\'email dans les logs? (o/n): ').then(answer => {
    return answer.toLowerCase() === 'o';
  });
}

/**
 * Vérifier la boîte de réception
 */
function checkInbox() {
  console.log('\n📬 Vérification de la boîte de réception...\n');
  
  console.log('💡 Instructions:');
  console.log('1. Ouvrez votre boîte email:', process.env.EMAIL_USER || 'votre-email@gmail.com');
  console.log('2. Cherchez les emails avec le sujet: "Vérification de votre email"');
  console.log('3. Vérifiez le dossier Spam/Indésirables si nécessaire');
  console.log('4. Vérifiez que le lien de vérification est présent\n');
  
  return question('Avez-vous reçu l\'email de vérification? (o/n): ').then(answer => {
    const received = answer.toLowerCase() === 'o';
    
    if (received) {
      return question('Le lien de vérification est-il présent et fonctionnel? (o/n): ').then(linkOk => {
        return { received: true, linkOk: linkOk.toLowerCase() === 'o' };
      });
    }
    
    return { received: false, linkOk: false };
  });
}

/**
 * Générer un rapport de vérification
 */
async function generateVerificationReport(results) {
  const report = `# Rapport de Vérification Email

**Date:** ${new Date().toLocaleString('fr-FR')}

## Configuration

- EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Défini' : '❌ Non défini'}
- EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Défini' : '❌ Non défini'}
- SERVER_URL: ${process.env.SERVER_URL || 'Non défini'}
- CLIENT_URL: ${process.env.CLIENT_URL || 'Non défini'}

## Tests

### Connexion SMTP
- **Statut:** ${results.smtpOk ? '✅ Réussi' : '❌ Échoué'}

### Logs Backend
- **Statut:** ${results.logsOk ? '✅ Emails envoyés visibles dans les logs' : '❌ Aucun email visible dans les logs'}

### Boîte de réception
- **Email reçu:** ${results.inbox.received ? '✅ Oui' : '❌ Non'}
- **Lien fonctionnel:** ${results.inbox.linkOk ? '✅ Oui' : '❌ Non'}

## Résumé

${results.smtpOk && results.logsOk && results.inbox.received && results.inbox.linkOk 
  ? '✅ Tous les tests de vérification email sont passés!' 
  : '⚠️ Certains tests ont échoué. Consultez les détails ci-dessus.'}

## Recommandations

${!results.smtpOk ? '- Vérifiez la configuration SMTP\n' : ''}${!results.logsOk ? '- Vérifiez les logs du backend pour les erreurs\n' : ''}${!results.inbox.received ? '- Vérifiez le dossier Spam/Indésirables\n- Vérifiez que l\'email de test est correct\n' : ''}${results.inbox.received && !results.inbox.linkOk ? '- Vérifiez que SERVER_URL est correctement configuré\n' : ''}
`;

  const reportFile = path.join(__dirname, 'EMAIL_VERIFICATION_REPORT.md');
  fs.writeFileSync(reportFile, report, 'utf-8');
  console.log(`\n✅ Rapport généré: ${reportFile}\n`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 VÉRIFICATION DE LA LIVRAISON D\'EMAIL');
  console.log('='.repeat(60));
  
  const results = {
    configOk: false,
    smtpOk: false,
    logsOk: false,
    inbox: { received: false, linkOk: false }
  };
  
  // Vérifier la configuration
  results.configOk = checkEmailConfig();
  
  if (!results.configOk) {
    console.log('❌ Configuration incomplète. Veuillez corriger avant de continuer.\n');
    rl.close();
    return;
  }
  
  // Tester la connexion SMTP
  results.smtpOk = await testSMTPConnection();
  
  // Vérifier les logs
  results.logsOk = await checkBackendLogs();
  
  // Vérifier la boîte de réception
  results.inbox = await checkInbox();
  
  // Générer le rapport
  await generateVerificationReport(results);
  
  // Résumé
  console.log('='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`Configuration: ${results.configOk ? '✅' : '❌'}`);
  console.log(`Connexion SMTP: ${results.smtpOk ? '✅' : '❌'}`);
  console.log(`Logs Backend: ${results.logsOk ? '✅' : '❌'}`);
  console.log(`Email reçu: ${results.inbox.received ? '✅' : '❌'}`);
  console.log(`Lien fonctionnel: ${results.inbox.linkOk ? '✅' : '❌'}`);
  console.log('='.repeat(60) + '\n');
  
  if (results.smtpOk && results.logsOk && results.inbox.received && results.inbox.linkOk) {
    console.log('✅ Tous les tests de vérification email sont passés!\n');
  } else {
    console.log('⚠️ Certains tests ont échoué. Consultez le rapport pour plus de détails.\n');
  }
  
  rl.close();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error);
    rl.close();
    process.exit(1);
  });
}

module.exports = { checkEmailConfig, testSMTPConnection, checkBackendLogs, checkInbox };

