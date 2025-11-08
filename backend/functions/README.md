# Firebase Functions pour CodeGenesis

Ce dossier contient les fonctions Firebase qui servent l'API backend Express.

## Configuration des Variables d'Environnement

Les variables d'environnement doivent être configurées via Firebase Console ou CLI.

### Variables Requises

- `MONGODB_URI` : URL de connexion MongoDB Atlas
- `JWT_SECRET` : Secret JWT pour les utilisateurs
- `JWT_ADMIN_SECRET` : Secret JWT pour les administrateurs
- `CLIENT_ORIGIN` : URL du frontend (Firebase Hosting)
- `NODE_ENV` : `production`

### Variables Optionnelles

- `STRIPE_SECRET_KEY` : Clé secrète Stripe (si vous utilisez Stripe)
- `STRIPE_WEBHOOK_SECRET` : Secret webhook Stripe

### Configuration via Firebase CLI

```bash
# Définir les variables d'environnement
firebase functions:config:set \
  mongodb.uri="mongodb+srv://..." \
  jwt.secret="..." \
  jwt.admin_secret="..." \
  client.origin="https://your-project.web.app"

# OU utiliser Firebase Secrets (recommandé pour les secrets)
firebase functions:secrets:set MONGODB_URI
firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set JWT_ADMIN_SECRET
```

## Déploiement

```bash
# Déployer uniquement les functions
firebase deploy --only functions

# Déployer toutes les functions
firebase deploy
```

## Logs

```bash
# Voir les logs en temps réel
firebase functions:log

# Filtrer par fonction
firebase functions:log --only api
```

## Structure

- `index.js` : Point d'entrée Firebase Functions
- `../src/index-firebase.js` : Application Express adaptée pour Firebase

