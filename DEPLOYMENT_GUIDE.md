# Guide de Déploiement - CodeGenesis

Ce guide vous explique comment déployer CodeGenesis sur Internet avec GitHub Pages.

## 📋 Prérequis

1. Un compte GitHub
2. Un repository GitHub pour votre projet
3. Un service d'hébergement pour le backend (Vercel, Railway, Render, Heroku, etc.)

## 🚀 Déploiement du Frontend sur GitHub Pages

### Étape 1: Préparer le repository

1. **Initialiser Git** (si ce n'est pas déjà fait):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Créer un repository sur GitHub** et connecter:
```bash
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

### Étape 2: Configurer GitHub Pages

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** → **Pages**
3. Sous **Source**, sélectionnez:
   - **Source**: `GitHub Actions`
4. Sauvegardez

### Étape 3: Configurer les Secrets (Variables d'environnement)

1. Dans votre repository GitHub, allez dans **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez les secrets suivants:

| Secret | Description | Exemple |
|--------|-------------|---------|
| `REACT_APP_API_BASE_URL` | URL de base de votre backend API | `https://api.codegenesis.com` |
| `REACT_APP_API_URL` | URL complète de l'API | `https://api.codegenesis.com/api` |

### Étape 4: Déclencher le déploiement

1. Le workflow se déclenche automatiquement lors d'un push sur `main` ou `master`
2. Ou allez dans **Actions** → **Deploy Frontend to GitHub Pages** → **Run workflow**

### Étape 5: Accéder à votre site

Une fois le déploiement terminé, votre site sera accessible à:
```
https://VOTRE_USERNAME.github.io/VOTRE_REPO/
```

## 🔧 Configuration du Frontend

### Variables d'environnement

Le frontend utilise les variables d'environnement suivantes:

- `REACT_APP_API_BASE_URL`: URL de base du backend (ex: `https://api.codegenesis.com`)
- `REACT_APP_API_URL`: URL complète de l'API (ex: `https://api.codegenesis.com/api`)

Ces variables sont définies dans `.env.production` lors du build.

### Mise à jour de la configuration API

Modifiez `frontend/src/config/api.js` pour utiliser les variables d'environnement:

```javascript
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  // ... reste de la config
};
```

## 🖥️ Déploiement du Backend

GitHub Pages ne peut pas héberger un backend Node.js. Vous devez utiliser un autre service:

### Option 1: Vercel (Recommandé)

1. Créez un compte sur [Vercel](https://vercel.com)
2. Importez votre repository GitHub
3. Configurez le projet:
   - **Root Directory**: `backend`
   - **Build Command**: (laissez vide ou `npm install`)
   - **Output Directory**: (laissez vide)
   - **Install Command**: `npm install`
4. Ajoutez les variables d'environnement:
   - `MONGODB_URI`: URI de votre base de données MongoDB
   - `JWT_SECRET`: Secret pour JWT
   - `PORT`: Port (généralement laissé vide, Vercel le gère)

### Option 2: Railway

1. Créez un compte sur [Railway](https://railway.app)
2. Nouveau projet → Deploy from GitHub repo
3. Sélectionnez votre repository
4. Configurez:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Ajoutez les variables d'environnement dans **Variables**

### Option 3: Render

1. Créez un compte sur [Render](https://render.com)
2. New → Web Service
3. Connectez votre repository GitHub
4. Configurez:
   - **Name**: `codegenesis-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Ajoutez les variables d'environnement

### Option 4: Heroku

1. Créez un compte sur [Heroku](https://heroku.com)
2. Installez Heroku CLI
3. Créez une app:
```bash
cd backend
heroku create codegenesis-backend
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

## 🔐 Configuration de la Base de Données

### MongoDB Atlas (Recommandé pour la production)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Configurez:
   - **Database Access**: Créez un utilisateur
   - **Network Access**: Ajoutez `0.0.0.0/0` (tous les IPs) ou l'IP de votre serveur
4. Obtenez la connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/codegenesis?retryWrites=true&w=majority
   ```

## 📝 Checklist de Déploiement

### Frontend
- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub
- [ ] GitHub Pages activé
- [ ] Secrets GitHub configurés (API URLs)
- [ ] Workflow GitHub Actions testé
- [ ] Site accessible sur GitHub Pages

### Backend
- [ ] Service d'hébergement choisi (Vercel/Railway/Render/Heroku)
- [ ] Backend déployé
- [ ] Variables d'environnement configurées
- [ ] Base de données MongoDB configurée
- [ ] CORS configuré pour accepter le domaine GitHub Pages
- [ ] URL du backend mise à jour dans les secrets GitHub

### Tests
- [ ] Frontend accessible publiquement
- [ ] Backend accessible publiquement
- [ ] API fonctionne correctement
- [ ] Authentification fonctionne
- [ ] Les requêtes CORS fonctionnent

## 🔧 Configuration CORS du Backend

Assurez-vous que votre backend accepte les requêtes depuis votre domaine GitHub Pages:

```javascript
// backend/src/index.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://VOTRE_USERNAME.github.io',
    'http://localhost:3000' // Pour le développement local
  ],
  credentials: true
}));
```

## 🌐 Domaines Personnalisés

Si vous avez un domaine personnalisé:

1. Dans GitHub Pages Settings, ajoutez votre domaine personnalisé
2. Configurez les DNS de votre domaine pour pointer vers GitHub Pages
3. Mettez à jour la configuration CORS du backend avec votre domaine

## 📚 Ressources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

## 🆘 Support

En cas de problème:
1. Vérifiez les logs GitHub Actions
2. Vérifiez les logs de votre service backend
3. Vérifiez la console du navigateur pour les erreurs CORS
4. Assurez-vous que toutes les variables d'environnement sont configurées
