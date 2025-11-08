# 🧹 Variables d'Environnement Nettoyées pour Render

## ✅ Variables à CONSERVER (Production)

Voici les variables que vous devez **CONSERVER** dans Render :

```env
# ============================================
# BASE - REQUISES
# ============================================
MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
CLIENT_ORIGIN=https://codegenesis-platform.web.app
NODE_ENV=production

# ============================================
# URLS - RECOMMANDÉES
# ============================================
CLIENT_URL=https://codegenesis-platform.web.app
SERVER_URL=https://codegenesis-backend.onrender.com
APP_BASE_URL=https://codegenesis-platform.web.app

# ============================================
# EMAIL - REQUISES (Pour la validation d'email)
# ============================================
EMAIL_USER=ahmeben1234@gmail.com
EMAIL_PASS=ydqy crpt vica nvhy
EMAIL_FROM=your@domain.com

# ============================================
# FIREBASE - OPTIONNELLES
# ============================================
FIREBASE_PROJECT_ID=codegenesis-3dc24
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@codegenesis-3dc24.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDi8vujfphEwXPY\niVkqgZuZGVrClCqWU7Vg07js5N8tsGl5FlJ3fiaMzTSAM4G6oF5JfagUzOx1JXni\nKhtUzx0Rd3bYb7Bgr0li0VZb5w9EO+rSpTeFJmogxk1gtbScOi7rId00ddwf7YFT\nD3Z4eNKhe0J5V6PORGEkFddS9vagRO4BWZMCMZtt/KnRQXY3zu7baPGDff0WPMsi\nBNn/ybxkXdcDWYNuJ49fnbxFsAjKjBhAeRMoMljNyf23i/vyV5eTqDk+YCDGpmax\n4YauFbW3JO/S+flU4IpLapRcRqNKJ4vsm6i9Ppg7Xr0NtxOI8h5If+q9yD8BDgsB\n/ErHCKxtAgMBAAECggEADW+lRkCwcyGg4ij/hmy18ZJ2tR5ghxXdnyXpxNyn+eR/\n2hNgPoLRdXSQryZdf9cOvfsagGDBfw4A8Urc42B/sBEKkDXMk2zNQ3RxUG+Vj8yc\nUmxFpTRpBBe5bQhU8QrgzDrtBbYUmi9NgMVhljBRCA5sGRL/N68EsUY5wUetwj81\n5kQrcVa/WYy7BiNwPAr5J1TJc4qPa4Kmozn0n29h8a+/6QeVozZoQXPAktsdYYXn\nZG5jZpOAsdwWx0qI++knLzh8RTUqFV5oiuzwqygDJR1PXodcarsF/plIt0slGhe/\n82sDjestGDr0j3y4D9JIdD02h7Rf/HU1wMrEDb+oYQKBgQD8F4vfXTwLrB+aQ7Pj\n3E1M1LWuBqdWBy5ogl0lRf3nPieSCr7N1lcrKsXu6LBU+ke9+QnuCFhvfxB5OdmU\nE4ByjJtd9UdJJazgNh17sCePy1L4bZ2+OrtuQlAfQ+syf49mUoujDvkSrdlB7gAE\n94wZxYVQMcu5tVEG4+WiqHG1owKBgQDmd6eVuN9Y18NsQzrPF7taFqvSgmFHHsEt\n+u5yIHW0WlsczeIOFbMhtV7LWAFFMKTi1ZF3I55QaM0BXWmL3aTLzHt4u4rmxNXF\nNTO08s0BsKwxu3stxKwv/Hufz8n+9hWjBH1aEqTca7yWaP/tiujnDOXV3iMSs2EG\n43buSaCWrwKBgQCDyHtiZQcCwxQyPLpJn9z5ESl4tBm+Kzrjf2LaHWDCBggBnIRq\nbmZbNp0Ka7HieoQOl6XNPaedgbtG5CsN8bPwLfj6gUKmxn89Joz7H/dOgGf7XrJb\nw7A/z4K7FXJaj7yTLQu6ThV+4kr04Eo6Tn566nrqlV1+035sL67X/V6UKQKBgGNs\nwWaNIAWi55LgGhHXiiLeXvfs+WyGLw7YD2A68qyAwofVpi0vXV0wcpnE+J9R0gBt\n5FiCjDziSXbKRstpLjwhli7KsazGw/ZU8l6g1KJjBpZZ7FUdYK8+/FJAgUM2BLWU\nLUPbgTX6YJx+5dIjuEBdRxYRxA3ARx6CqP850kbPAoGANPHiOkFEfi5VxducfZbc\nXWrnGlFdvO/xk2KwQo46O8ZgXbGArUSeHGzomnCUKBlglJl/Dwlry8SSMtsgjhl2\nOjZUkPxTQgtjCSZ00+LA7Dfm/pKNkuRQf2yvyeYfDCXnZkZ14BPmFep0r9gS0A5L\nH3A5Ve7l/Sv6JD0l5J1ODYQ=\n-----END PRIVATE KEY-----"
FIREBASE_PRIVATE_KEY_ID=36ccc034774a5772d2edb329dc031723e62e16dc
FIREBASE_CLIENT_ID=101264396619363868510
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40codegenesis-3dc24.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=codegenesis-3dc24.appspot.com
FIREBASE_WEB_API_KEY=AIzaSyAyWwRXyunN_wKhvG6LKvNP3MIItuje_aQ

# ============================================
# KONNECT - OPTIONNELLES
# ============================================
KONNECT_API_KEY=689df9b0833596bcddc09e0d:EpDx3mBXyFOvucb3A
KONNECT_RECEIVER_WALLET_ID=689df9b2833596bcddc09fe0
KONNECT_BASE_URL=https://api.sandbox.konnect.network

# ============================================
# STRIPE - OPTIONNELLES
# ============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## ❌ Variables à SUPPRIMER (Doublons et valeurs de développement)

Supprimez ces variables de Render car elles sont :
- Des doublons avec suffixe "d" ou "dd"
- Des valeurs de développement (localhost)
- Non nécessaires en production

```env
# ❌ À SUPPRIMER - Doublons
CLIENT_ORIGINd=http://localhost:3000
JWT_SECRETdd=votre_secret_jwt_super_securise
JWT_ADMIN_SECRETd=votre_secret_jwt_admin_super_securise
PORTd=5000

