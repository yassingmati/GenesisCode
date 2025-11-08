# ✅ Étapes Complètes pour Déployer sur Firebase

## 📋 Checklist de Préparation

### Étape 1 : Installation des Prérequis

```bash
# 1. Installer Firebase CLI globalement
npm install -g firebase-tools

# 2. Se connecter à Firebase
firebase login

# 3. Vérifier l'installation
firebase --version
```

### Étape 2 : Créer un Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur **"Ajouter un projet"**
3. Entrer le nom du projet : `codegenesis-platform` (ou votre nom)
4. Désactiver Google Analytics (optionnel)
5. Cliquer sur **"Créer le projet"**

### Étape 3 : Initialiser Firebase dans le Projet

```bash
# Depuis la racine du projet
firebase init
```

**Réponses aux questions :**

1. **Quel projet Firebase voulez-vous utiliser ?**
   - Sélectionner votre projet créé ou créer un nouveau

2. **Quelles fonctionnalités Firebase voulez-vous configurer ?**
   - ✅ **Hosting** : Configurez Firebase Hosting
   - ✅ **Functions** : Configurez Firebase Functions

3. **Quel répertoire public utiliser ?**
   - `frontend/build`

4. **Configurer comme une application à page unique ?**
   - **Oui** (réécrire toutes les URLs vers /index.html)

5. **Définir les fichiers à ignorer ?**
   - **Oui** (utiliser les fichiers par défaut)

6. **Voulez-vous configurer Firebase Functions ?**
   - **Oui**

7. **Quel langage utiliser pour les Functions ?**
   - **JavaScript**

8. **Utiliser ESLint ?**
   - **Non** (ou Oui si vous préférez)

9. **Installer les dépendances maintenant ?**
   - **Oui**

### Étape 4 : Configurer MongoDB Atlas

1. **Créer un compte MongoDB Atlas**
   - Aller sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Créer un compte gratuit

2. **Créer un cluster**
   - Choisir le plan **M0 (Free)**
   - Choisir une région proche
   - Créer le cluster

3. **Configurer Network Access**
   - Aller dans **Network Access**
   - Cliquer sur **"Add IP Address"**
   - Cliquer sur **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Cliquer sur **"Confirm"**

4. **Créer un utilisateur de base de données**
   - Aller dans **Database Access**
   - Cliquer sur **"Add New Database User"**
   - Choisir **"Password"** comme méthode d'authentification
   - Créer un nom d'utilisateur et un mot de passe (SAVEZ-LE !)
   - Rôle : **Atlas admin**
   - Cliquer sur **"Add User"**

5. **Récupérer la chaîne de connexion**
   - Aller dans **Database**
   - Cliquer sur **"Connect"**
   - Choisir **"Connect your application"**
   - Copier la chaîne de connexion
   - Remplacer `<password>` par votre mot de passe
   - Exemple : `mongodb+srv://username:password@cluster.mongodb.net/codegenesis?retryWrites=true&w=majority`

### Étape 5 : Configurer les Variables d'Environnement Firebase

#### Option A : Via Firebase Console (Recommandé)

1. Aller dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet
3. Aller dans **Functions** → **Configuration**
4. Cliquer sur **"Secrets"** (ou **"Environment variables"**)
5. Ajouter les secrets suivants :

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/codegenesis
JWT_SECRET = votre_secret_jwt_ici
JWT_ADMIN_SECRET = votre_secret_admin_jwt_ici
CLIENT_ORIGIN = https://votre-projet-id.web.app
NODE_ENV = production
```

#### Option B : Via Firebase CLI

```bash
# Définir les secrets (recommandé pour les données sensibles)
firebase functions:secrets:set MONGODB_URI
# Entrez la valeur lorsque demandé

firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set JWT_ADMIN_SECRET

# OU définir les configs (alternative)
firebase functions:config:set \
  mongodb.uri="mongodb+srv://username:password@cluster.mongodb.net/codegenesis" \
  jwt.secret="votre_secret_jwt" \
  jwt.admin_secret="votre_secret_admin_jwt" \
  client.origin="https://votre-projet-id.web.app"
```

### Étape 6 : Installer les Dépendances

```bash
# Installer les dépendances du backend
cd backend
npm install
cd ..

# Installer les dépendances du frontend
cd frontend
npm install
cd ..
```

### Étape 7 : Configurer l'URL API dans le Frontend

Créez le fichier `frontend/.env.production` :

```bash
# frontend/.env.production
REACT_APP_API_BASE_URL=https://us-central1-votre-projet-id.cloudfunctions.net/api
```

**Important** : Remplacez `votre-projet-id` par votre ID de projet Firebase.

Pour trouver votre ID de projet :
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

### Étape 8 : Construire le Frontend

```bash
cd frontend
npm run build
cd ..
```

Vérifiez que le dossier `frontend/build` a été créé.

### Étape 9 : Déployer sur Firebase

#### Option 1 : Déployer tout

```bash
firebase deploy
```

#### Option 2 : Déployer séparément

```bash
# Déployer uniquement le frontend
firebase deploy --only hosting

# Déployer uniquement le backend
firebase deploy --only functions
```

#### Option 3 : Utiliser les scripts npm

```bash
# Déployer tout
npm run deploy:all

# Déployer uniquement le hosting
npm run deploy:hosting

# Déployer uniquement les functions
npm run deploy:functions
```

### Étape 10 : Vérifier le Déploiement

1. **Frontend** : Ouvrir `https://votre-projet-id.web.app`
2. **API Health Check** : 
   ```bash
   curl https://us-central1-votre-projet-id.cloudfunctions.net/api/health
   ```

3. **Vérifier les logs** :
   ```bash
   firebase functions:log
   ```

### Étape 11 : Mettre à jour CORS (si nécessaire)

Si vous avez des erreurs CORS, vérifiez que `CLIENT_ORIGIN` dans les variables d'environnement Firebase Functions pointe vers votre URL Firebase Hosting :

```
CLIENT_ORIGIN = https://votre-projet-id.web.app
```

Puis redéployez les functions :
```bash
firebase deploy --only functions
```

## 🔧 Commandes Utiles

```bash
# Voir les projets Firebase
firebase projects:list

# Changer de projet
firebase use votre-projet-id

# Voir les logs en temps réel
firebase functions:log

# Voir les logs d'une fonction spécifique
firebase functions:log --only api

# Lister les variables d'environnement
firebase functions:config:get

# Supprimer un secret
firebase functions:secrets:delete MONGODB_URI

# Ouvrir Firebase Console
firebase open
```

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

## ✅ Checklist Finale

- [ ] Firebase CLI installé et connecté
- [ ] Projet Firebase créé
- [ ] Firebase initialisé dans le projet (`firebase init`)
- [ ] MongoDB Atlas configuré
- [ ] Variables d'environnement configurées
- [ ] Dépendances installées (backend et frontend)
- [ ] `.env.production` créé avec l'URL API
- [ ] Frontend construit (`npm run build`)
- [ ] Déploiement réussi
- [ ] Frontend accessible
- [ ] API accessible
- [ ] Logs vérifiés

## 🎉 C'est Fait !

Votre plateforme est maintenant déployée sur Firebase !

- **Frontend** : `https://votre-projet-id.web.app`
- **API** : `https://us-central1-votre-projet-id.cloudfunctions.net/api`

---

**Besoin d'aide ?** Consultez :
- `FIREBASE_DEPLOYMENT.md` - Guide complet
- `FIREBASE_QUICK_START.md` - Démarrage rapide
- `FIREBASE_SETUP_SUMMARY.md` - Résumé de la configuration

