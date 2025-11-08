# 🔧 Configuration Complète des Variables d'Environnement sur Render

## 📋 Liste Complète des Variables d'Environnement

### ✅ Variables REQUISES (Obligatoires)

#### 1. MONGODB_URI
- **Description**: Chaîne de connexion MongoDB Atlas
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Où l'obtenir**: MongoDB Atlas > Connect > Connect your application
- **Exemple**: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority`

#### 2. JWT_SECRET
- **Description**: Clé secrète pour signer les tokens JWT des utilisateurs
- **Format**: Chaîne aléatoire sécurisée (minimum 32 caractères)
- **Comment générer**: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Exemple**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

#### 3. JWT_ADMIN_SECRET
- **Description**: Clé secrète pour signer les tokens JWT des administrateurs
- **Format**: Chaîne aléatoire sécurisée différente de JWT_SECRET (minimum 32 caractères)
- **Comment générer**: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Exemple**: `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4`

#### 4. CLIENT_ORIGIN
- **Description**: URL du frontend pour CORS et redirections
- **Format**: URL complète sans slash final
- **Exemple**: `https://codegenesis-platform.web.app`

#### 5. NODE_ENV
- **Description**: Environnement d'exécution
- **Valeurs possibles**: `production` ou `development`
- **Valeur recommandée**: `production`

#### 6. EMAIL_USER
- **Description**: Adresse email utilisée pour envoyer les emails de vérification
- **Format**: `votre-email@gmail.com`
- **Où l'obtenir**: Votre adresse Gmail (ou autre service email)
- **Note**: Pour Gmail, vous devez activer la vérification en 2 étapes

#### 7. EMAIL_PASS
- **Description**: Mot de passe de l'application Gmail (App Password)
- **Format**: Mot de passe d'application Gmail (sans espaces)
- **Où l'obtenir**: 
  1. Activez la vérification en 2 étapes sur Gmail
  2. Allez sur https://myaccount.google.com/apppasswords
  3. Créez un "Mot de passe d'application"
  4. Utilisez ce mot de passe (sans espaces)
- **Important**: Ne pas utiliser votre mot de passe Gmail normal

