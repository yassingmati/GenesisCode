# Configuration Konnect

## Variables d'environnement requises

Pour activer les paiements Konnect, vous devez configurer les variables d'environnement suivantes dans `backend/.env` ou dans les variables d'environnement de votre déploiement (Render) :

```env
# Konnect API Key (obligatoire)
KONNECT_API_KEY=your-konnect-api-key-here

# Konnect Receiver Wallet ID (obligatoire)
KONNECT_RECEIVER_WALLET_ID=your-receiver-wallet-id-here

# Konnect Base URL (optionnel, défaut: https://api.konnect.network)
# Pour le sandbox (test) :
KONNECT_BASE_URL=https://api.sandbox.konnect.network
# Pour la production :
# KONNECT_BASE_URL=https://api.konnect.network

# Konnect Webhook URL (optionnel, générée automatiquement si non spécifiée)
KONNECT_WEBHOOK_URL=https://your-backend-url.onrender.com/api/payment/webhook
```

## Où obtenir les clés Konnect

1. **Konnect API Key** :
   - Connectez-vous à votre compte Konnect
   - Allez dans les paramètres de l'API
   - Générez ou copiez votre clé API

2. **Konnect Receiver Wallet ID** :
   - Connectez-vous à votre compte Konnect
   - Allez dans la section "Wallets"
   - Copiez l'ID du wallet récepteur

## Configuration pour Render

Si vous déployez sur Render, ajoutez ces variables dans les paramètres de votre service :

1. Allez dans votre service Render
2. Cliquez sur "Environment"
3. Ajoutez les variables d'environnement :
   - `KONNECT_API_KEY`
   - `KONNECT_RECEIVER_WALLET_ID`
   - `KONNECT_BASE_URL` (optionnel)
   - `KONNECT_WEBHOOK_URL` (optionnel)

## Vérification de la configuration

Une fois configuré, vérifiez que le service Konnect est correctement initialisé en regardant les logs au démarrage du serveur. Vous devriez voir :

```
🔗 Service Konnect initialisé:
- API Key: ********************...
- Wallet ID: your-wallet-id
- Base URL: https://api.konnect.network
- Webhook URL: https://your-backend-url.onrender.com/api/payment/webhook
```

Si vous voyez des avertissements, vérifiez que toutes les variables sont correctement configurées.

## Mode test (sans Konnect)

Si vous n'avez pas encore configuré Konnect, le service fonctionnera en mode dégradé avec des messages d'avertissement. Les paiements ne fonctionneront pas, mais le reste de l'application fonctionnera normalement.




