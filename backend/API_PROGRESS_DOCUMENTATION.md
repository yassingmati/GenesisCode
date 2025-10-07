# API Documentation - Enhanced Progress System

## Overview
Cette documentation décrit les améliorations apportées au système de progression et de scoring des exercices.

## Nouveaux endpoints

### 1. Submit Exercise (Enhanced)
**POST** `/api/courses/exercises/:id/submit`

#### Formats de soumission par type d'exercice :

##### QCM
```json
{
  "userId": "ObjectId",
  "answer": [0, 2] // indices des options sélectionnées
}
```

##### TextInput / FillInTheBlank
```json
{
  "userId": "ObjectId", 
  "answer": "réponse texte"
}
```

##### Code - Format simple
```json
{
  "userId": "ObjectId",
  "passed": true
}
```

##### Code - Format détaillé
```json
{
  "userId": "ObjectId",
  "passedCount": 8,
  "totalCount": 10,
  "tests": [
    {
      "name": "Test case 1",
      "passed": true,
      "points": 2,
      "message": "Success"
    }
  ]
}
```

##### DragDrop / OrderBlocks / Matching
```json
{
  "userId": "ObjectId",
  "answer": [...] // structure spécifique au type
}
```

#### Réponse enrichie :
```json
{
  "correct": true,
  "pointsEarned": 8.5,
  "pointsMax": 10,
  "xpEarned": 9,
  "explanation": "Bonne réponse ! ...",
  "details": {
    "type": "QCM",
    "user": ["opt1", "opt3"],
    "correct": ["opt1", "opt3"],
    "pointsEarned": 8.5,
    "pointsMax": 10
  },
  "revealSolutions": false
}
```

### 2. User Exercise Progress
**GET** `/api/courses/users/:userId/exercises/:exerciseId/progress`

```json
{
  "completed": true,
  "xp": 15,
  "pointsEarned": 8.5,
  "pointsMax": 10,
  "attempts": 3,
  "bestScore": 8.5,
  "lastAttempt": "2025-10-02T16:54:21.071Z",
  "completedAt": "2025-10-02T16:54:21.071Z",
  "details": {...},
  "exerciseType": "QCM"
}
```

### 3. User Global Statistics
**GET** `/api/courses/users/:userId/stats`

```json
{
  "totalXp": 450,
  "totalExercises": 25,
  "completedExercises": 20,
  "averageScore": 0.82,
  "totalAttempts": 45
}
```

### 4. User Level Progress
**GET** `/api/courses/users/:userId/levels/:levelId/progress`

```json
{
  "levelId": "ObjectId",
  "totalExercises": 10,
  "completedExercises": 8,
  "completionRate": 0.8,
  "totalXp": 120,
  "totalPointsEarned": 85,
  "totalPointsMax": 100,
  "scorePercentage": 85,
  "exerciseProgresses": {
    "exerciseId1": {
      "completed": true,
      "xp": 10,
      "pointsEarned": 10,
      "pointsMax": 10,
      "attempts": 1,
      "bestScore": 10,
      "lastAttempt": "2025-10-02T16:54:21.071Z"
    }
  }
}
```

## Modifications du modèle UserProgress

### Nouveaux champs :
- `pointsEarned`: Points obtenus pour cet exercice
- `pointsMax`: Points maximum possible
- `attempts`: Nombre de tentatives
- `bestScore`: Meilleur score obtenu
- `completedAt`: Date de completion
- `details`: Détails de la dernière soumission

### Nouvelles méthodes :
- `UserProgress.updateProgress(userId, exerciseId, progressData)`: Méthode principale de mise à jour
- `UserProgress.getUserStats(userId)`: Statistiques globales
- `UserProgress.addXp()`: **DEPRECATED** - utiliser `updateProgress`

## Scoring System

### QCM avec points partiels :
- Si `allowPartial: true` : chaque bonne réponse donne des points proportionnels
- Si `allowPartial: false` : tout ou rien

### Code avec tests détaillés :
- Support de 3 formats de soumission
- Calcul proportionnel basé sur les tests passés
- Points par test individuel

### Autres types :
- Matching : points par paire correcte
- OrderBlocks : points par position correcte
- DragDrop : points par élément bien placé
- TextInput : support regex et plages numériques

## Migration

Pour migrer depuis l'ancien système :
1. Les anciens champs `xp` et `completed` sont conservés
2. Les nouveaux champs sont automatiquement initialisés
3. L'ancienne méthode `addXp` est dépréciée mais fonctionnelle

## Exemples d'utilisation Frontend

```javascript
// Soumettre un QCM
const response = await fetch('/api/courses/exercises/123/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    answer: [0, 2] // indices sélectionnés
  })
});

const result = await response.json();
console.log(`Score: ${result.pointsEarned}/${result.pointsMax}`);

// Obtenir les stats d'un utilisateur
const stats = await fetch('/api/courses/users/user123/stats');
const userStats = await stats.json();
console.log(`Progression globale: ${userStats.averageScore * 100}%`);
```


