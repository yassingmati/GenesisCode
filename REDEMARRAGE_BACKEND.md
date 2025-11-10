# Redémarrage du Backend - Instructions

## Date: 2025-01-XX

## Situation Actuelle

- ✅ Backend accessible sur http://localhost:5000
- ✅ Fichier `backend/.env` contient la nouvelle clé API Konnect
- ✅ Test de connexion directe Konnect: **RÉUSSI**
- ⚠️ Le backend retourne toujours l'erreur "Invalid Api Key"

## Problème Identifié

Le backend en cours d'exécution utilise probablement encore l'ancienne clé API car les variables d'environnement sont chargées au démarrage du processus Node.js.

## Solution

### Étapes pour Redémarrer le Backend

1. **Arrêter le backend actuel**
   - Trouvez le terminal où le backend tourne
   - Appuyez sur `Ctrl+C` pour arrêter le processus
   - Attendez que le processus s'arrête complètement

2. **Redémarrer le backend**
   ```bash
   cd backend
   npm start
   ```

3. **Vérifier les logs au démarrage**
   
   Vous devriez voir dans les logs quelque chose comme:
   ```
   🔗 Service Konnect initialisé:
   - API Key: 689f41026a8310ca2790...
   - Wallet ID: 689f41076a8310ca27901216
   - Base URL: https://api.sandbox.konnect.network
   ```
   
   Si vous voyez une clé API différente ou "NON DÉFINIE", le fichier `.env` n'est pas correctement chargé.

4. **Réexécuter les tests**
   ```bash
   cd ..
   $env:MONGODB_URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0"
   node test-subscription-complete.js
   ```

## Vérification

### Test de Connexion Directe Konnect

Le test de connexion directe fonctionne, ce qui confirme que:
- ✅ La nouvelle clé API est valide
- ✅ L'API Konnect répond correctement
- ✅ La configuration est correcte

**Résultat du test:**
```json
{
  "payUrl": "https://gateway.sandbox.konnect.network/pay?payment_ref=6911c8a763c10de262b88c7c",
  "paymentRef": "6911c8a763c10de262b88c7c"
}
```

### Configuration Actuelle

- **KONNECT_API_KEY**: `689f41026a8310ca2790119a:MgBoO199H0zS99ndQ92HvILLm4`
- **KONNECT_BASE_URL**: `https://api.sandbox.konnect.network`
- **KONNECT_RECEIVER_WALLET_ID**: `689f41076a8310ca27901216`

## Résultats Attendus

Après le redémarrage du backend, tous les tests devraient passer:
- ✅ Récupération plans publics
- ✅ Abonnement plan gratuit
- ✅ Récupération abonnement
- ✅ Annulation abonnement
- ✅ Reprise abonnement
- ✅ **Abonnement plan payant** (devrait maintenant fonctionner)

**Taux de réussite attendu: 100%** (6/6 tests)

## Dépannage

### Si l'erreur persiste après le redémarrage

1. **Vérifier le fichier `.env`**
   ```bash
   cat backend/.env | grep KONNECT
   ```
   
   Vous devriez voir:
   ```
   KONNECT_API_KEY=689f41026a8310ca2790119a:MgBoO199H0zS99ndQ92HvILLm4
   KONNECT_BASE_URL=https://api.sandbox.konnect.network
   KONNECT_RECEIVER_WALLET_ID=689f41076a8310ca27901216
   ```

2. **Vérifier les logs du backend**
   - Les logs doivent afficher la nouvelle clé API (masquée)
   - Si vous voyez "NON DÉFINIE", le fichier `.env` n'est pas chargé

3. **Vérifier que le backend utilise bien le fichier `.env`**
   - Le backend doit charger les variables d'environnement depuis `backend/.env`
   - Vérifiez que le script de démarrage charge bien le fichier `.env`

## Conclusion

Le test de connexion directe fonctionne, ce qui confirme que la nouvelle clé API est valide. Le problème est simplement que le backend doit être redémarré pour charger les nouvelles variables d'environnement. Une fois redémarré, tous les tests devraient passer.