# ❌ À SUPPRIMER - Valeurs de développement
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
REACT_APP_SERVER_URL=http://localhost:5000
MONGO_URI=mongodb://localhost:27017/codegenesis
PORT=10000  # Render définit automatiquement PORT, pas besoin de le spécifier

# ❌ À SUPPRIMER - Variables non utilisées
DOMAIN=https://ton-front.example  # Non utilisée dans le code
SENDGRID_API_KEY=SG-xxxxxxxxxxxxxxxxxxxx  # Vous utilisez Gmail, pas SendGrid
```

## ⚠️ Corrections Recommandées

### 1. EMAIL_PASS - Supprimer les guillemets et espaces

**Actuel**: `EMAIL_PASS="ydqy crpt vica nvhy"`  
**Correct**: `EMAIL_PASS=ydqycrptvicanvhy`

⚠️ **Important**: Dans Render, supprimez les guillemets et les espaces du mot de passe d'application Gmail.

### 2. KONNECT_BASE_URL - URL incorrecte

**Actuel**: `KONNECT_BASE_URL=https://dashboard.konnect.network`  
**Correct**: `KONNECT_BASE_URL=https://api.sandbox.konnect.network`

⚠️ **Important**: L'URL doit être l'API, pas le dashboard.

### 3. SERVER_URL - Utiliser l'URL de production

**Actuel**: `SERVER_URL=http://localhost:5000`  
**Correct**: `SERVER_URL=https://codegenesis-backend.onrender.com`

⚠️ **Important**: SERVER_URL doit pointer vers votre backend Render pour que les liens de vérification d'email fonctionnent.

### 4. FIREBASE_STORAGE_BUCKET - Ajouter si manquant

**À ajouter si pas présent**: `FIREBASE_STORAGE_BUCKET=codegenesis-3dc24.appspot.com`

### 5. PORT - Laisser Render le gérer

**À supprimer**: `PORT=10000` ou `PORT=5000`

Render définit automatiquement la variable PORT. Vous n'avez pas besoin de la spécifier.

## ✅ Configuration Finale Recommandée

Voici la configuration finale optimale pour Render :

