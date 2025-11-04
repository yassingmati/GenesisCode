# Système de Déblocage Séquentiel des Niveaux

## Vue d'ensemble

Le système de déblocage séquentiel des niveaux implémente une logique stricte d'accès au contenu éducatif :

- **Premier niveau** : Seul le premier niveau du premier parcours (ordre le plus bas) est débloqué automatiquement
- **Niveaux suivants** : Débloqués uniquement après complétion du niveau précédent
- **Contrôle d'accès** : Toutes les routes de contenu sont protégées par middleware
- **Sécurité** : Vérification côté serveur, protection contre la concurrence

## Architecture

### Modèles

#### CategoryAccess
- Stocke les niveaux débloqués par utilisateur dans `unlockedLevels[]`
- Index optimisés pour les requêtes de déblocage
- Méthodes atomiques pour éviter les conditions de course

#### Level, Path, Category
- Structure hiérarchique : Category → Path → Level
- Champ `order` pour déterminer la séquence
- Premier niveau = `order: 0` du premier parcours

### Services

#### LevelUnlockService
- `unlockFirstLevelsForCategory()` : Débloque uniquement le premier niveau du premier parcours
- `checkAndUnlockNextLevel()` : Débloque le niveau suivant après complétion
- `checkLevelAccess()` : Vérifie l'accès à un niveau spécifique
- `getUnlockStatus()` : Retourne le statut complet de déblocage

#### CategoryPaymentService
- `initializeUserAccess()` : Crée un accès et débloque le premier niveau
- `unlockFirstLevels()` : Utilise le service de déblocage corrigé

### Middleware

#### levelAccessMiddleware
- `requireLevelAccess()` : Protège les routes de contenu
- Extraction automatique des IDs (categoryId, pathId, levelId)
- Messages d'erreur détaillés pour les niveaux verrouillés

## API Endpoints

### Routes Protégées

Toutes ces routes nécessitent une authentification et vérifient l'accès au niveau :

```javascript
GET /levels/:id                    // Contenu d'un niveau
GET /levels/:id/exercises          // Exercices d'un niveau
GET /exercises/:id                 // Détails d'un exercice
POST /exercises/:id/submit         // Soumission d'exercice
GET /levels/:levelId/video         // Streaming vidéo
GET /levels/:levelId/pdf           // Affichage PDF
```

### Nouvelles Routes de Statut

```javascript
GET /users/:userId/categories/:categoryId/unlock-status
GET /users/:userId/paths/:pathId/unlock-status
```

### Réponses API

#### Contenu de Niveau
```javascript
{
  "_id": "level_id",
  "title": "Titre du niveau",
  "content": "Contenu...",
  "exercises": [...],
  "unlockStatus": {
    "isUnlocked": true,
    "accessType": "unlocked",
    "canAccess": true
  }
}
```

#### Soumission d'Exercice
```javascript
{
  "correct": true,
  "pointsEarned": 10,
  "xpEarned": 10,
  "nextLevelUnlocked": {
    "levelId": "next_level_id",
    "levelName": "Niveau suivant",
    "message": "Niveau suivant débloqué !"
  }
}
```

#### Statut de Déblocage
```javascript
{
  "hasAccess": true,
  "categoryId": "category_id",
  "paths": [
    {
      "pathId": "path_id",
      "pathOrder": 0,
      "pathName": "Nom du parcours",
      "levels": [
        {
          "levelId": "level_id",
          "levelOrder": 0,
          "levelName": "Nom du niveau",
          "isUnlocked": true,
          "canAccess": true
        }
      ]
    }
  ]
}
```

## Migration des Données Existantes

### Script de Migration

```bash
# Exécuter la migration
node backend/src/scripts/migrateSequentialUnlock.js

# Mode dry-run (simulation)
node backend/src/scripts/migrateSequentialUnlock.js --dry-run

# Validation uniquement
node backend/src/scripts/migrateSequentialUnlock.js --validate
```

### Processus de Migration

1. **Sauvegarde** : Création automatique d'un backup JSON
2. **Réinitialisation** : Vidage des niveaux débloqués existants
3. **Premier niveau** : Déblocage du premier niveau du premier parcours
4. **Progression** : Restauration séquentielle basée sur `UserLevelProgress`
5. **Validation** : Vérification que tous les utilisateurs ont le premier niveau

### Rollback

En cas d'erreur, le script peut restaurer l'état précédent :

```javascript
const migration = new SequentialUnlockMigration();
await migration.rollback('backup_file.json');
```

## Tests

### Script de Test

```bash
node backend/src/scripts/testSequentialUnlock.js
```

### Tests Inclus

1. **Premier niveau débloqué** : Vérification qu'un seul niveau est débloqué à l'initialisation
2. **Autres niveaux verrouillés** : Confirmation que les niveaux suivants sont inaccessibles
3. **Déblocage séquentiel** : Test de déblocage automatique après complétion
4. **Statut de déblocage** : Validation de l'API de statut

## Utilisation

### 1. Accorder l'Accès à une Catégorie

```javascript
const CategoryPaymentService = require('./services/categoryPaymentService');

// Accès gratuit
const access = await CategoryPaymentService.grantFreeAccess(
  userId, 
  categoryId, 
  categoryPlanId
);

// Accès payant (après paiement réussi)
await CategoryPaymentService.processSuccessfulPayment(konnectPaymentId);
```

### 2. Vérifier l'Accès à un Niveau

