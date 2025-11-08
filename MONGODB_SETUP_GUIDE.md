# Guide de Configuration MongoDB - CodeGenesis

## 🎯 Objectif

Ce guide vous explique comment configurer MongoDB pour que votre application CodeGenesis fonctionne correctement.

## 📋 Options de Configuration

### Option 1: MongoDB Atlas (Recommandé pour Production)

MongoDB Atlas est un service cloud gratuit qui offre un cluster MongoDB gratuit.

#### Étapes de Configuration

1. **Créer un compte MongoDB Atlas**
   - Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Cliquez sur "Try Free" ou "Sign Up"
   - Créez un compte gratuit

2. **Créer un Cluster**
   - Une fois connecté, cliquez sur "Build a Database"
   - Choisissez "M0 Free" (gratuit)
   - Sélectionnez une région proche de vous (ex: `us-east-1`)
   - Cliquez sur "Create Cluster"
   - Attendez que le cluster soit créé (2-3 minutes)

3. **Configurer Network Access**
   - Dans le menu de gauche, allez dans "Network Access"
   - Cliquez sur "Add IP Address"
   - Cliquez sur "Allow Access from Anywhere" (0.0.0.0/0)
   - Cliquez sur "Confirm"
   - ⚠️ **Note**: Pour la production, limitez les IPs autorisées

4. **Créer un Utilisateur de Base de Données**
   - Dans le menu de gauche, allez dans "Database Access"
   - Cliquez sur "Add New Database User"
   - Choisissez "Password" comme méthode d'authentification
   - Créez un nom d'utilisateur (ex: `codegenesis-admin`)
   - Créez un mot de passe fort et **SAVEZ-LE** (vous ne pourrez plus le voir)
   - Rôle: Sélectionnez "Atlas admin" ou "Read and write to any database"
   - Cliquez sur "Add User"

5. **Récupérer l'URI de Connexion**
   - Dans le menu de gauche, allez dans "Database"
   - Cliquez sur "Connect" sur votre cluster
   - Choisissez "Connect your application"
   - Sélectionnez "Node.js" et version "4.1 or later"
   - Copiez la chaîne de connexion
   - **Remplacez** `<password>` par le mot de passe que vous avez créé
   - **Remplacez** `<dbname>` par `codegenesis` (ou votre nom de base)

   **Exemple d'URI finale**:
   ```
   mongodb+srv://codegenesis-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority
   ```

6. **Configurer dans le Projet**
   - Créez ou modifiez le fichier `.env` dans le dossier `backend/`
   - Ajoutez la ligne suivante:
   ```
   MONGODB_URI=mongodb+srv://codegenesis-admin:VotreMotDePasse@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority
   ```

### Option 2: MongoDB Local (Pour Développement)

Pour utiliser MongoDB localement, vous devez l'installer sur votre machine.

#### Installation MongoDB Local

**Windows**:
1. Téléchargez MongoDB Community Server depuis [mongodb.com/download](https://www.mongodb.com/try/download/community)
2. Installez MongoDB en suivant les instructions
3. MongoDB démarre automatiquement comme service Windows

**macOS** (avec Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux** (Ubuntu/Debian):
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### Configuration

1. **Vérifier que MongoDB est en cours d'exécution**
   ```bash
   # Windows
   Get-Service MongoDB
   
   # macOS/Linux
   sudo systemctl status mongodb
   ```

2. **Configurer dans le Projet**
   - Créez ou modifiez le fichier `.env` dans le dossier `backend/`
   - Ajoutez la ligne suivante:
   ```
   MONGODB_URI=mongodb://localhost:27017/codegenesis
   ```

## ✅ Vérification

### Test de Connexion

1. **Démarrer le serveur backend**
   ```bash
   cd backend
   npm start
   ```

2. **Vérifier les logs**
   - Si MongoDB est connecté, vous devriez voir:
     ```
     ✅ Connecté à MongoDB
     🚀 Serveur démarré sur le port 5000
     ```
   - Si MongoDB n'est pas connecté, vous verrez:
     ```
     ⚠️ Erreur connexion MongoDB: ...
     ⚠️ Mode dégradé: Le serveur démarre sans MongoDB
     ```

3. **Tester le Health Check**
   ```bash
   curl http://localhost:5000/api/health
   ```
   - Si MongoDB est connecté: `"database": "connected"`
   - Si MongoDB n'est pas connecté: `"database": "disconnected"`

4. **Tester le Login**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```
   - Si MongoDB est connecté: Le login fonctionne (si l'utilisateur existe)
   - Si MongoDB n'est pas connecté: Erreur 503 avec message clair

## 🔧 Résolution de Problèmes

### Problème 1: "MongoDB not connected"
**Cause**: MongoDB n'est pas accessible ou l'URI est incorrecte.

**Solution**:
1. Vérifiez que MongoDB est en cours d'exécution (local) ou que le cluster est actif (Atlas)
2. Vérifiez que l'URI dans `.env` est correcte
3. Vérifiez que le mot de passe dans l'URI est correct (Atlas)
4. Vérifiez que Network Access est configuré (Atlas)

### Problème 2: "Authentication failed"
**Cause**: Le nom d'utilisateur ou le mot de passe est incorrect.

**Solution**:
1. Vérifiez les identifiants dans l'URI
2. Recréez un utilisateur dans MongoDB Atlas si nécessaire

### Problème 3: "Network Access denied"
**Cause**: Votre IP n'est pas autorisée dans MongoDB Atlas.

**Solution**:
1. Allez dans "Network Access" dans MongoDB Atlas
2. Ajoutez votre IP ou utilisez 0.0.0.0/0 (pour le développement uniquement)

### Problème 4: "Connection timeout"
**Cause**: Le firewall bloque la connexion ou MongoDB n'est pas accessible.

**Solution**:
1. Vérifiez que le port 27017 est ouvert (MongoDB local)
2. Vérifiez que votre firewall/autorouteur autorise les connexions sortantes (MongoDB Atlas)

## 📝 Notes Importantes

1. **Sécurité**: 
   - Ne commitez jamais le fichier `.env` dans Git
   - Utilisez des mots de passe forts pour MongoDB
   - Limitez les IPs autorisées en production

2. **Performance**:
   - MongoDB Atlas gratuit a des limites (512 MB de stockage)
   - Pour la production, envisagez un plan payant

3. **Backup**:
   - Configurez des sauvegardes automatiques dans MongoDB Atlas
   - Pour MongoDB local, configurez des sauvegardes régulières

## 🚀 Après Configuration

Une fois MongoDB configuré et connecté:

1. **Le serveur démarre normalement** sans mode dégradé
2. **Le login fonctionne** correctement
3. **Toutes les fonctionnalités** nécessitant MongoDB fonctionnent

## 📚 Ressources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Local Installation](https://docs.mongodb.com/manual/installation/)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)

