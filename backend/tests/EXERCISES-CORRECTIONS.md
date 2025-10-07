# 📝 Corrections des Exercices - Niveau 68c973738b6e19e85d67e35a

## 🎯 **Exercices Créés et Leurs Corrections**

### 1. **Complexité du tri par sélection** (QCM) - 10 pts
**Question :** Quelle est la complexité temporelle du tri par sélection ?

**Options :**
- a) O(n)
- b) O(n log n)
- c) O(n²) ✅
- d) O(log n)

**Correction :** **c) O(n²)**
- Le tri par sélection effectue n(n-1)/2 comparaisons dans le pire des cas
- Pour chaque position i, il cherche le minimum dans le reste du tableau (n-i éléments)
- Complexité totale : O(n²)

---

### 2. **Fonction factorielle** (Code) - 15 pts
**Question :** Écrivez une fonction qui calcule la factorielle d'un nombre

**Solutions acceptées :**

**Version récursive :**
```javascript
function factorielle(n) {
  if (n <= 1) return 1;
  return n * factorielle(n - 1);
}
```

**Version itérative :**
```javascript
function factorielle(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

**Tests :**
- factorielle(0) = 1
- factorielle(1) = 1
- factorielle(5) = 120
- factorielle(10) = 3628800

---

### 3. **Étapes du tri par sélection** (Algorithm) - 12 pts
**Question :** Remettez les étapes de l'algorithme de tri par sélection dans le bon ordre

**Ordre correct :** 1 → 2 → 3 → 4

**Étapes :**
1. **Trouver le plus petit élément dans le tableau**
2. **Échanger cet élément avec le premier élément**
3. **Répéter pour le reste du tableau (sans le premier élément)**
4. **Continuer jusqu'à ce que tout le tableau soit trié**

**Explication :** L'algorithme trouve d'abord le plus petit élément, l'échange avec le premier, puis répète le processus pour le reste du tableau.

---

### 4. **Ordre des blocs de code** (OrderBlocks) - 8 pts
**Question :** Remettez les blocs de code dans le bon ordre pour créer un programme valide

**Ordre correct :** 1 → 2 → 3 → 4

**Blocs :**
1. `let x = 5;`
2. `console.log("Valeur initiale:", x);`
3. `x = x + 1;`
4. `console.log("Valeur finale:", x);`

**Résultat attendu :**
```
Valeur initiale: 5
Valeur finale: 6
```

---

### 5. **Fonction d'affichage** (TextInput) - 5 pts
**Question :** Quel est le nom de la fonction JavaScript pour afficher du texte dans la console ?

**Réponses acceptées :**
- `console.log`
- `console.log()`

**Explication :** `console.log()` est la fonction standard pour afficher des informations dans la console JavaScript.

---

### 6. **Complétion de phrase** (FillInTheBlank) - 6 pts
**Question :** Complétez la phrase : JavaScript est un langage de programmation _____

**Réponse :** **dynamique**

**Explication :** JavaScript est un langage de programmation dynamique car les types sont déterminés à l'exécution, contrairement aux langages statiquement typés.

---

### 7. **Détection d'erreurs** (SpotTheError) - 8 pts
**Question :** Identifiez les lignes contenant des erreurs dans ce code

**Code :**
```javascript
function calculer(a, b) {
  let result = a + b
  return result
}
```

**Ligne avec erreur :** **Ligne 2**

**Problème :** Manque le point-virgule à la fin de l'instruction

**Code corrigé :**
```javascript
function calculer(a, b) {
  let result = a + b;
  return result;
}
```

---

### 8. **Programme Scratch** (ScratchBlocks) - 10 pts
**Question :** Créez un programme Scratch qui affiche "Bonjour" puis "Monde"

**Ordre correct :** start → say1 → say2

**Blocs :**
1. **Quand le drapeau vert est cliqué** (événement)
2. **Dire "Bonjour" pendant 2 secondes** (action)
3. **Dire "Monde" pendant 2 secondes** (action)

**Explication :** Un programme Scratch commence toujours par un événement, suivi des actions dans l'ordre d'exécution.

---

## 🎯 **Points Totaux : 74 points**

| Exercice | Type | Points | Difficulté | Temps |
|----------|------|--------|------------|-------|
| 1 | QCM | 10 | Facile | 5 min |
| 2 | Code | 15 | Moyen | 15 min |
| 3 | Algorithm | 12 | Moyen | 10 min |
| 4 | OrderBlocks | 8 | Facile | 8 min |
| 5 | TextInput | 5 | Facile | 3 min |
| 6 | FillInTheBlank | 6 | Facile | 5 min |
| 7 | SpotTheError | 8 | Moyen | 8 min |
| 8 | ScratchBlocks | 10 | Facile | 10 min |

## 🧪 **Tests et Validation**

### **Tests Automatiques**
- **QCM** : Vérification de la réponse sélectionnée
- **Code** : Exécution avec cas de test (publics et cachés)
- **Algorithm** : Comparaison de l'ordre des étapes
- **OrderBlocks** : Vérification de la séquence
- **TextInput** : Comparaison de chaîne (insensible à la casse)
- **FillInTheBlank** : Validation des complétions
- **SpotTheError** : Identification des lignes d'erreur
- **ScratchBlocks** : Ordre des blocs visuels

### **Scoring**
- **Points partiels** : Activés pour la plupart des exercices
- **Tentatives** : 2-3 selon la difficulté
- **Temps limite** : 3-15 minutes selon l'exercice
- **Indices** : Disponibles pour tous les exercices

## 🚀 **Utilisation**

1. **Accédez au niveau** via l'interface utilisateur
2. **Sélectionnez un exercice** dans la liste
3. **Résolvez l'exercice** avec l'interface appropriée
4. **Soumettez votre réponse** et consultez les résultats
5. **Consultez les corrections** ci-dessus si nécessaire

## 📚 **Concepts Couverts**

- **Algorithmes** : Tri par sélection, complexité algorithmique
- **Programmation** : JavaScript, fonctions, récursion, itération
- **Logique** : Ordre d'exécution, détection d'erreurs
- **Syntaxe** : JavaScript, points-virgules, console.log
- **Programmation visuelle** : Scratch, blocs, événements
- **Typage** : Langages dynamiques vs statiques

---

**🎉 Ces exercices couvrent une gamme variée de concepts de programmation et d'algorithmique, parfaits pour tester les nouvelles fonctionnalités d'exercices intégrées !**

