# Instructions pour Déboguer l'Authentification Google

## Date: 2025-01-XX

## 🔍 Problème Actuel

L'authentification Google retourne une erreur 401 (Unauthorized) même si le token est correctement obtenu du frontend.

## 📋 Étapes pour Déboguer

### 1. Vérifier les Logs du Backend

**Important:** Le backend doit être en cours d'exécution pour voir les logs.

1. **Ouvrir le terminal où le backend tourne**
2. **Essayer de se connecter avec Google depuis le frontend**
3. **Vérifier les logs dans le terminal du backend**

Vous devriez voir des logs comme:
```
🔵 Authentification Google - Token reçu: eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4MDI5MzRmZTBlZWM0Nm...
⚠️ Firebase Admin non disponible ou vérification échouée - décodage token Google sans vérification
✅ Token Google décodé (fallback): {
  hasSub: true,
  hasEmail: true,
  hasName: true,
  email: 'yassine.gmatii@gmail.com',
  allKeys: ['sub', 'email', 'name', 'picture', ...],
  decodedSample: { sub: '...', email: '...', name: '...' }
}
✅ Données extraites du token: { uid: '...', email: '...', name: '...' }
```

### 2. Identifier l'Erreur Exacte

Les logs indiquent:
- ✅ Si le token est reçu
- ✅ Si le décodage fonctionne
- ✅ Quels champs sont présents dans le token
- ✅ Si l'email et l'uid sont extraits correctement
- ❌ L'erreur exacte si quelque chose échoue

### 3. Vérifier la Structure du Token

Le token Firebase Auth contient généralement:
- `sub`: L'ID utilisateur Firebase (uid) - **OBLIGATOIRE**
- `email`: L'email de l'utilisateur - **OBLIGATOIRE**
- `name`: Le nom complet de l'utilisateur
- `picture`: L'URL de la photo de profil
- `firebase`: Objet avec des informations Firebase supplémentaires
  - `identities`: { email: ['email@example.com'] }
  - `sign_in_provider`: 'google.com'

### 4. Vérifier Firebase Admin

Si Firebase Admin n'est pas configuré, le fallback sera utilisé automatiquement. Vérifiez les variables d'environnement dans `backend/.env`:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_CLIENT_X509_CERT_URL`

## 🔧 Solutions Possibles

### Solution 1: Vérifier les Logs du Backend

1. **Démarrer le backend** si ce n'est pas déjà fait
2. **Essayer de se connecter avec Google**
3. **Vérifier les logs** pour voir l'erreur exacte

### Solution 2: Vérifier le Format du Token

Le token Firebase Auth est un JWT avec 3 parties séparées par des points:
- Partie 1: Header (base64url)
- Partie 2: Payload (base64url) - contient les données utilisateur
- Partie 3: Signature (base64url)

### Solution 3: Tester avec un Token Factice

Le test `test-auth-complete.js` crée un token factice pour tester le décodage. Exécutez:
```bash
node test-auth-complete.js
```

## 📝 Prochaines Étapes

1. **Vérifier les logs du backend** lors de la tentative de connexion Google
2. **Identifier l'erreur exacte** dans les logs
3. **Corriger le problème** selon l'erreur trouvée

## ✅ Conclusion

Le code a été amélioré avec:
- ✅ Logs détaillés pour le débogage
- ✅ Fallback amélioré pour décoder le token
- ✅ Support de plusieurs formats de champs
- ✅ Gestion d'erreur améliorée

**Vérifiez les logs du backend pour identifier le problème exact.**

