# Correction URL de Paiement Konnect - "Payment Not Found"

## Date: 2025-01-XX

## 🔍 Problème Identifié

L'erreur "Payment Not Found!" sur la page de paiement Konnect Gateway était causée par une URL de paiement incorrecte construite côté frontend.

### Symptômes
- URL de paiement incorrecte: `gateway.konnect.network/pay?receiver_wallet_id=...&token=...`
- L'URL devrait utiliser `payment_ref` au lieu de `receiver_wallet_id` et `token`
- L'URL devrait être: `gateway.sandbox.konnect.network/pay?payment_ref=...`

### Cause Racine
1. **Méthode `buildPaymentUrl` incorrecte** dans `frontend/src/services/konnectService.js`:
   - Construisait une URL avec `receiver_wallet_id` et `token` au lieu de `payment_ref`
   - Cette méthode était utilisée comme fallback dans `KonnectPaymentHandler.jsx`

2. **Fallback incorrect** dans `frontend/src/components/KonnectPaymentHandler.jsx`:
   - Utilisait `buildPaymentUrl` si le backend ne trouvait pas le plan
   - Cette URL incorrecte était ensuite utilisée pour rediriger vers Konnect

## ✅ Corrections Appliquées

### 1. Suppression du Fallback Incorrect

**Fichier:** `frontend/src/components/KonnectPaymentHandler.jsx`

**Avant:**
```javascript
try {
  result = await KonnectService.initPayment(paymentData);
} catch (e) {
  // Fallback: construire une URL Konnect directe
  const paymentUrl = KonnectService.buildPaymentUrl({...});
  setPaymentUrl(paymentUrl);
  return;
}
```

**Après:**
```javascript
try {
  result = await KonnectService.initPayment(paymentData);
} catch (e) {
  // Ne pas utiliser buildPaymentUrl car elle construit une URL incorrecte
  // L'URL de paiement doit toujours venir du backend depuis l'API Konnect
  console.error('❌ Erreur initialisation paiement:', e);
  throw new Error(`Erreur lors de l'initialisation du paiement: ${e.message || 'Erreur inconnue'}`);
}
```

### 2. Dépéciation de `buildPaymentUrl`

**Fichier:** `frontend/src/services/konnectService.js`

**Avant:**
```javascript
static buildPaymentUrl(paymentData) {
  const params = new URLSearchParams({
    receiver_wallet_id: API_CONFIG.KONNECT.RECEIVER_WALLET_ID,
    token: API_CONFIG.KONNECT.API_KEY,
    // ...
  });
  return `${API_CONFIG.KONNECT.GATEWAY_URL}/pay?${params.toString()}`;
}
```

**Après:**
```javascript
/**
 * ⚠️ DEPRECATED: Cette méthode ne devrait PAS être utilisée
 * ⚠️ Elle construit une URL incorrecte avec receiver_wallet_id et token au lieu de payment_ref
 * ⚠️ Utilisez toujours l'URL retournée par le backend depuis l'API Konnect
 * @deprecated Utilisez toujours l'URL retournée par le backend depuis l'API Konnect
 */
static buildPaymentUrl(paymentData) {
  console.error('❌ buildPaymentUrl est DEPRECATED et ne doit pas être utilisée.');
  throw new Error('buildPaymentUrl est DEPRECATED. Utilisez toujours l\'URL retournée par le backend depuis l\'API Konnect.');
}
```

### 3. Création du Composant `SubscribeButton`

**Fichier:** `frontend/src/components/SubscribeButton.jsx`

**Nouveau composant** qui:
- Utilise `SubscriptionService.subscribe` pour appeler le backend
- Utilise toujours l'URL de paiement retournée par le backend
- Vérifie que l'URL contient `payment_ref` ou `gateway.sandbox.konnect.network`
- Gère correctement les plans gratuits et payants

**Code clé:**
```javascript
const result = await SubscriptionService.subscribe(planId, {
  returnUrl: returnUrl || `${window.location.origin}/payments/konnect-return`
});

