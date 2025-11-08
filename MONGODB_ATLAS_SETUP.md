# Configuration MongoDB Atlas - CodeGenesis

## 📋 Informations de Connexion

D'après MongoDB Atlas, votre cluster est configuré avec:

- **Cluster**: `cluster0.whxj5zj.mongodb.net`
- **Utilisateur**: `discord`
- **URI Template**: `mongodb+srv://discord:<db_password>@cluster0.whxj5zj.mongodb.net/?appName=Cluster0`

## 🔧 Étapes de Configuration

### 1. Remplacer le mot de passe dans l'URI

L'URI contient `<db_password>` qui doit être remplacé par le mot de passe réel de l'utilisateur `discord`.

**Important**: Vous devez avoir le mot de passe de l'utilisateur `discord` créé dans MongoDB Atlas.

### 2. Ajouter le nom de la base de données

L'URI doit inclure le nom de la base de données `codegenesis`:

```
mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Mettre à jour backend/.env

Ouvrez le fichier `backend/.env` et remplacez la ligne `MONGODB_URI`:

**Avant**:
```
MONGODB_URI=mongodb://localhost:27017/codegenesis
```

**Après** (remplacez `VOTRE_MOT_DE_PASSE` par votre mot de passe réel):
```
MONGODB_URI=mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
```

### 4. Vérifier Network Access

Assurez-vous que votre IP est autorisée dans MongoDB Atlas:
- Allez dans "Network Access" dans MongoDB Atlas
- Vérifiez que `0.0.0.0/0` (toutes les IPs) est autorisé OU que votre IP est autorisée

### 5. Redémarrer le serveur

```bash
cd backend
npm start
```

Vous devriez voir:
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 5000
```

### 6. Tester la connexion

```bash
node test-server.js
```

Le health check devrait montrer: `"database": "connected"`

## ⚠️ Sécurité

- Ne commitez jamais le fichier `.env` dans Git
- Utilisez un mot de passe fort pour l'utilisateur MongoDB
- Limitez les IPs autorisées en production (ne pas utiliser 0.0.0.0/0)

