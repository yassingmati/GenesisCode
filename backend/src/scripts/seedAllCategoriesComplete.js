// src/scripts/seedAllCategoriesComplete.js
// Script complet pour créer toutes les catégories avec tous les types d'exercices
const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');

// Helper pour créer des traductions
function t3(fr, en, ar) {
  return { fr, en, ar };
}

// Plan de cours complet avec tous les types d'exercices
const COMPLETE_COURSE_PLAN = {
  classic: [
    {
      name: t3('Programmation Fondamentale', 'Fundamental Programming', 'البرمجة الأساسية'),
      type: 'classic',
      order: 1,
      paths: [
        {
          name: t3('Bases de la Programmation', 'Programming Basics', 'أساسيات البرمجة'),
          description: t3('Apprenez les concepts fondamentaux', 'Learn fundamental concepts', 'تعلم المفاهيم الأساسية'),
          levels: [
            {
              title: t3('Variables et Types', 'Variables and Types', 'المتغيرات والأنواع'),
              content: t3('Introduction aux variables', 'Introduction to variables', 'مقدمة في المتغيرات'),
              exercises: [
                {
                  type: 'QCM',
                  question: t3('Qu\'est-ce qu\'une variable?', 'What is a variable?', 'ما هي المتغير؟'),
                  options: [
                    t3('Un conteneur de données', 'A data container', 'حاوية بيانات'),
                    t3('Une fonction', 'A function', 'دالة'),
                    t3('Un opérateur', 'An operator', 'عامل'),
                    t3('Une classe', 'A class', 'فئة')
                  ],
                  solution: [0],
                  points: 10,
                  difficulty: 'easy'
                },
                {
                  type: 'TextInput',
                  question: t3('Quel mot-clé déclare une variable en JavaScript?', 'Which keyword declares a variable in JavaScript?', 'ما هي الكلمة المفتاحية لإعلان متغير في JavaScript؟'),
                  solution: ['let', 'var', 'const'],
                  points: 10,
                  difficulty: 'easy'
                },
                {
                  type: 'FillInTheBlank',
                  question: t3('Complétez: let x = _____;', 'Complete: let x = _____;', 'أكمل: let x = _____;'),
                  codeSnippet: 'let x = _____;',
                  solution: ['10', '5', '0'],
                  points: 10,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Structures de Contrôle', 'Control Structures', 'هياكل التحكم'),
              content: t3('Conditions et boucles', 'Conditions and loops', 'الشروط والحلقات'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Écrivez une fonction qui retourne le maximum de deux nombres', 'Write a function that returns the maximum of two numbers', 'اكتب دالة ترجع القيمة القصوى لرقمين'),
                  language: 'javascript',
                  codeTemplate: 'function max(a, b) {\n  return _____;\n}',
                  testCases: [
                    { input: [5, 3], expected: 5 },
                    { input: [10, 20], expected: 20 },
                    { input: [0, 0], expected: 0 }
                  ],
                  solution: ['a > b ? a : b', 'Math.max(a, b)'],
                  points: 20,
                  difficulty: 'medium'
                },
                {
                  type: 'OrderBlocks',
                  question: t3('Ordonnez les blocs pour créer une boucle for', 'Order blocks to create a for loop', 'رتب الكتل لإنشاء حلقة for'),
                  blocks: [
                    { id: '1', code: 'for (let i = 0;' },
                    { id: '2', code: 'i < 10;' },
                    { id: '3', code: 'i++) {' },
                    { id: '4', code: '  console.log(i);' },
                    { id: '5', code: '}' }
                  ],
                  solution: ['1', '2', '3', '4', '5'],
                  points: 15,
                  difficulty: 'medium'
                },
                {
                  type: 'DragDrop',
                  question: t3('Associez les structures de contrôle à leurs descriptions', 'Match control structures to their descriptions', 'اربط هياكل التحكم بوصفها'),
                  elements: [
                    { id: '1', text: 'if' },
                    { id: '2', text: 'for' },
                    { id: '3', text: 'while' }
                  ],
                  targets: [
                    { id: 't1', text: 'Condition', correct: '1' },
                    { id: 't2', text: 'Boucle avec compteur', correct: '2' },
                    { id: 't3', text: 'Boucle conditionnelle', correct: '3' }
                  ],
                  solution: [],
                  points: 15,
                  difficulty: 'medium'
                }
              ]
            },
            {
              title: t3('Fonctions', 'Functions', 'الدوال'),
              content: t3('Création et utilisation de fonctions', 'Creating and using functions', 'إنشاء واستخدام الدوال'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez une fonction qui additionne deux nombres', 'Create a function that adds two numbers', 'أنشئ دالة تجمع رقمين'),
                  language: 'javascript',
                  codeTemplate: 'function addition(a, b) {\n  return _____;\n}',
                  testCases: [
                    { input: [2, 3], expected: 5 },
                    { input: [10, 5], expected: 15 }
                  ],
                  solution: ['a + b'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'SpotTheError',
                  question: t3('Trouvez l\'erreur dans ce code', 'Find the error in this code', 'ابحث عن الخطأ في هذا الكود'),
                  codeSnippet: 'function multiply(a, b) {\n  return a * b\n}',
                  solution: ['Manque point-virgule après return'],
                  points: 10,
                  difficulty: 'easy'
                }
              ]
            }
          ]
        },
        {
          name: t3('Algorithmes et Logique', 'Algorithms and Logic', 'الخوارزميات والمنطق'),
          description: t3('Développez votre pensée algorithmique', 'Develop algorithmic thinking', 'طور تفكيرك الخوارزمي'),
          levels: [
            {
              title: t3('Introduction aux Algorithmes', 'Introduction to Algorithms', 'مقدمة في الخوارزميات'),
              content: t3('Qu\'est-ce qu\'un algorithme?', 'What is an algorithm?', 'ما هي الخوارزمية؟'),
              exercises: [
                {
                  type: 'Algorithm',
                  question: t3('Décrivez un algorithme pour trouver le maximum dans une liste', 'Describe an algorithm to find the maximum in a list', 'صف خوارزمية للعثور على القيمة القصوى في قائمة'),
                  algorithmSteps: [
                    { id: '1', step: 'Initialiser max avec le premier élément' },
                    { id: '2', step: 'Parcourir les autres éléments' },
                    { id: '3', step: 'Si élément > max, mettre à jour max' },
                    { id: '4', step: 'Retourner max' }
                  ],
                  solution: [],
                  points: 25,
                  difficulty: 'medium'
                },
                {
                  type: 'FlowChart',
                  question: t3('Créez un organigramme pour vérifier si un nombre est pair', 'Create a flowchart to check if a number is even', 'أنشئ مخطط انسيابي للتحقق من أن الرقم زوجي'),
                  flowChartNodes: [
                    { id: 'start', type: 'start', label: 'Début' },
                    { id: 'input', type: 'process', label: 'Lire n' },
                    { id: 'check', type: 'decision', label: 'n % 2 == 0?' },
                    { id: 'yes', type: 'process', label: 'Afficher "Pair"' },
                    { id: 'no', type: 'process', label: 'Afficher "Impair"' },
                    { id: 'end', type: 'end', label: 'Fin' }
                  ],
                  flowChartConnections: [
                    { from: 'start', to: 'input' },
                    { from: 'input', to: 'check' },
                    { from: 'check', to: 'yes', condition: 'Oui' },
                    { from: 'check', to: 'no', condition: 'Non' },
                    { from: 'yes', to: 'end' },
                    { from: 'no', to: 'end' }
                  ],
                  solution: [],
                  points: 30,
                  difficulty: 'medium'
                },
                {
                  type: 'PseudoCode',
                  question: t3('Écrivez le pseudo-code pour trier un tableau', 'Write pseudocode to sort an array', 'اكتب الكود الزائف لترتيب مصفوفة'),
                  pseudoCodeStructure: {
                    algorithm: 'Tri à bulles',
                    steps: [
                      'Pour i de 0 à n-1',
                      '  Pour j de 0 à n-i-1',
                      '    Si tableau[j] > tableau[j+1]',
                      '      Échanger tableau[j] et tableau[j+1]'
                    ]
                  },
                  solution: [],
                  points: 30,
                  difficulty: 'hard'
                }
              ]
            },
            {
              title: t3('Recherche et Tri', 'Search and Sort', 'البحث والترتيب'),
              content: t3('Algorithmes de recherche et tri', 'Search and sort algorithms', 'خوارزميات البحث والترتيب'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Implémentez une recherche linéaire', 'Implement linear search', 'قم بتنفيذ بحث خطي'),
                  language: 'javascript',
                  codeTemplate: 'function rechercheLineaire(tableau, valeur) {\n  for (let i = 0; i < tableau.length; i++) {\n    if (tableau[i] === valeur) {\n      return _____;\n    }\n  }\n  return -1;\n}',
                  testCases: [
                    { input: [[1, 2, 3, 4, 5], 3], expected: 2 },
                    { input: [[10, 20, 30], 20], expected: 1 },
                    { input: [[1, 2, 3], 5], expected: -1 }
                  ],
                  solution: ['i'],
                  points: 25,
                  difficulty: 'medium'
                },
                {
                  type: 'Trace',
                  question: t3('Tracez l\'exécution de la recherche de 5 dans [1,3,5,7,9]', 'Trace execution of searching for 5 in [1,3,5,7,9]', 'تتبع تنفيذ البحث عن 5 في [1,3,5,7,9]'),
                  traceVariables: ['i', 'tableau[i]', 'valeur'],
                  traceSteps: [
                    { step: 1, i: 0, 'tableau[i]': 1, valeur: 5, condition: '1 !== 5' },
                    { step: 2, i: 1, 'tableau[i]': 3, valeur: 5, condition: '3 !== 5' },
                    { step: 3, i: 2, 'tableau[i]': 5, valeur: 5, condition: '5 === 5', result: 'return 2' }
                  ],
                  solution: [],
                  points: 20,
                  difficulty: 'medium'
                },
                {
                  type: 'Complexity',
                  question: t3('Quelle est la complexité temporelle de la recherche linéaire?', 'What is the time complexity of linear search?', 'ما هي التعقيد الزمني للبحث الخطي؟'),
                  complexityAnalysis: {
                    bestCase: 'O(1)',
                    averageCase: 'O(n)',
                    worstCase: 'O(n)',
                    spaceComplexity: 'O(1)'
                  },
                  solution: ['O(n)'],
                  points: 15,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        },
        {
          name: t3('Structures de Données', 'Data Structures', 'هياكل البيانات'),
          description: t3('Maîtrisez les structures de données', 'Master data structures', 'اتقن هياكل البيانات'),
          levels: [
            {
              title: t3('Tableaux et Listes', 'Arrays and Lists', 'المصفوفات والقوائم'),
              content: t3('Structures de données linéaires', 'Linear data structures', 'هياكل البيانات الخطية'),
              exercises: [
                {
                  type: 'DataStructure',
                  question: t3('Ajoutez un élément à la fin d\'un tableau', 'Add an element to the end of an array', 'أضف عنصراً في نهاية المصفوفة'),
                  dataStructureType: 'array',
                  dataStructureOperations: [
                    { operation: 'push', element: 4, expected: [1, 2, 3, 4] }
                  ],
                  solution: ['push'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'Code',
                  question: t3('Créez une fonction pour inverser un tableau', 'Create a function to reverse an array', 'أنشئ دالة لعكس مصفوفة'),
                  language: 'javascript',
                  codeTemplate: 'function inverser(tableau) {\n  return tableau._____();\n}',
                  testCases: [
                    { input: [[1, 2, 3]], expected: [3, 2, 1] },
                    { input: [[10, 20]], expected: [20, 10] }
                  ],
                  solution: ['reverse'],
                  points: 15,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Piles et Files', 'Stacks and Queues', 'المكدسات والطوابير'),
              content: t3('Structures LIFO et FIFO', 'LIFO and FIFO structures', 'هياكل LIFO و FIFO'),
              exercises: [
                {
                  type: 'ConceptMapping',
                  question: t3('Associez les concepts aux définitions', 'Match concepts to definitions', 'اربط المفاهيم بالتعريفات'),
                  concepts: [
                    { id: '1', content: 'Pile (Stack)' },
                    { id: '2', content: 'File (Queue)' },
                    { id: '3', content: 'LIFO' },
                    { id: '4', content: 'FIFO' }
                  ],
                  definitions: [
                    { id: 'd1', content: 'Dernier entré, premier sorti' },
                    { id: 'd2', content: 'Premier entré, premier sorti' },
                    { id: 'd3', content: 'Structure avec push/pop' },
                    { id: 'd4', content: 'Structure avec enqueue/dequeue' }
                  ],
                  solution: [
                    { concept: '1', definition: 'd3' },
                    { concept: '2', definition: 'd4' },
                    { concept: '3', definition: 'd1' },
                    { concept: '4', definition: 'd2' }
                  ],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('Développement Web', 'Web Development', 'تطوير الويب'),
      type: 'classic',
      order: 2,
      paths: [
        {
          name: t3('HTML et CSS', 'HTML and CSS', 'HTML و CSS'),
          description: t3('Créez vos premières pages web', 'Create your first web pages', 'أنشئ صفحات الويب الأولى'),
          levels: [
            {
              title: t3('Introduction au HTML', 'Introduction to HTML', 'مقدمة إلى HTML'),
              content: t3('Structure HTML de base', 'Basic HTML structure', 'البنية الأساسية لـ HTML'),
              exercises: [
                {
                  type: 'FillInTheBlank',
                  question: t3('Complétez la structure HTML', 'Complete the HTML structure', 'أكمل بنية HTML'),
                  codeSnippet: '<!DOCTYPE html>\n<html>\n<head>\n  <title>_____</title>\n</head>\n<body>\n  <h1>_____</h1>\n</body>\n</html>',
                  solution: ['Mon Site', 'Bienvenue'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'Matching',
                  question: t3('Associez les balises HTML à leur fonction', 'Match HTML tags to their function', 'اربط علامات HTML بوظيفتها'),
                  prompts: [
                    { id: '1', content: '<h1>' },
                    { id: '2', content: '<p>' },
                    { id: '3', content: '<a>' },
                    { id: '4', content: '<img>' }
                  ],
                  matches: [
                    { id: 'm1', content: 'Titre principal' },
                    { id: 'm2', content: 'Paragraphe' },
                    { id: 'm3', content: 'Lien' },
                    { id: 'm4', content: 'Image' }
                  ],
                  solution: [
                    { prompt: '1', match: 'm1' },
                    { prompt: '2', match: 'm2' },
                    { prompt: '3', match: 'm3' },
                    { prompt: '4', match: 'm4' }
                  ],
                  points: 20,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Styliser avec CSS', 'Styling with CSS', 'التنسيق باستخدام CSS'),
              content: t3('Apprenez CSS', 'Learn CSS', 'تعلم CSS'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez une règle CSS pour centrer un texte', 'Create a CSS rule to center text', 'أنشئ قاعدة CSS لتوسيط النص'),
                  language: 'css',
                  codeTemplate: '.titre {\n  text-align: _____;\n  color: _____;\n}',
                  solution: ['center', 'red'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'DragDrop',
                  question: t3('Associez les propriétés CSS aux valeurs', 'Match CSS properties to values', 'اربط خصائص CSS بالقيم'),
                  elements: [
                    { id: '1', text: 'color' },
                    { id: '2', text: 'font-size' },
                    { id: '3', text: 'margin' }
                  ],
                  targets: [
                    { id: 't1', text: 'red', correct: '1' },
                    { id: 't2', text: '20px', correct: '2' },
                    { id: 't3', text: '10px', correct: '3' }
                  ],
                  solution: [],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        },
        {
          name: t3('JavaScript pour le Web', 'JavaScript for Web', 'JavaScript للويب'),
          description: t3('Rendez vos pages interactives', 'Make your pages interactive', 'اجعل صفحاتك تفاعلية'),
          levels: [
            {
              title: t3('DOM et Manipulation', 'DOM and Manipulation', 'DOM والمعالجة'),
              content: t3('Manipulation du DOM', 'DOM manipulation', 'معالجة DOM'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Sélectionnez un élément par ID', 'Select an element by ID', 'حدد عنصراً بالمعرف'),
                  language: 'javascript',
                  codeTemplate: 'const element = document._____(\'monId\');',
                  solution: ['getElementById'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'CodeOutput',
                  question: t3('Quelle est la sortie de ce code?', 'What is the output of this code?', 'ما هي مخرجات هذا الكود؟'),
                  codeSnippet: 'let x = 5;\nlet y = x++;\nconsole.log(x, y);',
                  expectedOutput: '6 5',
                  solution: ['6 5'],
                  points: 15,
                  difficulty: 'medium'
                },
                {
                  type: 'Debug',
                  question: t3('Trouvez et corrigez les erreurs', 'Find and fix errors', 'ابحث عن الأخطاء وأصلحها'),
                  codeSnippet: 'function getElement(id) {\n  return document.getElementById(id);\n}\n\nconst btn = getElement(\'button\');\nbtn.addEventListner(\'click\', function() {\n  alert(\'Clicked\');\n});',
                  debugErrors: [
                    { line: 5, error: 'addEventListner devrait être addEventListener', type: 'typo' }
                  ],
                  solution: ['addEventListener'],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('Programmation Avancée', 'Advanced Programming', 'البرمجة المتقدمة'),
      type: 'classic',
      order: 3,
      paths: [
        {
          name: t3('Programmation Orientée Objet', 'Object-Oriented Programming', 'البرمجة كائنية التوجه'),
          description: t3('Classes et objets', 'Classes and objects', 'الفئات والكائنات'),
          levels: [
            {
              title: t3('Classes et Objets', 'Classes and Objects', 'الفئات والكائنات'),
              content: t3('Introduction à la POO', 'Introduction to OOP', 'مقدمة في البرمجة كائنية التوجه'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez une classe Personne', 'Create a Person class', 'أنشئ فئة Person'),
                  language: 'javascript',
                  codeTemplate: 'class Personne {\n  constructor(nom) {\n    this._____ = nom;\n  }\n}',
                  testCases: [
                    { input: ['Jean'], expected: { nom: 'Jean' } }
                  ],
                  solution: ['nom'],
                  points: 20,
                  difficulty: 'medium'
                },
                {
                  type: 'CodeCompletion',
                  question: t3('Complétez la méthode toString', 'Complete the toString method', 'أكمل طريقة toString'),
                  codeTemplate: 'class Personne {\n  constructor(nom) {\n    this.nom = nom;\n  }\n  toString() {\n    return `Personne: ${this._____}`;\n  }\n}',
                  codeGaps: [
                    { id: 'gap1', line: 5, correct: 'nom' }
                  ],
                  solution: ['nom'],
                  points: 15,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        },
        {
          name: t3('Algorithmes Avancés', 'Advanced Algorithms', 'الخوارزميات المتقدمة'),
          description: t3('Algorithmes complexes', 'Complex algorithms', 'خوارزميات معقدة'),
          levels: [
            {
              title: t3('Récursivité', 'Recursion', 'العودية'),
              content: t3('Fonctions récursives', 'Recursive functions', 'الدوال العودية'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Implémentez une fonction récursive pour calculer factorielle', 'Implement recursive function for factorial', 'قم بتنفيذ دالة عودية لحساب المضروب'),
                  language: 'javascript',
                  codeTemplate: 'function factorielle(n) {\n  if (n <= 1) return 1;\n  return n * factorielle(_____);\n}',
                  testCases: [
                    { input: [5], expected: 120 },
                    { input: [3], expected: 6 },
                    { input: [0], expected: 1 }
                  ],
                  solution: ['n - 1'],
                  points: 25,
                  difficulty: 'hard'
                },
                {
                  type: 'AlgorithmSteps',
                  question: t3('Ordonnez les étapes de l\'algorithme récursif', 'Order recursive algorithm steps', 'رتب خطوات الخوارزمية العودية'),
                  algorithmSteps: [
                    { id: '1', step: 'Vérifier condition de base' },
                    { id: '2', step: 'Appeler récursivement avec n-1' },
                    { id: '3', step: 'Multiplier n par le résultat' },
                    { id: '4', step: 'Retourner le résultat' }
                  ],
                  solution: ['1', '2', '3', '4'],
                  points: 20,
                  difficulty: 'medium'
                },
                {
                  type: 'Trace',
                  question: t3('Tracez factorielle(4)', 'Trace factorial(4)', 'تتبع factorielle(4)'),
                  traceVariables: ['n', 'result'],
                  traceSteps: [
                    { step: 1, n: 4, result: '4 * factorielle(3)' },
                    { step: 2, n: 3, result: '3 * factorielle(2)' },
                    { step: 3, n: 2, result: '2 * factorielle(1)' },
                    { step: 4, n: 1, result: '1' },
                    { step: 5, final: '24' }
                  ],
                  solution: [],
                  points: 25,
                  difficulty: 'hard'
                }
              ]
            },
            {
              title: t3('Optimisation', 'Optimization', 'التحسين'),
              content: t3('Optimisez vos algorithmes', 'Optimize your algorithms', 'حسّن خوارزمياتك'),
              exercises: [
                {
                  type: 'Optimization',
                  question: t3('Optimisez cette fonction de recherche', 'Optimize this search function', 'حسّن دالة البحث هذه'),
                  codeSnippet: 'function search(arr, val) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === val) return i;\n  }\n  return -1;\n}',
                  optimizationCriteria: ['time', 'space'],
                  performanceMetrics: {
                    current: { time: 'O(n)', space: 'O(1)' },
                    optimized: { time: 'O(log n)', space: 'O(1)' }
                  },
                  solution: ['Utiliser recherche binaire si tableau trié'],
                  points: 30,
                  difficulty: 'hard'
                },
                {
                  type: 'Complexity',
                  question: t3('Analysez la complexité de cette fonction', 'Analyze complexity of this function', 'حلل تعقيد هذه الدالة'),
                  codeSnippet: 'function nestedLoop(n) {\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n; j++) {\n      console.log(i, j);\n    }\n  }\n}',
                  complexityAnalysis: {
                    timeComplexity: 'O(n²)',
                    spaceComplexity: 'O(1)',
                    explanation: 'Deux boucles imbriquées'
                  },
                  solution: ['O(n²)'],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('Programmation Visuelle', 'Visual Programming', 'البرمجة المرئية'),
      type: 'classic',
      order: 4,
      paths: [
        {
          name: t3('Scratch et Blocs', 'Scratch and Blocks', 'سكراتش والكتل'),
          description: t3('Programmation par blocs', 'Block programming', 'البرمجة بالكتل'),
          levels: [
            {
              title: t3('Introduction à Scratch', 'Introduction to Scratch', 'مقدمة إلى سكراتش'),
              content: t3('Premiers pas avec Scratch', 'First steps with Scratch', 'الخطوات الأولى مع سكراتش'),
              exercises: [
                {
                  type: 'ScratchBlocks',
                  question: t3('Créez un programme pour faire avancer un sprite', 'Create a program to move a sprite forward', 'أنشئ برنامجاً لتحريك كائن للأمام'),
                  scratchBlocks: [
                    { id: '1', type: 'event', block: 'when green flag clicked' },
                    { id: '2', type: 'motion', block: 'move 10 steps' },
                    { id: '3', type: 'control', block: 'repeat 10' }
                  ],
                  scratchWorkspace: {
                    sprites: ['cat'],
                    stage: 'default'
                  },
                  solution: ['1', '3', '2'],
                  points: 20,
                  difficulty: 'easy'
                },
                {
                  type: 'VisualProgramming',
                  question: t3('Construisez un programme visuel pour dessiner un carré', 'Build a visual program to draw a square', 'أنشئ برنامجاً مرئياً لرسم مربع'),
                  visualElements: [
                    { id: '1', type: 'start', label: 'Début' },
                    { id: '2', type: 'action', label: 'Avancer 100' },
                    { id: '3', type: 'action', label: 'Tourner 90°' },
                    { id: '4', type: 'loop', label: 'Répéter 4 fois' },
                    { id: '5', type: 'end', label: 'Fin' }
                  ],
                  solution: ['1', '4', '2', '3', '5'],
                  points: 25,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  specific: [
    {
      name: t3('JavaScript', 'JavaScript', 'جافاسكريبت'),
      type: 'specific',
      order: 1,
      paths: [
        {
          name: t3('Bases JavaScript', 'JavaScript Basics', 'أساسيات جافاسكريبت'),
          description: t3('Apprenez JavaScript', 'Learn JavaScript', 'تعلم جافاسكريبت'),
          levels: [
            {
              title: t3('Variables et Types', 'Variables and Types', 'المتغيرات والأنواع'),
              content: t3('Les bases de JavaScript', 'JavaScript basics', 'أساسيات جافاسكريبت'),
              exercises: [
                {
                  type: 'QCM',
                  question: t3('Quelle est la différence entre let et const?', 'What is the difference between let and const?', 'ما الفرق بين let و const؟'),
                  options: [
                    t3('const ne peut pas être réassigné', 'const cannot be reassigned', 'const لا يمكن إعادة تعيينه'),
                    t3('let ne peut pas être réassigné', 'let cannot be reassigned', 'let لا يمكن إعادة تعيينه'),
                    t3('Aucune différence', 'No difference', 'لا فرق'),
                    t3('const est plus rapide', 'const is faster', 'const أسرع')
                  ],
                  solution: [0],
                  points: 10,
                  difficulty: 'easy'
                },
                {
                  type: 'Code',
                  question: t3('Créez une variable avec const', 'Create a variable with const', 'أنشئ متغيراً باستخدام const'),
                  language: 'javascript',
                  codeTemplate: 'const maVariable = _____;',
                  solution: ['10', '"hello"', 'true'],
                  points: 10,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Fonctions et Portées', 'Functions and Scopes', 'الدوال والنطاقات'),
              content: t3('Fonctions en JavaScript', 'Functions in JavaScript', 'الدوال في جافاسكريبت'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez une fonction fléchée', 'Create an arrow function', 'أنشئ دالة سهمية'),
                  language: 'javascript',
                  codeTemplate: 'const addition = (a, b) => _____;',
                  testCases: [
                    { input: [2, 3], expected: 5 }
                  ],
                  solution: ['a + b', 'return a + b'],
                  points: 15,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        },
        {
          name: t3('JavaScript Avancé', 'Advanced JavaScript', 'جافاسكريبت المتقدم'),
          description: t3('Concepts avancés', 'Advanced concepts', 'مفاهيم متقدمة'),
          levels: [
            {
              title: t3('Promises et Async/Await', 'Promises and Async/Await', 'الوعود و Async/Await'),
              content: t3('Programmation asynchrone', 'Asynchronous programming', 'البرمجة غير المتزامنة'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez une Promise', 'Create a Promise', 'أنشئ Promise'),
                  language: 'javascript',
                  codeTemplate: 'const maPromise = new Promise((resolve, reject) => {\n  setTimeout(() => resolve(\'Succès\'), 1000);\n});',
                  solution: [],
                  points: 20,
                  difficulty: 'hard'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('Python', 'Python', 'بايثون'),
      type: 'specific',
      order: 2,
      paths: [
        {
          name: t3('Bases Python', 'Python Basics', 'أساسيات بايثون'),
          description: t3('Apprenez Python', 'Learn Python', 'تعلم بايثون'),
          levels: [
            {
              title: t3('Syntaxe Python', 'Python Syntax', 'صيغة بايثون'),
              content: t3('Les bases de Python', 'Python basics', 'أساسيات بايثون'),
              exercises: [
                {
                  type: 'QCM',
                  question: t3('Comment déclarer une liste en Python?', 'How to declare a list in Python?', 'كيف تعلن قائمة في بايثون؟'),
                  options: [
                    t3('ma_liste = []', 'my_list = []', 'ma_liste = []'),
                    t3('ma_liste = list()', 'my_list = list()', 'ma_liste = list()'),
                    t3('ma_liste = {}', 'my_list = {}', 'ma_liste = {}'),
                    t3('Les deux premières', 'Both first two', 'الأوليان')
                  ],
                  solution: [3],
                  points: 10,
                  difficulty: 'easy'
                },
                {
                  type: 'Code',
                  question: t3('Créez une liste avec 3 éléments', 'Create a list with 3 elements', 'أنشئ قائمة بثلاثة عناصر'),
                  language: 'python',
                  codeTemplate: 'ma_liste = _____',
                  solution: ['[1, 2, 3]', '["a", "b", "c"]'],
                  points: 10,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Boucles et Conditions', 'Loops and Conditions', 'الحلقات والشروط'),
              content: t3('Structures de contrôle en Python', 'Control structures in Python', 'هياكل التحكم في بايثون'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Écrivez une boucle for en Python', 'Write a for loop in Python', 'اكتب حلقة for في بايثون'),
                  language: 'python',
                  codeTemplate: 'for i in range(5):\n  print(_____)',
                  solution: ['i'],
                  points: 15,
                  difficulty: 'easy'
                }
              ]
            }
          ]
        },
        {
          name: t3('Python Avancé', 'Advanced Python', 'بايثون المتقدم'),
          description: t3('Concepts avancés Python', 'Advanced Python concepts', 'مفاهيم بايثون المتقدمة'),
          levels: [
            {
              title: t3('Listes en compréhension', 'List Comprehensions', 'قوائم الفهم'),
              content: t3('Syntaxe avancée Python', 'Advanced Python syntax', 'صيغة بايثون المتقدمة'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez une liste en compréhension', 'Create a list comprehension', 'أنشئ قائمة فهم'),
                  language: 'python',
                  codeTemplate: 'carrés = [x**2 for x in range(10)]',
                  solution: [],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('Java', 'Java', 'جافا'),
      type: 'specific',
      order: 3,
      paths: [
        {
          name: t3('Bases Java', 'Java Basics', 'أساسيات جافا'),
          description: t3('Apprenez Java', 'Learn Java', 'تعلم جافا'),
          levels: [
            {
              title: t3('Classes et Objets', 'Classes and Objects', 'الفئات والكائنات'),
              content: t3('POO en Java', 'OOP in Java', 'البرمجة كائنية التوجه في جافا'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez une classe Java', 'Create a Java class', 'أنشئ فئة جافا'),
                  language: 'java',
                  codeTemplate: 'public class Personne {\n  private String nom;\n  \n  public Personne(String nom) {\n    this._____ = nom;\n  }\n}',
                  solution: ['nom'],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('C++', 'C++', 'سي++'),
      type: 'specific',
      order: 4,
      paths: [
        {
          name: t3('Bases C++', 'C++ Basics', 'أساسيات سي++'),
          description: t3('Apprenez C++', 'Learn C++', 'تعلم سي++'),
          levels: [
            {
              title: t3('Variables et Pointeurs', 'Variables and Pointers', 'المتغيرات والمؤشرات'),
              content: t3('Les bases de C++', 'C++ basics', 'أساسيات سي++'),
              exercises: [
                {
                  type: 'QCM',
                  question: t3('Qu\'est-ce qu\'un pointeur?', 'What is a pointer?', 'ما هو المؤشر؟'),
                  options: [
                    t3('Une variable qui stocke une adresse', 'A variable that stores an address', 'متغير يخزن عنواناً'),
                    t3('Une fonction', 'A function', 'دالة'),
                    t3('Un type de données', 'A data type', 'نوع بيانات'),
                    t3('Une classe', 'A class', 'فئة')
                  ],
                  solution: [0],
                  points: 15,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('React', 'React', 'ريأكت'),
      type: 'specific',
      order: 5,
      paths: [
        {
          name: t3('React Débutant', 'React Beginner', 'مبتدئ ريأكت'),
          description: t3('Apprenez React', 'Learn React', 'تعلم ريأكت'),
          levels: [
            {
              title: t3('Composants React', 'React Components', 'مكونات ريأكت'),
              content: t3('Créer des composants', 'Create components', 'إنشاء المكونات'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Créez un composant React fonctionnel', 'Create a functional React component', 'أنشئ مكون ريأكت وظيفي'),
                  language: 'javascript',
                  codeTemplate: 'function MonComposant() {\n  return <div>_____</div>;\n}',
                  solution: ['Hello World', 'Bonjour'],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            },
            {
              title: t3('Hooks React', 'React Hooks', 'خطافات ريأكت'),
              content: t3('Utilisez les hooks', 'Use hooks', 'استخدم الخطافات'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Utilisez useState', 'Use useState', 'استخدم useState'),
                  language: 'javascript',
                  codeTemplate: 'const [count, setCount] = useState(_____);',
                  solution: ['0'],
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('TypeScript', 'TypeScript', 'تايب سكريبت'),
      type: 'specific',
      order: 6,
      paths: [
        {
          name: t3('Bases TypeScript', 'TypeScript Basics', 'أساسيات تايب سكريبت'),
          description: t3('Apprenez TypeScript', 'Learn TypeScript', 'تعلم تايب سكريبت'),
          levels: [
            {
              title: t3('Types de Base', 'Basic Types', 'الأنواع الأساسية'),
              content: t3('Les types TypeScript', 'TypeScript types', 'أنواع تايب سكريبت'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Déclarez une variable typée', 'Declare a typed variable', 'أعلن متغيراً مكتوباً'),
                  language: 'typescript',
                  codeTemplate: 'let nom: _____ = "Jean";',
                  solution: ['string'],
                  points: 15,
                  difficulty: 'easy'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('Node.js', 'Node.js', 'نود.جي إس'),
      type: 'specific',
      order: 7,
      paths: [
        {
          name: t3('Bases Node.js', 'Node.js Basics', 'أساسيات نود.جي إس'),
          description: t3('Apprenez Node.js', 'Learn Node.js', 'تعلم نود.جي إس'),
          levels: [
            {
              title: t3('Modules Node.js', 'Node.js Modules', 'وحدات نود.جي إس'),
              content: t3('Utiliser les modules', 'Use modules', 'استخدام الوحدات'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Importez un module', 'Import a module', 'استورد وحدة'),
                  language: 'javascript',
                  codeTemplate: 'const fs = require(_____);',
                  solution: ['"fs"'],
                  points: 15,
                  difficulty: 'easy'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('SQL', 'SQL', 'إس كيو إل'),
      type: 'specific',
      order: 8,
      paths: [
        {
          name: t3('Bases SQL', 'SQL Basics', 'أساسيات إس كيو إل'),
          description: t3('Apprenez SQL', 'Learn SQL', 'تعلم إس كيو إل'),
          levels: [
            {
              title: t3('Requêtes SELECT', 'SELECT Queries', 'استعلامات SELECT'),
              content: t3('Interroger une base de données', 'Query a database', 'استعلام قاعدة بيانات'),
              exercises: [
                {
                  type: 'Code',
                  question: t3('Écrivez une requête SELECT', 'Write a SELECT query', 'اكتب استعلام SELECT'),
                  language: 'sql',
                  codeTemplate: 'SELECT _____ FROM utilisateurs;',
                  solution: ['*', 'nom, email'],
                  points: 15,
                  difficulty: 'easy'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Fonctions de création
async function createCategory(name, type, order) {
  const existing = await Category.findOne({ 'translations.fr.name': name.fr });
  if (existing) {
    console.log(`⚠️  Catégorie "${name.fr}" existe déjà`);
    return existing;
  }
  const category = await Category.create({
    translations: {
      fr: { name: name.fr },
      en: { name: name.en },
      ar: { name: name.ar }
    },
    type,
    order
  });
  console.log(`✅ Catégorie créée: ${name.fr} (${type})`);
  return category;
}

async function createPath(categoryId, name, description, order) {
  const path = await Path.create({
    translations: {
      fr: { name: name.fr, description: description.fr },
      en: { name: name.en, description: description.en },
      ar: { name: name.ar, description: description.ar }
    },
    category: categoryId,
    order
  });
  console.log(`  📁 Path créé: ${name.fr}`);
  return path;
}

async function createLevel(pathId, title, content, order) {
  const level = await Level.create({
    translations: {
      fr: { title: title.fr, content: content.fr },
      en: { title: title.en, content: content.en },
      ar: { title: title.ar, content: content.ar }
    },
    path: pathId,
    order
  });
  console.log(`    📄 Level créé: ${title.fr}`);
  return level;
}

async function createExercise(levelId, exerciseData) {
  const { 
    type, question, options, solution, codeSnippet, codeTemplate, language, 
    testCases, blocks, elements, targets, points, difficulty,
    dataStructureType, algorithmSteps, traceVariables, traceSteps,
    debugErrors, codeGaps, pseudoCodeStructure, complexityAnalysis,
    optimizationCriteria, performanceMetrics, flowChartNodes, flowChartConnections,
    scratchBlocks, scratchWorkspace, visualElements, concepts, definitions,
    prompts, matches, expectedOutput, algorithmSteps: algoSteps
  } = exerciseData;

  const exercise = {
    translations: {
      fr: {
        name: `Exercice ${type}`,
        question: question.fr,
        explanation: ''
      },
      en: {
        name: `Exercise ${type}`,
        question: question.en,
        explanation: ''
      },
      ar: {
        name: `تمرين ${type}`,
        question: question.ar,
        explanation: ''
      }
    },
    type,
    level: levelId,
    points: points || 10,
    difficulty: difficulty || 'medium',
    solutions: Array.isArray(solution) ? solution : (solution ? [solution] : [])
  };

  // Ajouter les champs spécifiques selon le type
  if (options) {
    exercise.options = options.map((opt, i) => ({
      id: `opt-${i}`,
      text: typeof opt === 'object' ? opt.fr : opt
    }));
  }

  if (codeSnippet) {
    exercise.codeSnippet = codeSnippet;
  }

  if (codeTemplate) {
    exercise.codeTemplate = codeTemplate;
  }

  if (language) {
    exercise.language = language;
  }

  if (testCases) {
    exercise.testCases = testCases.map(tc => ({
      input: tc.input,
      expected: tc.expected,
      points: 1,
      public: true
    }));
  }

  if (blocks) {
    exercise.blocks = blocks.map(block => ({
      id: block.id,
      code: typeof block.code === 'object' ? block.code.fr : block.code
    }));
  }

  if (elements && targets) {
    exercise.elements = elements.map(el => ({
      id: el.id,
      text: typeof el.text === 'object' ? el.text.fr : el.text
    }));
    exercise.targets = targets.map(tg => ({
      id: tg.id,
      text: typeof tg.text === 'object' ? tg.text.fr : tg.text,
      correct: tg.correct
    }));
  }

  // Champs pour les types d'exercices avancés
  if (dataStructureType) {
    exercise.dataStructureType = dataStructureType;
  }

  if (algorithmSteps || algoSteps) {
    exercise.algorithmSteps = algorithmSteps || algoSteps;
  }

  if (flowChartNodes) {
    exercise.flowChartNodes = flowChartNodes;
  }

  if (flowChartConnections) {
    exercise.flowChartConnections = flowChartConnections;
  }

  if (traceVariables) {
    exercise.traceVariables = traceVariables;
  }

  if (traceSteps) {
    exercise.traceSteps = traceSteps;
  }

  if (debugErrors) {
    exercise.debugErrors = debugErrors;
  }

  if (codeGaps) {
    exercise.codeGaps = codeGaps;
  }

  if (pseudoCodeStructure) {
    exercise.pseudoCodeStructure = pseudoCodeStructure;
  }

  if (complexityAnalysis) {
    exercise.complexityAnalysis = complexityAnalysis;
  }

  if (optimizationCriteria) {
    exercise.optimizationCriteria = optimizationCriteria;
  }

  if (performanceMetrics) {
    exercise.performanceMetrics = performanceMetrics;
  }

  if (scratchBlocks) {
    exercise.scratchBlocks = scratchBlocks;
  }

  if (scratchWorkspace) {
    exercise.scratchWorkspace = scratchWorkspace;
  }

  if (visualElements) {
    exercise.visualElements = visualElements;
  }

  if (concepts && definitions) {
    exercise.concepts = concepts;
    exercise.definitions = definitions;
  }

  if (prompts && matches) {
    exercise.prompts = prompts;
    exercise.matches = matches;
  }

  if (expectedOutput) {
    exercise.expectedOutput = expectedOutput;
  }

  const created = await Exercise.create(exercise);
  console.log(`      🎯 Exercice créé: ${type} - ${question.fr.substring(0, 40)}...`);
  return created;
}

// Fonction principale de seeding
async function seed() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis';
    const isAtlas = mongoURI.includes('mongodb+srv://') || mongoURI.includes('@cluster');
    const isLocal = mongoURI.includes('localhost') || mongoURI.includes('127.0.0.1');
    
    console.log('🔗 Connexion à MongoDB...');
    if (isAtlas) {
      const cluster = mongoURI.match(/@([^/]+)/)?.[1] || 'Atlas';
      console.log(`   📍 Destination: MongoDB Atlas (${cluster})`);
    } else if (isLocal) {
      console.log(`   📍 Destination: MongoDB LOCAL (Compass)`);
      console.log(`   ⚠️  Pour se connecter à Atlas, configurez MONGODB_URI dans backend/.env`);
    } else {
      console.log(`   📍 Destination: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`);
    }
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // S'assurer que le type par défaut est défini
    await Category.updateMany(
      { $or: [{ type: { $exists: false } }, { type: null }] },
      { $set: { type: 'classic' } }
    );

    console.log('🌱 Création du plan de cours complet...\n');

    // Parcourir les catégories classiques
    for (const categoryData of COMPLETE_COURSE_PLAN.classic) {
      const category = await createCategory(categoryData.name, categoryData.type, categoryData.order);

      for (let pathIndex = 0; pathIndex < categoryData.paths.length; pathIndex++) {
        const pathData = categoryData.paths[pathIndex];
        const path = await createPath(
          category._id,
          pathData.name,
          pathData.description,
          pathIndex + 1
        );

        const levelIds = [];

        for (let levelIndex = 0; levelIndex < pathData.levels.length; levelIndex++) {
          const levelData = pathData.levels[levelIndex];
          const level = await createLevel(
            path._id,
            levelData.title,
            levelData.content,
            levelIndex + 1
          );

          levelIds.push(level._id);
          const exerciseIds = [];

          for (const exerciseData of levelData.exercises) {
            const exercise = await createExercise(level._id, exerciseData);
            exerciseIds.push(exercise._id);
          }

          await Level.findByIdAndUpdate(level._id, {
            exercises: exerciseIds
          });
        }

        await Path.findByIdAndUpdate(path._id, {
          levels: levelIds
        });
      }
    }

    // Parcourir les catégories spécifiques
    for (const categoryData of COMPLETE_COURSE_PLAN.specific) {
      const category = await createCategory(categoryData.name, categoryData.type, categoryData.order);

      for (let pathIndex = 0; pathIndex < categoryData.paths.length; pathIndex++) {
        const pathData = categoryData.paths[pathIndex];
        const path = await createPath(
          category._id,
          pathData.name,
          pathData.description,
          pathIndex + 1
        );

        const levelIds = [];

        for (let levelIndex = 0; levelIndex < pathData.levels.length; levelIndex++) {
          const levelData = pathData.levels[levelIndex];
          const level = await createLevel(
            path._id,
            levelData.title,
            levelData.content,
            levelIndex + 1
          );

          levelIds.push(level._id);
          const exerciseIds = [];

          for (const exerciseData of levelData.exercises) {
            const exercise = await createExercise(level._id, exerciseData);
            exerciseIds.push(exercise._id);
          }

          await Level.findByIdAndUpdate(level._id, {
            exercises: exerciseIds
          });
        }

        await Path.findByIdAndUpdate(path._id, {
          levels: levelIds
        });
      }
    }

    console.log('\n✅ Plan de cours complet créé avec succès !');
    console.log('\n📊 Résumé:');
    const categoriesClassic = await Category.countDocuments({ type: 'classic' });
    const categoriesSpecific = await Category.countDocuments({ type: 'specific' });
    const paths = await Path.countDocuments();
    const levels = await Level.countDocuments();
    const exercises = await Exercise.countDocuments();
    console.log(`  - ${categoriesClassic} catégories classiques`);
    console.log(`  - ${categoriesSpecific} catégories spécifiques`);
    console.log(`  - ${paths} paths`);
    console.log(`  - ${levels} levels`);
    console.log(`  - ${exercises} exercices`);

    // Afficher les types d'exercices créés
    const exerciseTypes = await Exercise.distinct('type');
    console.log(`\n📝 Types d'exercices créés: ${exerciseTypes.join(', ')}`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  seed();
}

module.exports = seed;

