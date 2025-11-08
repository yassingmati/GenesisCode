# Guide Rapide - Déploiement Backend (Sans Blaze)

## Choix du Service

### Railway (Recommandé) ⭐
- ✅ $5 crédits gratuits/mois
- ✅ Pas de mise en veille
- ✅ Déploiement automatique
- ✅ HTTPS automatique

### Render (Alternative)
- ✅ Plan gratuit
- ⚠️ Mise en veille après 15 min (première requête lente)
- ✅ Déploiement automatique

## Déploiement Rapide sur Railway

### 1. Créer un compte
- Aller sur https://railway.app
- Se connecter avec GitHub

### 2. Créer un nouveau projet
- Cliquer sur "New Project"
- Sélectionner "Deploy from GitHub repo"
- Choisir le repository CodeGenesis

### 3. Configurer le service
- Railway détectera automatiquement le dossier `backend`
- Si ce n'est pas le cas:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`

### 4. Configurer les variables d'environnement
Dans l'onglet "Variables", ajouter:

```
MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
CLIENT_ORIGIN=https://codegenesis-platform.web.app
NODE_ENV=production
```

### 5. Obtenir l'URL
- Attendre la fin du déploiement
- Copier l'URL du backend (ex: `https://backend-production-xxxx.up.railway.app`)

### 6. Tester
```bash
node test-backend-deployed.js https://votre-backend.railway.app
```

## Déploiement Rapide sur Render

### 1. Créer un compte
- Aller sur https://render.com
- Se connecter avec GitHub

### 2. Créer un Web Service
- Cliquer sur "New +" → "Web Service"
- Connecter le repository CodeGenesis

### 3. Configurer
- Name: `codegenesis-backend`
- Environment: `Node`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Plan: `Free`

### 4. Variables d'environnement
Même configuration que Railway, mais ajouter:
```
PORT=10000
```

### 5. Déployer
- Cliquer sur "Create Web Service"
- Attendre 5-10 minutes

### 6. Tester
```bash
node test-backend-deployed.js https://votre-backend.onrender.com
```

## Configuration du Frontend

### 1. Créer `.env.production`
```bash
cd frontend
echo "REACT_APP_API_BASE_URL=https://votre-backend.railway.app" > .env.production
```

### 2. Rebuild
```bash
npm run build
```

### 3. Redéployer
```bash
firebase deploy --only hosting
```

## Vérification

### Tester le backend
```bash
# Health check
curl https://votre-backend.railway.app/api/health

# Ou utiliser le script
node test-backend-deployed.js https://votre-backend.railway.app
```

### Tester depuis le frontend
1. Ouvrir https://codegenesis-platform.web.app
2. Essayer de se connecter
3. Vérifier la console (F12) - pas d'erreurs CORS

## Dépannage

### Le backend ne démarre pas
- Vérifier les logs dans Railway/Render
- Vérifier que toutes les variables sont configurées
- Vérifier MongoDB Atlas Network Access (doit être 0.0.0.0/0)

### Erreurs CORS
- Vérifier que `CLIENT_ORIGIN` est `https://codegenesis-platform.web.app`
- Vérifier que le frontend utilise la bonne URL

### Render: Service en veille
- Normal pour le plan gratuit
- Première requête peut prendre 30-60 secondes
- Solution: Utiliser Railway

## Support

- Guide complet: `backend/DEPLOYMENT_GUIDE.md`
- Railway: https://docs.railway.app
- Render: https://render.com/docs

