# Guide de Test pour l'Authentification Google

## Date: 2025-01-XX

## ✅ Backend Redémarré

Le backend a été redémarré avec le nouveau code. Il devrait être en cours d'exécution sur le port 5000.

## 🧪 Étapes de Test

### 1. Vérifier que le Backend est Démarré

**Vérifier le port 5000:**
```powershell
netstat -ano | findstr ":5000"
```

Vous devriez voir:
```
TCP    0.0.0.0:5000           0.0.0.0:0              LISTENING       <PID>
```

### 2. Ouvrir le Frontend

**Démarrer le frontend (si ce n'est pas déjà fait):**
```powershell
cd frontend
npm start
```

Le frontend devrait être accessible sur `http://localhost:3000`

### 3. Tester la Connexion Google

1. **Ouvrir le navigateur** et aller sur `http://localhost:3000`
2. **Cliquer sur "Se connecter"** ou "Se connecter avec Google"
3. **Sélectionner un compte Google** dans la popup
4. **Autoriser l'accès** si demandé

### 4. Vérifier les Logs du Backend

**Ouvrir le terminal où le backend tourne** et vérifier les logs. Vous devriez voir:

#### ✅ Logs de Succès

```
🔵 Authentification Google - Token reçu: eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4MDI5MzRmZTBlZWM0Nm...
🔵 Décodage manuel du token JWT...
✅ Token décodé avec succès
   Clés disponibles: ['sub', 'email', 'name', 'picture', 'iat', 'exp', ...]
   sub: QpQTZ9R5haSItaApggJXHw8cYk62
   email: yassine.gmatii@gmail.com
   name: yassin gmatii
✅ Données extraites: { uid: 'QpQTZ9R5haSItaApggJXHw8cYk62', email: 'yassine.gmatii@gmail.com', name: 'yassin gmatii' }
✅ Données finales: { uid: 'QpQTZ9R5haSItaApggJXHw8cYk62', email: 'yassine.gmatii@gmail.com', name: 'yassin gmatii' }
📝 Création d'un nouvel utilisateur...
✅ Nouvel utilisateur créé: 6911d0432e8947bd935bdcb8
✅ Authentification Google réussie
   User ID: 6911d0432e8947bd935bdcb8
   Email: yassine.gmatii@gmail.com
```

#### ❌ Logs d'Erreur

Si vous voyez des erreurs, voici comment les identifier:

**Erreur: Token Invalide**
```
❌ Erreur décodage token: Token invalide: format incorrect. Attendu 3 parties, reçu 2
```
**Solution:** Vérifier que le token est correctement envoyé depuis le frontend

**Erreur: Email Non Trouvé**
```
❌ Email non trouvé dans le token
```
**Solution:** Vérifier que le token contient l'email dans `payload.email` ou `payload.firebase.identities.email`

**Erreur: UID Non Trouvé**
```
❌ UID non trouvé dans le token
⚠️ UID généré automatiquement: google-yassine-gmatii-gmail-com-1234567890
```
**Note:** C'est normal si le token ne contient pas `sub`, un UID sera généré automatiquement

**Erreur: MongoDB**
```
❌ Erreur MongoDB: ...
```
**Solution:** Vérifier la connexion MongoDB et que la base de données est accessible

### 5. Vérifier la Réponse du Backend

**Dans la console du navigateur (F12), vérifier:**

#### ✅ Réponse de Succès

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6911d0432e8947bd935bdcb8",
    "email": "yassine.gmatii@gmail.com",
    "firstName": "yassin",
    "lastName": "gmatii",
    "userType": "student",
    "isVerified": true,
    "isProfileComplete": true
  },
  "message": "Google login successful."
}
```

#### ❌ Réponse d'Erreur

```json
{
  "success": false,
  "message": "Google authentication failed.",
  "error": "..."
}
```

### 6. Vérifier le Comportement du Frontend

**Après la connexion Google, vérifier:**

- ✅ Le token est stocké dans `localStorage`
- ✅ Les données utilisateur sont stockées dans `localStorage`
- ✅ L'utilisateur est redirigé vers le dashboard
- ✅ Aucune erreur dans la console du navigateur

## 🔍 Débogage

### Problème: Le Backend ne Répond Pas

**Vérifier:**
1. Le backend est démarré: `netstat -ano | findstr ":5000"`
2. Les logs du backend montrent des erreurs
3. Les variables d'environnement sont chargées

### Problème: Le Token n'est Pas Décodé

**Vérifier:**
1. Le token est correctement envoyé depuis le frontend
2. Le format du token est correct (3 parties séparées par des points)
3. Les logs du backend montrent l'erreur exacte

### Problème: L'Utilisateur n'est Pas Créé

**Vérifier:**
1. La connexion MongoDB est active
2. Les logs du backend montrent l'erreur MongoDB
3. L'email et l'UID sont extraits correctement du token

## 📝 Checklist de Test

- [ ] Backend redémarré et en cours d'exécution
- [ ] Frontend ouvert sur `http://localhost:3000`
- [ ] Test de connexion Google effectué
- [ ] Logs du backend vérifiés
- [ ] Réponse du backend vérifiée
- [ ] Token stocké dans `localStorage`
- [ ] Utilisateur redirigé vers le dashboard
- [ ] Aucune erreur dans la console du navigateur

## ✅ Résultat Attendu

Après le test, vous devriez avoir:
- ✅ Un token JWT valide stocké dans `localStorage`
- ✅ Les données utilisateur stockées dans `localStorage`
- ✅ L'utilisateur connecté et redirigé vers le dashboard
- ✅ Les logs du backend montrent le processus complet sans erreur

## 🚨 Si des Erreurs Persistent

1. **Vérifier les logs du backend** pour identifier l'erreur exacte
2. **Vérifier la console du navigateur** pour voir les erreurs frontend
3. **Vérifier les variables d'environnement** dans `backend/.env`
4. **Vérifier la connexion MongoDB** et que la base de données est accessible

## 📚 Documentation

- `CORRECTION_GOOGLE_AUTH_COMPLETE.md` - Détails de la correction
- `REDEMARRAGE_BACKEND_GOOGLE_AUTH.md` - Instructions de redémarrage
- `INSTRUCTIONS_DEBUG_GOOGLE_AUTH.md` - Guide de débogage