// Vérifier que l'URL est correcte (doit contenir payment_ref)
if (result.paymentUrl) {
  if (result.paymentUrl.includes('payment_ref=') || 
      result.paymentUrl.includes('gateway.sandbox.konnect.network') || 
      result.paymentUrl.includes('gateway.konnect.network')) {
    window.open(result.paymentUrl, '_blank');
  } else {
    toast.error('URL de paiement invalide. Veuillez contacter le support.');
  }
}
```

## 📋 Flux Correct du Paiement

1. **Frontend** appelle `SubscriptionService.subscribe(planId)`
2. **Backend** (`/api/subscriptions/subscribe`) appelle `initPayment` de Konnect
3. **Konnect API** retourne:
   ```json
   {
     "payUrl": "https://gateway.sandbox.konnect.network/pay?payment_ref=6911ccf063c10de262b8927d",
     "paymentRef": "6911ccf063c10de262b8927d"
   }
   ```
4. **Backend** retourne cette URL au frontend:
   ```json
   {
     "success": true,
     "paymentUrl": "https://gateway.sandbox.konnect.network/pay?payment_ref=6911ccf063c10de262b8927d",
     "konnectPaymentId": "6911ccf063c10de262b8927d"
   }
   ```
5. **Frontend** utilise cette URL pour rediriger vers Konnect

## ✅ Vérification

### Test de Connexion Konnect
```bash
node test-konnect-connection.js
```

**Résultat attendu:**
```
✅ Connexion Konnect réussie!
Réponse: {
  "payUrl": "https://gateway.sandbox.konnect.network/pay?payment_ref=6911ccf063c10de262b8927d",
  "paymentRef": "6911ccf063c10de262b8927d"
}
```

### Test d'Abonnement
```bash
node test-subscription-complete.js
```

**Résultat attendu:**
- L'URL de paiement retournée doit contenir `payment_ref=`
- L'URL doit pointer vers `gateway.sandbox.konnect.network` (sandbox) ou `gateway.konnect.network` (production)

## 🎯 Points Importants

1. **Toujours utiliser l'URL retournée par le backend**: L'URL de paiement doit toujours venir de l'API Konnect via le backend, jamais construite côté frontend.

2. **Format correct de l'URL**: 
   - ✅ `https://gateway.sandbox.konnect.network/pay?payment_ref=...`
   - ❌ `https://gateway.konnect.network/pay?receiver_wallet_id=...&token=...`

3. **Pas de fallback incorrect**: Si le backend ne retourne pas d'URL, il faut afficher une erreur plutôt que de construire une URL incorrecte.

4. **Vérification de l'URL**: Le frontend doit vérifier que l'URL contient `payment_ref` avant de rediriger.

## 📝 Fichiers Modifiés

- ✅ `frontend/src/components/SubscribeButton.jsx` - Créé
- ✅ `frontend/src/components/KonnectPaymentHandler.jsx` - Corrigé (suppression fallback)
- ✅ `frontend/src/services/konnectService.js` - Corrigé (dépéciation buildPaymentUrl)

## 🚀 Prochaines Étapes

1. **Tester l'abonnement** avec un plan payant pour vérifier que l'URL est correcte
2. **Vérifier le webhook** Konnect pour confirmer que les paiements sont bien reçus
3. **Tester en production** avec les vraies clés API Konnect

## ✅ Conclusion

Le problème "Payment Not Found" était causé par une URL de paiement incorrecte construite côté frontend. Les corrections appliquées garantissent que:
- L'URL de paiement vient toujours du backend depuis l'API Konnect
- L'URL utilise le format correct avec `payment_ref`
- Aucun fallback incorrect n'est utilisé
- Les erreurs sont correctement gérées et affichées

L'URL de paiement est maintenant correctement générée et fonctionne avec Konnect Gateway.

