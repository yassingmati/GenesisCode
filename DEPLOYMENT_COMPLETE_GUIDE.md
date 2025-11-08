# Guide Complet - Déploiement Backend sur Service Gratuit

## Vue d'ensemble

Ce guide explique comment déployer le backend Express sur un service d'hébergement gratuit (Railway ou Render) au lieu de Firebase Functions, évitant ainsi le besoin du plan Blaze.

## Architecture

```
Frontend (Firebase Hosting)
    ↓
    https://codegenesis-platform.web.app
    ↓
Backend (Railway/Render)
    ↓
    https://backend.railway.app ou https://backend.onrender.com
    ↓
MongoDB Atlas
    ↓
    mongodb+srv://...
```

## Étapes de Déploiement

### Phase 1: Préparation ✅

Les fichiers suivants ont été créés:
- `backend/railway.json` - Configuration Railway
- `backend/render.yaml` - Configuration Render
- `backend/Procfile` - Commande de démarrage
- `backend/DEPLOYMENT_GUIDE.md` - Guide détaillé
- `QUICK_DEPLOY_GUIDE.md` - Guide rapide

### Phase 2: Déploiement du Backend

#### Option A: Railway (Recommandé)

1. **Créer un compte Railway**
   - Aller sur https://railway.app
   - Se connecter avec GitHub

2. **Créer un nouveau projet**
   - Cliquer sur "New Project"
   - Sélectionner "Deploy from GitHub repo"
   - Choisir le repository CodeGenesis

3. **Configurer le service**
   - Railway détectera automatiquement le dossier `backend`
   - Si ce n'est pas le cas, configurer:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`

4. **Configurer les variables d'environnement**
   Dans l'onglet "Variables", ajouter:
   ```
   MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
   JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
   CLIENT_ORIGIN=https://codegenesis-platform.web.app
   NODE_ENV=production
   ```

5. **Obtenir l'URL du backend**
   - Attendre la fin du déploiement
   - Copier l'URL (ex: `https://backend-production-xxxx.up.railway.app`)

#### Option B: Render

1. **Créer un compte Render**
   - Aller sur https://render.com
   - Se connecter avec GitHub

2. **Créer un Web Service**
   - Cliquer sur "New +" → "Web Service"
   - Connecter le repository CodeGenesis

3. **Configurer le service**
   - Name: `codegenesis-backend`
   - Environment: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

4. **Configurer les variables d'environnement**
   Même configuration que Railway, mais ajouter:
   ```
   PORT=10000
   ```

5. **Obtenir l'URL du backend**
   - Attendre 5-10 minutes
   - Copier l'URL (ex: `https://codegenesis-backend.onrender.com`)

### Phase 3: Tester le Backend

```bash
# Utiliser le script de test
node test-backend-deployed.js https://votre-backend.railway.app

# Ou tester manuellement
curl https://votre-backend.railway.app/api/health
```

### Phase 4: Configurer le Frontend

1. **Configurer l'URL du backend**
   ```bash
   node configure-frontend-backend-url.js
   ```
   Entrer l'URL du backend déployé.

2. **Rebuild le frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Redéployer le frontend**
   ```bash
   firebase deploy --only hosting
   ```

   Ou utiliser le script automatique:
   ```bash
   # Windows PowerShell
   .\deploy-frontend.ps1
   
   # Linux/Mac
   ./deploy-frontend.sh
   ```

### Phase 5: Vérification

1. **Tester le backend**
   - Ouvrir l'URL du backend dans le navigateur
   - Vérifier que `/api/health` retourne une réponse JSON

2. **Tester le frontend**
   - Ouvrir https://codegenesis-platform.web.app
   - Essayer de se connecter
   - Vérifier la console du navigateur (F12) - pas d'erreurs CORS

## Fichiers Créés

### Configuration Backend
- `backend/railway.json` - Configuration Railway
- `backend/render.yaml` - Configuration Render
- `backend/Procfile` - Commande de démarrage
- `backend/src/index.js` - Configuration CORS améliorée

### Scripts
- `test-backend-deployed.js` - Tester le backend déployé
- `configure-frontend-backend-url.js` - Configurer l'URL du backend dans le frontend
- `deploy-frontend.sh` - Script de déploiement (Linux/Mac)
- `deploy-frontend.ps1` - Script de déploiement (Windows)

### Documentation
- `DEPLOYMENT_COMPLETE_GUIDE.md` - Ce fichier
- `QUICK_DEPLOY_GUIDE.md` - Guide rapide
- `backend/DEPLOYMENT_GUIDE.md` - Guide détaillé

## Variables d'Environnement

### Backend (Railway/Render)
```
MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
CLIENT_ORIGIN=https://codegenesis-platform.web.app
NODE_ENV=production
PORT= (automatique sur Railway, 10000 sur Render)
```

### Frontend
```
REACT_APP_API_BASE_URL=https://votre-backend.railway.app
```

## Dépannage

### Le backend ne démarre pas

1. **Vérifier les logs**
   - Railway: Onglet "Deployments" → "View Logs"
   - Render: Onglet "Logs"

2. **Vérifier les variables d'environnement**
   - S'assurer que toutes les variables sont configurées
   - Vérifier qu'il n'y a pas d'espaces ou de caractères spéciaux

3. **Vérifier MongoDB Atlas**
   - Network Access doit être `0.0.0.0/0`
   - Vérifier que l'utilisateur a les bonnes permissions

### Erreurs CORS

1. **Vérifier CLIENT_ORIGIN**
   - Doit être `https://codegenesis-platform.web.app`
   - Pas de slash final

2. **Vérifier l'URL du frontend**
   - Le frontend doit utiliser la bonne URL du backend
   - Vérifier `frontend/.env.production`

3. **Vérifier les headers CORS**
   - Utiliser le script de test pour vérifier les headers
   - Vérifier que `Access-Control-Allow-Origin` est présent

### Render: Service en veille

- Normal pour le plan gratuit
- Première requête peut prendre 30-60 secondes
- Solution: Utiliser Railway (pas de mise en veille)

## Commandes Utiles

```bash
# Tester le backend localement
cd backend
npm start

# Tester le backend déployé
node test-backend-deployed.js https://votre-backend.railway.app

# Configurer le frontend
node configure-frontend-backend-url.js

# Rebuild et redéployer le frontend
cd frontend
npm run build
cd ..
firebase deploy --only hosting

# Ou utiliser le script
.\deploy-frontend.ps1  # Windows
./deploy-frontend.sh   # Linux/Mac
```

## Coûts

### Railway
- **Gratuit:** $5 de crédits/mois
- **Coût estimé:** $0/mois pour ~1000 utilisateurs
- **Limite:** 500 heures de runtime/mois

### Render
- **Gratuit:** Plan gratuit disponible
- **Coût estimé:** $0/mois
- **Limitation:** Service en veille après 15 min d'inactivité

## Support

- Railway: https://docs.railway.app
- Render: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Firebase Hosting: https://firebase.google.com/docs/hosting

## Prochaines Étapes

1. ✅ Déployer le backend sur Railway ou Render
2. ✅ Tester le backend déployé
3. ✅ Configurer le frontend avec la nouvelle URL
4. ✅ Rebuild et redéployer le frontend
5. ✅ Tester l'authentification complète

---

**Tout est prêt! Suivez les étapes ci-dessus pour déployer votre backend.** 🚀

