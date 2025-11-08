# Configurer MongoDB Atlas Maintenant - CodeGenesis

## ✅ État Actuel

- ✅ **Network Access MongoDB Atlas**: Configuré (0.0.0.0/0 actif)
- ✅ **Serveur Backend**: Fonctionne correctement
- ⚠️ **MongoDB**: Non connecté (localhost:27017 configuré)

## 🚀 Configuration MongoDB Atlas

### Option 1: Script depuis le dossier backend (Recommandé)

```bash
cd backend
node setup-mongodb.js
```

Le script vous demandera le mot de passe de l'utilisateur `discord` et mettra à jour automatiquement le fichier `.env`.

### Option 2: Script depuis le dossier racine

```bash
# Depuis le dossier racine du projet
node setup-mongodb-atlas.js
```

### Option 3: Configuration Manuelle

1. **Ouvrez `backend/.env`**

2. **Trouvez la ligne `MONGODB_URI=...`**

3. **Remplacez-la par:**
   ```
   MONGODB_URI=mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
   ```
   **Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe réel de l'utilisateur `discord`**

4. **Sauvegardez le fichier**

5. **Le serveur redémarrera automatiquement** (nodemon détectera le changement)

## ✅ Vérification

Après configuration, vérifiez les logs du serveur. Vous devriez voir:
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 5000
```

Au lieu de:
```
⚠️ Erreur connexion MongoDB: ...
⚠️ Mode dégradé: Le serveur démarre sans MongoDB
```

## 🧪 Test

Une fois MongoDB connecté, testez:

```bash
# Depuis le dossier racine
node test-server.js
```

Le health check devrait montrer: `"database": "connected"`

## 📋 Informations MongoDB Atlas

- **Cluster**: `cluster0.whxj5zj.mongodb.net`
- **Utilisateur**: `discord`
- **Network Access**: ✅ Configuré (0.0.0.0/0 actif)
- **Base de données**: `codegenesis`

## 🎯 Prochaines Étapes

1. ✅ Network Access vérifié (déjà configuré)
2. ⏳ Configurer l'URI MongoDB dans `.env`
3. ⏳ Redémarrer le serveur (automatique avec nodemon)
4. ⏳ Tester la connexion

Une fois MongoDB connecté, tout fonctionnera correctement!