#### 8. SERVER_URL
- **Description**: URL du serveur backend (pour les liens de vérification d'email, etc.)
- **Format**: URL complète de votre backend Render
- **Exemple**: `https://codegenesis-backend.onrender.com`
- **Note**: Utilisée pour générer les liens de vérification d'email

### ✅ Variables RECOMMANDÉES (Optionnelles mais recommandées)

#### 9. APP_BASE_URL
- **Description**: URL de base de l'application (pour redirections après paiement)
- **Format**: URL complète
- **Exemple**: `https://codegenesis-platform.web.app`

#### 10. CLIENT_URL
- **Description**: URL client pour les redirections (peut être identique à CLIENT_ORIGIN)
- **Format**: URL complète
- **Exemple**: `https://codegenesis-platform.web.app`

#### 11. PORT
- **Description**: Port du serveur
- **Note**: Render définit automatiquement PORT, mais vous pouvez le spécifier
- **Valeur par défaut**: `5000`

### 📧 Variables EMAIL (Configuration avancée - Optionnelles)

#### 12. EMAIL_SERVICE
- **Description**: Service email à utiliser
- **Valeurs possibles**: `gmail`, `outlook`, `yahoo`, `sendgrid`, etc.
- **Valeur par défaut**: `gmail`

#### 13. EMAIL_HOST
- **Description**: Host SMTP personnalisé (si vous n'utilisez pas Gmail)
- **Format**: `smtp.gmail.com` (pour Gmail)
- **Note**: Généré automatiquement selon EMAIL_SERVICE si non spécifié

#### 14. EMAIL_PORT
- **Description**: Port SMTP
- **Valeurs possibles**: `587` (TLS), `465` (SSL), `25` (non sécurisé)
- **Valeur par défaut**: `587`

#### 15. EMAIL_SECURE
- **Description**: Utiliser une connexion sécurisée (TLS/SSL)
- **Valeurs possibles**: `true` ou `false`
- **Valeur par défaut**: `false` (utilise TLS sur le port 587)

#### 16. EMAIL_FROM
- **Description**: Email de l'expéditeur (peut être différent de EMAIL_USER)
- **Format**: `noreply@codegenesis-platform.web.app`
- **Note**: Par défaut, utilise EMAIL_USER si non spécifié

### 💳 Variables STRIPE (Optionnelles)

#### 17. STRIPE_SECRET_KEY
- **Description**: Clé secrète Stripe (si vous utilisez Stripe)
- **Où l'obtenir**: https://dashboard.stripe.com/apikeys
- **Format**: `sk_test_...` ou `sk_live_...`

#### 18. STRIPE_WEBHOOK_SECRET
- **Description**: Secret webhook Stripe (pour valider les webhooks)
- **Où l'obtenir**: https://dashboard.stripe.com/webhooks
- **Format**: `whsec_...`

### 🔗 Variables KONNECT (Optionnelles)

#### 19. KONNECT_API_KEY
- **Description**: Clé API Konnect (si vous utilisez Konnect pour les paiements)
- **Où l'obtenir**: Votre dashboard Konnect
- **Format**: Votre clé API Konnect

#### 20. KONNECT_RECEIVER_WALLET_ID
- **Description**: ID du wallet récepteur Konnect (si vous utilisez Konnect)
- **Où l'obtenir**: Votre dashboard Konnect
- **Format**: ID du wallet récepteur

#### 21. KONNECT_BASE_URL
- **Description**: URL de base Konnect (sandbox ou production)
- **Valeurs possibles**: 
  - `https://api.sandbox.konnect.network` (sandbox/test)
  - `https://api.konnect.network` (production)
- **Valeur par défaut**: `https://api.sandbox.konnect.network`

#### 22. KONNECT_WEBHOOK_URL
- **Description**: URL de webhook Konnect (générée automatiquement si non spécifiée)
- **Format**: `https://your-backend-url.onrender.com/api/konnect/webhook`
- **Note**: Générée automatiquement à partir de CLIENT_ORIGIN si non spécifiée

### 🔥 Variables FIREBASE (Optionnelles)

#### 23. FIREBASE_PROJECT_ID
- **Description**: ID du projet Firebase
- **Où l'obtenir**: Firebase Console > Project Settings

#### 24. FIREBASE_CLIENT_EMAIL
- **Description**: Email du compte de service Firebase
- **Format**: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
- **Où l'obtenir**: Firebase Console > Project Settings > Service Accounts

#### 25. FIREBASE_PRIVATE_KEY
- **Description**: Clé privée Firebase (compte de service)
- **Format**: 
  ```
  -----BEGIN PRIVATE KEY-----
  ...
  -----END PRIVATE KEY-----
  ```
- **Important**: Dans Render, vous devez inclure les vrais sauts de ligne
- **Où l'obtenir**: Firebase Console > Project Settings > Service Accounts > Generate new private key

#### 26. FIREBASE_PRIVATE_KEY_ID
- **Description**: ID de la clé privée Firebase
- **Où l'obtenir**: Dans le fichier JSON du compte de service Firebase

#### 27. FIREBASE_CLIENT_ID
- **Description**: ID client Firebase
- **Où l'obtenir**: Dans le fichier JSON du compte de service Firebase

#### 28. FIREBASE_CLIENT_X509_CERT_URL
- **Description**: URL du certificat X509 Firebase
- **Format**: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com`
- **Où l'obtenir**: Dans le fichier JSON du compte de service Firebase

#### 29. FIREBASE_STORAGE_BUCKET
- **Description**: Bucket de stockage Firebase
- **Format**: `your-project.appspot.com`
- **Où l'obtenir**: Firebase Console > Storage

#### 30. FIREBASE_WEB_API_KEY
- **Description**: Clé API web Firebase (pour l'authentification côté client)
- **Où l'obtenir**: Firebase Console > Project Settings > General > Web API Key

## 📝 Exemple de Configuration Complète

```env
# ============================================
# VARIABLES REQUISES
# ============================================
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/codegenesis?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_ADMIN_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
CLIENT_ORIGIN=https://codegenesis-platform.web.app
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SERVER_URL=https://codegenesis-backend.onrender.com

# ============================================
# VARIABLES RECOMMANDÉES
# ============================================
APP_BASE_URL=https://codegenesis-platform.web.app
CLIENT_URL=https://codegenesis-platform.web.app

# ============================================
# VARIABLES EMAIL (Optionnelles)
# ============================================
# EMAIL_SERVICE=gmail
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
# EMAIL_FROM=noreply@codegenesis-platform.web.app

# ============================================
# VARIABLES STRIPE (Optionnelles)
# ============================================
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# VARIABLES KONNECT (Optionnelles)
# ============================================
# KONNECT_API_KEY=your-konnect-api-key
# KONNECT_RECEIVER_WALLET_ID=your-receiver-wallet-id
# KONNECT_BASE_URL=https://api.sandbox.konnect.network
# KONNECT_WEBHOOK_URL=https://your-backend-url.onrender.com/api/konnect/webhook

# ============================================
# VARIABLES FIREBASE (Optionnelles)
# ============================================
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# FIREBASE_PRIVATE_KEY_ID=your-private-key-id
# FIREBASE_CLIENT_ID=your-client-id
# FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
# FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# FIREBASE_WEB_API_KEY=your-firebase-web-api-key
```

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

### Méthode 2: Via le fichier render.yaml

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
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
      - key: SERVER_URL
        value: https://codegenesis-backend.onrender.com
```

**Note**: Les variables avec `sync: false` doivent être définies manuellement dans le dashboard Render.

## 🔐 Génération de Secrets JWT

Pour générer des secrets JWT sécurisés:

```bash
# Ouvrez un terminal Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Exécutez cette commande deux fois pour obtenir deux secrets différents (un pour JWT_SECRET et un pour JWT_ADMIN_SECRET).

## 📧 Configuration Email (Gmail)

### Étapes pour configurer Gmail:

1. **Activez la vérification en 2 étapes**:
   - Allez sur https://myaccount.google.com/security
   - Activez la "Vérification en deux étapes"

2. **Créez un mot de passe d'application**:
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Autre (nom personnalisé)"
   - Entrez "CodeGenesis Backend" comme nom
   - Cliquez sur "Générer"
   - Copiez le mot de passe généré (16 caractères)

3. **Configurez les variables**:
   - `EMAIL_USER`: Votre adresse Gmail (ex: `your-email@gmail.com`)
   - `EMAIL_PASS`: Le mot de passe d'application généré (sans espaces)
   - `SERVER_URL`: L'URL de votre backend Render (ex: `https://codegenesis-backend.onrender.com`)

### Test de l'envoi d'email:

1. Connectez-vous à l'application
2. Utilisez l'endpoint `/api/auth/send-verification` pour envoyer un email de vérification
3. Vérifiez votre boîte email
4. Vérifiez les logs Render pour voir s'il y a des erreurs

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

4. **Email**:
   - Utilisez un "Mot de passe d'application" Gmail, pas votre mot de passe normal
   - SERVER_URL doit pointer vers l'URL de votre backend Render
   - Testez l'envoi d'email après la configuration

5. **Firebase Private Key**:
   - Dans Render, pour FIREBASE_PRIVATE_KEY, vous devez inclure les vrais sauts de ligne
   - Copiez la clé privée telle qu'elle apparaît dans le fichier JSON du compte de service
   - Assurez-vous que tous les sauts de ligne sont présents

6. **Redéploiement**:
   - Après avoir ajouté/modifié des variables d'environnement, Render redéploiera automatiquement votre service
   - Vérifiez les logs après le redéploiement pour vous assurer que tout fonctionne

## 🔍 Vérification

Après avoir configuré les variables d'environnement, vérifiez que tout fonctionne:

1. **Vérifiez les logs Render** pour voir si l'application démarre correctement
2. **Testez l'endpoint `/api/health`** pour vérifier que le serveur répond
3. **Testez l'authentification** pour vérifier que JWT_SECRET fonctionne
4. **Testez la connexion MongoDB** pour vérifier que MONGODB_URI est correct
5. **Testez l'envoi d'email** en utilisant l'endpoint `/api/auth/send-verification`
6. **Vérifiez la vérification d'email** en cliquant sur le lien dans l'email reçu

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs Render
2. Vérifiez que toutes les variables requises sont définies
3. Vérifiez que les valeurs sont correctes (pas d'espaces supplémentaires, etc.)
4. Vérifiez que MongoDB Atlas autorise les connexions depuis Render
5. Vérifiez que Gmail autorise l'utilisation du mot de passe d'application
6. Vérifiez que SERVER_URL pointe vers la bonne URL de backend

## 📚 Ressources

- [Documentation Render](https://render.com/docs/environment-variables)
- [Documentation MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Documentation Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Documentation Nodemailer](https://nodemailer.com/about/)

