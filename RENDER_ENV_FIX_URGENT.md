# 🚨 CORRECTION URGENTE - Erreur de Connexion MongoDB

## ❌ Problème Identifié

Votre variable `MONGODB_URI` est **INCORRECTE** :

**Actuel (INCORRECT)** :
```
MONGODB_URI="MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0"
```

**Problème** : Il y a une duplication - `MONGODB_URI="MONGODB_URI=..."` - ce qui est incorrect.

## ✅ Solution

### Correction IMMEDIATE dans Render

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service backend
3. Cliquez sur "Environment"
4. Trouvez la variable `MONGODB_URI`
5. **Modifiez la valeur** pour :

```
MONGODB_URI=mongodb+srv://discord:dxDKTKLRgG4PG5SG@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ IMPORTANT** :
- ❌ Supprimez les guillemets `"`
- ❌ Supprimez la duplication `MONGODB_URI=` à l'intérieur
- ✅ La valeur doit être juste l'URL MongoDB, sans guillemets

## 📋 Configuration Finale Correcte

Voici toutes vos variables d'environnement **CORRIGÉES** :

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

## 🔍 Vérifications Additionnelles

### 1. Vérifier MongoDB Atlas

Assurez-vous que :
- ✅ Votre IP est autorisée dans MongoDB Atlas (pour Render, autorisez `0.0.0.0/0`)
- ✅ L'utilisateur `discord` existe et a les bonnes permissions
- ✅ Le mot de passe est correct : `dxDKTKLRgG4PG5SG`
- ✅ Le cluster est actif et accessible

### 2. Vérifier les Logs Render

Après avoir corrigé `MONGODB_URI`, vérifiez les logs Render :
1. Allez sur Render Dashboard > Your Service > Logs
2. Cherchez les messages de connexion MongoDB
3. Vérifiez qu'il n'y a pas d'erreurs de connexion

### 3. Tester la Connexion

Une fois corrigé, testez l'endpoint `/api/health` pour vérifier que :
- ✅ Le serveur répond
- ✅ MongoDB est connecté
- ✅ Tous les services sont opérationnels

## 📝 Étapes de Correction

1. **Corriger MONGODB_URI dans Render** :
   - Ouvrez Render Dashboard
   - Allez dans Environment
   - Modifiez `MONGODB_URI` avec la valeur corrigée (sans guillemets, sans duplication)
   - Sauvegardez

2. **Attendre le redéploiement** :
   - Render redéploiera automatiquement (2-5 minutes)
   - Surveillez les logs pour voir si la connexion MongoDB réussit

3. **Vérifier les logs** :
   - Si vous voyez "✅ MongoDB connecté" ou similaire, c'est bon
   - Si vous voyez encore des erreurs, vérifiez MongoDB Atlas

4. **Tester l'application** :
   - Testez l'endpoint `/api/health`
   - Testez l'authentification
   - Vérifiez que l'erreur "Service temporairement indisponible" a disparu

## ⚠️ Notes Importantes

1. **MONGODB_URI** : Ne doit pas avoir de guillemets dans Render (sauf si vraiment nécessaire pour des caractères spéciaux)
2. **MongoDB Atlas** : Assurez-vous que les connexions depuis Render sont autorisées
3. **Logs** : Vérifiez toujours les logs Render après une modification pour voir si ça fonctionne

## 🚀 Après la Correction

Une fois `MONGODB_URI` corrigé, votre application devrait :
- ✅ Se connecter à MongoDB Atlas
- ✅ Fonctionner correctement
- ✅ Ne plus afficher l'erreur "Service temporairement indisponible"

Si l'erreur persiste après la correction, vérifiez :
1. Les logs Render pour voir l'erreur exacte
2. MongoDB Atlas pour vérifier que le cluster est accessible
3. Les permissions de l'utilisateur MongoDB

