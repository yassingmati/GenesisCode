# 🚀 Guide de Déploiement Firebase Complet

## 📋 Vue d'Ensemble

Ce guide vous accompagne étape par étape pour déployer votre plateforme CodeGenesis sur Firebase.

**Architecture :**
- **Frontend** : Firebase Hosting (React)
- **Backend** : Firebase Functions (Node.js/Express)
- **Base de données** : MongoDB Atlas (externe)

## 🎯 Étape par Étape

### Phase 1 : Préparation (5 minutes)

#### 1.1 Installer Firebase CLI

```bash
npm install -g firebase-tools
```

#### 1.2 Se connecter à Firebase

```bash
firebase login
```

Cela ouvrira votre navigateur pour vous authentifier.

#### 1.3 Vérifier l'installation

```bash
firebase --version
```

### Phase 2 : Configuration Firebase (10 minutes)

#### 2.1 Créer un Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur **"Ajouter un projet"**
3. Entrer le nom : `codegenesis-platform` (ou votre nom)
4. Désactiver Google Analytics (optionnel)
5. Cliquer sur **"Créer le projet"**

#### 2.2 Initialiser Firebase dans le Projet

```bash
# Depuis la racine du projet
firebase init
```

**Réponses aux questions :**

```
? Quel projet Firebase voulez-vous utiliser ?
  → Sélectionner votre projet

? Quelles fonctionnalités Firebase voulez-vous configurer ?
  → Hosting (Espace)
  → Functions (Espace)

? Quel répertoire public utiliser ? (public)
  → frontend/build

? Configurer comme une application à page unique ? (y/N)
  → y

? Définir les fichiers à ignorer ? (y/N)
  → y

? Voulez-vous configurer Firebase Functions ? (y/N)
  → y

? Quel langage utiliser pour les Functions ? (JavaScript/TypeScript)
  → JavaScript

? Utiliser ESLint ? (y/N)
  → N

? Installer les dépendances maintenant ? (y/N)
  → y
```

### Phase 3 : Configuration MongoDB Atlas (15 minutes)

#### 3.1 Créer un Compte MongoDB Atlas

1. Aller sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un compte gratuit
3. Vérifier votre email

#### 3.2 Créer un Cluster

1. Cliquer sur **"Build a Database"**
2. Choisir **"M0 Free"** (gratuit)
3. Choisir une région (proche de Firebase Functions : `us-central1`)
4. Cliquer sur **"Create"**

#### 3.3 Configurer Network Access

1. Aller dans **Network Access**
2. Cliquer sur **"Add IP Address"**
3. Cliquer sur **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Cliquer sur **"Confirm"**

#### 3.4 Créer un Utilisateur de Base de Données

1. Aller dans **Database Access**
2. Cliquer sur **"Add New Database User"**
3. Choisir **"Password"** comme méthode d'authentification
4. Créer un nom d'utilisateur (ex: `codegenesis-admin`)
5. Créer un mot de passe fort (SAVEZ-LE !)
6. Rôle : **Atlas admin**
7. Cliquer sur **"Add User"**

#### 3.5 Récupérer la Chaîne de Connexion

1. Aller dans **Database**
2. Cliquer sur **"Connect"**
3. Choisir **"Connect your application"**
4. Copier la chaîne de connexion
5. Remplacer `<password>` par votre mot de passe
6. Remplacer `<dbname>` par `codegenesis` (ou votre nom)

**Exemple :**
```
mongodb+srv://codegenesis-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority
```

### Phase 4 : Configuration des Variables d'Environnement (10 minutes)

#### 4.1 Via Firebase Console (Recommandé)

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet
3. Aller dans **Functions** → **Configuration**
4. Cliquer sur **"Secrets"** (ou **"Environment variables"**)
5. Ajouter les secrets suivants :

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/codegenesis
JWT_SECRET = votre_secret_jwt_ici (générer un secret fort)
JWT_ADMIN_SECRET = votre_secret_admin_jwt_ici (générer un secret fort)
CLIENT_ORIGIN = https://votre-projet-id.web.app
NODE_ENV = production
```

**Pour générer des secrets JWT :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 4.2 Via Firebase CLI (Alternative)

```bash
# Définir les secrets (recommandé)
firebase functions:secrets:set MONGODB_URI
# Entrez la valeur lorsque demandé

firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set JWT_ADMIN_SECRET
firebase functions:secrets:set CLIENT_ORIGIN

# OU définir les configs (moins sécurisé)
firebase functions:config:set \
  mongodb.uri="mongodb+srv://..." \
  jwt.secret="..." \
  jwt.admin_secret="..." \
  client.origin="https://votre-projet-id.web.app"
```

### Phase 5 : Configuration du Frontend (5 minutes)

#### 5.1 Créer le Fichier .env.production

Créez le fichier `frontend/.env.production` :

```bash
# frontend/.env.production
REACT_APP_API_BASE_URL=https://us-central1-votre-projet-id.cloudfunctions.net/api
```

**Important :** Remplacez `votre-projet-id` par votre ID de projet Firebase.

**Pour trouver votre ID de projet :**
```bash
firebase projects:list
```

Ou regardez dans `.firebaserc` :
```json
{
  "projects": {
    "default": "votre-projet-id"
  }
}
```

### Phase 6 : Installation des Dépendances (5 minutes)

```bash
# Installer les dépendances du backend
cd backend
npm install
cd ..

