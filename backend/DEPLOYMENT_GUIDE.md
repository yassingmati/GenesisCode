# Guide de Déploiement - Backend sur Service Gratuit

Ce guide explique comment déployer le backend Express sur Railway ou Render (services gratuits) au lieu de Firebase Functions.

## Prérequis

- Compte GitHub avec le repository CodeGenesis
- MongoDB Atlas configuré et accessible
- Variables d'environnement prêtes

## Option 1: Déploiement sur Railway (Recommandé)

### Avantages
- ✅ $5 de crédits gratuits/mois
- ✅ Déploiement automatique depuis GitHub
- ✅ HTTPS automatique
- ✅ Pas de mise en veille

### Étapes

1. **Créer un compte Railway**
   - Aller sur https://railway.app
   - Se connecter avec GitHub
   - Cliquer sur "New Project"

2. **Connecter le repository**
   - Cliquer sur "Deploy from GitHub repo"
   - Sélectionner le repository CodeGenesis
   - Railway détectera automatiquement le backend

3. **Configurer le service**
   - Railway détectera automatiquement le dossier `backend`
   - Si ce n'est pas le cas, configurer:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`

4. **Configurer les variables d'environnement**
   - Aller dans l'onglet "Variables"
   - Ajouter les variables suivantes:
     ```
     MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
     JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
     JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
     CLIENT_ORIGIN=https://codegenesis-platform.web.app
     NODE_ENV=production
     PORT= (laissé vide, Railway le définit automatiquement)
     ```

5. **Déployer**
   - Railway déploiera automatiquement
   - Attendre la fin du déploiement
   - Obtenir l'URL du backend (ex: `https://backend-production-xxxx.up.railway.app`)

6. **Tester**
   - Tester l'endpoint: `https://votre-backend.railway.app/api/health`
   - Vous devriez voir une réponse JSON

## Option 2: Déploiement sur Render

### Avantages
- ✅ Plan gratuit disponible
- ✅ Déploiement automatique
- ⚠️ Service en veille après 15 min d'inactivité (première requête lente)

### Étapes

1. **Créer un compte Render**
   - Aller sur https://render.com
   - Se connecter avec GitHub
   - Cliquer sur "New +" puis "Web Service"

2. **Connecter le repository**
   - Sélectionner le repository CodeGenesis
   - Render détectera automatiquement le backend

3. **Configurer le service**
   - Name: `codegenesis-backend`
   - Environment: `Node`
   - Region: Choisir la région la plus proche
   - Branch: `main` (ou votre branche principale)
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

4. **Configurer les variables d'environnement**
   - Aller dans l'onglet "Environment"
   - Ajouter les variables suivantes:
     ```
     MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
     JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
     JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
     CLIENT_ORIGIN=https://codegenesis-platform.web.app
     NODE_ENV=production
     PORT=10000
     ```

5. **Déployer**
   - Cliquer sur "Create Web Service"
   - Render déploiera automatiquement
   - Attendre la fin du déploiement (5-10 minutes)
   - Obtenir l'URL du backend (ex: `https://codegenesis-backend.onrender.com`)

6. **Tester**
   - Tester l'endpoint: `https://votre-backend.onrender.com/api/health`
   - Vous devriez voir une réponse JSON

## Configuration du Frontend

Une fois le backend déployé, mettre à jour le frontend:

1. **Créer `frontend/.env.production`** (ou mettre à jour):
   ```
   REACT_APP_API_BASE_URL=https://votre-backend.railway.app
   ```
   ou
   ```
   REACT_APP_API_BASE_URL=https://votre-backend.onrender.com
   ```

2. **Rebuild le frontend**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Redéployer le frontend**:
   ```bash
   firebase deploy --only hosting
   ```

## Vérification CORS

Le backend doit accepter les requêtes depuis le frontend. Vérifier que `CLIENT_ORIGIN` est correctement configuré:

- Frontend: `https://codegenesis-platform.web.app`
- Backend doit autoriser cette origine dans la configuration CORS

## Tests

### Tester le backend déployé

```bash
# Health check
curl https://votre-backend.railway.app/api/health

# Test d'authentification
curl -X POST https://votre-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Tester depuis le frontend

1. Ouvrir https://codegenesis-platform.web.app
2. Essayer de se connecter
3. Vérifier la console du navigateur (F12) - il ne devrait plus y avoir d'erreurs CORS

## Dépannage

### Le backend ne démarre pas

- Vérifier les logs dans Railway/Render
- Vérifier que toutes les variables d'environnement sont configurées
- Vérifier que MongoDB Atlas est accessible (Network Access)

### Erreurs CORS

- Vérifier que `CLIENT_ORIGIN` est correctement configuré
- Vérifier que l'URL du frontend correspond à `CLIENT_ORIGIN`

### Le backend se met en veille (Render uniquement)

- Render met les services gratuits en veille après 15 min d'inactivité
- La première requête après la mise en veille peut prendre 30-60 secondes
- Solution: Utiliser Railway (pas de mise en veille) ou passer à un plan payant

## Commandes Utiles

```bash
# Tester le backend localement
cd backend
npm start

# Vérifier les variables d'environnement
cd backend
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# Build le frontend avec la nouvelle URL
cd frontend
REACT_APP_API_BASE_URL=https://votre-backend.railway.app npm run build
```

## Support

- Railway: https://docs.railway.app
- Render: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

