# 🔗 Comment Obtenir Votre Lien GitHub Pages

## 🎯 Votre Lien Sera au Format:

```
https://VOTRE_USERNAME.github.io/VOTRE_REPO/
```

## 📝 Étapes Rapides

### 1. Créer le Repository GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **+** → **New repository**
3. Nom: `codegenesis` (ou votre choix)
4. Créez le repository

### 2. Pousser le Code

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

**Remplacez:**
- `VOTRE_USERNAME` par votre nom d'utilisateur GitHub
- `VOTRE_REPO` par le nom de votre repository

### 3. Activer GitHub Pages

1. GitHub → Votre repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

### 4. Configurer les Secrets

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez:
- `REACT_APP_API_BASE_URL` = `http://localhost:5000` (temporaire)
- `REACT_APP_API_URL` = `http://localhost:5000/api` (temporaire)

### 5. Déclencher le Déploiement

**Actions** → **Deploy Frontend to GitHub Pages** → **Run workflow**

### 6. Obtenir Votre Lien

**Settings** → **Pages**

Votre lien sera affiché là:
```
https://VOTRE_USERNAME.github.io/VOTRE_REPO/
```

## 📌 Exemple Concret

Si votre username GitHub est `john123` et votre repo est `codegenesis`:

1. Repository: `https://github.com/john123/codegenesis`
2. Lien GitHub Pages: `https://john123.github.io/codegenesis/`

## ⚡ Commande Rapide pour Obtenir le Lien

Une fois le repository créé, vous pouvez obtenir le lien directement:

```bash
# Récupérer votre username GitHub
GITHUB_USER=$(git config user.name 2>/dev/null || echo "VOTRE_USERNAME")
REPO_NAME=$(basename $(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | cut -d'/' -f2) 2>/dev/null || echo "VOTRE_REPO")

echo "Votre lien GitHub Pages sera:"
echo "https://${GITHUB_USER}.github.io/${REPO_NAME}/"
```

Ou simplement:
```
https://VOTRE_USERNAME.github.io/VOTRE_REPO/
```

## 🎉 C'est Tout!

Une fois le déploiement terminé, votre site sera accessible à cette URL!

