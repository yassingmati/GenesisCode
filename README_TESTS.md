# Guide des Tests - CodeGenesis

## Structure des Tests

### Backend Tests (`backend/tests/`)

#### Configuration
- `jest.config.js` - Configuration Jest avec mongodb-memory-server
- `setup.js` - Setup global pour les tests
- `teardown.js` - Nettoyage après tests

#### Fixtures (`backend/tests/fixtures/`)
- `users.js` - Fixtures pour les utilisateurs
- `categories.js` - Fixtures pour les catégories
- `plans.js` - Fixtures pour les plans
- `subscriptions.js` - Fixtures pour les abonnements
- `paths.js` - Fixtures pour les parcours et niveaux

#### Tests
- **Controllers**: `tests/controllers/`
  - `courseAccessController.test.js`
  - `subscriptionController.test.js`
  - `categoryPaymentController.test.js`

- **Services**: `tests/services/`
  - `accessControlService.test.js`
  - `categoryPaymentService.test.js`
  - `courseAccessService.test.js`

- **Routes**: `tests/routes/`
  - `accessRoutes.test.js`
  - `subscriptionRoutes.test.js`
  - `categoryPaymentRoutes.test.js`

- **Middlewares**: `tests/middlewares/`
  - `authMiddleware.test.js`
  - `subscriptionMiddleware.test.js`

### Frontend Tests (`frontend/src/__tests__/`)

#### Configuration
- `setupTests.js` - Configuration React Testing Library
- `test-utils.jsx` - Utilitaires de test (providers, mocks)

#### Tests
- **Composants**: `__tests__/components/`
  - `CourseAccessGuard.test.jsx`
  - `LevelAccessGate.test.jsx`
  - `SubscriptionModal.test.jsx`

- **Services**: `__tests__/services/`
  - `authService.test.js`
  - `subscriptionService.test.js`
  - `categoryPaymentService.test.js`

- **Hooks**: `__tests__/hooks/`
  - `useCourse.test.js`

- **Contexts**: `__tests__/contexts/`
  - `AuthContext.test.jsx`

### Tests E2E (`cypress/e2e/`)

#### Configuration
- `cypress.config.js` - Configuration Cypress
- `cypress/support/commands.js` - Commandes personnalisées
- `cypress/fixtures/` - Données de test

#### Tests
- `auth.spec.js` - Tests d'authentification
- `subscription.spec.js` - Tests d'abonnement
- `course-access.spec.js` - Tests d'accès aux cours

## Commandes de Test

### Backend
```bash
cd backend
npm test                    # Tous les tests
npm run test:watch          # Mode watch
npm run test:coverage       # Avec couverture
npm run test:controllers    # Tests controllers uniquement
npm run test:services       # Tests services uniquement
npm run test:routes         # Tests routes uniquement
```

### Frontend
```bash
cd frontend
npm test                    # Tous les tests
npm run test:coverage       # Avec couverture
npm run test:ci             # Mode CI (sans watch)
```

### E2E (Cypress)
```bash
# Depuis la racine
npm run test:e2e            # Exécuter tous les tests E2E
npx cypress open            # Ouvrir l'interface Cypress
```

### Tous les tests
```bash
# Depuis la racine
npm run test:all            # Backend + Frontend + E2E
```

## CI/CD

Le workflow GitHub Actions (`.github/workflows/test.yml`) exécute automatiquement :
1. Tests backend avec couverture
2. Tests frontend avec couverture
3. Tests E2E Cypress

## Fixtures Cypress

Les fixtures suivantes sont disponibles dans `cypress/fixtures/` :
- `auth-success.json` - Réponse de connexion réussie
- `plans.json` - Liste des plans
- `subscription-init.json` - Initialisation de paiement
- `access-granted.json` - Accès autorisé
- `access-free.json` - Accès gratuit

## Commandes Cypress Personnalisées

- `cy.login(email, password)` - Connexion
- `cy.logout()` - Déconnexion
- `cy.setAuthToken(token)` - Définir un token d'authentification
- `cy.visitWithAuth(url, token)` - Visiter une URL avec authentification

## Notes Importantes

1. **MongoDB Memory Server**: Les tests backend utilisent `mongodb-memory-server` pour une isolation complète
2. **Mocks**: Les services externes (Konnect, Firebase) sont mockés dans les tests
3. **Cleanup**: Chaque test nettoie les données avant de s'exécuter
4. **Fixtures**: Utilisez les fixtures pour des données de test cohérentes

## Couverture Visée

- Backend: 80%+ pour controllers et services
- Frontend: 70%+ pour composants critiques
- E2E: Flux critiques complets

