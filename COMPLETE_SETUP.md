# Configuration Complète MongoDB Atlas - CodeGenesis

## 🎯 Objectif

Compléter la configuration MongoDB Atlas pour votre application CodeGenesis.

## 📋 Informations MongoDB Atlas

D'après MongoDB Atlas, votre cluster est configuré avec:
- **Cluster**: `cluster0.whxj5zj.mongodb.net`
- **Utilisateur**: `discord`
- **URI Template**: `mongodb+srv://discord:<db_password>@cluster0.whxj5zj.mongodb.net/?appName=Cluster0`

## 🚀 Option 1: Script Automatique (Recommandé)

1. **Exécuter le script de configuration**
   ```bash
   node setup-mongodb-atlas.js
   ```

2. **Entrer le mot de passe MongoDB**
   - Le script vous demandera le mot de passe de l'utilisateur `discord`
   - Le fichier `.env` sera automatiquement mis à jour

3. **Redémarrer le serveur**
   ```bash
   cd backend
   npm start
   ```

## 🔧 Option 2: Configuration Manuelle

1. **Récupérer le mot de passe**
   - Vous devez avoir le mot de passe de l'utilisateur `discord` créé dans MongoDB Atlas
   - Si vous ne l'avez pas, créez un nouvel utilisateur dans MongoDB Atlas

2. **Construire l'URI complète**
   - Remplacez `<db_password>` par votre mot de passe réel
   - Ajoutez le nom de la base de données `codegenesis`
   - URI finale:
     ```
     mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
     ```

3. **Mettre à jour backend/.env**
   - Ouvrez `backend/.env`
   - Trouvez la ligne `MONGODB_URI=...`
   - Remplacez-la par:
     ```
     MONGODB_URI=mongodb+srv://discord:VOTRE_MOT_DE_PASSE@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
     ```
   - **Remplacez `VOTRE_MOT_DE_PASSE` par votre mot de passe réel**

## ✅ Vérifications Requises

### 1. Network Access dans MongoDB Atlas

Assurez-vous que votre IP est autorisée:
1. Allez dans MongoDB Atlas → Network Access
2. Vérifiez que `0.0.0.0/0` (toutes les IPs) est autorisé OU que votre IP est autorisée
3. Si nécessaire, cliquez sur "Add IP Address" → "Allow Access from Anywhere"

### 2. Database Access dans MongoDB Atlas

Vérifiez que l'utilisateur `discord` existe:
1. Allez dans MongoDB Atlas → Database Access
2. Vérifiez que l'utilisateur `discord` existe
3. Si nécessaire, créez un nouvel utilisateur avec le rôle "Atlas admin"

## 🧪 Test de la Connexion

### 1. Redémarrer le serveur
```bash
cd backend
npm start
```

### 2. Vérifier les logs
Vous devriez voir:
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 5000
```

Si vous voyez:
```
⚠️ Erreur connexion MongoDB: ...
```
Vérifiez:
- Le mot de passe dans l'URI est correct
- Network Access est configuré
- L'utilisateur `discord` existe

### 3. Tester avec le script
```bash
node test-server.js
```

Le health check devrait montrer:
```json
{
  "status": "OK",
  "database": "connected",
  ...
}
```

### 4. Tester le login
```bash
# Créer un utilisateur de test
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","userType":"student"}'

# Se connecter
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📝 Résumé des Étapes

1. ✅ Exécuter `node setup-mongodb-atlas.js` (ou configurer manuellement)
2. ✅ Vérifier Network Access dans MongoDB Atlas
3. ✅ Vérifier Database Access dans MongoDB Atlas
4. ✅ Redémarrer le serveur backend
5. ✅ Tester avec `node test-server.js`
6. ✅ Vérifier que le health check montre `"database": "connected"`

## 🔐 Sécurité

- ⚠️ Ne commitez jamais le fichier `.env` dans Git
- ⚠️ Utilisez un mot de passe fort pour MongoDB
- ⚠️ Limitez les IPs autorisées en production (ne pas utiliser 0.0.0.0/0)
- ⚠️ Gardez votre mot de passe MongoDB secret

## 🆘 Résolution de Problèmes

### Erreur: "Authentication failed"
- Vérifiez que le mot de passe est correct
- Vérifiez que l'utilisateur `discord` existe dans MongoDB Atlas

### Erreur: "Network Access denied"
- Vérifiez que votre IP est autorisée dans Network Access
- Ajoutez `0.0.0.0/0` pour le développement (toutes les IPs)

### Erreur: "Connection timeout"
- Vérifiez que le cluster MongoDB Atlas est actif
- Vérifiez votre connexion internet
- Vérifiez que le firewall n'bloque pas les connexions sortantes

## ✅ Prochaines Étapes

Une fois MongoDB configuré et connecté:
1. Le serveur fonctionnera normalement (pas de mode dégradé)
2. Le login et register fonctionneront correctement
3. Toutes les fonctionnalités nécessitant MongoDB fonctionneront

