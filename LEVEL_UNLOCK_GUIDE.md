# Guide du Système de Déblocage Progressif des Niveaux

## 🎯 Fonctionnalités

Le nouveau système de déblocage progressif des niveaux offre :

- ✅ **Accès gratuit au premier niveau** de chaque parcours
- ✅ **Déblocage automatique** du niveau suivant après complétion
- ✅ **Paiement par catégorie** (pas par parcours)
- ✅ **Intégration avec le système de progression** existant
- ✅ **Interface utilisateur intuitive** pour suivre la progression

## 🏗️ Architecture

### Backend Services

1. **LevelUnlockService** - Service principal de déblocage
2. **CategoryPaymentService** - Gestion des paiements par catégorie
3. **LevelAccessMiddleware** - Middlewares de vérification d'accès
4. **Intégration CourseController** - Déblocage automatique après complétion

### Frontend Components

1. **LevelProgressTracker** - Suivi de la progression des niveaux
2. **LevelAccessGate** - Porte d'accès pour les niveaux
3. **CategoryPaymentCard** - Carte de paiement par catégorie

## 🚀 Installation et Migration

### 1. Migration Complète

```bash
# Migration avec système de déblocage
npm run migrate:unlock

# Ou migration standard
npm run migrate
```

### 2. Test du Système

```bash
# Tester le système de déblocage
npm run test:unlock
```

### 3. Vérification

```bash
# Vérifier que tout fonctionne
curl http://localhost:5000/api/category-payments/plans
```

## 🔧 Utilisation

### 1. Accès Gratuit au Premier Niveau

```javascript
// Automatique lors de l'accès à un niveau
const access = await LevelUnlockService.checkLevelAccess(
  userId, 
  categoryId, 
  pathId, 
  levelId
);

if (access.hasAccess && access.accessType === 'free_first_level') {
  // Premier niveau débloqué automatiquement
}
```

### 2. Déblocage Progressif

```javascript
// Déclenché automatiquement après complétion d'un niveau
await LevelUnlockService.onLevelCompleted(userId, completedLevelId);

// Le niveau suivant est débloqué automatiquement
```

### 3. Vérification d'Accès

```javascript
// Vérifier l'accès à un niveau
const hasAccess = await LevelUnlockService.checkLevelAccess(
  userId, 
  categoryId, 
  pathId, 
  levelId
);
```

## 🎮 Interface Utilisateur

### 1. Page des Plans par Catégorie

```
/category-plans
```

- Affiche tous les plans de catégories
- Paiement intégré avec Konnect
- Accès immédiat après paiement

### 2. Suivi de Progression

```jsx
<LevelProgressTracker 
  categoryId={categoryId}
  pathId={pathId}
  onLevelUnlocked={handleLevelUnlocked}
  onLevelAccessGranted={handleLevelAccess}
/>
```

### 3. Porte d'Accès aux Niveaux

```jsx
<LevelAccessGate 
  categoryId={categoryId}
  pathId={pathId}
  levelId={levelId}
  onAccessGranted={handleAccess}
>
  <LevelContent />
</LevelAccessGate>
```

## 🔄 Flux de Déblocage

### 1. Premier Accès à une Catégorie

```
1. Utilisateur achète l'accès à une catégorie
2. Premier niveau de chaque parcours débloqué automatiquement
3. Utilisateur peut commencer à apprendre
```

### 2. Progression dans les Niveaux

```
1. Utilisateur complète un niveau
2. Système détecte la complétion
3. Niveau suivant débloqué automatiquement
4. Notification à l'utilisateur (optionnel)
```

### 3. Vérification d'Accès

```
1. Utilisateur tente d'accéder à un niveau
2. Système vérifie l'accès
3. Si débloqué : accès accordé
4. Si verrouillé : proposition d'achat ou déblocage
```

## 🛠️ Configuration

### 1. Prix des Catégories

```javascript
// Exemple de configuration
const priceUpdates = {
  'CATEGORY_ID_1': 0,      // Gratuit
  'CATEGORY_ID_2': 5000,   // 50 TND
  'CATEGORY_ID_3': 10000   // 100 TND
};

await CategoryPlanSeeder.updateCategoryPrices(priceUpdates);
```

### 2. Middleware d'Accès

```javascript
// Utiliser le middleware pour protéger les routes
router.get('/level/:levelId', 
  levelAccessMiddleware.requireLevelAccess(),
  levelController.getLevel
);
```

### 3. Intégration avec les Exercices

```javascript
// Dans CourseController.submitExercise
if (allExercisesCompleted) {
  // Marquer le niveau comme complété
  await UserLevelProgress.findOneAndUpdate(/* ... */);
  
  // Débloquer le niveau suivant
  await LevelUnlockService.onLevelCompleted(userId, levelId);
}
```

## 📊 Monitoring et Debugging

### 1. Logs de Déblocage

```bash
# Surveiller les logs de déblocage
tail -f logs/level-unlock.log
```

### 2. Vérification des Accès

```bash
# Vérifier les accès d'un utilisateur
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/category-payments/history
```

### 3. Test de Déblocage

```bash
# Tester le déblocage d'un niveau
curl -X POST http://localhost:5000/api/category-payments/unlock-level \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryId": "CAT_ID", "pathId": "PATH_ID", "levelId": "LEVEL_ID"}'
```

## 🚨 Dépannage

### Problèmes Courants

1. **Premier niveau pas débloqué**
   - Vérifier que l'utilisateur a accès à la catégorie
   - Vérifier que le parcours a des niveaux
   - Vérifier l'ordre des niveaux

2. **Déblocage progressif ne fonctionne pas**
   - Vérifier l'intégration avec CourseController
   - Vérifier que le niveau est marqué comme complété
   - Vérifier les logs d'erreur

3. **Accès refusé incorrectement**
   - Vérifier les middlewares d'authentification
   - Vérifier la logique de vérification d'accès
   - Vérifier les permissions de l'utilisateur

### Commandes de Debug

```bash
# Vérifier les niveaux débloqués
node -e "
const LevelUnlockService = require('./src/services/levelUnlockService');
LevelUnlockService.getUnlockedLevels('USER_ID', 'CATEGORY_ID')
  .then(levels => console.log('Niveaux débloqués:', levels.length));
"

# Tester le déblocage
npm run test:unlock
```

## 📈 Améliorations Futures

1. **Notifications** - Alertes de nouveaux niveaux débloqués
2. **Analytics** - Suivi des taux de complétion
3. **Récompenses** - Bonus pour la progression rapide
4. **Social** - Partage des progrès avec la communauté

---

**🎉 Le système de déblocage progressif est maintenant opérationnel !**

Utilisez `npm run migrate:unlock` pour activer toutes les fonctionnalités.






