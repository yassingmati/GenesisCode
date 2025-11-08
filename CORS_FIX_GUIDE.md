# Guide de Correction CORS - Authentification Firebase

## Problème Identifié

L'erreur CORS se produit parce que le frontend essaie d'accéder à l'URL directe de la fonction Firebase au lieu d'utiliser l'URL relative via les rewrites Firebase Hosting.

**Erreur:**
```
Access to XMLHttpRequest at 'https://us-central1-codegenesis-platform.cloudfunctions.net/api/auth...' 
from origin 'https://codegenesis-platform.web.app' has been blocked by CORS policy
```

## Solutions Appliquées

### 1. Correction du Frontend ✅

**Fichiers modifiés:**
- `frontend/src/pages/auth/auth.jsx`
- `frontend/src/utils/api.jsx`
- `frontend/src/config/api.js`
- 17 autres fichiers frontend

**Changement:**
```javascript
// Avant
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Après
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
```

**Résultat:** En production, le frontend utilise maintenant une URL vide (relative), ce qui permet d'utiliser les rewrites Firebase Hosting et d'éviter les problèmes CORS.

### 2. Amélioration de la Configuration CORS ✅

**Fichier modifié:** `backend/src/index-firebase.js`

**Changements:**
- Ajout de l'URL directe de la fonction Firebase dans les origines autorisées
- Amélioration de la logique de vérification CORS
- Gestion explicite des requêtes OPTIONS (preflight)
- Ajout de logs pour le débogage

**Origines autorisées:**
- `https://codegenesis-platform.web.app` (Frontend)
- `https://codegenesis-platform.firebaseapp.com` (Frontend alternatif)
- `https://us-central1-codegenesis-platform.cloudfunctions.net` (URL directe de la fonction)

## Actions Requises

### 1. Rebuild le Frontend

Le frontend doit être rebuild avec la nouvelle configuration:

```bash
cd frontend
npm run build
```

### 2. Redéployer le Frontend

```bash
firebase deploy --only hosting
```

### 3. Redéployer les Fonctions (si nécessaire)

Si vous avez modifié le backend:

```bash
firebase deploy --only functions
```

### 4. Tester

1. Ouvrez: https://codegenesis-platform.web.app
2. Essayez de vous connecter
3. Vérifiez la console du navigateur (F12) - il ne devrait plus y avoir d'erreurs CORS

## Vérification

### Vérifier que le Frontend utilise l'URL Relative

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet Network
3. Essayez de vous connecter
4. Vérifiez la requête vers `/api/auth/login`
5. L'URL devrait être: `https://codegenesis-platform.web.app/api/auth/login`
6. **Pas:** `https://us-central1-codegenesis-platform.cloudfunctions.net/api/auth/login`

### Vérifier les Headers CORS

Dans la réponse de la requête, vous devriez voir:
```
Access-Control-Allow-Origin: https://codegenesis-platform.web.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

## Dépannage

### Si l'erreur CORS persiste

1. **Vérifiez que le frontend est rebuild:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Vérifiez que le frontend est redéployé:**
   ```bash
   firebase deploy --only hosting
   ```

3. **Videz le cache du navigateur:**
   - Appuyez sur Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
   - Ou ouvrez en navigation privée

4. **Vérifiez les logs Firebase Functions:**
   ```bash
   firebase functions:log --only api
   ```

5. **Vérifiez la configuration CORS dans les logs:**
   - Les logs devraient montrer les origines autorisées
   - Vérifiez qu'il n'y a pas d'erreurs CORS dans les logs

### Si le frontend utilise encore l'URL directe

1. **Vérifiez les variables d'environnement:**
   - Assurez-vous qu'il n'y a pas de `.env` qui définit `REACT_APP_API_BASE_URL`
   - Vérifiez que `.env.production` est vide ou n'existe pas

2. **Rebuild le frontend:**
   ```bash
   cd frontend
   rm -rf build
   npm run build
   ```

3. **Vérifiez le build:**
   - Ouvrez `frontend/build/static/js/main.*.js`
   - Recherchez `API_BASE_URL`
   - Vérifiez qu'il utilise une URL vide en production

## Résumé

**Problème:** CORS bloque les requêtes car le frontend utilise l'URL directe de la fonction Firebase.

**Solution:**
1. ✅ Frontend modifié pour utiliser URL relative en production
2. ✅ Configuration CORS améliorée pour accepter toutes les origines nécessaires
3. ⏳ Rebuild et redéploiement du frontend requis

**Prochaines étapes:**
1. Rebuild le frontend: `cd frontend && npm run build`
2. Redéployer: `firebase deploy --only hosting`
3. Tester l'authentification

