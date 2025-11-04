# 🚀 Guide de Déploiement Rapide - CodeGenesis

## 📋 Étapes Rapides

### 1️⃣ Préparer le Repository GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Créer un repository sur GitHub, puis:
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

### 2️⃣ Configurer GitHub Pages

1. Allez sur **GitHub** → Votre repository → **Settings** → **Pages**
2. Sous **Source**, sélectionnez: **GitHub Actions**
3. Sauvegardez

### 3️⃣ Configurer les Secrets GitHub

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez ces secrets:

| Nom du Secret | Valeur (exemple) |
|---------------|-----------------|
| `REACT_APP_API_BASE_URL` | `https://votre-backend.vercel.app` |
| `REACT_APP_API_URL` | `https://votre-backend.vercel.app/api` |

### 4️⃣ Déclencher le Déploiement

Le déploiement se déclenche automatiquement lors d'un push sur `main`.

Ou manuellement:
- **Actions** → **Deploy Frontend to GitHub Pages** → **Run workflow**

### 5️⃣ Votre Site est Live! 🎉

Votre site sera accessible à:
```
https://VOTRE_USERNAME.github.io/VOTRE_REPO/
```

## 🖥️ Déploiement du Backend

### Option 1: Vercel (Recommandé - Gratuit)

1. Allez sur [vercel.com](https://vercel.com)
2. **Import Project** → Connectez votre GitHub
3. Configurez:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (laissez vide)
   - **Output Directory**: (laissez vide)
4. Ajoutez les variables d'environnement:
   - `MONGODB_URI`: votre URI MongoDB
   - `JWT_SECRET`: votre secret JWT
   - `CLIENT_ORIGIN`: `https://VOTRE_USERNAME.github.io`
5. **Deploy**

### Option 2: Railway

1. Allez sur [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionnez votre repo
4. Configurez:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Ajoutez les variables d'environnement

## 📝 Checklist

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub
- [ ] GitHub Pages activé (source: GitHub Actions)
- [ ] Secrets GitHub configurés (`REACT_APP_API_BASE_URL`, `REACT_APP_API_URL`)
- [ ] Backend déployé (Vercel/Railway/Render)
- [ ] Variables d'environnement backend configurées
- [ ] MongoDB Atlas configuré
- [ ] CORS backend configuré pour accepter GitHub Pages
- [ ] Site testé et fonctionnel

## ⚠️ Important

1. **Mettez à jour `REACT_APP_API_BASE_URL`** dans les secrets GitHub avec l'URL de votre backend déployé
2. **Configurez CORS** dans votre backend pour accepter votre domaine GitHub Pages
3. **MongoDB Atlas**: Configurez `Network Access` pour autoriser les connexions depuis votre service backend

## 🆘 Aide

Si vous avez des problèmes:
1. Vérifiez les logs dans **Actions** → Votre workflow
2. Vérifiez les logs de votre service backend
3. Vérifiez la console du navigateur (F12)
4. Assurez-vous que toutes les URLs sont correctes

