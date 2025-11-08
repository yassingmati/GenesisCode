# Connecter MongoDB Maintenant - CodeGenesis

## ✅ État Actuel

Le serveur fonctionne correctement mais MongoDB n'est **pas connecté** (mode dégradé actif).

## 🚀 Solution Rapide: MongoDB Atlas

### Étape 1: Configurer l'URI MongoDB Atlas

Exécutez le script de configuration:
```bash
node setup-mongodb-atlas.js
```

Le script vous demandera le mot de passe de l'utilisateur `discord` et mettra à jour automatiquement `backend/.env`.

### Étape 2: Vérifier Network Access

1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Connectez-vous à votre compte
3. Allez dans **Network Access**
4. Vérifiez que `0.0.0.0/0` est autorisé (ou ajoutez-le)

### Étape 3: Redémarrer le Serveur

Le serveur redémarrera automatiquement avec nodemon. Vous devriez voir:
```
✅ Connecté à MongoDB
```

Au lieu de:
```
⚠️ Erreur connexion MongoDB: ...
```

## 🔧 Configuration Manuelle (Alternative)

Si vous préférez configurer manuellement:

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

Une fois MongoDB connecté, testez le login:
- Le frontend devrait pouvoir se connecter
- Les erreurs 503 devraient disparaître
- Le login devrait fonctionner

## 📚 Documentation

- `ETAPES_FINALES.md` - Guide complet étape par étape
- `COMPLETE_SETUP.md` - Guide de configuration MongoDB Atlas
- `setup-mongodb-atlas.js` - Script de configuration automatique