```javascript
const LevelUnlockService = require('./services/levelUnlockService');

const access = await LevelUnlockService.checkLevelAccess(
  userId, 
  categoryId, 
  pathId, 
  levelId
);

if (!access.hasAccess) {
  // Niveau verrouillé
  console.log('Raison:', access.reason);
}
```

### 3. Déclencher le Déblocage du Niveau Suivant

```javascript
// Automatiquement appelé dans CourseController.submitExercise
const nextLevel = await LevelUnlockService.onLevelCompleted(userId, completedLevelId);

if (nextLevel) {
  console.log('Niveau suivant débloqué:', nextLevel._id);
}
```

### 4. Obtenir le Statut de Déblocage

```javascript
const unlockStatus = await LevelUnlockService.getUnlockStatus(userId, categoryId);

unlockStatus.paths.forEach(path => {
  path.levels.forEach(level => {
    console.log(`${level.levelName}: ${level.isUnlocked ? 'Débloqué' : 'Verrouillé'}`);
  });
});
```

## Sécurité

### Protection Côté Serveur

- **Middleware obligatoire** : Toutes les routes de contenu sont protégées
- **Vérification atomique** : Utilisation de `findOneAndUpdate` pour éviter les conditions de course
- **Validation des IDs** : Vérification de l'existence des niveaux/parcours/catégories
- **Logs d'audit** : Traçabilité de tous les déblocages

### Messages d'Erreur

```javascript
// Niveau verrouillé
{
  "success": false,
  "message": "Niveau verrouillé - Accès refusé",
  "code": "LEVEL_LOCKED",
  "reason": "level_not_unlocked",
  "lockedMessage": "Ce niveau est verrouillé. Complétez les niveaux précédents pour continuer."
}

// Pas d'accès à la catégorie
{
  "success": false,
  "message": "Niveau verrouillé - Accès refusé",
  "code": "LEVEL_LOCKED",
  "reason": "no_category_access",
  "requiresPayment": true,
  "categoryPlan": {...}
}
```

## Performance

### Optimisations

- **Index composés** : Requêtes rapides sur les niveaux débloqués
- **Opérations atomiques** : Évite les requêtes multiples
- **Cache potentiel** : Structure prête pour l'ajout de Redis
- **Requêtes lean** : Minimise la charge mémoire

### Index MongoDB

```javascript
// CategoryAccess
{ user: 1, category: 1, status: 1 }
{ 'unlockedLevels.path': 1, 'unlockedLevels.level': 1 }
{ user: 1, category: 1, 'unlockedLevels.path': 1, 'unlockedLevels.level': 1 }
```

## Monitoring

### Logs Importants

```javascript
// Déblocage du premier niveau
console.log('🎁 Premier niveau débloqué:', { userId, categoryId, pathId, levelId });

// Déblocage séquentiel
console.log('🔓 Niveau suivant débloqué atomiquement:', { userId, levelId });

// Erreurs de déblocage
console.error('❌ Erreur déblocage niveau:', error);
```

### Métriques à Surveiller

- Nombre de niveaux débloqués par utilisateur
- Temps de réponse des vérifications d'accès
- Erreurs de déblocage (conditions de course)
- Utilisation des routes protégées

## Dépannage

### Problèmes Courants

1. **Niveau non débloqué après complétion**
   - Vérifier que `UserLevelProgress` est correctement mis à jour
   - Contrôler les logs de `onLevelCompleted`

2. **Erreur "LEVEL_NOT_FOUND"**
   - Vérifier que le niveau existe et appartient au bon parcours
   - Contrôler la population des relations dans les requêtes

3. **Accès refusé sur un niveau débloqué**
   - Vérifier l'expiration de `CategoryAccess`
   - Contrôler les index MongoDB

### Commandes de Diagnostic

```bash
# Vérifier les index
db.categoryaccesses.getIndexes()

# Compter les niveaux débloqués par utilisateur
db.categoryaccesses.aggregate([
  { $match: { user: ObjectId("user_id") } },
  { $project: { unlockedCount: { $size: "$unlockedLevels" } } }
])

# Vérifier les accès expirés
db.categoryaccesses.find({ 
  status: "active", 
  expiresAt: { $lt: new Date() } 
})
```

## Évolutions Futures

### Améliorations Possibles

1. **Cache Redis** : Mise en cache du statut de déblocage
2. **Notifications** : Alertes lors du déblocage de nouveaux niveaux
3. **Analytics** : Suivi de la progression des utilisateurs
4. **Déblocage conditionnel** : Basé sur des critères personnalisés
5. **Mode preview** : Accès limité aux niveaux verrouillés

### API Extensions

```javascript
// Déblocage manuel (admin)
POST /admin/users/:userId/levels/:levelId/unlock

// Statistiques de progression
GET /users/:userId/progress/analytics

// Recommandations de niveaux
GET /users/:userId/recommendations
```

---

## Résumé

Le système de déblocage séquentiel des niveaux est maintenant entièrement implémenté avec :

✅ **Logique métier** : Premier niveau débloqué, progression séquentielle  
✅ **Sécurité** : Middleware de protection, vérifications atomiques  
✅ **API** : Endpoints de statut, réponses enrichies  
✅ **Migration** : Script pour les données existantes  
✅ **Tests** : Validation complète du système  
✅ **Documentation** : Guide d'utilisation et dépannage  

Le système est prêt pour la production et peut être déployé en toute sécurité.
