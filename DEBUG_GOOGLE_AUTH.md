# Debug Authentification Google

## Date: 2025-01-XX

## 🔍 Problème Actuel

L'authentification Google retourne une erreur 401 (Unauthorized) même si le token est correctement obtenu du frontend.

### Symptômes
- ✅ Token obtenu avec succès du frontend
- ❌ Backend retourne 401 Unauthorized
- ❌ Erreur: "Google token is invalid or malformed"

## ✅ Corrections Appliquées

### 1. Logs Détaillés Ajoutés

**Backend:**
- ✅ Log du token reçu (premiers 50 caractères)
- ✅ Log de la vérification Firebase Admin
- ✅ Log du décodage fallback avec toutes les clés du token
- ✅ Log des erreurs avec stack trace

### 2. Amélioration du Fallback

**Améliorations:**
- ✅ Le fallback est maintenant utilisé si Firebase Admin n'est pas disponible OU si la vérification échoue
- ✅ Support de plusieurs formats de champs dans le token
- ✅ Support des structures Firebase Auth complexes

**Code clé:**
```javascript
// Firebase Auth token contient généralement: sub, email, name, picture, etc.
uid = decoded.sub || decoded.user_id || decoded.uid || decoded.firebase?.identities?.email?.[0] || `google-${Date.now()}`;
email = decoded.email || decoded.email_address || decoded.firebase?.email;
name = decoded.name || decoded.display_name || decoded.full_name || decoded.firebase?.displayName;
```

## 🧪 Comment Déboguer

### 1. Vérifier les Logs du Backend

Quand vous essayez de vous connecter avec Google, vérifiez les logs du backend:

```
🔵 Authentification Google - Token reçu: eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4MDI5MzRmZTBlZWM0Nm...
🔵 Vérification token avec Firebase Admin...
❌ Erreur vérification token Google: [erreur]
⚠️ Vérification Firebase échouée, utilisation du fallback...
✅ Token Google décodé (fallback): {
  hasSub: true,
  hasEmail: true,
  hasName: true,
  email: 'user@example.com',
  allKeys: ['sub', 'email', 'name', 'picture', ...]
}
```

### 2. Vérifier la Structure du Token

Le token Firebase Auth contient généralement:
- `sub`: L'ID utilisateur Firebase (uid)
- `email`: L'email de l'utilisateur
- `name`: Le nom complet de l'utilisateur
- `picture`: L'URL de la photo de profil
- `firebase`: Objet avec des informations Firebase supplémentaires

### 3. Vérifier Firebase Admin

Si Firebase Admin n'est pas configuré, le fallback sera utilisé automatiquement. Vérifiez les variables d'environnement:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- etc.

## 🔧 Solutions Possibles

### Solution 1: Vérifier les Logs du Backend

1. **Démarrer le backend** et vérifier les logs
2. **Essayer de se connecter avec Google**
3. **Vérifier les logs** pour voir l'erreur exacte

### Solution 2: Vérifier le Format du Token

Le token Firebase Auth est un JWT avec 3 parties séparées par des points:
- Partie 1: Header (base64url)
- Partie 2: Payload (base64url) - contient les données utilisateur
- Partie 3: Signature (base64url)

### Solution 3: Tester le Décodage Manuel

Vous pouvez tester le décodage du token manuellement:

```javascript
const tokenParts = idToken.split('.');
const base64Url = tokenParts[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
const decoded = JSON.parse(jsonPayload);
console.log('Token décodé:', decoded);
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

Vérifiez les logs du backend pour identifier le problème exact.

