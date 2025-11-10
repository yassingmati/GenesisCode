# Configuration Konnect - Guide Complet

## Date: 2025-01-XX

## Informations de Configuration

### Variables d'Environnement Konnect

Les variables suivantes ont été configurées dans `backend/.env`:

```env
KONNECT_RECEIVER_WALLET_ID=689f41076a8310ca27901216
KONNECT_BASE_URL=https://api.sandbox.konnect.network
KONNECT_API_KEY=689f41026a8310ca2790119a:tyoTF3caVuyYo09BxMIViXOXRdVz5wHA
```

### URLs Konnect

- **Dashboard Sandbox**: https://dashboard.sandbox.konnect.network
- **API Sandbox**: https://api.sandbox.konnect.network

**Note importante**: Le backend utilise `KONNECT_BASE_URL` pour l'API, pas le dashboard. L'URL a été automatiquement corrigée de `dashboard.sandbox.konnect.network` vers `api.sandbox.konnect.network`.

## Configuration Appliquée

### Script de Mise à Jour

Le script `update-konnect-config.js` a été créé pour mettre à jour automatiquement les variables Konnect dans `backend/.env`.

**Utilisation:**
```bash
node update-konnect-config.js
```

### Vérification de la Configuration

Le service Konnect (`backend/src/services/konnectService.js`) utilise les variables suivantes:

1. **KONNECT_API_KEY**: Clé API pour authentifier les requêtes
2. **KONNECT_BASE_URL**: URL de base de l'API Konnect (par défaut: `https://api.sandbox.konnect.network`)
3. **KONNECT_RECEIVER_WALLET_ID**: ID du portefeuille destinataire

## Redémarrage du Backend

**IMPORTANT**: Après la mise à jour des variables d'environnement, le backend doit être redémarré pour charger les nouvelles valeurs.

### Étapes pour Redémarrer le Backend

1. Arrêter le backend actuel (Ctrl+C dans le terminal où il tourne)
2. Redémarrer le backend:
   ```bash
   cd backend
   npm start
   ```

### Vérification

Une fois le backend redémarré, vérifiez les logs pour confirmer que les variables Konnect sont chargées:

```
🔗 Service Konnect initialisé:
- API Key: 689f41026a8310ca2790...
- Wallet ID: 689f41076a8310ca27901216
- Base URL: https://api.sandbox.konnect.network
```

## Tests

Après le redémarrage du backend, réexécutez les tests:

```bash
# Définir MONGODB_URI pour cette session
$env:MONGODB_URI = "mongodb+srv://discord:TH3R890ie9VzACpX@cluster0.whxj5zj.mongodb.net/codegenesis?retryWrites=true&w=majority&appName=Cluster0"

# Exécuter les tests subscriptions
node test-subscription-complete.js
```

## Résolution des Problèmes

### Erreur: "Invalid Api Key"

Si vous obtenez toujours l'erreur "Invalid Api Key" après le redémarrage:

1. **Vérifier le format de la clé API**: La clé doit être au format `id:secret`
2. **Vérifier l'environnement**: Assurez-vous d'utiliser les clés sandbox pour l'environnement sandbox
3. **Vérifier les logs du backend**: Les logs doivent afficher la clé API (masquée) au démarrage
4. **Vérifier le fichier .env**: Ouvrez `backend/.env` et vérifiez que les variables sont correctement définies

### Erreur: "KONNECT_RECEIVER_WALLET_ID non défini"

Si vous obtenez cette erreur:

1. Vérifiez que `KONNECT_RECEIVER_WALLET_ID` est défini dans `backend/.env`
2. Redémarrez le backend après la mise à jour

## Documentation Konnect

Pour plus d'informations sur l'API Konnect:
- Dashboard: https://dashboard.sandbox.konnect.network
- Documentation API: Consultez la documentation officielle de Konnect

## Conclusion

La configuration Konnect a été mise à jour avec succès. N'oubliez pas de redémarrer le backend pour que les changements prennent effet.

