# Étapes Finales - Configuration MongoDB Atlas

## 🎯 Objectif

Compléter la configuration MongoDB Atlas pour votre application CodeGenesis.

## 📋 Informations MongoDB Atlas

- **Cluster**: `cluster0.whxj5zj.mongodb.net`
- **Utilisateur**: `discord`
- **Base de données**: `codegenesis`

## 🚀 Étapes à Suivre

### Étape 1: Configurer l'URI MongoDB Atlas

**Option A: Script Automatique (Recommandé)**
```bash
node setup-mongodb-atlas.js
```
Le script vous demandera le mot de passe de l'utilisateur `discord` et mettra à jour automatiquement `backend/.env`.

**Option B: Configuration Manuelle**
1. Ouvrez `backend/.env`
2. Trouvez la ligne `MONGODB_URI=...`
3. Remplacez-la par:
   ```
   MONGODB_URI=mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
   ```
4. **Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe réel de l'utilisateur `discord`**

### Étape 2: Vérifier Network Access dans MongoDB Atlas

1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Connectez-vous à votre compte
3. Allez dans **Network Access** (menu de gauche)
4. Vérifiez que `0.0.0.0/0` (toutes les IPs) est autorisé OU que votre IP est autorisée
5. Si nécessaire, cliquez sur **Add IP Address** → **Allow Access from Anywhere** → **Confirm**

### Étape 3: Vérifier Database Access dans MongoDB Atlas

1. Allez dans **Database Access** (menu de gauche)
2. Vérifiez que l'utilisateur `discord` existe
3. Si nécessaire, créez un nouvel utilisateur:
   - Cliquez sur **Add New Database User**
   - Username: `discord`
   - Password: Créez un mot de passe fort et **SAVEZ-LE**
   - Role: **Atlas admin**
   - Cliquez sur **Add User**

### Étape 4: Redémarrer le Serveur

```bash
cd backend
npm start
```

**Vérifiez les logs:**
- ✅ Si vous voyez: `✅ Connecté à MongoDB` → MongoDB est connecté !
- ❌ Si vous voyez: `⚠️ Erreur connexion MongoDB: ...` → Vérifiez le mot de passe et Network Access

### Étape 5: Tester la Connexion

```bash
node test-server.js
```

**Résultats attendus:**
- Health check devrait montrer: `"database": "connected"`
- Login devrait fonctionner (créer un utilisateur d'abord)
- Register devrait créer un utilisateur avec succès

### Étape 6: Tester le Login (Optionnel)

```bash
# Créer un utilisateur de test
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\",\"userType\":\"student\"}"

# Se connecter
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

## ✅ Checklist

- [ ] URI MongoDB Atlas configurée dans `backend/.env`
- [ ] Mot de passe MongoDB correct dans l'URI
- [ ] Network Access configuré dans MongoDB Atlas (0.0.0.0/0 ou votre IP)
- [ ] Utilisateur `discord` existe dans MongoDB Atlas
- [ ] Serveur redémarré (`npm start` dans `backend/`)
- [ ] Logs montrent: `✅ Connecté à MongoDB`
- [ ] Test exécuté: `node test-server.js`
- [ ] Health check montre: `"database": "connected"`

## 🆘 Résolution de Problèmes

### Erreur: "Authentication failed"
- **Cause**: Mot de passe incorrect
- **Solution**: Vérifiez que le mot de passe dans l'URI correspond au mot de passe de l'utilisateur `discord` dans MongoDB Atlas

### Erreur: "Network Access denied"
- **Cause**: Votre IP n'est pas autorisée
- **Solution**: Allez dans MongoDB Atlas → Network Access → Ajoutez `0.0.0.0/0` (pour le développement) ou votre IP spécifique

### Erreur: "Connection timeout"
- **Cause**: Cluster MongoDB Atlas non actif ou problème de connexion
- **Solution**: Vérifiez que le cluster est actif dans MongoDB Atlas et que votre connexion internet fonctionne

## 📚 Documentation

- `COMPLETE_SETUP.md` - Guide complet de configuration
- `MONGODB_ATLAS_SETUP.md` - Guide spécifique MongoDB Atlas
- `setup-mongodb-atlas.js` - Script de configuration automatique
- `test-server.js` - Script de test du serveur

## 🎉 Une Fois Complété

Une fois toutes les étapes complétées:
- ✅ MongoDB sera connecté
- ✅ Le serveur fonctionnera normalement (pas de mode dégradé)
- ✅ Le login et register fonctionneront correctement
- ✅ Toutes les fonctionnalités nécessitant MongoDB fonctionneront

