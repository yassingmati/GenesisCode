# Guide de Correction - Authentification Firebase

## Problème
Le frontend fonctionne mais l'authentification ne retourne aucune réponse du serveur.

## Solutions Appliquées

### 1. Configuration des Variables d'Environnement Firebase

Les variables d'environnement ont été configurées avec `firebase functions:config:set`:

```bash
firebase functions:config:set mongodb.uri="mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0"
firebase functions:config:set jwt.secret="[généré]"
firebase functions:config:set jwt.admin_secret="[généré]"
firebase functions:config:set client.origin="https://codegenesis-platform.web.app"
```

### 2. Mise à Jour du Code

Le fichier `backend/src/index-firebase.js` a été mis à jour pour:
- Charger les variables depuis `functions.config()` en production
- Fallback vers `process.env` en développement local
- Améliorer les logs de connexion MongoDB
- Augmenter le timeout de connexion MongoDB pour Firebase Functions

### 3. Configuration Frontend

Le frontend utilise maintenant une URL vide pour `REACT_APP_API_BASE_URL`, ce qui permet d'utiliser le même domaine grâce aux rewrites Firebase Hosting.

## Déploiement

### Option 1: Plan Blaze (Recommandé)

Si votre projet est sur le plan Blaze:
```bash
firebase deploy --only functions
```

### Option 2: Plan Spark (Gratuit)

Le plan Spark ne permet pas de déployer de nouvelles fonctions, mais si les fonctions sont déjà déployées, vous pouvez:
1. Mettre à jour la configuration: `firebase functions:config:set ...`
2. Les fonctions existantes utiliseront la nouvelle configuration au prochain redémarrage

## Vérification

### 1. Vérifier la Configuration
```bash
firebase functions:config:get
```

### 2. Tester les Endpoints
```bash
node test-firebase-endpoints.js
```

### 3. Vérifier les Logs
```bash
firebase functions:log --only api
```

## Tests Manuels

### Test Health Endpoint
```bash
curl https://codegenesis-platform.web.app/api/health
```

### Test Login
```bash
curl -X POST https://codegenesis-platform.web.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Problèmes Courants

### 1. "Aucune réponse du serveur"
- **Cause**: Les fonctions Firebase ne sont pas déployées ou ne répondent pas
- **Solution**: Vérifiez les logs Firebase Functions

### 2. "MongoDB connection failed"
- **Cause**: Variables d'environnement non configurées ou MongoDB Atlas Network Access
- **Solution**: Vérifiez `firebase functions:config:get` et Network Access dans MongoDB Atlas

### 3. "CORS error"
- **Cause**: CLIENT_ORIGIN mal configuré
- **Solution**: Vérifiez que `client.origin` correspond à l'URL du frontend

## Prochaines Étapes

1. ✅ Configuration des variables d'environnement
2. ✅ Mise à jour du code pour charger la configuration
3. ⏳ Déploiement des fonctions (nécessite plan Blaze)
4. ⏳ Tests des endpoints
5. ⏳ Vérification depuis le frontend

## Notes Importantes

- Le plan Spark (gratuit) ne permet pas de déployer de nouvelles fonctions
- Les fonctions existantes utiliseront la nouvelle configuration automatiquement
- Pour déployer de nouvelles fonctions, vous devez passer au plan Blaze
- La configuration `functions.config()` sera dépréciée en mars 2026, mais fonctionne encore actuellement

