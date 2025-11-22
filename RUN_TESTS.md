# Guide d'Exécution des Tests

Ce guide vous explique comment exécuter les tests étape par étape.

## ⚠️ Prérequis

Avant d'exécuter les tests, assurez-vous que:

1. **Backend démarré**: Le backend doit être en cours d'exécution
2. **MongoDB connecté**: La base de données MongoDB doit être accessible
3. **Variables d'environnement configurées**: Voir ci-dessous

## 🔧 Configuration

### Étape 1: Vérifier les variables d'environnement

Exécutez d'abord le script de vérification:

```bash
cd "D:\startup (2)\startup\CodeGenesis"
node test-env-check.js
```

Ce script vérifie que toutes les variables nécessaires sont configurées.

### Étape 2: Configurer les variables manquantes

Si des variables sont manquantes, copiez `backend/env.example` vers `backend/.env` et remplissez les valeurs:

```bash
cd backend
copy env.example .env
# Puis éditez .env avec vos valeurs
```

**Variables requises:**
- `MONGODB_URI` - Connection string MongoDB
- `JWT_SECRET` - Secret JWT pour utilisateurs
- `JWT_ADMIN_SECRET` - Secret JWT pour admins
- `EMAIL_USER` - Email Gmail pour envoi
- `EMAIL_PASS` - Mot de passe application Gmail
- `SERVER_URL` - URL du backend (optionnel, défaut: http://localhost:5000)
- `CLIENT_URL` - URL du frontend (optionnel, défaut: http://localhost:3000)

**Pour Gmail:**
1. Activez la vérification en 2 étapes sur votre compte Gmail
2. Créez un "Mot de passe d'application": https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `EMAIL_PASS`

## 🚀 Exécution des Tests

### Tests Automatisés

#### 1. Vérifier l'environnement

```bash
cd "D:\startup (2)\startup\CodeGenesis"
node test-env-check.js
```

**Résultat attendu:** Toutes les variables d'environnement sont définies ✅

#### 2. Exécuter tous les tests

```bash
node test-plans-subscription-admin-email.js
```

Ce script exécute:
- Tests de création d'admin
- Tests de gestion des plans
- Tests de subscription
- Tests de vérification email

**Résultat:** Un rapport est généré dans `TEST_RESULTS_PLANS_SUBSCRIPTION.md`

### Tests Manuels

#### 1. Utiliser la checklist interactive

```bash
node test-manual-checklist.js
```

Cette checklist vous guide à travers tous les tests manuels.

#### 2. Suivre le guide détaillé

Consultez `TEST_GUIDE_PLANS_SUBSCRIPTION.md` pour les instructions détaillées.

### Vérification Email

#### 1. Vérifier la configuration email

```bash
node check-email-logs.js
```

Ce script vérifie:
- Configuration email
- Connexion SMTP
- Logs backend
- Boîte de réception

## 📊 Résultats

### Rapports générés

Après l'exécution des tests, les rapports suivants sont générés:

1. **TEST_RESULTS_PLANS_SUBSCRIPTION.md** - Rapport des tests automatisés
2. **MANUAL_TEST_REPORT.md** - Rapport des tests manuels (généré par la checklist)
3. **EMAIL_VERIFICATION_REPORT.md** - Rapport de vérification email

### Consulter les rapports

```bash
# Ouvrir les rapports
notepad TEST_RESULTS_PLANS_SUBSCRIPTION.md
notepad MANUAL_TEST_REPORT.md
notepad EMAIL_VERIFICATION_REPORT.md
```

## 🔍 Dépannage

### Erreur: "Cannot find module"

**Solution:** Assurez-vous d'exécuter les scripts depuis la racine du projet:
```bash
cd "D:\startup (2)\startup\CodeGenesis"
```

### Erreur: "Backend non accessible"

**Solution:** 
1. Vérifiez que le backend est démarré
2. Vérifiez que le port 5000 est disponible
3. Vérifiez `SERVER_URL` dans `.env`

### Erreur: "MongoDB non connecté"

**Solution:**
1. Vérifiez `MONGODB_URI` dans `.env`
2. Vérifiez que MongoDB est démarré
3. Vérifiez la connexion réseau

### Erreur: "Email non envoyé"

**Solution:**
1. Vérifiez `EMAIL_USER` et `EMAIL_PASS` dans `.env`
2. Pour Gmail, utilisez un mot de passe d'application
3. Vérifiez les logs du backend

## ✅ Checklist Complète

- [ ] Variables d'environnement configurées
- [ ] Backend démarré
- [ ] MongoDB connecté
- [ ] Tests automatisés exécutés
- [ ] Tests manuels complétés
- [ ] Emails vérifiés
- [ ] Rapports consultés
- [ ] Bugs corrigés (si nécessaire)

## 📚 Documentation

- **Guide de test manuel**: `TEST_GUIDE_PLANS_SUBSCRIPTION.md`
- **Guide d'utilisation**: `README_TESTS.md`
- **Guide de démarrage rapide**: `QUICK_START_TESTS.md`
- **Résumé de l'implémentation**: `TESTING_IMPLEMENTATION_SUMMARY.md`

## 🎯 Prochaines Étapes

1. ✅ Configurer les variables d'environnement
2. ✅ Exécuter les tests automatisés
3. ✅ Exécuter les tests manuels
4. ✅ Vérifier les emails
5. ✅ Consulter les rapports
6. ✅ Corriger les bugs identifiés
7. ✅ Réexécuter les tests

Bon test! 🚀




