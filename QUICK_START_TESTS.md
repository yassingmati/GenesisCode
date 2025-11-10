# Guide de Démarrage Rapide - Tests

Ce guide vous permet de démarrer rapidement les tests pour Plans, Subscription, Admin et Vérification Email.

## 🚀 Démarrage Rapide

### Étape 1: Vérifier l'environnement

```bash
node test-env-check.js
```

Ce script vérifie:
- ✅ Variables d'environnement
- ✅ Connexion MongoDB
- ✅ Connexion backend
- ✅ Configuration email

### Étape 2: Exécuter les tests automatisés

```bash
node test-plans-subscription-admin-email.js
```

Ce script exécute tous les tests et génère un rapport dans `TEST_RESULTS_PLANS_SUBSCRIPTION.md`.

### Étape 3: Tests manuels

#### Option A: Checklist interactive

```bash
node test-manual-checklist.js
```

Cette checklist vous aide à suivre la progression de vos tests manuels.

#### Option B: Guide détaillé

Consultez `TEST_GUIDE_PLANS_SUBSCRIPTION.md` pour les instructions détaillées de chaque test manuel.

### Étape 4: Vérifier les emails

```bash
node check-email-logs.js
```

Ce script vous aide à vérifier:
- Configuration email
- Connexion SMTP
- Logs backend
- Boîte de réception

## 📋 Checklist Complète

### Tests Automatisés
- [ ] Vérifier l'environnement (`test-env-check.js`)
- [ ] Exécuter tous les tests (`test-plans-subscription-admin-email.js`)
- [ ] Consulter le rapport (`TEST_RESULTS_PLANS_SUBSCRIPTION.md`)

### Tests Manuels
- [ ] Création d'admin (voir `TEST_GUIDE_PLANS_SUBSCRIPTION.md`)
- [ ] Gestion des plans
- [ ] Subscription
- [ ] Vérification email

### Vérification Email
- [ ] Vérifier la configuration (`check-email-logs.js`)
- [ ] Vérifier les logs backend
- [ ] Vérifier la boîte de réception
- [ ] Tester le lien de vérification

## 📁 Fichiers Importants

### Scripts de Test
- `test-plans-subscription-admin-email.js` - Script principal
- `test-admin-creation.js` - Tests admin
- `test-plans-management.js` - Tests plans
- `test-subscription-flow.js` - Tests subscription
- `test-email-verification.js` - Tests email
- `test-env-check.js` - Vérification environnement
- `test-manual-checklist.js` - Checklist interactive
- `check-email-logs.js` - Vérification emails

### Documentation
- `TEST_GUIDE_PLANS_SUBSCRIPTION.md` - Guide de test manuel
- `README_TESTS.md` - Guide d'utilisation des tests
- `TESTING_IMPLEMENTATION_SUMMARY.md` - Résumé de l'implémentation
- `QUICK_START_TESTS.md` - Ce fichier

### Rapports
- `TEST_RESULTS_PLANS_SUBSCRIPTION.md` - Rapport des tests automatisés
- `MANUAL_TEST_REPORT.md` - Rapport des tests manuels
- `EMAIL_VERIFICATION_REPORT.md` - Rapport de vérification email

## 🔧 Configuration Requise

### Variables d'environnement (backend/.env)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_ADMIN_SECRET=your-admin-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### Prérequis

- ✅ Backend démarré
- ✅ MongoDB connecté
- ✅ Configuration email Gmail valide
- ✅ Node.js installé

## 📊 Résultats Attendus

### Tests Automatisés
- Tous les tests devraient passer avec succès
- Rapport généré automatiquement
- Détails de chaque test dans le rapport

### Tests Manuels
- Utilisez la checklist interactive pour suivre la progression
- Consultez le guide détaillé pour les instructions
- Générez le rapport manuel à la fin

### Vérification Email
- Configuration email correcte
- Connexion SMTP réussie
- Emails envoyés et reçus
- Liens de vérification fonctionnels

## 🆘 Dépannage

### Backend non accessible
```bash
# Vérifiez que le backend est démarré
cd backend
npm start
```

### MongoDB non connecté
```bash
# Vérifiez MONGODB_URI dans backend/.env
# Testez la connexion
node test-env-check.js
```

### Email non envoyé
```bash
# Vérifiez la configuration email
node check-email-logs.js
```

### Erreurs dans les tests
1. Consultez le rapport généré
2. Vérifiez les logs du backend
3. Vérifiez la configuration de l'environnement
4. Consultez `TEST_GUIDE_PLANS_SUBSCRIPTION.md`

## 📚 Documentation Complète

- **Guide de test manuel**: `TEST_GUIDE_PLANS_SUBSCRIPTION.md`
- **Guide d'utilisation**: `README_TESTS.md`
- **Résumé de l'implémentation**: `TESTING_IMPLEMENTATION_SUMMARY.md`

## ✅ Prochaines Étapes

1. ✅ Vérifier l'environnement
2. ✅ Exécuter les tests automatisés
3. ✅ Exécuter les tests manuels
4. ✅ Vérifier les emails
5. ✅ Consulter les rapports
6. ✅ Corriger les bugs identifiés
7. ✅ Réexécuter les tests

## 🎯 Objectif

L'objectif est de s'assurer que toutes les fonctionnalités suivantes fonctionnent correctement:

- ✅ Création d'admin (script et API)
- ✅ Gestion des plans (CRUD complet)
- ✅ Subscription (création, annulation, reprise)
- ✅ Vérification email (envoi, réception, vérification)

Bon test! 🚀


