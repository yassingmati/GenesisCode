# 🚀 Déploiement Rapide - CodeGenesis

## ⚡ Démarrage Rapide (5 minutes)

### 1. Créer le Repository GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

### 2. Activer GitHub Pages

1. GitHub → Settings → Pages
2. Source: **GitHub Actions**
3. Sauvegarder

### 3. Configurer les Secrets

GitHub → Settings → Secrets and variables → Actions → New secret

Ajoutez:
- `REACT_APP_API_BASE_URL` = URL de votre backend (ex: `https://codegenesis-backend.vercel.app`)
- `REACT_APP_API_URL` = URL de votre API (ex: `https://codegenesis-backend.vercel.app/api`)

### 4. Déployer le Backend (Vercel)

1. [vercel.com](https://vercel.com) → Import Project
2. Root Directory: `backend`
3. Variables d'environnement:
   - `MONGODB_URI` = votre URI MongoDB
   - `JWT_SECRET` = votre secret
   - `CLIENT_ORIGIN` = `https://VOTRE_USERNAME.github.io`
4. Deploy

### 5. C'est Fait! ✅

Votre site: `https://VOTRE_USERNAME.github.io/VOTRE_REPO/`

## 📚 Documentation Complète

Voir `DEPLOYMENT_GUIDE.md` pour plus de détails.

