/**
 * Checklist interactive pour les tests manuels
 * Aide à suivre la progression des tests manuels
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const checklist = {
  adminCreation: [
    { id: 'admin-script', name: 'Création admin via script', done: false },
    { id: 'admin-api', name: 'Création admin via API', done: false },
    { id: 'admin-auth', name: 'Authentification admin', done: false },
    { id: 'admin-list', name: 'Liste des admins', done: false }
  ],
  plansManagement: [
    { id: 'plan-create', name: 'Créer un plan via API', done: false },
    { id: 'plan-update', name: 'Modifier un plan', done: false },
    { id: 'plan-deactivate', name: 'Désactiver un plan', done: false },
    { id: 'plan-list-admin', name: 'Liste des plans (admin)', done: false },
    { id: 'plan-list-public', name: 'Liste des plans (public)', done: false },
    { id: 'plan-reactivate', name: 'Réactiver un plan', done: false }
  ],
  subscription: [
    { id: 'sub-free', name: 'S\'abonner à un plan gratuit', done: false },
    { id: 'sub-paid', name: 'S\'abonner à un plan payant', done: false },
    { id: 'sub-get', name: 'Récupérer l\'abonnement', done: false },
    { id: 'sub-cancel', name: 'Annuler un abonnement', done: false },
    { id: 'sub-resume', name: 'Reprendre un abonnement', done: false }
  ],
  emailVerification: [
    { id: 'email-send', name: 'Envoyer un email de vérification', done: false },
    { id: 'email-content', name: 'Vérifier le contenu de l\'email', done: false },
    { id: 'email-click', name: 'Cliquer sur le lien de vérification', done: false },
    { id: 'email-status', name: 'Vérifier le statut après vérification', done: false },
    { id: 'email-resend', name: 'Réenvoyer email (utilisateur vérifié)', done: false }
  ]
};

const resultsFile = path.join(__dirname, 'MANUAL_TEST_RESULTS.json');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function displayChecklist() {
  console.clear();
  console.log('\n' + '='.repeat(60));
  console.log('📋 CHECKLIST DES TESTS MANUELS');
  console.log('='.repeat(60) + '\n');
  
  let total = 0;
  let done = 0;
  
  Object.entries(checklist).forEach(([category, items]) => {
    const categoryName = {
      adminCreation: '1. Création d\'admin',
      plansManagement: '2. Gestion des plans',
      subscription: '3. Subscription',
      emailVerification: '4. Vérification email'
    }[category] || category;
    
    console.log(`\n${categoryName}:`);
    items.forEach(item => {
      total++;
      const status = item.done ? '✅' : '⏳';
      console.log(`  ${status} ${item.name}`);
      if (item.done) done++;
    });
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Progression: ${done}/${total} (${Math.round((done/total)*100)}%)`);
  console.log('='.repeat(60) + '\n');
}

async function markItemDone(category, itemId) {
  const categoryItems = checklist[category];
  if (!categoryItems) return false;
  
  const item = categoryItems.find(i => i.id === itemId);
  if (!item) return false;
  
  item.done = true;
  await saveResults();
  return true;
}

async function saveResults() {
  try {
    await fs.writeFile(resultsFile, JSON.stringify(checklist, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error.message);
  }
}

async function loadResults() {
  try {
    const data = await fs.readFile(resultsFile, 'utf-8');
    const saved = JSON.parse(data);
    
    // Fusionner avec la structure actuelle
    Object.keys(checklist).forEach(category => {
      if (saved[category]) {
        saved[category].forEach(savedItem => {
          const item = checklist[category].find(i => i.id === savedItem.id);
          if (item) {
            item.done = savedItem.done || false;
          }
        });
      }
    });
  } catch (error) {
    // Fichier n'existe pas encore, c'est normal
  }
}

function getCategoryMenu() {
  return `
Choisissez une catégorie:
1. Création d'admin
2. Gestion des plans
3. Subscription
4. Vérification email
5. Voir la checklist complète
6. Générer le rapport
0. Quitter

Votre choix: `;
}

function getItemMenu(category) {
  const items = checklist[category];
  const categoryName = {
    adminCreation: 'Création d\'admin',
    plansManagement: 'Gestion des plans',
    subscription: 'Subscription',
    emailVerification: 'Vérification email'
  }[category] || category;
  
  let menu = `\n${categoryName}:\n`;
  items.forEach((item, index) => {
    const status = item.done ? '✅' : '⏳';
    menu += `${index + 1}. ${status} ${item.name}\n`;
  });
  menu += `0. Retour\n\nVotre choix: `;
  return menu;
}

async function handleCategory(categoryKey) {
  const categoryName = {
    adminCreation: 'Création d\'admin',
    plansManagement: 'Gestion des plans',
    subscription: 'Subscription',
    emailVerification: 'Vérification email'
  }[categoryKey] || categoryKey;
  
  while (true) {
    displayChecklist();
    const choice = await question(getItemMenu(categoryKey));
    
    if (choice === '0') {
      break;
    }
    
    const index = parseInt(choice) - 1;
    const items = checklist[categoryKey];
    
    if (index >= 0 && index < items.length) {
      const item = items[index];
      
      if (item.done) {
        const unmark = await question(`\n${item.name} est déjà marqué comme fait. Voulez-vous le marquer comme non fait? (o/n): `);
        if (unmark.toLowerCase() === 'o') {
          item.done = false;
          await saveResults();
          console.log('\n✅ Item marqué comme non fait');
          await question('\nAppuyez sur Entrée pour continuer...');
        }
      } else {
        const confirm = await question(`\nMarquer "${item.name}" comme fait? (o/n): `);
        if (confirm.toLowerCase() === 'o') {
          item.done = true;
          await saveResults();
          console.log('\n✅ Item marqué comme fait!');
          await question('\nAppuyez sur Entrée pour continuer...');
        }
      }
    } else {
      console.log('\n❌ Choix invalide');
      await question('\nAppuyez sur Entrée pour continuer...');
    }
  }
}

async function generateReport() {
  let total = 0;
  let done = 0;
  
  Object.values(checklist).forEach(items => {
    items.forEach(item => {
      total++;
      if (item.done) done++;
    });
  });
  
  const report = `# Rapport des Tests Manuels

**Date:** ${new Date().toLocaleString('fr-FR')}
**Progression:** ${done}/${total} (${Math.round((done/total)*100)}%)

## Résultats par catégorie

### 1. Création d'admin
${checklist.adminCreation.map(item => `- ${item.done ? '✅' : '⏳'} ${item.name}`).join('\n')}

### 2. Gestion des plans
${checklist.plansManagement.map(item => `- ${item.done ? '✅' : '⏳'} ${item.name}`).join('\n')}

### 3. Subscription
${checklist.subscription.map(item => `- ${item.done ? '✅' : '⏳'} ${item.name}`).join('\n')}

### 4. Vérification email
${checklist.emailVerification.map(item => `- ${item.done ? '✅' : '⏳'} ${item.name}`).join('\n')}

## Résumé

- **Total:** ${total} tests
- **Réussis:** ${done} ✅
- **En attente:** ${total - done} ⏳
- **Taux de complétion:** ${Math.round((done/total)*100)}%

## Prochaines étapes

${done === total ? '✅ Tous les tests manuels sont complétés!' : `⏳ ${total - done} test(s) restant(s) à compléter`}
`;

  const reportFile = path.join(__dirname, 'MANUAL_TEST_REPORT.md');
  await fs.writeFile(reportFile, report, 'utf-8');
  console.log(`\n✅ Rapport généré: ${reportFile}\n`);
}

async function main() {
  await loadResults();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 CHECKLIST INTERACTIVE DES TESTS MANUELS');
  console.log('='.repeat(60));
  console.log('\nCe script vous aide à suivre la progression de vos tests manuels.');
  console.log('Consultez TEST_GUIDE_PLANS_SUBSCRIPTION.md pour les instructions détaillées.\n');
  
  while (true) {
    displayChecklist();
    const choice = await question(getCategoryMenu());
    
    switch (choice) {
      case '1':
        await handleCategory('adminCreation');
        break;
      case '2':
        await handleCategory('plansManagement');
        break;
      case '3':
        await handleCategory('subscription');
        break;
      case '4':
        await handleCategory('emailVerification');
        break;
      case '5':
        // Afficher la checklist (déjà affichée)
        await question('\nAppuyez sur Entrée pour continuer...');
        break;
      case '6':
        await generateReport();
        await question('\nAppuyez sur Entrée pour continuer...');
        break;
      case '0':
        console.log('\n👋 Au revoir!\n');
        rl.close();
        return;
      default:
        console.log('\n❌ Choix invalide');
        await question('\nAppuyez sur Entrée pour continuer...');
    }
  }
}

// Gérer la fermeture propre
process.on('SIGINT', () => {
  console.log('\n\n👋 Au revoir!\n');
  rl.close();
  process.exit(0);
});

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error);
    rl.close();
    process.exit(1);
  });
}

module.exports = { checklist, saveResults, loadResults, generateReport };


