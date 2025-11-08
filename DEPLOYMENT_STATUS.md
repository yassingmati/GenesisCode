# État du Déploiement Firebase - CodeGenesis

## ✅ Déploiement Complété

### Frontend (Firebase Hosting)
- **Status**: ✅ Déployé avec succès
- **URL**: https://codegenesis-platform.web.app
- **Build**: Construit avec succès dans `frontend/build`
- **Configuration**: `.env.production` configuré avec l'URL Firebase Functions

### Backend (Firebase Functions)
- **Status**: ⚠️ Nécessite le plan Blaze (pay-as-you-go)
- **Raison**: Firebase Functions nécessite le plan Blaze pour être déployées
- **Action requise**: Mettre à niveau le projet Firebase vers le plan Blaze

## 📋 Prochaines Étapes

### 1. Mettre à niveau vers le plan Blaze

1. Allez sur [Firebase Console - Upgrade](https://console.firebase.google.com/project/codegenesis-platform/usage/details)
2. Cliquez sur **Upgrade to Blaze plan**
3. Suivez les instructions pour activer le plan pay-as-you-go
4. Note : Le plan Blaze a un niveau gratuit généreux pour Firebase Functions

### 2. Configurer les secrets Firebase

Après avoir activé le plan Blaze, configurez les secrets Firebase :

```bash
cd "D:\startup (2)\startup\CodeGenesis"
```

Voir le fichier `FIREBASE_SECRETS_SETUP.md` pour les instructions détaillées.

### 3. Déployer les Firebase Functions

Une fois le plan Blaze activé et les secrets configurés :

```bash
firebase deploy --only functions
```

### 4. Redéployer le hosting (si nécessaire)

Les routes `/api/**` dans `firebase.json` redirigeront vers la Firebase Function `api` une fois déployée.

```bash
firebase deploy --only hosting
```

## 🔧 Configuration Actuelle

### Frontend
- **URL de production**: https://codegenesis-platform.web.app
- **API URL configurée**: https://us-central1-codegenesis-platform.cloudfunctions.net/api
- **Note**: L'API ne fonctionnera que lorsque les Firebase Functions seront déployées

### Backend
- **Firebase Function**: `api` (dans `backend/functions/index.js`)
- **Express App**: `backend/src/index-firebase.js`
- **Secrets requis**: MONGODB_URI, JWT_SECRET, JWT_ADMIN_SECRET, CLIENT_ORIGIN, NODE_ENV

## 📝 Notes Importantes

1. **Plan Blaze**: Le plan Blaze de Firebase est gratuit jusqu'à un certain quota (très généreux pour la plupart des applications)
2. **MongoDB Atlas**: Vous devez avoir configuré MongoDB Atlas et récupéré l'URI de connexion
3. **Secrets Firebase**: Les secrets doivent être configurés avant de déployer les functions
4. **Hosting**: Le frontend est déjà accessible mais l'API ne fonctionnera pas tant que les functions ne sont pas déployées

## 🚀 Vérification

### Tester le Frontend
- Visitez: https://codegenesis-platform.web.app
- Le frontend devrait se charger, mais les appels API échoueront jusqu'à ce que les functions soient déployées

### Tester les Functions (après déploiement)
- Health check: https://us-central1-codegenesis-platform.cloudfunctions.net/api/health
- API: https://us-central1-codegenesis-platform.cloudfunctions.net/api

## 📚 Ressources

- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)