```env
# ============================================
# BASE - REQUISES
# ============================================
MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=b1c3a42a9367c4b83fe7633960c483a260c267a7bb2a3654541c0e2802c66d31
JWT_ADMIN_SECRET=e5ed7a6e618a35a514ebe6bbbe8788f21b9f024aa3493bbbb4d40d1a37e5b7c8
CLIENT_ORIGIN=https://codegenesis-platform.web.app
NODE_ENV=production

# ============================================
# URLS - RECOMMANDÉES
# ============================================
CLIENT_URL=https://codegenesis-platform.web.app
SERVER_URL=https://codegenesis-backend.onrender.com
APP_BASE_URL=https://codegenesis-platform.web.app

# ============================================
# EMAIL - REQUISES
# ============================================
EMAIL_USER=ahmeben1234@gmail.com
EMAIL_PASS=ydqycrptvicanvhy
EMAIL_FROM=ahmeben1234@gmail.com

# ============================================
# FIREBASE
# ============================================
FIREBASE_PROJECT_ID=codegenesis-3dc24
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@codegenesis-3dc24.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDi8vujfphEwXPY\niVkqgZuZGVrClCqWU7Vg07js5N8tsGl5FlJ3fiaMzTSAM4G6oF5JfagUzOx1JXni\nKhtUzx0Rd3bYb7Bgr0li0VZb5w9EO+rSpTeFJmogxk1gtbScOi7rId00ddwf7YFT\nD3Z4eNKhe0J5V6PORGEkFddS9vagRO4BWZMCMZtt/KnRQXY3zu7baPGDff0WPMsi\nBNn/ybxkXdcDWYNuJ49fnbxFsAjKjBhAeRMoMljNyf23i/vyV5eTqDk+YCDGpmax\n4YauFbW3JO/S+flU4IpLapRcRqNKJ4vsm6i9Ppg7Xr0NtxOI8h5If+q9yD8BDgsB\n/ErHCKxtAgMBAAECggEADW+lRkCwcyGg4ij/hmy18ZJ2tR5ghxXdnyXpxNyn+eR/\n2hNgPoLRdXSQryZdf9cOvfsagGDBfw4A8Urc42B/sBEKkDXMk2zNQ3RxUG+Vj8yc\nUmxFpTRpBBe5bQhU8QrgzDrtBbYUmi9NgMVhljBRCA5sGRL/N68EsUY5wUetwj81\n5kQrcVa/WYy7BiNwPAr5J1TJc4qPa4Kmozn0n29h8a+/6QeVozZoQXPAktsdYYXn\nZG5jZpOAsdwWx0qI++knLzh8RTUqFV5oiuzwqygDJR1PXodcarsF/plIt0slGhe/\n82sDjestGDr0j3y4D9JIdD02h7Rf/HU1wMrEDb+oYQKBgQD8F4vfXTwLrB+aQ7Pj\n3E1M1LWuBqdWBy5ogl0lRf3nPieSCr7N1lcrKsXu6LBU+ke9+QnuCFhvfxB5OdmU\nE4ByjJtd9UdJJazgNh17sCePy1L4bZ2+OrtuQlAfQ+syf49mUoujDvkSrdlB7gAE\n94wZxYVQMcu5tVEG4+WiqHG1owKBgQDmd6eVuN9Y18NsQzrPF7taFqvSgmFHHsEt\n+u5yIHW0WlsczeIOFbMhtV7LWAFFMKTi1ZF3I55QaM0BXWmL3aTLzHt4u4rmxNXF\nNTO08s0BsKwxu3stxKwv/Hufz8n+9hWjBH1aEqTca7yWaP/tiujnDOXV3iMSs2EG\n43buSaCWrwKBgQCDyHtiZQcCwxQyPLpJn9z5ESl4tBm+Kzrjf2LaHWDCBggBnIRq\nbmZbNp0Ka7HieoQOl6XNPaedgbtG5CsN8bPwLfj6gUKmxn89Joz7H/dOgGf7XrJb\nw7A/z4K7FXJaj7yTLQu6ThV+4kr04Eo6Tn566nrqlV1+035sL67X/V6UKQKBgGNs\nwWaNIAWi55LgGhHXiiLeXvfs+WyGLw7YD2A68qyAwofVpi0vXV0wcpnE+J9R0gBt\n5FiCjDziSXbKRstpLjwhli7KsazGw/ZU8l6g1KJjBpZZ7FUdYK8+/FJAgUM2BLWU\nLUPbgTX6YJx+5dIjuEBdRxYRxA3ARx6CqP850kbPAoGANPHiOkFEfi5VxducfZbc\nXWrnGlFdvO/xk2KwQo46O8ZgXbGArUSeHGzomnCUKBlglJl/Dwlry8SSMtsgjhl2\nOjZUkPxTQgtjCSZ00+LA7Dfm/pKNkuRQf2yvyeYfDCXnZkZ14BPmFep0r9gS0A5L\nH3A5Ve7l/Sv6JD0l5J1ODYQ=\n-----END PRIVATE KEY-----"
FIREBASE_PRIVATE_KEY_ID=36ccc034774a5772d2edb329dc031723e62e16dc
FIREBASE_CLIENT_ID=101264396619363868510
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40codegenesis-3dc24.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=codegenesis-3dc24.appspot.com
FIREBASE_WEB_API_KEY=AIzaSyAyWwRXyunN_wKhvG6LKvNP3MIItuje_aQ

# ============================================
# KONNECT
# ============================================
KONNECT_API_KEY=689df9b0833596bcddc09e0d:EpDx3mBXyFOvucb3A
KONNECT_RECEIVER_WALLET_ID=689df9b2833596bcddc09fe0
KONNECT_BASE_URL=https://api.sandbox.konnect.network

# ============================================
# STRIPE (si vous utilisez Stripe)
# ============================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📋 Checklist d'Actions

### ✅ À FAIRE dans Render Dashboard

1. **Supprimer les doublons**:
   - [ ] Supprimer `CLIENT_ORIGINd`
   - [ ] Supprimer `JWT_SECRETdd`
   - [ ] Supprimer `JWT_ADMIN_SECRETd`
   - [ ] Supprimer `PORTd`

2. **Supprimer les valeurs de développement**:
   - [ ] Supprimer `CLIENT_URL=http://localhost:3000` (garder uniquement la version production)
   - [ ] Supprimer `SERVER_URL=http://localhost:5000` (remplacer par l'URL Render)
   - [ ] Supprimer `REACT_APP_SERVER_URL`
   - [ ] Supprimer `MONGO_URI`
   - [ ] Supprimer `PORT=10000` (si présent)

3. **Supprimer les variables non utilisées**:
   - [ ] Supprimer `DOMAIN`
   - [ ] Supprimer `SENDGRID_API_KEY` (vous utilisez Gmail)

4. **Corriger les valeurs**:
   - [ ] Modifier `EMAIL_PASS`: Retirer les guillemets et espaces → `ydqycrptvicanvhy`
   - [ ] Modifier `KONNECT_BASE_URL`: `https://dashboard.konnect.network` → `https://api.sandbox.konnect.network`
   - [ ] Modifier `SERVER_URL`: `http://localhost:5000` → `https://codegenesis-backend.onrender.com`
   - [ ] Modifier `EMAIL_FROM`: `your@domain.com` → `ahmeben1234@gmail.com` (ou laisser tel quel si vous voulez)

5. **Ajouter si manquant**:
   - [ ] Ajouter `APP_BASE_URL=https://codegenesis-platform.web.app`
   - [ ] Vérifier que `FIREBASE_STORAGE_BUCKET=codegenesis-3dc24.appspot.com` est présent

## 🔍 Vérifications Finales

Après avoir nettoyé les variables, vérifiez que :

1. ✅ Toutes les variables requises sont présentes
2. ✅ Aucune variable de développement (localhost) n'est présente
3. ✅ Aucun doublon n'est présent
4. ✅ Les URLs pointent vers la production
5. ✅ EMAIL_PASS n'a pas de guillemets ni d'espaces
6. ✅ SERVER_URL pointe vers votre backend Render
7. ✅ KONNECT_BASE_URL pointe vers l'API (pas le dashboard)

## 📝 Notes Importantes

1. **EMAIL_PASS**: Le mot de passe d'application Gmail doit être sans espaces ni guillemets dans Render
2. **SERVER_URL**: Doit être l'URL complète de votre backend Render pour que les liens de vérification d'email fonctionnent
3. **KONNECT_BASE_URL**: Doit être `https://api.sandbox.konnect.network` (sandbox) ou `https://api.konnect.network` (production), pas le dashboard
4. **PORT**: Render définit automatiquement PORT, vous n'avez pas besoin de le spécifier
5. **FIREBASE_PRIVATE_KEY**: Assurez-vous que les sauts de ligne (`\n`) sont présents dans Render

## 🚀 Après le Nettoyage

Après avoir nettoyé les variables :
1. Render redéploiera automatiquement votre service
2. Vérifiez les logs pour vous assurer qu'il n'y a pas d'erreurs
3. Testez l'envoi d'email de vérification
4. Testez l'authentification
5. Testez les paiements Konnect (si applicable)

