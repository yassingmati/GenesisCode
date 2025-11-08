# Déploiement Backend - Guide Rapide

## 🎯 Objectif

Déployer le backend Express sur un service gratuit (Railway ou Render) au lieu de Firebase Functions, évitant ainsi le besoin du plan Blaze.

## ⚡ Démarrage Rapide

### 1. Déployer le Backend

**Option A: Railway (Recommandé)**
1. Aller sur https://railway.app
2. Se connecter avec GitHub
3. Créer un nouveau projet → "Deploy from GitHub repo"
4. Configurer les variables d'environnement (voir ci-dessous)
5. Obtenir l'URL du backend

**Option B: Render**
1. Aller sur https://render.com
2. Se connecter avec GitHub
3. Créer un "Web Service"
4. Configurer les variables d'environnement (voir ci-dessous)
5. Obtenir l'URL du backend

### 2. Variables d'Environnement

```
MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
CLIENT_ORIGIN=https://codegenesis-platform.web.app
NODE_ENV=production
PORT= (automatique sur Railway, 10000 sur Render)
```

### 3. Tester le Backend

```bash
node test-backend-deployed.js https://votre-backend.railway.app
```

### 4. Configurer le Frontend

```bash
node configure-frontend-backend-url.js
```

Entrer l'URL du backend déployé.

### 5. Rebuild et Redéployer le Frontend

```bash
# Windows PowerShell
.\deploy-frontend.ps1

# Linux/Mac
./deploy-frontend.sh
```

Ou manuellement:
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

### 6. Tester

1. Ouvrir https://codegenesis-platform.web.app
2. Essayer de se connecter
3. Vérifier la console (F12) - pas d'erreurs CORS

## 📚 Documentation

- **Guide complet:** `DEPLOYMENT_COMPLETE_GUIDE.md`
- **Guide rapide:** `QUICK_DEPLOY_GUIDE.md`
- **Guide backend:** `backend/DEPLOYMENT_GUIDE.md`

## 🛠️ Scripts Disponibles

- `test-backend-deployed.js` - Tester le backend déployé
- `configure-frontend-backend-url.js` - Configurer l'URL du backend
- `deploy-frontend.sh` - Déployer le frontend (Linux/Mac)
- `deploy-frontend.ps1` - Déployer le frontend (Windows)

## ❓ Dépannage

### Le backend ne démarre pas
- Vérifier les logs dans Railway/Render
- Vérifier que toutes les variables sont configurées
- Vérifier MongoDB Atlas Network Access

### Erreurs CORS
- Vérifier que `CLIENT_ORIGIN` est correct
- Vérifier que le frontend utilise la bonne URL

### Render: Service en veille
- Normal pour le plan gratuit
- Première requête peut prendre 30-60 secondes
- Solution: Utiliser Railway

## 💰 Coûts

- **Railway:** $5 crédits gratuits/mois (suffisant pour ~1000 utilisateurs)
- **Render:** Plan gratuit (service en veille après 15 min)

## 🚀 C'est tout!

Suivez les étapes ci-dessus et votre backend sera déployé en quelques minutes.
