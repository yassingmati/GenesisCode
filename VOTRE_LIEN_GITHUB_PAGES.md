# 🎉 Votre Lien GitHub Pages

## 🔗 Votre Lien GitHub Pages Sera:

```
https://yassingmati.github.io/GenesisCode/
```

## 📋 Étapes pour Activer GitHub Pages

### 1. Aller sur votre Repository GitHub

Allez sur: https://github.com/yassingmati/GenesisCode

### 2. Activer GitHub Pages

1. Cliquez sur **Settings** (en haut du repository)
2. Dans le menu de gauche, cliquez sur **Pages**
3. Sous **Source**, sélectionnez: **GitHub Actions**
4. Cliquez sur **Save**

### 3. Configurer les Secrets

1. Toujours dans **Settings**, cliquez sur **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez ces secrets:

**Secret 1:**
- **Name**: `REACT_APP_API_BASE_URL`
- **Secret**: `https://votre-backend.vercel.app` (vous l'obtiendrez après avoir déployé le backend)
- Cliquez sur **Add secret**

**Secret 2:**
- **Name**: `REACT_APP_API_URL`
- **Secret**: `https://votre-backend.vercel.app/api`
- Cliquez sur **Add secret**

**⚠️ Note Temporaire:** Pour l'instant, mettez:
- `REACT_APP_API_BASE_URL`: `http://localhost:5000`
- `REACT_APP_API_URL`: `http://localhost:5000/api`

Nous les mettrons à jour après avoir déployé le backend.

### 4. Pousser le Code (si pas déjà fait)

```bash
git add .
git commit -m "Configuration pour GitHub Pages"
git push origin main
```

### 5. Déclencher le Déploiement

1. Allez dans l'onglet **Actions** de votre repository
2. Cliquez sur **Deploy Frontend to GitHub Pages**
3. Cliquez sur **Run workflow** (bouton à droite)
4. Sélectionnez la branche `main`
5. Cliquez sur **Run workflow**

### 6. Attendre le Déploiement

Le workflow prendra 5-10 minutes. Vous verrez une coche verte ✅ quand c'est terminé.

### 7. Votre Site Sera Accessible à:

```
https://yassingmati.github.io/GenesisCode/
```

## 🖥️ Déploiement du Backend (Vercel)

Pour que votre site fonctionne complètement, vous devez aussi déployer le backend:

1. Allez sur [vercel.com](https://vercel.com)
2. **Import Project** → Connectez votre GitHub
3. Sélectionnez le repository `GenesisCode`
4. Configurez:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
5. Variables d'environnement:
   - `MONGODB_URI`: Votre URI MongoDB
   - `JWT_SECRET`: Votre secret JWT
   - `CLIENT_ORIGIN`: `https://yassingmati.github.io`
6. **Deploy**

Une fois déployé, mettez à jour les secrets GitHub avec l'URL Vercel de votre backend.

## ✅ Checklist

- [ ] Repository GitHub: https://github.com/yassingmati/GenesisCode
- [ ] GitHub Pages activé (Settings → Pages → Source: GitHub Actions)
- [ ] Secrets GitHub configurés (`REACT_APP_API_BASE_URL`, `REACT_APP_API_URL`)
- [ ] Code poussé sur GitHub
- [ ] Workflow GitHub Actions exécuté
- [ ] Backend déployé sur Vercel
- [ ] Secrets GitHub mis à jour avec l'URL Vercel
- [ ] Site accessible: https://yassingmati.github.io/GenesisCode/

## 🎉 C'est Tout!

Une fois le déploiement terminé, votre site sera accessible à:
**https://yassingmati.github.io/GenesisCode/**

