# Guide de Test - Système de Déblocage Séquentiel

## Vue d'ensemble

Ce guide explique comment tester le système de déblocage séquentiel de CodeGenesis. Le système implémente un contrôle d'accès strict basé sur les règles métier suivantes :

- **Premier niveau débloqué** : Le premier niveau du premier parcours de chaque catégorie est débloqué par défaut
- **Déblocage séquentiel** : Les niveaux suivants sont débloqués automatiquement après completion du niveau précédent
- **Contrôle d'accès strict** : Seuls les niveaux débloqués permettent l'accès au contenu

## Structure des Tests

### 1. Tests Backend

#### 1.1 Test du Système Complet (`testCompleteSystem.js`)
**Objectif** : Tester l'ensemble du système de déblocage séquentiel

**Fonctionnalités testées** :
- ✅ Création d'utilisateur et données de test
- ✅ Déblocage initial du premier niveau
- ✅ Déblocage séquentiel des niveaux suivants
- ✅ Soumission d'exercices et progression
- ✅ Contrôle d'accès aux niveaux
- ✅ Gestion des déblocages concurrents
- ✅ Statut de déblocage des catégories et parcours

**Exécution** :

```bash
cd backend
node src/scripts/testCompleteSystem.js
```

**Résultat attendu** : Taux de réussite ≥ 85% (certains tests de concurrence peuvent échouer de manière attendue)

#### 1.2 Test des Routes API (`testAPIRoutes.js`)
**Objectif** : Tester la logique métier des routes API

**Fonctionnalités testées** :
- ✅ Logique d'authentification
- ✅ Logique des catégories
- ✅ Contrôle d'accès aux niveaux
- ✅ Logique des exercices
- ✅ Statut de déblocage
- ✅ Gestion des accès refusés
- ✅ Logique des médias

**Exécution** :

```bash
cd backend
node src/scripts/testAPIRoutes.js
```

**Résultat attendu** : Taux de réussite 100%

#### 1.3 Test Complet (`runAllTests.js`)
**Objectif** : Exécuter tous les tests backend

**Exécution** :

```bash
cd backend
node src/scripts/runAllTests.js
```

**Résultat attendu** : Taux de réussite global ≥ 85%

### 2. Tests Frontend

#### 2.1 Test des Composants (`testSequentialUnlockFrontend.js`)
**Objectif** : Tester l'intégration frontend du système de déblocage

**Fonctionnalités testées** :
- ✅ Composant `SequentialLevelAccess`
- ✅ Composant `LevelUnlockStatus`
- ✅ Composant `LevelUnlockNotification`
- ✅ Intégration avec `LevelPage`
- ✅ Service `courseService`

**Exécution** :

```bash
cd frontend
node src/utils/testSequentialUnlockFrontend.js
```

## Configuration des Tests

### Variables d'Environnement

```bash
# Base de données de test
MONGODB_URI=mongodb://localhost:27017/code_genesis_test

# Configuration des tests
CLEANUP=true          # Nettoyage automatique des données de test
VERBOSE=true          # Affichage détaillé des logs
```

### Prérequis

1. **MongoDB** : Instance MongoDB accessible
2. **Node.js** : Version 16+ recommandée
3. **Dépendances** : Toutes les dépendances installées (`npm install`)

## Interprétation des Résultats

### Codes de Statut

- ✅ **PASSÉ** : Test réussi
- ❌ **ÉCHOUÉ** : Test échoué avec erreur
- ⚠️ **ATTENTION** : Test partiellement réussi ou avec avertissement

### Taux de Réussite

- **100%** : Système parfaitement fonctionnel
- **85-99%** : Système fonctionnel avec quelques problèmes mineurs
- **< 85%** : Problèmes majeurs nécessitant une correction

### Erreurs Communes

#### 1. Erreurs de Validation Mongoose
```
CategoryAccess validation failed: categoryPlan: Path `categoryPlan` is required.
```
**Solution** : Vérifier que tous les champs requis sont fournis dans les données de test

#### 2. Erreurs de Concurrence
```
Déblocages concurrents: Plusieurs déblocages concurrents ont réussi
```
**Solution** : Cette erreur est attendue dans certains cas de test de concurrence

#### 3. Erreurs de Connexion
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution** : Changer le port ou arrêter les processus utilisant le port

