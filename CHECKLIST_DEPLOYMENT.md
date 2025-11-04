# ✅ Checklist de Déploiement - CodeGenesis

## 📋 État Actuel

- [x] Repository GitHub créé: `https://github.com/yassingmati/GenesisCode`
- [x] Repository rendu public
- [x] GitHub Pages activé (Source: GitHub Actions)
- [x] Workflow GitHub Actions créé (`.github/workflows/deploy-frontend.yml`)
- [ ] Secrets GitHub configurés
- [ ] Code poussé sur GitHub
- [ ] Workflow exécuté avec succès
- [ ] Site accessible sur GitHub Pages

## 🔧 À Faire Maintenant

### 1. Configurer les Secrets (2 minutes)

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Nom | Valeur Temporaire | À Mettre à Jour Après |
|-----|-------------------|----------------------|
| `REACT_APP_API_BASE_URL` | `http://localhost:5000` | URL Vercel du backend |
| `REACT_APP_API_URL` | `http://localhost:5000/api` | URL Vercel du backend + `/api` |

### 2. Pousser le Code (1 minute)

```bash
git add .
git commit -m "Configuration pour GitHub Pages"
git push origin main
```

### 3. Vérifier le Déploiement (5-10 minutes)

1. Allez dans **Actions**
2. Regardez le workflow "Deploy Frontend to GitHub Pages"
3. Attendez la coche verte ✅

### 4. Accéder à Votre Site

Une fois terminé, votre site sera à:
```
https://yassingmati.github.io/GenesisCode/
```

## 🖥️ Déploiement Backend (Optionnel mais Recommandé)

### Sur Vercel:

- [ ] Créer un compte Vercel
- [ ] Importer le repository `GenesisCode`
- [ ] Configurer Root Directory: `backend`
- [ ] Ajouter variables d'environnement:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `CLIENT_ORIGIN` = `https://yassingmati.github.io`
- [ ] Déployer
- [ ] Mettre à jour les secrets GitHub avec l'URL Vercel

## 📊 Progression

```
Frontend:  ████████░░ 80% (GitHub Pages activé, workflow prêt)
Backend:   ░░░░░░░░░░  0% (À faire)
Total:     █████░░░░░ 50%
```

## 🎯 Lien Final

Une fois tout terminé:
- **Frontend**: https://yassingmati.github.io/GenesisCode/
- **Backend**: https://votre-backend.vercel.app (à configurer)

