# Guide de Test Manuel - Plans, Subscription, Admin et Vérification Email

Ce guide fournit des instructions détaillées pour tester manuellement les fonctionnalités de plans, subscription, admin et vérification email.

## Prérequis

### 1. Configuration de l'environnement

Assurez-vous que les variables d'environnement suivantes sont configurées dans `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codegenesis
JWT_SECRET=your-jwt-secret-minimum-32-characters
JWT_ADMIN_SECRET=your-admin-jwt-secret-different-from-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### 2. Démarrage du backend

```bash
cd backend
npm install
npm start
```

Le backend devrait démarrer sur `http://localhost:5000`.

### 3. Outils nécessaires

- **Postman** ou **Thunder Client** (extension VS Code) pour les tests API
- **Navigateur web** pour tester l'interface admin
- **Accès à la boîte email** pour vérifier les emails de vérification

## Tests de Création d'Admin

### Test 1.1: Création admin via script

1. Ouvrir un terminal
2. Exécuter le script:
   ```bash
   cd backend
   node src/scripts/createAdminUser.js
   ```
3. Vérifier la sortie:
   - Admin créé avec l'email `admin@test.com`
   - Rôle admin présent
   - `isVerified = true`

### Test 1.2: Création admin via API

1. Ouvrir Postman/Thunder Client
2. Créer une requête POST vers `http://localhost:5000/api/admin/register`
3. Headers:
   - `Content-Type: application/json`
4. Body (JSON):
   ```json
   {
     "email": "admin2@test.com",
     "password": "password123"
   }
   ```
5. Vérifier la réponse:
   - Status: `201 Created`
   - Token JWT présent
   - Admin créé avec l'email spécifié

### Test 1.3: Authentification admin

1. Créer une requête POST vers `http://localhost:5000/api/admin/login`
2. Body (JSON):
   ```json
   {
     "email": "admin2@test.com",
     "password": "password123"
   }
   ```
3. Vérifier la réponse:
   - Status: `200 OK`
   - Token JWT présent
   - Admin object présent

4. **Sauvegarder le token** pour les tests suivants

### Test 1.4: Liste des admins

1. Créer une requête GET vers `http://localhost:5000/api/admin/list`
2. Headers:
   - `Authorization: Bearer <admin_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - Liste des admins retournée
   - Admin créé présent dans la liste

## Tests de Gestion des Plans

### Test 2.1: Créer un plan via API admin

1. Créer une requête POST vers `http://localhost:5000/api/admin/subscriptions/plans`
2. Headers:
   - `Authorization: Bearer <admin_token>`
   - `Content-Type: application/json`
3. Body (JSON):
   ```json
   {
     "_id": "plan-test-001",
     "name": "Plan Test",
     "description": "Plan de test pour les tests manuels",
     "priceCents": 1000,
     "currency": "TND",
     "interval": "month",
     "features": ["Feature 1", "Feature 2", "Feature 3"],
     "active": true
   }
   ```
4. Vérifier la réponse:
   - Status: `201 Created`
   - Plan créé avec les données spécifiées
   - Plan visible dans MongoDB

### Test 2.2: Modifier un plan

1. Créer une requête PUT vers `http://localhost:5000/api/admin/subscriptions/plans/plan-test-001`
2. Headers:
   - `Authorization: Bearer <admin_token>`
   - `Content-Type: application/json`
3. Body (JSON):
   ```json
   {
     "name": "Plan Test Modifié",
     "priceCents": 2000,
     "description": "Plan modifié pour les tests"
   }
   ```
4. Vérifier la réponse:
   - Status: `200 OK`
   - Plan modifié avec les nouvelles données

### Test 2.3: Désactiver un plan

1. Créer une requête DELETE vers `http://localhost:5000/api/admin/subscriptions/plans/plan-test-001`
2. Headers:
   - `Authorization: Bearer <admin_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - Plan désactivé (`active = false`)

### Test 2.4: Lister les plans (admin)

1. Créer une requête GET vers `http://localhost:5000/api/admin/subscriptions/plans`
2. Headers:
   - `Authorization: Bearer <admin_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - Liste complète des plans (actifs et inactifs)
   - Pagination fonctionnelle

### Test 2.5: Lister les plans (public)

1. Créer une requête GET vers `http://localhost:5000/api/subscriptions/plans`
2. **Pas besoin d'authentification**
3. Vérifier la réponse:
   - Status: `200 OK`
   - Seulement les plans actifs
   - Plan désactivé ne devrait pas apparaître

