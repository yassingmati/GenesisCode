# 🧩 Composants d'Exercices - Documentation

Ce dossier contient tous les composants nécessaires pour créer une interface complète de résolution d'exercices de programmation.

## 📁 Structure des Fichiers

```text
components/
├── ExerciseAnswerInterface.jsx          # Interface principale unifiée
├── ExerciseRenderer.jsx                 # Rendu conditionnel des exercices
├── CodeEditor.jsx                       # Éditeur de code avec Monaco
├── ExerciseTestPage.jsx                 # Page de test pour tous les composants
├── ExerciseStyles.css                   # Styles globaux
├── ui/                                  # Composants UI réutilisables
│   ├── ExerciseHeader.jsx               # En-tête d'exercice
│   ├── SubmissionPanel.jsx             # Panneau de soumission
│   ├── LoadingSpinner.jsx              # Spinner de chargement
│   └── ErrorMessage.jsx                # Messages d'erreur
└── exercises/                           # Composants d'exercices spécialisés
    ├── QCMExercise.jsx                 # Questions à choix multiple
    ├── CodeExercise.jsx                # Exercices de programmation
    ├── OrderBlocksExercise.jsx         # Ordre des blocs
    └── SpotTheErrorExercise.jsx        # Détection d'erreurs
```

## 🚀 Utilisation Rapide

### 1. Interface Principale

```jsx
import ExerciseAnswerInterface from './components/ExerciseAnswerInterface';

function MyExercisePage() {
  const [userAnswer, setUserAnswer] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  const handleSubmit = async () => {
    // Logique de soumission
  };
  
  const handleTest = async (code) => {
    // Logique de test de code
  };
  
  return (
    <ExerciseAnswerInterface
      exercise={exercise}
      answer={userAnswer}
      onAnswer={setUserAnswer}
      onSubmit={handleSubmit}
      onTest={handleTest}
      attempts={0}
      maxAttempts={3}
      isSubmitting={false}
      submissionResult={submissionResult}
      error={null}
    />
  );
}
```

### 2. Composants UI

```jsx
import ExerciseHeader from './components/ui/ExerciseHeader';
import SubmissionPanel from './components/ui/SubmissionPanel';

// En-tête d'exercice
<ExerciseHeader
  title="Mon Exercice"
  difficulty="medium"
  points={10}
  type="Code"
  timeLimit={15}
/>

// Panneau de soumission
<SubmissionPanel
  onSubmit={handleSubmit}
  result={submissionResult}
  isSubmitting={false}
  attemptsAllowed={3}
  currentAttempts={1}
  userAnswer={userAnswer}
/>
```

### 3. Éditeur de Code

```jsx
import CodeEditor from './components/CodeEditor';

<CodeEditor
  exercise={exercise}
  userAnswer={userAnswer}
  setUserAnswer={setUserAnswer}
  onTest={handleTest}
  attempts={0}
  maxAttempts={3}
  showSolution={false}
  solution={exercise.solutions?.[0]}
  language="javascript"
/>
```

## 🎯 Types d'Exercices Supportés

### 1. **QCM** - Questions à Choix Multiple

```jsx
const qcmExercise = {
  type: 'QCM',
  question: 'Quelle est la capitale de la France ?',
  options: [
    { id: 'a', text: 'Lyon' },
    { id: 'b', text: 'Marseille' },
    { id: 'c', text: 'Paris' },
    { id: 'd', text: 'Toulouse' }
  ],
  solutions: ['c'],
  allowMultipleSelections: false
};
```

### 2. **Code** - Exercices de Programmation

```jsx
const codeExercise = {
  type: 'Code',
  question: 'Écrivez une fonction qui retourne la somme de deux nombres',
  language: 'javascript',
  codeSnippet: 'function somme(a, b) {\n  // Votre code ici\n}',
  testCases: [
    { input: [2, 3], expected: 5, public: true, points: 5 },
    { input: [10, 20], expected: 30, public: true, points: 5 }
  ],
  solutions: ['function somme(a, b) { return a + b; }']
};
```

### 3. **OrderBlocks** - Ordre des Blocs

```jsx
const orderBlocksExercise = {
  type: 'OrderBlocks',
  question: 'Remettez les blocs de code dans le bon ordre',
  blocks: [
    { id: '1', code: 'console.log("Hello");' },
    { id: '2', code: 'let name = "World";' },
    { id: '3', code: 'console.log(name);' }
  ],
  solutions: ['2', '1', '3']
};
```

### 4. **ScratchBlocks** - Blocs Scratch

```jsx
const scratchBlocksExercise = {
  type: 'ScratchBlocks',
  question: 'Créez un programme qui affiche "Bonjour"',
  blocks: [
    { id: 'start', type: 'event', text: 'Quand le drapeau vert est cliqué' },
    { id: 'say', type: 'looks', text: 'Dire "Bonjour"' }
  ],
  solutions: ['start', 'say']
};
```

