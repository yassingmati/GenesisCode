# Guide de Test - Système de Déblocage Séquentiel

## Vue d'ensemble

Ce guide fournit des instructions complètes pour tester le système de déblocage séquentiel de CodeGenesis. Le système implémente un contrôle d'accès strict où les utilisateurs ne peuvent accéder aux niveaux qu'ils ont débloqués en complétant les niveaux précédents.

## Architecture du Système

### Composants Backend
- **LevelUnlockService** : Logique de déblocage des niveaux
- **CategoryAccess** : Modèle de données pour l'accès aux catégories
- **levelAccessMiddleware** : Middleware de contrôle d'accès
- **CourseController** : Contrôleur pour les opérations de cours
- **Routes API** : Endpoints protégés pour l'accès au contenu

### Composants Frontend
- **SequentialLevelAccess** : Composant de contrôle d'accès
- **LevelUnlockStatus** : Affichage du statut de déblocage
- **LevelUnlockNotification** : Notifications de déblocage
- **Services API** : Communication avec le backend

## Tests Automatisés

### 1. Tests Backend

#### Test Complet du Système
```bash
cd backend/src/scripts
node testCompleteSystem.js
```

**Ce test vérifie :**
- Attribution d'accès initial
- Déblocage séquentiel des niveaux
- Soumission d'exercices
- Contrôle d'accès strict
- Gestion des déblocages concurrents
- API de statut de déblocage
- Gestion d'erreurs

#### Test des Routes API
```bash
cd backend/src/scripts
node testAPIRoutes.js
```

**Ce test vérifie :**
- Authentification des routes
- Contrôle d'accès aux niveaux
- Soumission d'exercices
- Statut de déblocage
- Gestion des erreurs API
- Routes de médias

#### Test de Migration
```bash
cd backend/src/scripts
node migrateSequentialUnlock.js
```

**Ce test vérifie :**
- Migration des données existantes
- Correction des accès incorrects
- Préservation des progrès utilisateur

### 2. Tests Frontend

#### Test des Services
```javascript
// Dans la console du navigateur
import FrontendSequentialUnlockTester from './utils/testSequentialUnlockFrontend';
const tester = new FrontendSequentialUnlockTester();
await tester.runAllFrontendTests();
```

**Ce test vérifie :**
- Connexions aux services API
- Accès au contenu des niveaux
- Statut de déblocage
- Soumission d'exercices
- Gestion d'erreurs frontend

### 3. Tests Complets

#### Exécution de Tous les Tests
```bash
cd backend/src/scripts
node runAllTests.js
```

Ce script exécute tous les tests backend et frontend et fournit un rapport complet.

## Tests Manuels

### 1. Test du Flux Utilisateur Complet

#### Scénario 1 : Nouvel Utilisateur
1. **Créer un compte utilisateur**
   - Inscription avec email valide
   - Vérification de l'email
   - Connexion réussie

2. **Accès à une catégorie**
   - Achat d'un plan de catégorie
   - Vérification du déblocage automatique du premier niveau
   - Accès au contenu du premier niveau

3. **Progression séquentielle**
   - Completion des exercices du premier niveau
   - Vérification du déblocage du niveau suivant
   - Accès au contenu du niveau suivant

#### Scénario 2 : Utilisateur Existant
1. **Migration des données**
   - Exécution du script de migration
   - Vérification de la préservation des progrès
   - Correction des accès incorrects

2. **Continuation de l'apprentissage**
   - Accès aux niveaux déjà débloqués
   - Progression vers de nouveaux niveaux
   - Vérification du système de déblocage

### 2. Test des Cas d'Erreur

#### Accès Non Autorisé
1. **Niveau verrouillé**
   - Tentative d'accès direct à un niveau verrouillé
   - Vérification du message d'erreur 403
   - Redirection vers le niveau précédent

2. **Token expiré**
   - Utilisation d'un token d'authentification expiré
   - Vérification de la redirection vers la connexion
   - Reconnexion et accès au contenu

#### Données Invalides
1. **ID de niveau invalide**
   - Tentative d'accès avec un ID malformé
   - Vérification du message d'erreur 400
   - Gestion gracieuse de l'erreur

2. **Niveau inexistant**
   - Tentative d'accès à un niveau qui n'existe pas
   - Vérification du message d'erreur 404
   - Redirection vers une page d'erreur

### 3. Test des Notifications

#### Déblocage de Niveau
1. **Completion d'un niveau**
   - Soumission réussie d'un exercice
   - Vérification de la notification de déblocage
   - Animation et message de félicitations

2. **Progression dans le parcours**
   - Completion de plusieurs niveaux
   - Vérification des notifications successives
   - Mise à jour de l'interface utilisateur

### 4. Test des Performances

#### Charge Utilisateur
1. **Déblocages concurrents**
   - Simulation de plusieurs utilisateurs complétant des niveaux simultanément
   - Vérification de l'atomicité des opérations
   - Absence de déblocages dupliqués