### Test 2.6: Réactiver un plan

1. Créer une requête PUT vers `http://localhost:5000/api/admin/subscriptions/plans/plan-test-001`
2. Headers:
   - `Authorization: Bearer <admin_token>`
   - `Content-Type: application/json`
3. Body (JSON):
   ```json
   {
     "active": true
   }
   ```
4. Vérifier la réponse:
   - Status: `200 OK`
   - Plan réactivé (`active = true`)
   - Plan visible dans la liste publique

## Tests de Subscription

### Préparation: Créer un utilisateur de test

1. Créer une requête POST vers `http://localhost:5000/api/auth/register`
2. Body (JSON):
   ```json
   {
     "email": "test-subscription@test.com",
     "password": "test123",
     "userType": "student"
   }
   ```
3. **Sauvegarder le token utilisateur** pour les tests suivants

### Préparation: Créer des plans de test

1. Créer un plan gratuit (voir Test 2.1):
   ```json
   {
     "_id": "plan-free-test",
     "name": "Plan Gratuit Test",
     "priceCents": 0,
     "currency": "TND",
     "interval": "month",
     "features": ["Accès gratuit"],
     "active": true
   }
   ```

2. Créer un plan payant (voir Test 2.1):
   ```json
   {
     "_id": "plan-paid-test",
     "name": "Plan Payant Test",
     "priceCents": 5000,
     "currency": "TND",
     "interval": "month",
     "features": ["Accès premium", "Support prioritaire"],
     "active": true
   }
   ```

### Test 3.1: S'abonner à un plan gratuit

1. Créer une requête POST vers `http://localhost:5000/api/subscriptions/subscribe`
2. Headers:
   - `Authorization: Bearer <user_token>`
   - `Content-Type: application/json`
3. Body (JSON):
   ```json
   {
     "planId": "plan-free-test"
   }
   ```
4. Vérifier la réponse:
   - Status: `200 OK`
   - Abonnement activé localement
   - `status = "active"`
   - `currentPeriodEnd` défini

### Test 3.2: S'abonner à un plan payant

1. Créer une requête POST vers `http://localhost:5000/api/subscriptions/subscribe`
2. Headers:
   - `Authorization: Bearer <user_token>`
   - `Content-Type: application/json`
3. Body (JSON):
   ```json
   {
     "planId": "plan-paid-test"
   }
   ```
4. Vérifier la réponse:
   - Status: `200 OK`
   - `paymentUrl` retourné (pour redirection vers paiement)
   - `status = "incomplete"`
   - `konnectPaymentId` créé (si Konnect est configuré)

### Test 3.3: Récupérer l'abonnement

1. Créer une requête GET vers `http://localhost:5000/api/subscriptions/me`
2. Headers:
   - `Authorization: Bearer <user_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - Abonnement retourné avec tous les détails
   - Plan, status, dates présents

### Test 3.4: Annuler un abonnement

1. Créer une requête POST vers `http://localhost:5000/api/subscriptions/cancel`
2. Headers:
   - `Authorization: Bearer <user_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - `cancelAtPeriodEnd = true`
   - Status reste `"active"` jusqu'à la fin de période

### Test 3.5: Reprendre un abonnement

1. Créer une requête POST vers `http://localhost:5000/api/subscriptions/resume`
2. Headers:
   - `Authorization: Bearer <user_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - `cancelAtPeriodEnd = false`
   - Status = `"active"`

## Tests de Vérification Email

### Préparation: Créer un utilisateur non vérifié

1. Créer une requête POST vers `http://localhost:5000/api/auth/register`
2. Body (JSON):
   ```json
   {
     "email": "test-email@test.com",
     "password": "test123",
     "userType": "student"
   }
   ```
3. **Sauvegarder le token utilisateur** pour les tests suivants
4. Vérifier que `isVerified = false` dans la réponse

### Test 4.1: Envoyer un email de vérification

