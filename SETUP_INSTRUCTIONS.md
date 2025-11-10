# Instructions de Configuration et d'Exécution des Tests

## 📋 Vue d'ensemble

Ce document explique comment configurer et exécuter les tests pour Plans, Subscription, Admin et Vérification Email.

## 🔧 Configuration Initiale

### 1. Vérifier que le backend est configuré

```bash
cd backend
npm install
```

### 2. Configurer les variables d'environnement

Copiez `backend/env.example` vers `backend/.env`:

```bash
cd backend
copy env.example .env
```

Puis éditez `backend/.env` et remplissez les valeurs suivantes:

#### Variables Requises

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codegenesis

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_ADMIN_SECRET=your-super-secret-admin-jwt-key-minimum-32-characters-long

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs (optionnel, valeurs par défaut)
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

#### Configuration Gmail

Pour configurer Gmail pour l'envoi d'emails:

1. Activez la vérification en 2 étapes sur votre compte Gmail
2. Créez un "Mot de passe d'application":
   - Allez sur: https://myaccount.google.com/apppasswords
   - Créez un nouveau mot de passe d'application
   - Utilisez ce mot de passe dans `EMAIL_PASS`

### 3. Démarrer le backend

```bash
cd backend
npm start
```

Le backend devrait démarrer sur `http://localhost:5000`.

## 🚀 Exécution des Tests

### Important: Exécuter depuis la racine du projet

**Tous les scripts de test doivent être exécutés depuis la racine du projet:**

```bash
cd "D:\startup (2)\startup\CodeGenesis"
```

### Étape 1: Vérifier l'environnement

```bash
node test-env-check.js
```

**Ce script vérifie:**
- ✅ Variables d'environnement définies
- ✅ Connexion MongoDB
- ✅ Connexion backend
- ✅ Configuration email

**Résultat attendu:** Toutes les vérifications passent ✅

### Étape 2: Exécuter les tests automatisés

```bash
node test-plans-subscription-admin-email.js
```

**Ce script exécute:**
- Tests de création d'admin
- Tests de gestion des plans
- Tests de subscription
- Tests de vérification email

**Résultat:** Un rapport est généré dans `TEST_RESULTS_PLANS_SUBSCRIPTION.md`

### Étape 3: Tests manuels (optionnel)

#### Option A: Checklist interactive

```bash
node test-manual-checklist.js
```

Cette checklist vous guide à travers tous les tests manuels.

#### Option B: Guide détaillé

Consultez `TEST_GUIDE_PLANS_SUBSCRIPTION.md` pour les instructions détaillées.

### Étape 4: Vérifier les emails

```bash
node check-email-logs.js
```

**Ce script vérifie:**
- Configuration email
- Connexion SMTP
- Logs backend
- Boîte de réception

## 📊 Consulter les Rapports

### Rapports générés

1. **TEST_RESULTS_PLANS_SUBSCRIPTION.md** - Rapport des tests automatisés
2. **MANUAL_TEST_REPORT.md** - Rapport des tests manuels
3. **EMAIL_VERIFICATION_REPORT.md** - Rapport de vérification email

### Ouvrir les rapports

```bash
# Windows
notepad TEST_RESULTS_PLANS_SUBSCRIPTION.md
notepad MANUAL_TEST_REPORT.md
notepad EMAIL_VERIFICATION_REPORT.md
```

## 🔍 Dépannage

### Erreur: "Cannot find module"

**Problème:** Les scripts sont exécutés depuis le mauvais répertoire.

**Solution:** Assurez-vous d'être dans la racine du projet:
```bash
cd "D:\startup (2)\startup\CodeGenesis"
```

### Erreur: "Backend non accessible"

**Problème:** Le backend n'est pas démarré.

**Solution:**
1. Vérifiez que le backend est démarré:
   ```bash
   cd backend
   npm start
   ```
2. Vérifiez que le port 5000 est disponible
3. Vérifiez `SERVER_URL` dans `.env`

### Erreur: "MongoDB non connecté"

**Problème:** MongoDB n'est pas accessible.

**Solution:**
1. Vérifiez `MONGODB_URI` dans `.env`
2. Vérifiez que MongoDB est démarré (si local)
3. Vérifiez la connexion réseau (si MongoDB Atlas)
4. Vérifiez que votre IP est autorisée (MongoDB Atlas)

### Erreur: "Email non envoyé"

**Problème:** Configuration email incorrecte.

**Solution:**
1. Vérifiez `EMAIL_USER` et `EMAIL_PASS` dans `.env`
2. Pour Gmail, utilisez un mot de passe d'application
3. Vérifiez les logs du backend pour les erreurs SMTP
4. Vérifiez que "Accès aux applications moins sécurisées" est activé (si nécessaire)

### Variables d'environnement non chargées

**Problème:** Le fichier `.env` n'est pas chargé correctement.

**Solution:**
1. Vérifiez que `backend/.env` existe
2. Vérifiez que le fichier contient les variables requises
3. Réexécutez `node test-env-check.js` pour vérifier

## ✅ Checklist Complète

### Configuration
- [ ] Backend installé (`npm install` dans backend/)
- [ ] Variables d'environnement configurées (backend/.env)
- [ ] Backend démarré (`npm start` dans backend/)
- [ ] MongoDB connecté

### Tests Automatisés
- [ ] Environnement vérifié (`node test-env-check.js`)
- [ ] Tests automatisés exécutés (`node test-plans-subscription-admin-email.js`)
- [ ] Rapport consulté (`TEST_RESULTS_PLANS_SUBSCRIPTION.md`)

### Tests Manuels
- [ ] Checklist interactive utilisée (`node test-manual-checklist.js`)
- [ ] Ou guide détaillé suivi (`TEST_GUIDE_PLANS_SUBSCRIPTION.md`)
- [ ] Rapport manuel généré (`MANUAL_TEST_REPORT.md`)

### Vérification Email
- [ ] Configuration email vérifiée (`node check-email-logs.js`)
- [ ] Emails reçus dans la boîte de réception
- [ ] Liens de vérification fonctionnels
- [ ] Rapport email généré (`EMAIL_VERIFICATION_REPORT.md`)

## 📚 Documentation

- **Guide de démarrage rapide**: `QUICK_START_TESTS.md`
- **Guide de test manuel**: `TEST_GUIDE_PLANS_SUBSCRIPTION.md`
- **Guide d'utilisation**: `README_TESTS.md`
- **Guide d'exécution**: `RUN_TESTS.md` (ce fichier)
- **Résumé de l'implémentation**: `TESTING_IMPLEMENTATION_SUMMARY.md`

## 🎯 Prochaines Étapes

1. ✅ Configurer les variables d'environnement
2. ✅ Démarrer le backend
3. ✅ Vérifier l'environnement
4. ✅ Exécuter les tests automatisés
5. ✅ Exécuter les tests manuels
6. ✅ Vérifier les emails
7. ✅ Consulter les rapports
8. ✅ Corriger les bugs identifiés
9. ✅ Réexécuter les tests

## 💡 Conseils

- **Exécutez toujours les scripts depuis la racine du projet**
- **Vérifiez l'environnement avant d'exécuter les tests**
- **Consultez les rapports pour identifier les problèmes**
- **Utilisez la checklist interactive pour les tests manuels**
- **Vérifiez les logs du backend pour les erreurs**

Bon test! 🚀


