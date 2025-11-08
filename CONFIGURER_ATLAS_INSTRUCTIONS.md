# 🚀 Instructions pour Configurer MongoDB Atlas

## Problème Actuel
Votre configuration pointe vers MongoDB LOCAL (Compass) au lieu de MongoDB Atlas.

## ✅ Solution Rapide

### Option 1: Script PowerShell (Recommandé pour Windows)

1. **Exécutez le script PowerShell:**
   ```powershell
   .\configure-atlas.ps1
   ```

2. **Entrez le mot de passe** de l'utilisateur `discord` dans MongoDB Atlas

3. **Exécutez le seed vers Atlas:**
   ```powershell
   cd backend
   npm run seed:atlas
   ```

### Option 2: Script Node.js

1. **Exécutez le script:**
   ```bash
   node setup-mongodb-atlas.js
   ```

2. **Entrez le mot de passe** de l'utilisateur `discord`

3. **Exécutez le seed:**
   ```bash
   cd backend
   npm run seed:atlas
   ```

### Option 3: Configuration Manuelle

1. **Ouvrez le fichier `backend/.env`**

2. **Trouvez la ligne:**
   ```
   MONGODB_URI=mongodb://localhost:27017/codegenesis
   ```

3. **Remplacez-la par:**
   ```
   MONGODB_URI=mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
   ```
   **⚠️ Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe réel de l'utilisateur `discord`**

4. **Sauvegardez le fichier**

5. **Exécutez le seed:**
   ```powershell
   cd backend
   npm run seed:atlas
   ```

## 📋 Informations MongoDB Atlas

- **Cluster**: `cluster0.whxj5zj.mongodb.net`
- **Utilisateur**: `discord`
- **Base de données**: `codegenesis`
- **Network Access**: Doit être configuré (0.0.0.0/0 ou votre IP)

## ✅ Vérification

Après configuration, exécutez:
```powershell
cd backend
npm run seed:atlas
```

Vous devriez voir:
```
✅ Connexion réussie à MongoDB Atlas!
📍 Destination: MongoDB Atlas (cluster0.whxj5zj.mongodb.net)
```

Puis dans MongoDB Atlas Data Explorer, vous verrez toutes vos données!

## 🔍 Comment Récupérer le Mot de Passe MongoDB Atlas?

Si vous ne connaissez pas le mot de passe de l'utilisateur `discord`:

1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Connectez-vous à votre compte
3. Allez dans **Database Access** (menu de gauche)
4. Trouvez l'utilisateur `discord`
5. Cliquez sur **Edit** ou **Reset Password**
6. Créez un nouveau mot de passe et **SAVEZ-LE**

## ⚠️ Important

- Le script `seed:atlas` vérifie automatiquement que vous êtes connecté à Atlas
- Il refusera de se connecter à localhost pour éviter les erreurs
- Utilisez toujours `npm run seed:atlas` pour garantir la connexion à Atlas