1. Créer une requête POST vers `http://localhost:5000/api/auth/send-verification`
2. Headers:
   - `Authorization: Bearer <user_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - Message de succès

4. **Vérifier les logs serveur:**
   - Email envoyé avec succès
   - Pas d'erreur SMTP

5. **Vérifier la boîte email:**
   - Email reçu à `test-email@test.com`
   - Sujet: "Vérification de votre email"
   - Lien de vérification présent

### Test 4.2: Vérifier le contenu de l'email

1. Ouvrir l'email reçu
2. Vérifier:
   - Sujet: "Vérification de votre email"
   - Lien de vérification présent
   - Lien pointe vers: `${SERVER_URL}/api/auth/verify-email?token=...`
   - Design HTML correct
   - Message clair et professionnel

### Test 4.3: Cliquer sur le lien de vérification

1. Cliquer sur le lien de vérification dans l'email
2. Vérifier:
   - Redirection vers `${CLIENT_URL}/verified-success`
   - Message de succès affiché
   - Pas d'erreur dans la console

3. **Vérifier dans la base de données:**
   - `isVerified = true` pour l'utilisateur
   - Date de vérification enregistrée

### Test 4.4: Vérifier le statut après vérification

1. Créer une requête GET vers `http://localhost:5000/api/auth/profile`
2. Headers:
   - `Authorization: Bearer <user_token>`
3. Vérifier la réponse:
   - Status: `200 OK`
   - `isVerified = true`
   - Profil utilisateur complet

### Test 4.5: Réenvoyer un email de vérification

1. Créer une requête POST vers `http://localhost:5000/api/auth/send-verification`
2. Headers:
   - `Authorization: Bearer <user_token>` (utilisateur déjà vérifié)
3. Vérifier la réponse:
   - Status: `400 Bad Request`
   - Message: "Email is already verified" ou "Email déjà vérifié"

## Tests via Interface Admin

### Accéder au panel admin

1. Ouvrir `http://localhost:3000/admin/login` (si frontend est démarré)
2. Se connecter avec les identifiants admin
3. Vérifier l'accès au panel admin

### Tester la gestion des plans via UI

1. Naviguer vers "Gestion des Plans" ou "Subscription Management"
2. Créer un nouveau plan via l'interface
3. Modifier un plan existant
4. Désactiver/activer un plan
5. Vérifier que les modifications sont sauvegardées

### Tester la gestion des abonnements via UI

1. Naviguer vers "Gestion des Abonnements"
2. Lister les abonnements actifs
3. Voir les détails d'un abonnement
4. Modifier un abonnement utilisateur
5. Annuler un abonnement

## Checklist de Test

### Création Admin
- [ ] Admin créé via script
- [ ] Admin créé via API
- [ ] Authentification admin fonctionnelle
- [ ] Liste des admins accessible

### Gestion des Plans
- [ ] Plan créé via API
- [ ] Plan modifié avec succès
- [ ] Plan désactivé
- [ ] Plan réactivé
- [ ] Liste des plans (admin) fonctionnelle
- [ ] Liste des plans (public) fonctionnelle

### Subscription
- [ ] Abonnement plan gratuit activé
- [ ] Abonnement plan payant initié
- [ ] Abonnement récupéré
- [ ] Abonnement annulé
- [ ] Abonnement repris

### Vérification Email
- [ ] Email de vérification envoyé
- [ ] Email reçu dans la boîte de réception
- [ ] Contenu de l'email correct
- [ ] Lien de vérification fonctionnel
- [ ] Statut isVerified mis à jour
- [ ] Réenvoi refusé pour utilisateur vérifié

## Dépannage

### Erreurs courantes

1. **Erreur 401 Unauthorized**
   - Vérifier que le token est valide
   - Vérifier que le token est dans le header Authorization
   - Vérifier que le token n'a pas expiré

2. **Erreur 403 Forbidden**
   - Vérifier que l'utilisateur a les droits admin
   - Vérifier que le token admin est utilisé

3. **Email non envoyé**
   - Vérifier la configuration EMAIL_USER et EMAIL_PASS
   - Vérifier les logs serveur
   - Vérifier que Gmail permet les applications moins sécurisées (ou utiliser un mot de passe d'application)

4. **Backend non accessible**
   - Vérifier que le backend est démarré
   - Vérifier que le port 5000 est disponible
   - Vérifier les logs du backend

5. **MongoDB non connecté**
   - Vérifier MONGODB_URI
   - Vérifier la connexion réseau
   - Vérifier les logs MongoDB

## Résultats attendus

Tous les tests devraient passer avec succès:
- ✅ Tous les endpoints retournent les codes de statut attendus
- ✅ Les données sont correctement sauvegardées dans MongoDB
- ✅ Les emails sont envoyés et reçus
- ✅ Les tokens JWT sont valides
- ✅ L'interface admin est accessible

## Prochaines étapes

Après avoir complété tous les tests:
1. Documenter les résultats dans `TEST_RESULTS_PLANS_SUBSCRIPTION.md`
2. Corriger les bugs identifiés
3. Réexécuter les tests pour vérifier les corrections
4. Mettre à jour la documentation si nécessaire


