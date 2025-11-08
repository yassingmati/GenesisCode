# 🚀 Guide de Déploiement sur Firebase

Ce guide vous explique comment déployer votre plateforme CodeGenesis sur Firebase Hosting et Firebase Functions.

## 📋 Prérequis

1. **Compte Firebase** : Créez un compte sur [Firebase Console](https://console.firebase.google.com/)
2. **Node.js 18+** : Installé sur votre machine
3. **Firebase CLI** : Installé globalement
   ```bash
   npm install -g firebase-tools
   ```
4. **MongoDB Atlas** : Pour la base de données (Firebase n'a pas de MongoDB natif)
5. **Compte Stripe** (optionnel) : Pour les paiements

## 🔧 Installation et Configuration

### 1. Installation de Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Connexion à Firebase

```bash
firebase login
```

### 3. Initialisation du projet Firebase

```bash
firebase init
```

Sélectionnez :
- ✅ **Hosting** : Configurez Firebase Hosting
- ✅ **Functions** : Configurez Firebase Functions

**Options de configuration :**
- Utiliser un projet Firebase existant ou créer-en un nouveau
- Nom du projet : `codegenesis-platform` (ou votre nom)
- Dossier public : `frontend/build`
- Single-page app : **Oui**
- Configuration Firebase Functions : **Oui**
- Runtime Node.js : **18**

### 4. Configuration des Variables d'Environnement

Firebase Functions utilise des variables d'environnement configurées via Firebase Console ou CLI.

#### Via Firebase Console :

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Functions** → **Configuration**
4. Ajoutez les variables d'environnement :

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codegenesis
JWT_SECRET=votre_secret_jwt
JWT_ADMIN_SECRET=votre_secret_admin_jwt
CLIENT_ORIGIN=https://votre-projet.web.app
STRIPE_SECRET_KEY=sk_live_... (si vous utilisez Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (si vous utilisez Stripe)
NODE_ENV=production
```

#### Via Firebase CLI :

```bash
# Définir les variables d'environnement
firebase functions:config:set \
  mongodb.uri="mongodb+srv://username:password@cluster.mongodb.net/codegenesis" \
  jwt.secret="votre_secret_jwt" \
  jwt.admin_secret="votre_secret_admin_jwt" \
  client.origin="https://votre-projet.web.app"

# Déployer la configuration
firebase deploy --only functions
```

**Note** : Pour les secrets sensibles, utilisez Firebase Functions Secrets :

```bash
# Définir un secret (plus sécurisé)
firebase functions:secrets:set MONGODB_URI
# Entrez la valeur lorsque demandé

firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set JWT_ADMIN_SECRET
```

### 5. Configuration MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster MongoDB (gratuit disponible)
3. Configurez les accès réseau (ajoutez `0.0.0.0/0` pour autoriser Firebase Functions)
4. Créez un utilisateur de base de données
5. Récupérez la chaîne de connexion MongoDB
6. Ajoutez-la comme variable d'environnement `MONGODB_URI` dans Firebase

### 6. Configuration du Frontend

Modifiez `frontend/src/config/api.js` pour pointer vers votre Firebase Functions :

```javascript
// frontend/src/config/api.js
const API_CONFIG = {
  // Pour Firebase Functions
  BASE_URL: process.env.REACT_APP_API_URL || 'https://us-central1-codegenesis-platform.cloudfunctions.net/api',
  
  // Ou pour le développement local
  // BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
};

export default API_CONFIG;
```

Créez un fichier `.env.production` dans le dossier `frontend` :

```bash
# frontend/.env.production
REACT_APP_API_URL=https://us-central1-codegenesis-platform.cloudfunctions.net/api
```

Remplacez `codegenesis-platform` par votre ID de projet Firebase.

## 🏗️ Construction et Déploiement

### 1. Installation des Dépendances

```bash
# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

### 2. Construction du Frontend

```bash
cd frontend
npm run build
```

Cela crée le dossier `frontend/build` qui sera déployé sur Firebase Hosting.

### 3. Déploiement sur Firebase

#### Déployer tout (Hosting + Functions) :

```bash
# Depuis la racine du projet
firebase deploy
```

#### Déployer uniquement le Frontend (Hosting) :

```bash
firebase deploy --only hosting
```

#### Déployer uniquement le Backend (Functions) :

```bash
firebase deploy --only functions
```

### 4. Vérification du Déploiement

Après le déploiement, vous obtiendrez :
- **URL Frontend** : `https://votre-projet.web.app` ou `https://votre-projet.firebaseapp.com`
- **URL API** : `https://us-central1-votre-projet.cloudfunctions.net/api`

## 🔧 Configuration Post-Déploiement

### 1. Mettre à jour CORS dans le Backend

Assurez-vous que `CLIENT_ORIGIN` dans les variables d'environnement Firebase Functions pointe vers votre URL Firebase Hosting.

### 2. Configurer les Routes dans Firebase Hosting

Firebase Hosting redirige automatiquement toutes les routes vers `index.html` grâce à la configuration dans `firebase.json`.

### 3. Configurer les Domaines Personnalisés (Optionnel)

1. Allez dans Firebase Console → **Hosting**
2. Cliquez sur **Ajouter un domaine**
3. Suivez les instructions pour ajouter votre domaine personnalisé

## 📝 Scripts de Déploiement

Ajoutez ces scripts dans votre `package.json` racine :

```json
{
  "scripts": {
    "build": "cd frontend && npm run build",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:all": "npm run build && firebase deploy"
  }
}
```

## 🔍 Dépannage

### Problème : Functions ne démarrent pas

1. Vérifiez les logs :
   ```bash
   firebase functions:log
   ```

2. Vérifiez les variables d'environnement :
   ```bash
   firebase functions:config:get
   ```

### Problème : Erreurs CORS

1. Vérifiez que `CLIENT_ORIGIN` pointe vers votre URL Firebase Hosting
2. Vérifiez la configuration CORS dans `backend/src/index-firebase.js`

### Problème : Connexion MongoDB échoue

1. Vérifiez que l'IP de Firebase Functions est autorisée dans MongoDB Atlas
2. Ajoutez `0.0.0.0/0` dans MongoDB Atlas Network Access (temporaire pour test)
3. Vérifiez que `MONGODB_URI` est correctement configuré

### Problème : Frontend ne charge pas l'API

1. Vérifiez que `REACT_APP_API_URL` est défini dans `.env.production`
2. Reconstruisez le frontend après modification des variables d'environnement
3. Vérifiez la console du navigateur pour les erreurs

## 📊 Monitoring

### Logs Firebase Functions

```bash
# Voir les logs en temps réel
firebase functions:log

# Filtrer par fonction
firebase functions:log --only api
```

### Firebase Console

- **Hosting** : Analytics, performance, erreurs
- **Functions** : Logs, métriques, utilisation

## 🚀 Prochaines Étapes

1. **Activer Firebase Analytics** : Pour suivre l'utilisation
2. **Configurer Firebase Storage** : Pour les fichiers uploadés (vidéos, PDFs)
3. **Mettre en place CI/CD** : Avec GitHub Actions pour déployer automatiquement
4. **Configurer Firebase Performance Monitoring** : Pour optimiser les performances

## 📚 Ressources

- [Documentation Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Documentation Firebase Functions](https://firebase.google.com/docs/functions)
- [Guide MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## ⚠️ Notes Importantes

1. **Stockage des fichiers** : Les uploads de vidéos et PDFs doivent être stockés sur Firebase Storage ou un autre service cloud (pas dans Firebase Functions)
2. **Limites Firebase Functions** : 
   - Timeout : 60 secondes (gratuit) ou 540 secondes (Blaze)
   - Mémoire : 256MB à 8GB
   - Requests : 2 millions/mois (gratuit)
3. **MongoDB Atlas** : Le plan gratuit (M0) est suffisant pour commencer
4. **Coûts** : Firebase Hosting est gratuit jusqu'à 10GB/mois, Functions a un plan gratuit généreux

---

**Bon déploiement ! 🎉**