# Installer les dépendances du frontend
cd frontend
npm install
cd ..

# Installer les dépendances Firebase Functions
cd backend/functions
npm install
cd ../..
```

### Phase 7 : Construction du Frontend (3 minutes)

```bash
cd frontend
npm run build
cd ..
```

Vérifiez que le dossier `frontend/build` a été créé et contient les fichiers.

### Phase 8 : Déploiement (10 minutes)

#### 8.1 Déployer tout

```bash
firebase deploy
```

#### 8.2 Ou déployer séparément

```bash
# Déployer uniquement le frontend
firebase deploy --only hosting

# Déployer uniquement le backend
firebase deploy --only functions
```

#### 8.3 Ou utiliser les scripts npm

```bash
# Déployer tout
npm run deploy:all

# Déployer uniquement le hosting
npm run deploy:hosting

# Déployer uniquement les functions
npm run deploy:functions
```

### Phase 9 : Vérification (5 minutes)

#### 9.1 Vérifier le Frontend

Ouvrir dans votre navigateur :
```
https://votre-projet-id.web.app
```

#### 9.2 Vérifier l'API

```bash
curl https://us-central1-votre-projet-id.cloudfunctions.net/api/health
```

Vous devriez voir :
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "...",
  "uptime": ...,
  "memory": {...},
  "version": "1.0.0"
}
```

#### 9.3 Vérifier les Logs

```bash
firebase functions:log
```

#### 9.4 Tester l'Authentification

1. Aller sur le frontend
2. Essayer de vous connecter
3. Vérifier que tout fonctionne

## 🔧 Configuration Post-Déploiement

### Mettre à jour CORS

Si vous avez des erreurs CORS, vérifiez que `CLIENT_ORIGIN` dans les variables d'environnement Firebase Functions pointe vers votre URL Firebase Hosting :

```
CLIENT_ORIGIN = https://votre-projet-id.web.app
```

Puis redéployez les functions :
```bash
firebase deploy --only functions
```

### Configurer Firebase Storage (Optionnel)

Pour les fichiers uploadés (vidéos, PDFs), vous pouvez utiliser Firebase Storage :

1. Aller dans **Firebase Console** → **Storage**
2. Cliquer sur **"Get Started"**
3. Configurer les règles de sécurité
4. Mettre à jour le code backend pour utiliser Firebase Storage

## 🐛 Dépannage

### Problème : Functions ne démarrent pas

1. Vérifier les logs :
   ```bash
   firebase functions:log
   ```

2. Vérifier les variables d'environnement :
   ```bash
   firebase functions:config:get
   ```

3. Vérifier que MongoDB Atlas autorise les connexions depuis Firebase

### Problème : Erreur CORS

1. Vérifier que `CLIENT_ORIGIN` pointe vers votre URL Firebase Hosting
2. Format : `https://votre-projet-id.web.app` (sans slash final)
3. Redéployer les functions après modification

### Problème : Frontend ne peut pas accéder à l'API

1. Vérifier que `REACT_APP_API_BASE_URL` est correctement configuré dans `.env.production`
2. Reconstruire le frontend après modification :
   ```bash
   cd frontend
   npm run build
   cd ..
   firebase deploy --only hosting
   ```

### Problème : Connexion MongoDB échoue

1. Vérifier que l'IP de Firebase Functions est autorisée dans MongoDB Atlas
2. Ajouter `0.0.0.0/0` dans MongoDB Atlas Network Access
3. Vérifier que `MONGODB_URI` est correctement configuré
4. Vérifier le nom d'utilisateur et le mot de passe

## 📊 URLs Importantes

- **Frontend** : `https://votre-projet-id.web.app`
- **API** : `https://us-central1-votre-projet-id.cloudfunctions.net/api`
- **Firebase Console** : https://console.firebase.google.com/
- **MongoDB Atlas** : https://cloud.mongodb.com/

## ✅ Checklist Finale

- [ ] Firebase CLI installé et connecté
- [ ] Projet Firebase créé
- [ ] Firebase initialisé dans le projet
- [ ] MongoDB Atlas configuré
- [ ] Variables d'environnement configurées
- [ ] `.env.production` créé
- [ ] Dépendances installées
- [ ] Frontend construit
- [ ] Déploiement réussi
- [ ] Frontend accessible
- [ ] API accessible
- [ ] Logs vérifiés

## 🎉 C'est Fait !

Votre plateforme est maintenant déployée sur Firebase !

**Prochaines étapes :**
- Configurer un domaine personnalisé (optionnel)
- Activer Firebase Analytics
- Configurer Firebase Storage pour les fichiers
- Mettre en place CI/CD avec GitHub Actions

---

**Besoin d'aide ?** Consultez les autres guides :
- `FIREBASE_QUICK_START.md` - Démarrage rapide
- `ETAPES_FIREBASE.md` - Étapes détaillées
- `CHECKLIST_FIREBASE.md` - Checklist interactive

