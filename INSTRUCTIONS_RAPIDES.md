# ⚡ Instructions Rapides - Résoudre le Problème GitHub Pages

## 🎯 Problème

Le repository est **privé** → GitHub Pages ne fonctionne pas.

## ✅ Solution en 3 Étapes

### 1️⃣ Rendre le Repository Public

1. Allez sur: https://github.com/yassingmati/GenesisCode/settings
2. **Scrollez tout en bas** jusqu'à **"Danger Zone"**
3. Cliquez sur **"Change visibility"**
4. Sélectionnez **"Make public"**
5. Tapez `yassingmati/GenesisCode` pour confirmer
6. Cliquez sur **"I understand, change repository visibility"**

### 2️⃣ Activer GitHub Pages

1. Toujours dans **Settings**, cliquez sur **Pages** (menu de gauche)
2. Sous **Source**, sélectionnez: **GitHub Actions**
3. Cliquez sur **Save**

### 3️⃣ Déclencher le Déploiement

1. Allez dans l'onglet **Actions**
2. Cliquez sur **Deploy Frontend to GitHub Pages**
3. Cliquez sur **Run workflow**
4. Sélectionnez `main`
5. Cliquez sur **Run workflow**

## 🎉 Résultat

Après 5-10 minutes, votre site sera accessible à:
```
https://yassingmati.github.io/GenesisCode/
```

## ⚠️ Important

Avant de rendre public, vérifiez qu'il n'y a pas de secrets dans le code (mots de passe, clés API, etc.).

