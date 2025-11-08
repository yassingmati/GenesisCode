# 🔧 Configuration des Variables d'Environnement sur Render

## 📋 Variables d'Environnement Requises

### Variables OBLIGATOIRES (Minimum pour que l'application fonctionne)

1. **MONGODB_URI**
   - **Description**: Chaîne de connexion MongoDB Atlas
   - **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - **Où l'obtenir**: MongoDB Atlas > Connect > Connect your application
   - **Exemple**: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority`

2. **JWT_SECRET**
   - **Description**: Clé secrète pour signer les tokens JWT des utilisateurs
   - **Format**: Chaîne aléatoire sécurisée (minimum 32 caractères)
   - **Comment générer**: 
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **Exemple**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

3. **JWT_ADMIN_SECRET**
   - **Description**: Clé secrète pour signer les tokens JWT des administrateurs
   - **Format**: Chaîne aléatoire sécurisée différente de JWT_SECRET (minimum 32 caractères)
   - **Comment générer**: 
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - **Exemple**: `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4`

4. **CLIENT_ORIGIN**
   - **Description**: URL du frontend pour CORS et redirections
   - **Format**: URL complète sans slash final
   - **Exemple**: `https://codegenesis-platform.web.app`

5. **NODE_ENV**
   - **Description**: Environnement d'exécution
   - **Valeurs possibles**: `production` ou `development`
   - **Valeur recommandée**: `production`

### Variables OPTIONNELLES (Recommandées)

6. **APP_BASE_URL**
   - **Description**: URL de base de l'application (pour redirections après paiement)
   - **Format**: URL complète
   - **Exemple**: `https://codegenesis-platform.web.app`

7. **CLIENT_URL**
   - **Description**: URL client pour les redirections (peut être identique à CLIENT_ORIGIN)
   - **Format**: URL complète
   - **Exemple**: `https://codegenesis-platform.web.app`

8. **PORT**
   - **Description**: Port du serveur
   - **Note**: Render définit automatiquement PORT, mais vous pouvez le spécifier
   - **Valeur par défaut**: `5000`

### Variables OPTIONNELLES (Services externes)

16. **STRIPE_SECRET_KEY**
   - **Description**: Clé secrète Stripe (si vous utilisez Stripe)
   - **Où l'obtenir**: https://dashboard.stripe.com/apikeys
   - **Format**: `sk_test_...` ou `sk_live_...`

17. **STRIPE_WEBHOOK_SECRET**
    - **Description**: Secret webhook Stripe (pour valider les webhooks)
    - **Où l'obtenir**: https://dashboard.stripe.com/webhooks
    - **Format**: `whsec_...`

18. **KONNECT_API_KEY**
    - **Description**: Clé API Konnect (si vous utilisez Konnect pour les paiements)
    - **Où l'obtenir**: Votre dashboard Konnect
    - **Format**: Votre clé API Konnect

22. **FIREBASE_PROJECT_ID**
    - **Description**: ID du projet Firebase
    - **Où l'obtenir**: Firebase Console > Project Settings

23. **FIREBASE_CLIENT_EMAIL**
    - **Description**: Email du compte de service Firebase
    - **Format**: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
    - **Où l'obtenir**: Firebase Console > Project Settings > Service Accounts

24. **FIREBASE_PRIVATE_KEY**
    - **Description**: Clé privée Firebase (compte de service)
    - **Format**: 
      ```
      -----BEGIN PRIVATE KEY-----
      ...
      -----END PRIVATE KEY-----
      ```
    - **Important**: Dans Render, vous devez inclure les vrais sauts de ligne
    - **Où l'obtenir**: Firebase Console > Project Settings > Service Accounts > Generate new private key

25. **FIREBASE_PRIVATE_KEY_ID**
    - **Description**: ID de la clé privée Firebase
    - **Où l'obtenir**: Dans le fichier JSON du compte de service Firebase

26. **FIREBASE_CLIENT_ID**
    - **Description**: ID client Firebase
    - **Où l'obtenir**: Dans le fichier JSON du compte de service Firebase

