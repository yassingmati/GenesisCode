# ⚡ Démarrage Rapide - Firebase

Guide rapide pour déployer CodeGenesis sur Firebase.

## 🚀 Étapes Rapides

### 1. Installer Firebase CLI

```bash
npm install -g firebase-tools
```

**Note pour PowerShell :** Si vous avez des erreurs d'exécution de scripts, utilisez `npx` :
```bash
npx firebase-tools login
```

Ou changez la politique PowerShell (voir `SOLUTION_POWERSHELL_FIREBASE.md`).

### 2. Initialiser Firebase

```bash
# Si vous utilisez npx
npx firebase-tools init

# OU si firebase fonctionne directement
firebase init
```

**Sélectionnez :**
- ✅ Hosting
- ✅ Functions

**Configurez :**
- Projet : Créez ou sélectionnez un projet Firebase
- Dossier public : `frontend/build`
- Single-page app : **Oui**
- Functions : **Oui**
- Runtime : **Node.js 18**

### 3. Configurer MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster (gratuit M0 disponible)
3. Configurez Network Access : Ajoutez `0.0.0.0/0` (temporaire)
4. Créez un utilisateur de base de données
5. Récupérez la chaîne de connexion

### 4. Configurer les Variables d'Environnement

```bash
# Via Firebase Secrets (recommandé)
firebase functions:secrets:set MONGODB_URI
# Entrez votre URI MongoDB lorsque demandé

firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set JWT_ADMIN_SECRET

# Via Config (alternative)
firebase functions:config:set \
  mongodb.uri="mongodb+srv://user:pass@cluster.mongodb.net/codegenesis" \
  jwt.secret="your_jwt_secret" \
  jwt.admin_secret="your_admin_jwt_secret" \
  client.origin="https://your-project-id.web.app"
```

### 5. Construire le Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 6. Déployer

```bash
# Déployer tout
firebase deploy

# OU déployer séparément
firebase deploy --only hosting  # Frontend
firebase deploy --only functions # Backend
```

### 7. Mettre à jour l'URL API dans le Frontend

Modifiez `frontend/src/config/api.js` ou créez `frontend/.env.production` :

```bash
# frontend/.env.production
REACT_APP_API_BASE_URL=https://us-central1-your-project-id.cloudfunctions.net/api
```

Puis reconstruisez :

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## ✅ Vérification

1. **Frontend** : `https://your-project-id.web.app`
2. **API** : `https://us-central1-your-project-id.cloudfunctions.net/api/health`

Testez l'API :
```bash
curl https://us-central1-your-project-id.cloudfunctions.net/api/health
```

## 🔧 Commandes Utiles

```bash
# Voir les logs (avec npx si nécessaire)
npx firebase-tools functions:log
# OU
firebase functions:log

# Voir les logs en temps réel
npx firebase-tools functions:log --only api

# Lister les variables d'environnement
npx firebase-tools functions:config:get

# Déployer uniquement les functions
npx firebase-tools deploy --only functions

# Déployer uniquement le hosting
npx firebase-tools deploy --only hosting
```

## 🐛 Problèmes Courants

### Functions ne démarrent pas
- Vérifiez les logs : `firebase functions:log`
- Vérifiez que MongoDB Atlas autorise les connexions depuis Firebase

### Erreur CORS
- Vérifiez que `CLIENT_ORIGIN` pointe vers votre URL Firebase Hosting
- Format : `https://your-project-id.web.app`

### Frontend ne peut pas accéder à l'API
- Vérifiez que `REACT_APP_API_BASE_URL` est correctement configuré
- Reconstruisez le frontend après modification

## 📚 Documentation Complète

Voir `FIREBASE_DEPLOYMENT.md` pour le guide complet.

