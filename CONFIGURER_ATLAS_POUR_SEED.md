# Configurer MongoDB Atlas pour le Seed

## 🎯 Objectif
Ajouter toutes les catégories, paths, levels et exercices dans **MongoDB Atlas** (pas dans MongoDB Compass local).

## 🚀 Étapes Rapides

### Option 1: Script Automatique (Recommandé)

1. **Exécutez le script de configuration:**
   ```bash
   node setup-mongodb-atlas.js
   ```
   
2. **Entrez le mot de passe** de l'utilisateur `discord` dans MongoDB Atlas

3. **Exécutez le seed vers Atlas:**
   ```bash
   cd backend
   npm run seed:atlas
   ```

### Option 2: Configuration Manuelle

1. **Ouvrez `backend/.env`**

2. **Trouvez la ligne `MONGODB_URI=...`**

3. **Remplacez-la par votre URI MongoDB Atlas:**
   ```
   MONGODB_URI=mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
   ```
   **Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe réel de l'utilisateur `discord`**

4. **Sauvegardez le fichier**

5. **Exécutez le seed:**
   ```bash
   cd backend
   npm run seed:atlas
   ```

## ✅ Vérification

Après exécution, vous devriez voir:
```
✅ Connexion réussie à MongoDB Atlas!
📍 Destination: MongoDB Atlas (cluster0.whxj5zj.mongodb.net)
```

Puis dans MongoDB Atlas Data Explorer, vous verrez:
- ✅ Des documents dans `categories`
- ✅ Des documents dans `paths`
- ✅ Des documents dans `levels`
- ✅ Des documents dans `exercises`

## 📋 Informations MongoDB Atlas

- **Cluster**: `cluster0.whxj5zj.mongodb.net`
- **Utilisateur**: `discord`
- **Base de données**: `codegenesis`
- **Network Access**: Doit être configuré (0.0.0.0/0 ou votre IP)

## ⚠️ Important

- Si vous voyez `📍 Destination: MongoDB LOCAL (Compass)`, cela signifie que l'URI pointe vers localhost
- Le script `seed:atlas` vérifie automatiquement et refuse de se connecter à localhost
- Utilisez `npm run seed:atlas` au lieu de `npm run seed:all` pour garantir la connexion à Atlas