2. **Requêtes API**
   - Test de charge sur les endpoints de déblocage
   - Vérification des temps de réponse
   - Gestion des erreurs sous charge

## Tests d'Intégration

### 1. Intégration Frontend-Backend

#### Communication API
1. **Authentification**
   - Envoi des tokens d'authentification
   - Vérification des headers d'autorisation
   - Gestion des erreurs d'authentification

2. **Synchronisation des données**
   - Mise à jour en temps réel du statut de déblocage
   - Synchronisation des progrès utilisateur
   - Gestion des conflits de données

### 2. Intégration Base de Données

#### Cohérence des Données
1. **Transactions atomiques**
   - Vérification de l'atomicité des déblocages
   - Gestion des rollbacks en cas d'erreur
   - Intégrité des données

2. **Index et Performances**
   - Vérification des index sur les requêtes fréquentes
   - Optimisation des requêtes de déblocage
   - Monitoring des performances

## Tests de Sécurité

### 1. Contrôle d'Accès

#### Autorisation
1. **Vérification des permissions**
   - Tentative d'accès avec des tokens invalides
   - Vérification des restrictions d'accès
   - Protection contre les accès non autorisés

2. **Validation des données**
   - Injection de données malveillantes
   - Vérification de la validation des entrées
   - Protection contre les attaques

### 2. Confidentialité

#### Protection des Données
1. **Données utilisateur**
   - Vérification de la protection des informations personnelles
   - Chiffrement des données sensibles
   - Conformité RGPD

## Tests de Compatibilité

### 1. Navigateurs

#### Support Multi-Navigateurs
1. **Chrome, Firefox, Safari, Edge**
   - Test des fonctionnalités sur tous les navigateurs
   - Vérification de la compatibilité des APIs
   - Gestion des différences de comportement

### 2. Appareils

#### Responsive Design
1. **Desktop, Tablette, Mobile**
   - Test de l'interface sur différentes tailles d'écran
   - Vérification de la navigation tactile
   - Optimisation des performances mobiles

## Tests de Régression

### 1. Fonctionnalités Existantes

#### Préservation des Fonctionnalités
1. **Système de cours existant**
   - Vérification que les fonctionnalités existantes fonctionnent toujours
   - Test des migrations de données
   - Absence de régression

### 2. Intégrations

#### Services Externes
1. **Paiements, Notifications, Analytics**
   - Vérification des intégrations existantes
   - Test des webhooks et callbacks
   - Gestion des erreurs d'intégration

## Outils de Test

### 1. Outils Backend
- **Jest** : Tests unitaires
- **Supertest** : Tests d'API
- **MongoDB Memory Server** : Base de données de test

### 2. Outils Frontend
- **React Testing Library** : Tests de composants
- **Cypress** : Tests end-to-end
- **Jest** : Tests unitaires

### 3. Outils de Monitoring
- **Winston** : Logging
- **Morgan** : Logging HTTP
- **New Relic** : Monitoring des performances

## Procédures de Déploiement

### 1. Environnement de Test
1. **Configuration**
   - Base de données de test séparée
   - Variables d'environnement de test
   - Services de test isolés

2. **Exécution des Tests**
   - Tests automatisés avant déploiement
   - Tests manuels sur l'environnement de test
   - Validation des performances

### 2. Environnement de Production
1. **Déploiement Graduel**
   - Déploiement sur un pourcentage d'utilisateurs
   - Monitoring des erreurs et performances
   - Rollback en cas de problème

2. **Validation Post-Déploiement**
   - Tests de smoke sur la production
   - Monitoring des métriques clés
   - Feedback utilisateur

## Checklist de Test

### Avant le Déploiement
- [ ] Tous les tests automatisés passent
- [ ] Tests manuels effectués
- [ ] Tests de performance validés
- [ ] Tests de sécurité effectués
- [ ] Documentation mise à jour
- [ ] Plan de rollback préparé

### Après le Déploiement
- [ ] Tests de smoke sur la production
- [ ] Monitoring des erreurs activé
- [ ] Métriques de performance surveillées
- [ ] Feedback utilisateur collecté
- [ ] Documentation de déploiement mise à jour

## Support et Maintenance

### 1. Monitoring Continu
- Surveillance des erreurs en temps réel
- Alertes automatiques pour les problèmes critiques
- Tableaux de bord de performance

### 2. Tests Réguliers
- Tests automatisés dans la CI/CD
- Tests de régression hebdomadaires
- Tests de performance mensuels

### 3. Documentation
- Mise à jour des guides de test
- Documentation des bugs et corrections
- Formation de l'équipe sur les nouveaux tests

## Conclusion

Ce guide de test fournit une approche complète pour valider le système de déblocage séquentiel. L'exécution régulière de ces tests garantit la qualité et la fiabilité du système, tout en permettant une détection précoce des problèmes.

Pour toute question ou problème, consultez la documentation technique ou contactez l'équipe de développement.
