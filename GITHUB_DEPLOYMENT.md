# 🚀 Déploiement sur GitHub Pages - CodeGenesis

## ✅ Configuration Complète

Tous les fichiers nécessaires ont été créés pour déployer votre site sur GitHub Pages.

## 📁 Fichiers Créés

1. **`.github/workflows/deploy-frontend.yml`** - Workflow GitHub Actions pour le déploiement automatique
2. **`DEPLOYMENT_GUIDE.md`** - Guide complet de déploiement
3. **`DEPLOYMENT_QUICK_START.md`** - Guide de démarrage rapide
4. **`README_DEPLOYMENT.md`** - Instructions rapides
5. **`frontend/public/404.html`** - Gestion du routage SPA pour GitHub Pages
6. **`frontend/.env.example`** - Exemple de variables d'environnement

## 🎯 Prochaines Étapes

### 1. Créer le Repository GitHub

```bash
# Si Git n'est pas encore initialisé
git init
git add .
git commit -m "Initial commit - Prêt pour le déploiement"

# Créer un repository sur GitHub (via le site GitHub)
# Puis connecter:
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

### 2. Configurer GitHub Pages

1. Allez sur votre repository GitHub
2. **Settings** → **Pages**
3. Sous **Source**, sélectionnez: **GitHub Actions**
4. Cliquez sur **Save**

### 3. Configurer les Secrets GitHub

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Ajoutez ces secrets:

| Nom du Secret | Description | Exemple |
|---------------|-------------|---------|
| `REACT_APP_API_BASE_URL` | URL de base de votre backend | `https://codegenesis-backend.vercel.app` |
| `REACT_APP_API_URL` | URL complète de l'API | `https://codegenesis-backend.vercel.app/api` |

**⚠️ Important**: Vous devez d'abord déployer votre backend pour obtenir l'URL réelle.

### 4. Déployer le Backend

#### Option A: Vercel (Recommandé)

1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte ou connectez-vous
3. **Add New...** → **Project**
4. **Import Git Repository** → Sélectionnez votre repository
5. Configurez:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (laissez vide)
   - **Output Directory**: (laissez vide)
   - **Install Command**: `npm install`
6. **Environment Variables**:
   - `MONGODB_URI`: Votre URI MongoDB Atlas
   - `JWT_SECRET`: Un secret aléatoire fort
   - `CLIENT_ORIGIN`: `https://VOTRE_USERNAME.github.io` (votre URL GitHub Pages)
   - `PORT`: (laissez vide, Vercel le gère)
7. **Deploy**

Une fois déployé, copiez l'URL (ex: `https://codegenesis-backend.vercel.app`) et mettez-la à jour dans les secrets GitHub.

#### Option B: Railway

1. Allez sur [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionnez votre repository
4. Configurez:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Ajoutez les variables d'environnement dans **Variables**

### 5. Déclencher le Déploiement Frontend

Le déploiement se déclenche automatiquement lors d'un push sur `main`.

Ou manuellement:
1. Allez dans **Actions** de votre repository
2. Sélectionnez **Deploy Frontend to GitHub Pages**
3. Cliquez sur **Run workflow**
4. Sélectionnez la branche `main`
5. Cliquez sur **Run workflow**

### 6. Vérifier le Déploiement

1. Attendez que le workflow se termine (coche verte)
2. Allez dans **Settings** → **Pages**
3. Votre site sera accessible à: `https://VOTRE_USERNAME.github.io/VOTRE_REPO/`

## 🔧 Configuration CORS du Backend

Assurez-vous que votre backend accepte les requêtes depuis GitHub Pages. Dans `backend/src/index.js`, la configuration CORS utilise `CLIENT_ORIGIN`:

```javascript
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));
```

**Important**: Mettez à jour `CLIENT_ORIGIN` dans les variables d'environnement de votre service backend avec votre URL GitHub Pages.

## 📝 Checklist de Déploiement

### Frontend
- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub
- [ ] GitHub Pages activé (source: GitHub Actions)
- [ ] Secrets GitHub configurés (`REACT_APP_API_BASE_URL`, `REACT_APP_API_URL`)
- [ ] Workflow GitHub Actions exécuté avec succès
- [ ] Site accessible sur GitHub Pages

### Backend
- [ ] Backend déployé (Vercel/Railway/Render)
- [ ] Variables d'environnement configurées:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `CLIENT_ORIGIN` (URL GitHub Pages)
- [ ] CORS configuré pour accepter GitHub Pages
- [ ] Backend accessible publiquement
- [ ] API fonctionne correctement

### Tests
- [ ] Frontend accessible publiquement
- [ ] Backend accessible publiquement
- [ ] API répond correctement
- [ ] Authentification fonctionne
- [ ] Pas d'erreurs CORS dans la console
- [ ] Les requêtes fonctionnent end-to-end

## 🆘 Résolution de Problèmes

### Le site ne se charge pas
- Vérifiez les logs dans **Actions** → Votre workflow
- Assurez-vous que le build a réussi (coche verte)

### Erreurs CORS
- Vérifiez que `CLIENT_ORIGIN` dans votre backend correspond à votre URL GitHub Pages
- Vérifiez la console du navigateur pour les erreurs exactes

### L'API ne répond pas
- Vérifiez que votre backend est déployé et accessible
- Vérifiez que `REACT_APP_API_BASE_URL` dans les secrets GitHub correspond à l'URL de votre backend
- Testez l'URL de votre backend directement dans le navigateur

### Les routes React ne fonctionnent pas
- Le fichier `404.html` devrait gérer le routage SPA
- Si ça ne fonctionne pas, vérifiez que le fichier est bien dans `frontend/public/`

## 📚 Ressources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

## ✨ C'est Tout!

Votre site CodeGenesis est maintenant prêt à être déployé sur GitHub Pages! 🎉

