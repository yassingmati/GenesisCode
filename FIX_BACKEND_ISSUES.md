# 🔧 Correction des problèmes du backend

## Problèmes identifiés dans les logs

### 1. ✅ Plans retournant 0 puis 12 plans
**Problème** : Les premières requêtes retournent 0 plans, puis 12 plans après.

**Cause** : La connexion MongoDB n'est pas encore établie quand les premières requêtes arrivent.

**Solution** : Ajouter une vérification de la connexion MongoDB dans le service avant de servir les requêtes.

### 2. ❌ Erreur Konnect "Invalid Api Key"
**Problème** : `Error: Invalid Api Key` lors de l'initialisation du paiement.

**Cause** : Les variables d'environnement Konnect ne sont pas configurées ou sont incorrectes.

**Variables requises** :
- `KONNECT_API_KEY`
- `KONNECT_RECEIVER_WALLET_ID`
- `KONNECT_BASE_URL` (optionnel, défaut: `https://api.konnect.network`)

**Solution** : Configurer les variables d'environnement dans `backend/.env` ou dans les variables d'environnement du déploiement (Render).

### 3. ❌ Route 404 `/api/payment/init`
**Problème** : `POST /api/payment/init HTTP/1.1" 404`

**Cause** : La route est montée correctement dans `index.js` mais le contrôleur peut avoir un problème.

**Vérification** : 
- Route montée à `/api/payment` (ligne 633 de `index.js`)
- Route définie dans `paymentRoutes.js` : `router.post('/init', ...)`
- Route complète devrait être : `/api/payment/init`

**Solution** : Vérifier que le contrôleur `PaymentController.initSubscriptionPayment` existe et fonctionne correctement.

### 4. ❌ URLs avec double slash `//api/...`
**Problème** : Les requêtes ont des URLs avec double slash : `//api/courses/levels/.../pdf`

**Cause** : Problème côté frontend dans la configuration de l'URL de base (probablement `BASE_URL = '/api'` au lieu de `BASE_URL = 'https://.../api'`).

**Solution** : Corriger la configuration de l'URL de base côté frontend.

## Solutions à appliquer

### Solution 1 : Ajouter une vérification MongoDB dans le service

Modifier `backend/src/services/categoryPaymentService.js` pour vérifier que MongoDB est connecté avant de servir les requêtes.

### Solution 2 : Configurer Konnect

Ajouter les variables d'environnement Konnect dans `backend/.env` ou dans les variables d'environnement du déploiement.

### Solution 3 : Vérifier la route `/api/payment/init`

Vérifier que le contrôleur fonctionne correctement et qu'il n'y a pas de conflit avec d'autres routes.

### Solution 4 : Corriger les URLs avec double slash

Vérifier la configuration de l'URL de base côté frontend.