27. **FIREBASE_CLIENT_X509_CERT_URL**
    - **Description**: URL du certificat X509 Firebase
    - **Format**: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com`
    - **Où l'obtenir**: Dans le fichier JSON du compte de service Firebase

28. **FIREBASE_STORAGE_BUCKET**
    - **Description**: Bucket de stockage Firebase
    - **Format**: `your-project.appspot.com`
    - **Où l'obtenir**: Firebase Console > Storage

29. **FIREBASE_WEB_API_KEY**
    - **Description**: Clé API web Firebase (pour l'authentification côté client)
    - **Où l'obtenir**: Firebase Console > Project Settings > General > Web API Key

## 🚀 Comment Ajouter les Variables sur Render

### Méthode 1: Via le Dashboard Render

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service backend
3. Cliquez sur "Environment" dans le menu de gauche
4. Ajoutez chaque variable d'environnement une par une:
   - Cliquez sur "Add Environment Variable"
   - Entrez le nom de la variable (ex: `MONGODB_URI`)
   - Entrez la valeur de la variable
   - Cliquez sur "Save Changes"
5. Répétez pour toutes les variables requises
6. Render redéploiera automatiquement votre service

### Méthode 2: Via le fichier render.yaml (Recommandé)

Si vous utilisez `render.yaml`, vous pouvez définir les variables d'environnement dans le fichier:

```yaml
services:
  - type: web
    name: codegenesis-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: JWT_ADMIN_SECRET
        sync: false
      - key: CLIENT_ORIGIN
        value: https://codegenesis-platform.web.app
      - key: NODE_ENV
        value: production
```

**Note**: Les variables avec `sync: false` doivent être définies manuellement dans le dashboard Render.

## 🔐 Génération de Secrets JWT

Pour générer des secrets JWT sécurisés:

```bash
# Ouvrez un terminal Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Exécutez cette commande deux fois pour obtenir deux secrets différents (un pour JWT_SECRET et un pour JWT_ADMIN_SECRET).

## 📝 Exemple de Configuration Complète

Voici un exemple de configuration complète pour Render:

```
# Variables Requises
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_ADMIN_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
CLIENT_ORIGIN=https://codegenesis-platform.web.app
NODE_ENV=production

# Variables Recommandées
APP_BASE_URL=https://codegenesis-platform.web.app
CLIENT_URL=https://codegenesis-platform.web.app
SERVER_URL=https://codegenesis-backend.onrender.com

# Variables Email (Pour la validation d'email)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Variables Optionnelles (Services externes)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# KONNECT_API_KEY=your-konnect-api-key
# KONNECT_RECEIVER_WALLET_ID=your-receiver-wallet-id
# FIREBASE_PROJECT_ID=your-firebase-project-id
# etc.
```

## ⚠️ Notes Importantes

1. **Sécurité**:
   - Ne commitez JAMAIS le fichier `.env` avec des valeurs réelles
   - Utilisez des secrets forts pour JWT_SECRET et JWT_ADMIN_SECRET
   - Ne partagez jamais vos secrets publiquement

2. **MongoDB Atlas**:
   - Assurez-vous que votre IP est autorisée dans MongoDB Atlas
   - Pour Render, autorisez `0.0.0.0/0` (toutes les IPs) ou les IPs spécifiques de Render
   - Vérifiez que l'utilisateur MongoDB a les bonnes permissions

3. **CORS**:
   - CLIENT_ORIGIN doit être l'URL exacte de votre frontend (sans slash final)
   - Assurez-vous que l'URL correspond à celle de votre frontend déployé

4. **Firebase Private Key**:
   - Dans Render, pour FIREBASE_PRIVATE_KEY, vous devez inclure les vrais sauts de ligne
   - Copiez la clé privée telle qu'elle apparaît dans le fichier JSON du compte de service
   - Assurez-vous que tous les sauts de ligne sont présents

5. **Redéploiement**:
   - Après avoir ajouté/modifié des variables d'environnement, Render redéploiera automatiquement votre service
   - Vérifiez les logs après le redéploiement pour vous assurer que tout fonctionne

6. **Configuration Email (Gmail)**:
   - Activez la vérification en 2 étapes sur votre compte Gmail
   - Créez un "Mot de passe d'application" depuis: https://myaccount.google.com/apppasswords
   - Utilisez ce mot de passe dans EMAIL_PASS (sans espaces)
   - Assurez-vous que SERVER_URL pointe vers l'URL de votre backend Render
   - Testez l'envoi d'email en utilisant l'endpoint `/api/auth/send-verification`

## 🔍 Vérification

Après avoir configuré les variables d'environnement, vérifiez que tout fonctionne:

1. Vérifiez les logs Render pour voir si l'application démarre correctement
2. Testez l'endpoint `/api/health` pour vérifier que le serveur répond
3. Testez l'authentification pour vérifier que JWT_SECRET fonctionne
4. Testez la connexion MongoDB pour vérifier que MONGODB_URI est correct

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs Render
2. Vérifiez que toutes les variables requises sont définies
3. Vérifiez que les valeurs sont correctes (pas d'espaces supplémentaires, etc.)
4. Vérifiez que MongoDB Atlas autorise les connexions depuis Render

