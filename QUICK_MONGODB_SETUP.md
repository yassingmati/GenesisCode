# Configuration Rapide MongoDB - CodeGenesis

## 🚀 Configuration Rapide (5 minutes)

### Option 1: MongoDB Atlas (Recommandé - Gratuit)

1. **Créer un compte sur MongoDB Atlas**
   - Allez sur: https://www.mongodb.com/cloud/atlas/register
   - Créez un compte gratuit

2. **Créer un Cluster Gratuit**
   - Cliquez sur "Build a Database"
   - Choisissez "M0 Free" (gratuit)
   - Région: Choisissez la plus proche (ex: `us-east-1`)
   - Cliquez sur "Create"

3. **Configurer l'Accès Réseau**
   - Menu gauche → "Network Access"
   - "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
   - "Confirm"

4. **Créer un Utilisateur**
   - Menu gauche → "Database Access"
   - "Add New Database User"
   - Username: `codegenesis-admin`
   - Password: **Créez un mot de passe fort et SAVEZ-LE**
   - Role: "Atlas admin"
   - "Add User"

5. **Récupérer l'URI de Connexion**
   - Menu gauche → "Database"
   - Cliquez sur "Connect" sur votre cluster
   - "Connect your application"
   - Copiez la chaîne de connexion
   - **Remplacez `<password>` par votre mot de passe**
   - **Remplacez `<dbname>` par `codegenesis`**

6. **Configurer dans le projet**
   - Ouvrez `backend/.env`
   - Remplacez la ligne `MONGODB_URI=` par votre URI complète
   - Exemple:
     ```
     MONGODB_URI=mongodb+srv://codegenesis-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority
     ```

### Option 2: MongoDB Local (Plus rapide pour tester)

Si MongoDB est déjà installé localement:

1. **Vérifier que MongoDB est en cours d'exécution**
   ```powershell
   # Windows
   Get-Service MongoDB
   ```

2. **Configurer dans le projet**
   - Ouvrez `backend/.env`
   - Vérifiez que la ligne est:
     ```
     MONGODB_URI=mongodb://localhost:27017/codegenesis
     ```

## ✅ Vérification

Après configuration, redémarrez le serveur:
```bash
cd backend
npm start
```

Vous devriez voir:
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 5000
```

## 🧪 Test

Une fois MongoDB configuré, testez avec:
```bash
node test-server.js
```

