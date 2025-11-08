# Configuration des Secrets Firebase - CodeGenesis

## Secrets à configurer

Exécutez les commandes suivantes dans le répertoire du projet pour configurer les secrets Firebase :

### 1. MONGODB_URI (Requiert votre URI MongoDB Atlas)

```bash
firebase functions:secrets:set MONGODB_URI
# Entrez votre URI MongoDB Atlas lorsque demandé
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### 2. JWT_SECRET (Secret JWT pour les utilisateurs)

```bash
firebase functions:secrets:set JWT_SECRET
# Entrez le secret JWT suivant lorsque demandé:
# 3231f641bff64eafcbcdddaa7b85b50c45540b54190f8d7ce77273e4fc253fc6ca4f76318205fd70675a673f07a44c52da5ad192e02e2ca4daeaa9dd265908ac
```

### 3. JWT_ADMIN_SECRET (Secret JWT pour les administrateurs)

```bash
firebase functions:secrets:set JWT_ADMIN_SECRET
# Entrez le secret JWT admin suivant lorsque demandé:
# 03c19d2d56f96ce676335058b8d6460be10404157cd50d1f9aef8d1aba6a807b7c827ad1c72bde20b20171e4a2a4a3d94997c5381c653880cd7f355b04a4b6ce
```

### 4. CLIENT_ORIGIN (URL du frontend Firebase Hosting)

```bash
firebase functions:secrets:set CLIENT_ORIGIN
# Entrez: https://codegenesis-platform.web.app
```

### 5. NODE_ENV (Environnement de production)

```bash
firebase functions:secrets:set NODE_ENV
# Entrez: production
```

## Alternative : Configuration via Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez le projet `codegenesis-platform`
3. Allez dans **Functions** → **Configuration** → **Secrets**
4. Cliquez sur **Add secret** pour chaque secret ci-dessus

## Vérification

Pour vérifier que les secrets sont configurés :

```bash
firebase functions:secrets:access
```

## Notes importantes

- **MONGODB_URI** : Vous devez avoir configuré MongoDB Atlas et récupéré l'URI de connexion
- Les secrets JWT ont été générés automatiquement
- CLIENT_ORIGIN doit correspondre à l'URL Firebase Hosting
- Après configuration, redéployez les functions : `firebase deploy --only functions`

