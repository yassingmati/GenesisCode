# Redémarrage du Backend pour l'Authentification Google

## Date: 2025-01-XX

## 🔄 Étapes pour Redémarrer le Backend

### 1. Arrêter le Backend Actuel

Le backend est actuellement en cours d'exécution sur le port 5000 (PID 16480).

**Option 1: Arrêter via PowerShell**
```powershell
taskkill /F /PID 16480
```

**Option 2: Arrêter via Ctrl+C**
- Si le backend tourne dans un terminal, appuyez sur `Ctrl+C`

**Option 3: Trouver et arrêter le processus**
```powershell
# Trouver le processus
netstat -ano | findstr ":5000"

# Arrêter le processus (remplacer PID par le numéro trouvé)
taskkill /F /PID <PID>
```

### 2. Redémarrer le Backend

**Depuis le répertoire backend:**
```powershell
cd backend
npm start
```

**Ou avec nodemon (pour le développement):**
```powershell
cd backend
npm run dev
```

### 3. Vérifier les Logs au Démarrage

Vous devriez voir des logs comme:
```
📄 MONGODB_URI: mongodb+srv://***:***@cluster0.whxj5zj.mongodb.net/...
✅ Connecté à MongoDB: codegenesis
🚀 Serveur démarré sur le port 5000
```

### 4. Vérifier que le Nouveau Code est Chargé

Les logs devraient montrer que le serveur a démarré correctement. Si vous voyez des erreurs, vérifiez:
- ✅ Les variables d'environnement sont chargées
- ✅ MongoDB est connecté
- ✅ Les routes sont montées correctement

## 🧪 Tester avec le Frontend

### 1. Ouvrir le Frontend

Assurez-vous que le frontend est en cours d'exécution:
```powershell
cd frontend
npm start
```

### 2. Tester la Connexion Google

1. **Ouvrir le navigateur** et aller sur `http://localhost:3000`
2. **Cliquer sur "Se connecter avec Google"**
3. **Sélectionner un compte Google**
4. **Vérifier les logs du backend** pour voir le processus complet

### 3. Vérifier les Logs du Backend

Vous devriez voir des logs comme:
```
🔵 Authentification Google - Token reçu: eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4MDI5MzRmZTBlZWM0Nm...
🔵 Décodage manuel du token JWT...
✅ Token décodé avec succès
   Clés disponibles: ['sub', 'email', 'name', 'picture', ...]
   sub: QpQTZ9R5haSItaApggJXHw8cYk62
   email: yassine.gmatii@gmail.com
   name: yassin gmatii
✅ Données extraites: { uid: '...', email: '...', name: '...' }
✅ Données finales: { uid: '...', email: '...', name: '...' }
📝 Création d'un nouvel utilisateur...
✅ Nouvel utilisateur créé: 6911d0432e8947bd935bdcb8
✅ Authentification Google réussie
   User ID: 6911d0432e8947bd935bdcb8
   Email: yassine.gmatii@gmail.com
```

## 🔍 Identifier les Erreurs

### Erreurs Communes

#### 1. Token Invalide
```
❌ Erreur décodage token: Token invalide: format incorrect
```
**Solution:** Vérifier que le token est correctement envoyé depuis le frontend

#### 2. Email Non Trouvé
```
❌ Email non trouvé dans le token
```
**Solution:** Vérifier que le token contient l'email dans `payload.email` ou `payload.firebase.identities.email`

#### 3. UID Non Trouvé
```
❌ UID non trouvé dans le token
⚠️ UID généré automatiquement: google-...
```
**Solution:** Normal si le token ne contient pas `sub`, un UID sera généré automatiquement

#### 4. Erreur MongoDB
```
❌ Erreur MongoDB: ...
```
**Solution:** Vérifier la connexion MongoDB et que la base de données est accessible

## ✅ Vérification Finale

Après le test, vérifiez:
- ✅ Le token JWT est généré correctement
- ✅ L'utilisateur est créé ou trouvé dans MongoDB
- ✅ La réponse contient `success: true`
- ✅ Le frontend reçoit le token et les données utilisateur
- ✅ L'utilisateur est redirigé vers le dashboard

## 📝 Notes

- Le backend doit être redémarré pour charger le nouveau code
- Les logs détaillés montrent chaque étape du processus
- Si une erreur survient, vérifier les logs pour identifier le problème exact