## Dépannage

### Problèmes de Base de Données

1. **Vérifier la connexion MongoDB** :
   ```bash
   mongosh mongodb://localhost:27017/code_genesis_test
   ```

2. **Nettoyer la base de test** :
   ```bash
   mongosh mongodb://localhost:27017/code_genesis_test --eval "db.dropDatabase()"
   ```

### Problèmes de Dépendances

1. **Réinstaller les dépendances** :
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Vérifier les versions** :
   ```bash
   node --version
   npm --version
   ```

### Problèmes de Tests

1. **Exécuter un test spécifique** :

```bash
   node src/scripts/testCompleteSystem.js
   ```

2. **Activer le mode verbose** :

```bash
   VERBOSE=true node src/scripts/testCompleteSystem.js
   ```

## Migration des Données Existantes

### Script de Migration

```bash
cd backend
node src/scripts/migrateSequentialUnlock.js
```

**Objectif** : Mettre à jour les données existantes pour respecter les nouvelles règles de déblocage

**Actions** :
- Identifie les utilisateurs avec accès aux catégories
- Débloque le premier niveau du premier parcours pour chaque catégorie
- Préserve les niveaux déjà débloqués

## Intégration Continue

### Pipeline de Test Recommandé

1. **Tests Backend** :

```bash
   npm run test:backend
   ```

2. **Tests Frontend** :

```bash
   npm run test:frontend
   ```

3. **Tests d'Intégration** :

```bash
   npm run test:integration
   ```

### Seuils de Qualité

- **Backend** : ≥ 85% de réussite
- **Frontend** : ≥ 90% de réussite
- **Intégration** : ≥ 80% de réussite

## Support et Maintenance

### Logs et Monitoring

- **Logs de test** : Conserver les logs pour analyse
- **Métriques** : Surveiller les taux de réussite
- **Alertes** : Configurer des alertes pour les échecs

### Mise à Jour des Tests

- **Nouveaux modèles** : Ajouter les tests correspondants
- **Nouvelles fonctionnalités** : Étendre les tests existants
- **Corrections de bugs** : Ajouter des tests de régression

## Conclusion

Ce système de test garantit la qualité et la fiabilité du système de déblocage séquentiel. Les tests couvrent tous les aspects critiques du système et permettent de détecter rapidement les problèmes.

Pour toute question ou problème, consultez les logs détaillés et suivez les étapes de dépannage décrites dans ce guide.

---

## Catalogue multilingue (Catégories/Parcours/Niveaux/Exercices)

### Objectif
Vérifier les données semées (FR/EN/AR) et l'API de consultation du catalogue.

### Pré-requis
- Variable d'environnement `MONGODB_URI` ou `MONGO_URI` configurée.
- Serveur backend démarré.

### Semis des données

```bash
cd backend
node src/scripts/runAllSeeds.js --lang=fr,en,ar
```

Le script exécute, de façon idempotente:
- Catégories classiques (Débutant/Intermédiaire/Avancé) et spécifiques (Java, Python, C++, C#, JavaScript, TypeScript, Angular, React, Node.js, SQL)
- Parcours par catégorie: Fondations/Core/Projects
- Niveaux par parcours: Débutant/Intermédiaire/Avancé
- Exercices d'exemple (QCM, TextInput, Code) avec difficulté selon niveau
- Complétion des traductions FR/EN/AR

Option: `--dry` pour un essai à blanc sans écriture.

### Vérification API
1) Récupérer le catalogue localisé (par query `lang` ou `Accept-Language`):
```bash
curl "http://localhost:5000/api/courses/catalog?lang=fr"
```

2) Exemples de noeuds attendus (champs clés):
- Catégorie: `{ _id, type, name, order, paths: [...] }`
- Parcours: `{ _id, name, description, order, levels: [...] }`
- Niveau: `{ _id, title, content, order, videos, pdfs, exercises: [...] }`
- Exercice: `{ _id, name, type, points, difficulty }`

3) Vérifier la localisation:
```bash
curl -H "Accept-Language: en" "http://localhost:5000/api/courses/catalog"
curl "http://localhost:5000/api/courses/catalog?lang=ar"
```

### Nettoyage (optionnel)
Utiliser un outil Mongo ou script dédié si besoin de purger et resemer.