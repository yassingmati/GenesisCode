# 🚀 Guide Complet - Obtenir Votre Lien GitHub Pages

## 📝 Étape par Étape

### Étape 1: Créer le Repository GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le **+** en haut à droite → **New repository**
3. Remplissez:
   - **Repository name**: `codegenesis` (ou le nom de votre choix)
   - **Description**: "CodeGenesis Learning Platform"
   - **Public** ou **Private** (selon votre préférence)
   - **NE PAS** cocher "Initialize this repository with a README"
4. Cliquez sur **Create repository**

### Étape 2: Pousser le Code sur GitHub

Ouvrez votre terminal dans le dossier du projet et exécutez:

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le commit initial
git commit -m "Initial commit - CodeGenesis Platform"

# Ajouter le remote (remplacez VOTRE_USERNAME et VOTRE_REPO par vos valeurs)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

**Exemple concret:**
Si votre username est `john` et votre repo est `codegenesis`:
```bash
git remote add origin https://github.com/john/codegenesis.git
git push -u origin main
```

### Étape 3: Activer GitHub Pages

1. Allez sur votre repository GitHub (ex: `https://github.com/john/codegenesis`)
2. Cliquez sur **Settings** (en haut du repository)
3. Dans le menu de gauche, cliquez sur **Pages**
4. Sous **Source**, sélectionnez: **GitHub Actions**
5. Cliquez sur **Save**

### Étape 4: Configurer les Secrets (Variables d'Environnement)

1. Toujours dans **Settings**, cliquez sur **Secrets and variables** → **Actions**
2. Cliquez sur **New repository secret**
3. Ajoutez le premier secret:
   - **Name**: `REACT_APP_API_BASE_URL`
   - **Secret**: `https://votre-backend.vercel.app` (vous l'obtiendrez après avoir déployé le backend)
   - Cliquez sur **Add secret**

4. Ajoutez le deuxième secret:
   - **Name**: `REACT_APP_API_URL`
   - **Secret**: `https://votre-backend.vercel.app/api`
   - Cliquez sur **Add secret**

**⚠️ Note Temporaire:** Pour l'instant, mettez des valeurs temporaires comme:
- `REACT_APP_API_BASE_URL`: `http://localhost:5000`
- `REACT_APP_API_URL`: `http://localhost:5000/api`

Nous les mettrons à jour après avoir déployé le backend.

### Étape 5: Déployer le Backend (Vercel)

1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte ou connectez-vous avec GitHub
3. Cliquez sur **Add New...** → **Project**
4. Cliquez sur **Import Git Repository**
5. Sélectionnez votre repository `codegenesis`
6. Configurez le projet:
   - **Root Directory**: Cliquez sur **Edit** → Tapez `backend`
   - **Framework Preset**: Other
   - **Build Command**: (laissez vide)
   - **Output Directory**: (laissez vide)
   - **Install Command**: `npm install`
7. Cliquez sur **Environment Variables**
8. Ajoutez ces variables:
   - **Key**: `MONGODB_URI` | **Value**: Votre URI MongoDB (ex: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>`)
   - **Key**: `JWT_SECRET` | **Value**: Un secret aléatoire (ex: `votre-super-secret-jwt-123456`)
   - **Key**: `CLIENT_ORIGIN` | **Value**: `https://VOTRE_USERNAME.github.io` (ex: `https://john.github.io`)
   - **Key**: `PORT` | **Value**: (laissez vide)
9. Cliquez sur **Deploy**

10. **Attendez le déploiement** (2-3 minutes)
11. Une fois déployé, vous verrez une URL comme: `https://codegenesis-backend-abc123.vercel.app`
12. **Copiez cette URL** - c'est l'URL de votre backend!

### Étape 6: Mettre à Jour les Secrets GitHub

1. Retournez sur GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Cliquez sur `REACT_APP_API_BASE_URL` → **Update**
3. Mettez à jour avec l'URL Vercel de votre backend (ex: `https://codegenesis-backend-abc123.vercel.app`)
4. Cliquez sur **Update secret**
5. Faites de même pour `REACT_APP_API_URL` avec `/api` à la fin

### Étape 7: Déclencher le Déploiement Frontend

1. Allez dans l'onglet **Actions** de votre repository GitHub
2. Vous devriez voir un workflow "Deploy Frontend to GitHub Pages"
3. Si le workflow n'a pas démarré automatiquement:
   - Cliquez sur **Deploy Frontend to GitHub Pages**
   - Cliquez sur **Run workflow** (bouton à droite)
   - Sélectionnez la branche `main`
   - Cliquez sur **Run workflow**

4. **Attendez** que le workflow se termine (5-10 minutes)
   - Vous verrez une coche verte ✅ quand c'est terminé

### Étape 8: Obtenir Votre Lien GitHub Pages

1. Allez dans **Settings** → **Pages**
2. Vous verrez votre URL GitHub Pages:
   ```
   https://VOTRE_USERNAME.github.io/VOTRE_REPO/
   ```

**Exemple:**
Si votre username est `john` et votre repo est `codegenesis`:
```
https://john.github.io/codegenesis/
```

### Étape 9: Vérifier que Tout Fonctionne

1. Ouvrez votre lien GitHub Pages dans un navigateur
2. Ouvrez la console du navigateur (F12)
3. Vérifiez qu'il n'y a pas d'erreurs CORS
4. Testez la connexion à l'API

## 📋 Checklist Rapide

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub (`git push`)
- [ ] GitHub Pages activé (Settings → Pages → Source: GitHub Actions)
- [ ] Secrets GitHub configurés (`REACT_APP_API_BASE_URL`, `REACT_APP_API_URL`)
- [ ] Backend déployé sur Vercel
- [ ] Variables d'environnement Vercel configurées (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`)
- [ ] Secrets GitHub mis à jour avec l'URL Vercel
- [ ] Workflow GitHub Actions exécuté avec succès
- [ ] Lien GitHub Pages obtenu ✅

## 🎯 Format de Votre Lien Final

Votre site sera accessible à:
```
https://VOTRE_USERNAME.github.io/VOTRE_REPO/
```

**Exemples:**
- `https://john.github.io/codegenesis/`
- `https://jane-doe.github.io/codegenesis-platform/`
- `https://codegenesis-team.github.io/frontend/`

## 🔗 Liens Importants

- **Frontend (GitHub Pages)**: `https://VOTRE_USERNAME.github.io/VOTRE_REPO/`
- **Backend (Vercel)**: `https://votre-backend.vercel.app`
- **API**: `https://votre-backend.vercel.app/api`

## ⚠️ Important

1. **Première fois**: Le déploiement peut prendre 10-15 minutes
2. **Mises à jour**: Chaque push sur `main` déclenchera automatiquement un nouveau déploiement
3. **CORS**: Assurez-vous que `CLIENT_ORIGIN` dans Vercel correspond exactement à votre URL GitHub Pages

## 🆘 Si Ça Ne Fonctionne Pas

1. Vérifiez les logs dans **Actions** → Votre workflow
2. Vérifiez les logs Vercel pour le backend
3. Vérifiez la console du navigateur (F12)
4. Assurez-vous que toutes les URLs sont correctes

## ✨ Vous Avez Maintenant Votre Site en Ligne!

Une fois tout configuré, votre lien GitHub Pages sera:
```
https://VOTRE_USERNAME.github.io/VOTRE_REPO/
```

 Partagez ce lien pour que vos utilisateurs accèdent à votre plateforme! 🎉

