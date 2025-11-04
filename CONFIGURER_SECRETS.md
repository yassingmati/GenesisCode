# 🔐 Instructions pour Configurer les Secrets GitHub

## ⚠️ Action Manuelle Requise

Les secrets GitHub doivent être configurés manuellement via l'interface GitHub car ils nécessitent une authentification.

## 📋 Étapes Rapides

### 1. Aller sur GitHub

Allez sur: https://github.com/yassingmati/GenesisCode/settings/secrets/actions

### 2. Ajouter le Premier Secret

1. Cliquez sur **New repository secret**
2. **Name**: `REACT_APP_API_BASE_URL`
3. **Secret**: `http://localhost:5000`
4. Cliquez sur **Add secret**

### 3. Ajouter le Deuxième Secret

1. Cliquez sur **New repository secret** (encore une fois)
2. **Name**: `REACT_APP_API_URL`
3. **Secret**: `http://localhost:5000/api`
4. Cliquez sur **Add secret**

## ✅ Vérification

Une fois les secrets ajoutés, vous devriez voir:
- ✅ `REACT_APP_API_BASE_URL`
- ✅ `REACT_APP_API_URL`

## 🚀 Après la Configuration

Une fois les secrets configurés, le workflow GitHub Actions se déclenchera automatiquement lors du prochain push, ou vous pouvez le déclencher manuellement:

1. Allez dans **Actions**
2. **Deploy Frontend to GitHub Pages**
3. **Run workflow**

## 📝 Note

Ces valeurs sont temporaires. Une fois que vous aurez déployé le backend sur Vercel, vous devrez mettre à jour ces secrets avec l'URL Vercel de votre backend.

