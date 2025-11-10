# Guide d'Utilisation des Tests - Plans, Subscription, Admin et Vérification Email

Ce guide explique comment exécuter les tests automatisés pour les fonctionnalités de plans, subscription, admin et vérification email.

## Prérequis

1. **Backend démarré**: Le backend doit être en cours d'exécution
2. **MongoDB connecté**: La base de données MongoDB doit être accessible
3. **Variables d'environnement configurées**: Voir `backend/env.example`

## Configuration

### 1. Vérifier l'environnement

Avant d'exécuter les tests, vérifiez que l'environnement est correctement configuré:

```bash
node test-env-check.js
```

Ce script vérifie:
- ✅ Variables d'environnement requises
- ✅ Connexion MongoDB
- ✅ Connexion au backend
- ✅ Configuration email

### 2. Variables d'environnement requises

Assurez-vous que le fichier `backend/.env` contient:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_ADMIN_SECRET=your-admin-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

## Exécution des Tests

### Tous les tests

Pour exécuter tous les tests:

```bash
node test-plans-subscription-admin-email.js
```

Ce script exécute:
1. Tests de création d'admin
2. Tests de gestion des plans
3. Tests de subscription
4. Tests de vérification email

Et génère un rapport détaillé dans `TEST_RESULTS_PLANS_SUBSCRIPTION.md`.

### Tests spécifiques

Vous pouvez également exécuter les tests individuellement:

#### Tests de création d'admin

```bash
node test-admin-creation.js
```

#### Tests de gestion des plans

```bash
node test-plans-management.js
```

#### Tests de subscription

```bash
node test-subscription-flow.js
```

#### Tests de vérification email

```bash
node test-email-verification.js
```

## Structure des Tests

### 1. Tests de création d'admin

- ✅ Création admin via script
- ✅ Création admin via API
- ✅ Authentification admin
- ✅ Liste des admins

### 2. Tests de gestion des plans

- ✅ Création de plan
- ✅ Modification de plan
- ✅ Désactivation de plan
- ✅ Réactivation de plan
- ✅ Liste des plans (admin)
- ✅ Liste des plans (public)

### 3. Tests de subscription

- ✅ Abonnement plan gratuit
- ✅ Abonnement plan payant
- ✅ Récupération abonnement
- ✅ Annulation abonnement
- ✅ Reprise abonnement

### 4. Tests de vérification email

- ✅ Envoi email de vérification
- ✅ Contenu de l'email
- ✅ Clic sur lien de vérification
- ✅ Statut après vérification
- ✅ Réenvoi email (utilisateur vérifié)

## Résultats des Tests

### Rapport généré

Après l'exécution, un rapport est généré dans `TEST_RESULTS_PLANS_SUBSCRIPTION.md` avec:

- Résumé des tests (réussis/échoués)
- Détails de chaque test
- Erreurs rencontrées
- Avertissements
- Recommandations

### Format du rapport

```markdown
# Rapport de Test - Plans, Subscription, Admin et Vérification Email

## Résumé
- Total des tests: X
- Tests réussis: Y ✅
- Tests échoués: Z ❌
- Taux de succès: XX%

## Résultats détaillés
...
```

## Dépannage

### Erreurs courantes

1. **Backend non accessible**
   - Vérifiez que le backend est démarré
   - Vérifiez que le port 5000 est disponible
   - Vérifiez SERVER_URL dans `.env`

2. **MongoDB non connecté**
   - Vérifiez MONGODB_URI
   - Vérifiez la connexion réseau
   - Vérifiez les permissions MongoDB

3. **Email non envoyé**
   - Vérifiez EMAIL_USER et EMAIL_PASS
   - Pour Gmail, utilisez un mot de passe d'application
   - Vérifiez les logs du backend

4. **Token invalide**
   - Vérifiez JWT_SECRET et JWT_ADMIN_SECRET
   - Vérifiez que les tokens ne sont pas expirés
   - Réexécutez les tests de création d'admin

### Logs

Les tests affichent des logs détaillés dans la console:
- ✅ Tests réussis
- ❌ Tests échoués
- ⚠️ Avertissements
- 📋 Informations

## Tests Manuels

Pour les tests manuels, consultez `TEST_GUIDE_PLANS_SUBSCRIPTION.md` qui contient:

- Instructions détaillées pour chaque test
- Exemples de requêtes API
- Checklist de test
- Guide de dépannage

## Intégration Continue

Les tests peuvent être intégrés dans un pipeline CI/CD:

```yaml
# Exemple GitHub Actions
- name: Run Tests
  run: |
    npm install
    node test-env-check.js
    node test-plans-subscription-admin-email.js
```

## Prochaines Étapes

Après l'exécution des tests:

1. ✅ Vérifier le rapport généré
2. ✅ Corriger les bugs identifiés
3. ✅ Réexécuter les tests
4. ✅ Mettre à jour la documentation

## Support

En cas de problème:

1. Vérifiez les logs du backend
2. Vérifiez la configuration de l'environnement
3. Consultez `TEST_GUIDE_PLANS_SUBSCRIPTION.md`
4. Vérifiez les erreurs dans le rapport généré