### 5. **TextInput** - Saisie de Texte

```jsx
const textInputExercise = {
  type: 'TextInput',
  question: 'Quel est le nom de la fonction pour afficher du texte en JavaScript ?',
  solutions: ['console.log']
};
```

### 6. **FillInTheBlank** - Texte à Compléter

```jsx
const fillInTheBlankExercise = {
  type: 'FillInTheBlank',
  question: 'Complétez la phrase : JavaScript est un langage de programmation _____',
  template: 'JavaScript est un langage de programmation _____',
  gaps: [
    { id: 'gap1', placeholder: 'type', hint: 'Pensez au typage' }
  ],
  solutions: { gap1: 'dynamique' }
};
```

### 7. **SpotTheError** - Détection d'Erreurs

```jsx
const spotTheErrorExercise = {
  type: 'SpotTheError',
  question: 'Identifiez les lignes contenant des erreurs',
  codeSnippet: 'function calculer(a, b) {\n  let result = a + b\n  return result\n}',
  language: 'javascript',
  solutions: [2] // Ligne 2 manque le point-virgule
};
```

## 🎨 Personnalisation des Styles

### Variables CSS

```css
:root {
  --primary-color: #667eea;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --border-radius: 8px;
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

### Classes Utilitaires

```css
.btn-primary { /* Bouton principal */ }
.badge-success { /* Badge de succès */ }
.alert-warning { /* Alerte d'avertissement */ }
.card { /* Carte générique */ }
```

## 🔧 API des Composants

### ExerciseAnswerInterface

| Prop | Type | Description |
|------|------|-------------|
| `exercise` | Object | Données de l'exercice |
| `answer` | Any | Réponse actuelle de l'utilisateur |
| `onAnswer` | Function | Callback pour mettre à jour la réponse |
| `onSubmit` | Function | Callback pour soumettre l'exercice |
| `onTest` | Function | Callback pour tester le code |
| `attempts` | Number | Nombre de tentatives actuelles |
| `maxAttempts` | Number | Nombre maximum de tentatives |
| `isSubmitting` | Boolean | État de soumission |
| `submissionResult` | Object | Résultat de la soumission |
| `error` | String | Message d'erreur |

### CodeEditor

| Prop | Type | Description |
|------|------|-------------|
| `exercise` | Object | Données de l'exercice |
| `userAnswer` | String | Code de l'utilisateur |
| `setUserAnswer` | Function | Callback pour mettre à jour le code |
| `onTest` | Function | Callback pour tester le code |
| `attempts` | Number | Nombre de tentatives |
| `maxAttempts` | Number | Nombre maximum de tentatives |
| `showSolution` | Boolean | Afficher la solution |
| `solution` | String | Code de la solution |
| `language` | String | Langage de programmation |

## 🧪 Test des Composants

Utilisez `ExerciseTestPage.jsx` pour tester tous les composants :

```jsx
import ExerciseTestPage from './components/ExerciseTestPage';

// Dans votre route
<Route path="/test-exercises" element={<ExerciseTestPage />} />
```

## 📱 Responsive Design

Tous les composants sont optimisés pour :

- **Desktop** : Interface complète avec toutes les fonctionnalités
- **Tablet** : Adaptation des tailles et espacements
- **Mobile** : Interface simplifiée et optimisée pour le tactile

## 🎯 Bonnes Pratiques

1. **Gestion d'État** : Utilisez `useState` pour gérer les réponses utilisateur
2. **Validation** : Validez les réponses avant soumission
3. **Feedback** : Fournissez un feedback immédiat à l'utilisateur
4. **Accessibilité** : Utilisez les attributs ARIA appropriés
5. **Performance** : Lazy load les composants lourds

## 🐛 Dépannage

### Problèmes Courants

1. **Monaco Editor ne se charge pas** : Vérifiez que `@monaco-editor/react` est installé
2. **Styles manquants** : Importez `ExerciseStyles.css`
3. **Erreurs de props** : Vérifiez la structure des données d'exercice
4. **Problèmes de responsive** : Vérifiez les media queries CSS

### Logs de Debug

Activez les logs de debug dans la console pour diagnostiquer les problèmes :

```jsx
// Dans ExerciseAnswerInterface
console.log('Exercise data:', exercise);
console.log('User answer:', userAnswer);
console.log('Submission result:', submissionResult);
```

## 🚀 Prochaines Étapes

1. **Tests Unitaires** : Ajoutez des tests Jest/React Testing Library
2. **Tests E2E** : Implémentez des tests Cypress
3. **Accessibilité** : Améliorez l'accessibilité avec ARIA
4. **Performance** : Optimisez le rendu avec React.memo
5. **Internationalisation** : Ajoutez le support i18n

---

**Note** : Cette documentation est mise à jour régulièrement. Consultez les commentaires dans le code pour plus de détails techniques.
