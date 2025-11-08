# 🔧 Correction des URLs Frontend et CORS

## Problèmes identifiés

1. **URLs hardcodées** : Plusieurs fichiers frontend utilisaient `http://localhost:5000` ou des URLs relatives qui pointaient vers le frontend au lieu du backend Render
2. **CORS** : Le backend renvoyait `http://localhost:3000` dans le header `Access-Control-Allow-Origin` au lieu de `https://codegenesis-platform.web.app`

## Corrections appliquées

### 1. Configuration centralisée de l'API (`frontend/src/utils/apiConfig.js`)

Création d'un fichier centralisé pour gérer l'URL du backend :
- En production : `https://codegenesis-backend.onrender.com`
- En développement : `http://localhost:5000`

### 2. Correction des fichiers frontend

**Fichiers corrigés (28 fichiers)** :
- `frontend/src/components/SubscriptionButton.jsx` : Utilise maintenant `getApiUrl()` au lieu d'une URL relative
- `frontend/src/pages/dashboard/Header.jsx` : Utilise maintenant `getApiUrl('/api')`
- `frontend/src/pages/course/LevelPage.jsx` : Utilise maintenant `getApiUrl('/api/courses')`
- `frontend/src/pages/course/ExercisePage.jsx` : Utilise maintenant `getApiUrl('/api/courses')`
- `frontend/src/pages/admin/CourseManagement.jsx` : Utilise maintenant `getApiUrl()`
- `frontend/src/config/api.js` : BASE_URL pointe maintenant vers Render en production
- Et 22 autres fichiers...

### 3. Correction CORS backend (`backend/src/index.js`)

**Changements** :
- La fonction `origin` du middleware CORS retourne maintenant explicitement l'origine de la requête (`callback(null, origin)`) au lieu de `true`
- Ajout d'un middleware supplémentaire pour forcer le header CORS avec l'origine de la requête
- Vérification explicite des origines autorisées incluant `codegenesis-platform.web.app`

## Prochaines étapes

### 1. Redéployer le backend sur Render

Le backend sera automatiquement redéployé après le push GitHub. Vérifiez les logs Render pour confirmer le déploiement.

### 2. Rebuild et redéployer le frontend

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

### 3. Tester l'application

Après le redéploiement, tester :
- ✅ Connexion/Inscription
- ✅ Chargement des catégories de cours
- ✅ Affichage du profil utilisateur
- ✅ Chargement des plans de paiement
- ✅ Vérifier les headers CORS dans la console du navigateur (devraient montrer `https://codegenesis-platform.web.app`)

## Vérification

### Vérifier les headers CORS

Dans la console du navigateur (DevTools > Network), vérifier que les réponses ont :
```
Access-Control-Allow-Origin: https://codegenesis-platform.web.app
Access-Control-Allow-Credentials: true
```

### Vérifier les requêtes API

Toutes les requêtes API doivent pointer vers :
```
https://codegenesis-backend.onrender.com/api/...
```

Et non vers :
- ❌ `http://localhost:5000/api/...`
- ❌ `https://codegenesis-platform.web.app/api/...`
- ❌ `/api/...` (URL relative)

## Fichiers modifiés

### Frontend (37 fichiers)
- `frontend/src/utils/apiConfig.js` (nouveau)
- `frontend/src/components/*` (10 fichiers)
- `frontend/src/pages/*` (15 fichiers)
- `frontend/src/utils/*` (4 fichiers)
- `frontend/src/config/api.js`
- Et autres...

### Backend (1 fichier)
- `backend/src/index.js` (correction CORS)

## Notes importantes

1. **Variables d'environnement** : Le frontend utilise maintenant `REACT_APP_API_BASE_URL` si défini, sinon utilise la logique par défaut
2. **Développement local** : En développement (`NODE_ENV !== 'production'`), les URLs pointent vers `http://localhost:5000`
3. **Production** : En production, les URLs pointent vers `https://codegenesis-backend.onrender.com`

## Support

Si des problèmes persistent :
1. Vérifier les logs Render du backend
2. Vérifier la console du navigateur pour les erreurs CORS
3. Vérifier que `NODE_ENV=production` est défini dans Render
4. Vérifier que `CLIENT_ORIGIN` n'est pas défini dans Render (ou défini à `https://codegenesis-platform.web.app`)

