# Guide Complet - Déploiement Firebase Functions

## Étape 1: Passer au Plan Blaze

### Pourquoi le Plan Blaze est Nécessaire

Le plan Spark (gratuit) ne permet pas de déployer des fonctions Firebase car il nécessite des APIs Google Cloud qui ne sont disponibles que sur le plan Blaze.

### Avantages du Plan Blaze

- ✅ **Niveau gratuit généreux**: 2 millions d'invocations/mois gratuites
- ✅ **Pas de coût si vous restez dans les limites gratuites**
- ✅ **Facturation uniquement si vous dépassez les limites**
- ✅ **Accès à toutes les fonctionnalités Firebase**

### Comment Passer au Plan Blaze

1. **Ouvrez la console Firebase:**
   - Allez sur: https://console.firebase.google.com/project/codegenesis-platform/usage/details
   - Ou connectez-vous à Firebase Console et sélectionnez votre projet

2. **Cliquez sur "Upgrade to Blaze"**
   - Vous verrez un bouton pour passer au plan Blaze
   - Cliquez dessus

3. **Configurez la facturation:**
   - Ajoutez une méthode de paiement (carte de crédit)
   - **Important**: Vous ne serez facturé que si vous dépassez les limites gratuites
   - Les 2 premiers millions d'invocations/mois sont gratuits

4. **Confirmez l'upgrade:**
   - Lisez et acceptez les conditions
   - Confirmez l'upgrade

### Vérifier que l'Upgrade est Terminé

Après l'upgrade, attendez quelques minutes puis vérifiez:

```bash
firebase projects:list
```

Vous devriez voir votre projet avec le plan Blaze activé.

## Étape 2: Déployer les Fonctions

Une fois le plan Blaze activé, déployez les fonctions:

```bash
cd "D:\startup (2)\startup\CodeGenesis"
firebase deploy --only functions
```

### Ce qui se passe pendant le déploiement

1. **Installation des dépendances**: Les dépendances du backend sont installées
2. **Build**: Le code est compilé et préparé
3. **Déploiement**: Les fonctions sont déployées sur Firebase
4. **Activation**: Les APIs nécessaires sont activées automatiquement

### Temps de déploiement

- Premier déploiement: 3-5 minutes
- Déploiements suivants: 1-2 minutes

## Étape 3: Vérifier le Déploiement

### Vérifier que les fonctions sont déployées

```bash
firebase functions:list
```

Vous devriez voir:
```
┌──────────┬─────────┬─────────┬──────────┬────────┬─────────┐
│ Function │ Version │ Trigger │ Location │ Memory │ Runtime │
├──────────┼─────────┼─────────┼──────────┼────────┼─────────┤
│ api      │ 1       │ HTTPS   │ us-central1 │ 512MB │ nodejs18 │
└──────────┴─────────┴─────────┴──────────┴────────┴─────────┘
```

### Obtenir l'URL de la fonction

L'URL de la fonction sera:
```
https://us-central1-codegenesis-platform.cloudfunctions.net/api
```

Grâce aux rewrites Firebase Hosting, vous pouvez aussi utiliser:
```
https://codegenesis-platform.web.app/api/*
```

## Étape 4: Tester les Endpoints

### Test automatique

```bash
node test-firebase-endpoints.js
```

### Test manuel - Health Endpoint

```bash
curl https://codegenesis-platform.web.app/api/health
```

Réponse attendue:
```json
{
  "status": "OK",
  "database": "connected",
  "timestamp": "2024-...",
  "uptime": 123.45,
  "memory": {...},
  "version": "1.0.0"
}
```

### Test manuel - Login

```bash
curl -X POST https://codegenesis-platform.web.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Étape 5: Vérifier les Logs

### Voir les logs en temps réel

```bash
firebase functions:log --only api
```

### Filtrer les logs par niveau

```bash
# Erreurs uniquement
firebase functions:log --only api | grep "Error"

# Logs récents
firebase functions:log --only api --limit 50
```

## Étape 6: Tester depuis le Frontend

1. **Ouvrez votre application:**
   - Allez sur: https://codegenesis-platform.web.app

2. **Essayez de vous connecter:**
   - Utilisez un compte existant ou créez-en un nouveau
   - Vérifiez la console du navigateur (F12) pour les erreurs

3. **Vérifiez les requêtes réseau:**
   - Ouvrez l'onglet Network dans les DevTools
   - Filtrez par "api"
   - Vérifiez que les requêtes vers `/api/auth/login` fonctionnent

## Dépannage

### Erreur: "Functions must be on Blaze plan"

**Solution**: Passez au plan Blaze (voir Étape 1)

### Erreur: "MongoDB connection failed"

**Vérifications:**
1. Vérifiez la configuration: `firebase functions:config:get`
2. Vérifiez Network Access dans MongoDB Atlas (doit être 0.0.0.0/0)
3. Vérifiez les logs: `firebase functions:log --only api`

### Erreur: "404 Page not found"

**Causes possibles:**
1. Les fonctions ne sont pas déployées
2. Les rewrites Firebase Hosting ne sont pas configurés
3. L'URL est incorrecte

**Solutions:**
1. Vérifiez: `firebase functions:list`
2. Vérifiez `firebase.json` pour les rewrites
3. Utilisez l'URL directe: `https://us-central1-codegenesis-platform.cloudfunctions.net/api`

### Erreur: "CORS error"

**Solution**: Vérifiez que `CLIENT_ORIGIN` est correctement configuré:
```bash
firebase functions:config:get
```

Doit contenir:
```json
{
  "client": {
    "origin": "https://codegenesis-platform.web.app"
  }
}
```

## Coûts Estimés

### Plan Blaze - Niveau Gratuit

- **2 millions d'invocations/mois**: Gratuit
- **400,000 GB-secondes de calcul/mois**: Gratuit
- **200,000 CPU-secondes/mois**: Gratuit
- **5 GB de sortie réseau/mois**: Gratuit

### Au-delà du niveau gratuit

- **Invocations**: $0.40 par million
- **Temps de calcul**: $0.0000025 par GB-seconde
- **Réseau**: $0.12 par GB

### Estimation pour votre application

Pour une application avec ~1000 utilisateurs actifs:
- **Invocations/mois**: ~500,000 (bien dans les limites gratuites)
- **Coût estimé**: **$0/mois** (gratuit)

## Commandes Rapides

```bash
# Vérifier la configuration
firebase functions:config:get

# Déployer les fonctions
firebase deploy --only functions

# Vérifier les fonctions déployées
firebase functions:list

# Voir les logs
firebase functions:log --only api

# Tester les endpoints
node test-firebase-endpoints.js

# Tester l'URL directe
node test-firebase-direct-url.js
```

## Prochaines Étapes

Après le déploiement réussi:

1. ✅ Tester l'authentification depuis le frontend
2. ✅ Vérifier que les utilisateurs peuvent se connecter
3. ✅ Vérifier que les routes protégées fonctionnent
4. ✅ Monitorer les logs pour détecter les erreurs
5. ✅ Configurer des alertes si nécessaire

## Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs: `firebase functions:log --only api`
2. Vérifiez la configuration: `firebase functions:config:get`
3. Vérifiez Network Access dans MongoDB Atlas
4. Consultez la documentation Firebase: https://firebase.google.com/docs/functions

