// src/scripts/seedCompleteCoursePlan.js
// Script complet pour créer un plan de cours structuré avec catégories, paths, levels et exercices
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

// Plan de cours complet
const COURSE_PLAN = {
  categories: [
    {
      name: t3('Programmation Débutant', 'Beginner Programming', 'برمجة للمبتدئين'),
      type: 'classic',
      order: 1,
      paths: [
        {
          name: t3('Introduction à la Programmation', 'Introduction to Programming', 'مقدمة في البرمجة'),
          description: t3(
            'Apprenez les concepts fondamentaux de la programmation',
            'Learn the fundamental concepts of programming',
            'تعلم المفاهيم الأساسية للبرمجة'
          ),
          levels: [
            {
              title: t3('Les Bases', 'The Basics', 'الأساسيات'),
              content: t3(
                'Découvrez ce qu\'est la programmation, les variables et les types de données.',
                'Discover what programming is, variables and data types.',
                'اكتشف ما هي البرمجة والمتغيرات وأنواع البيانات.'
              ),
              exercises: [
                {
                  type: 'QCM',
                  question: t3(
                    'Qu\'est-ce qu\'une variable en programmation ?',
                    'What is a variable in programming?',
                    'ما هي المتغير في البرمجة؟'
                  ),
                  options: [
                    t3('Un conteneur pour stocker des données', 'A container to store data', 'حاوية لتخزين البيانات'),
                    t3('Un type de fonction', 'A type of function', 'نوع من الدوال'),
                    t3('Un opérateur mathématique', 'A mathematical operator', 'عامل رياضي'),
                    t3('Un langage de programmation', 'A programming language', 'لغة برمجة')
                  ],
                  solution: [0],
                  points: 10,
                  difficulty: 'easy'
                },
                {
                  type: 'FillInTheBlank',
                  question: t3(
                    'En programmation, une _____ est utilisée pour stocker des valeurs.',
                    'In programming, a _____ is used to store values.',
                    'في البرمجة، يتم استخدام _____ لتخزين القيم.'
                  ),
                  codeSnippet: 'let maVariable = _____;',
                  solution: ['variable', 'var'],
                  points: 15,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Les Structures de Contrôle', 'Control Structures', 'هياكل التحكم'),
              content: t3(
                'Apprenez les conditions (if/else) et les boucles (for/while).',
                'Learn conditions (if/else) and loops (for/while).',
                'تعلم الشروط (if/else) والحلقات (for/while).'
              ),
              exercises: [
                {
                  type: 'Code',
                  question: t3(
                    'Écrivez une fonction qui vérifie si un nombre est pair.',
                    'Write a function that checks if a number is even.',
                    'اكتب دالة تتحقق مما إذا كان الرقم زوجياً.'
                  ),
                  language: 'javascript',
                  codeTemplate: 'function estPair(nombre) {\n  // Complétez ici\n  return _____;\n}',
                  testCases: [
                    { input: 2, expected: true },
                    { input: 3, expected: false },
                    { input: 0, expected: true }
                  ],
                  points: 20,
                  difficulty: 'medium'
                },
                {
                  type: 'OrderBlocks',
                  question: t3(
                    'Ordonnez les étapes pour créer une boucle for.',
                    'Order the steps to create a for loop.',
                    'رتب الخطوات لإنشاء حلقة for.'
                  ),
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
                }
              ]
            },
            {
              title: t3('Les Fonctions', 'Functions', 'الدوال'),
              content: t3(
                'Découvrez comment créer et utiliser des fonctions.',
                'Discover how to create and use functions.',
                'اكتشف كيفية إنشاء واستخدام الدوال.'
              ),
              exercises: [
                {
                  type: 'Code',
                  question: t3(
                    'Créez une fonction qui additionne deux nombres.',
                    'Create a function that adds two numbers.',
                    'أنشئ دالة تجمع رقمين.'
                  ),
                  language: 'javascript',
                  codeTemplate: 'function addition(a, b) {\n  return _____;\n}',
                  testCases: [
                    { input: [2, 3], expected: 5 },
                    { input: [10, 5], expected: 15 },
                    { input: [-1, 1], expected: 0 }
                  ],
                  points: 20,
                  difficulty: 'easy'
                },
                {
                  type: 'QCM',
                  question: t3(
                    'Quelle est la syntaxe correcte pour déclarer une fonction en JavaScript ?',
                    'What is the correct syntax to declare a function in JavaScript?',
                    'ما هي الصيغة الصحيحة لإعلان دالة في JavaScript؟'
                  ),
                  options: [
                    t3('function maFonction() {}', 'function myFunction() {}', 'function maFonction() {}'),
                    t3('function = maFonction() {}', 'function = myFunction() {}', 'function = maFonction() {}'),
                    t3('maFonction function() {}', 'myFunction function() {}', 'maFonction function() {}'),
                    t3('func maFonction() {}', 'func myFunction() {}', 'func maFonction() {}')
                  ],
                  solution: [0],
                  points: 10,
                  difficulty: 'easy'
                }
              ]
            }
          ]
        },
        {
          name: t3('Algorithms et Logique', 'Algorithms and Logic', 'الخوارزميات والمنطق'),
          description: t3(
            'Développez votre pensée algorithmique',
            'Develop your algorithmic thinking',
            'طور تفكيرك الخوارزمي'
          ),
          levels: [
            {
              title: t3('Notions de Base', 'Basic Concepts', 'المفاهيم الأساسية'),
              content: t3(
                'Comprenez ce qu\'est un algorithme et comment le concevoir.',
                'Understand what an algorithm is and how to design it.',
                'افهم ما هي الخوارزمية وكيفية تصميمها.'
              ),
              exercises: [
                {
                  type: 'Algorithm',
                  question: t3(
                    'Décrivez les étapes pour trouver le maximum dans une liste de nombres.',
                    'Describe the steps to find the maximum in a list of numbers.',
                    'صف الخطوات للعثور على القيمة القصوى في قائمة من الأرقام.'
                  ),
                  solution: [],
                  points: 25,
                  difficulty: 'medium'
                },
                {
                  type: 'QCM',
                  question: t3(
                    'Qu\'est-ce qu\'un algorithme ?',
                    'What is an algorithm?',
                    'ما هي الخوارزمية؟'
                  ),
                  options: [
                    t3('Une séquence d\'instructions pour résoudre un problème', 'A sequence of instructions to solve a problem', 'سلسلة من التعليمات لحل مشكلة'),
                    t3('Un langage de programmation', 'A programming language', 'لغة برمجة'),
                    t3('Un type de variable', 'A type of variable', 'نوع من المتغيرات'),
                    t3('Un opérateur mathématique', 'A mathematical operator', 'عامل رياضي')
                  ],
                  solution: [0],
                  points: 10,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Recherche et Tri', 'Search and Sort', 'البحث والترتيب'),
              content: t3(
                'Apprenez les algorithmes de recherche et de tri de base.',
                'Learn basic search and sort algorithms.',
                'تعلم خوارزميات البحث والترتيب الأساسية.'
              ),
              exercises: [
                {
                  type: 'Code',
                  question: t3(
                    'Implémentez une recherche linéaire dans un tableau.',
                    'Implement a linear search in an array.',
                    'قم بتنفيذ بحث خطي في مصفوفة.'
                  ),
                  language: 'javascript',
                  codeTemplate: 'function rechercheLineaire(tableau, valeur) {\n  for (let i = 0; i < tableau.length; i++) {\n    if (tableau[i] === valeur) {\n      return _____;\n    }\n  }\n  return -1;\n}',
                  testCases: [
                    { input: [[1, 2, 3, 4, 5], 3], expected: 2 },
                    { input: [[10, 20, 30], 20], expected: 1 },
                    { input: [[1, 2, 3], 5], expected: -1 }
                  ],
                  points: 25,
                  difficulty: 'medium'
                },
                {
                  type: 'Trace',
                  question: t3(
                    'Tracez l\'exécution de la recherche du nombre 5 dans [1, 3, 5, 7, 9].',
                    'Trace the execution of searching for number 5 in [1, 3, 5, 7, 9].',
                    'تتبع تنفيذ البحث عن الرقم 5 في [1, 3, 5, 7, 9].'
                  ),
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
      name: t3('Développement Web', 'Web Development', 'تطوير الويب'),
      type: 'classic',
      order: 2,
      paths: [
        {
          name: t3('HTML et CSS', 'HTML and CSS', 'HTML و CSS'),
          description: t3(
            'Créez vos premières pages web',
            'Create your first web pages',
            'أنشئ صفحات الويب الأولى'
          ),
          levels: [
            {
              title: t3('Introduction au HTML', 'Introduction to HTML', 'مقدمة إلى HTML'),
              content: t3(
                'Apprenez la structure de base d\'une page HTML.',
                'Learn the basic structure of an HTML page.',
                'تعلم البنية الأساسية لصفحة HTML.'
              ),
              exercises: [
                {
                  type: 'FillInTheBlank',
                  question: t3(
                    'Complétez la structure HTML de base.',
                    'Complete the basic HTML structure.',
                    'أكمل البنية الأساسية لـ HTML.'
                  ),
                  codeSnippet: '<!DOCTYPE html>\n<html>\n<head>\n  <title>_____</title>\n</head>\n<body>\n  <h1>_____</h1>\n</body>\n</html>',
                  solution: ['html', 'Mon Site'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'QCM',
                  question: t3(
                    'Quelle balise HTML est utilisée pour créer un titre principal ?',
                    'Which HTML tag is used to create a main heading?',
                    'ما هي علامة HTML المستخدمة لإنشاء عنوان رئيسي؟'
                  ),
                  options: [
                    t3('<h1>', '<h1>', '<h1>'),
                    t3('<title>', '<title>', '<title>'),
                    t3('<header>', '<header>', '<header>'),
                    t3('<head>', '<head>', '<head>')
                  ],
                  solution: [0],
                  points: 10,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Styliser avec CSS', 'Styling with CSS', 'التنسيق باستخدام CSS'),
              content: t3(
                'Découvrez comment styliser vos pages web.',
                'Discover how to style your web pages.',
                'اكتشف كيفية تنسيق صفحات الويب.'
              ),
              exercises: [
                {
                  type: 'Code',
                  question: t3(
                    'Créez une règle CSS pour centrer un texte et le rendre rouge.',
                    'Create a CSS rule to center text and make it red.',
                    'أنشئ قاعدة CSS لتوسيط النص وجعله أحمر.'
                  ),
                  language: 'css',
                  codeTemplate: '.titre {\n  color: _____;\n  text-align: _____;\n}',
                  solution: ['red', 'center'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'DragDrop',
                  question: t3(
                    'Associez les propriétés CSS à leurs valeurs.',
                    'Match CSS properties to their values.',
                    'اربط خصائص CSS بقيمها.'
                  ),
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
                  points: 20,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        },
        {
          name: t3('JavaScript pour le Web', 'JavaScript for Web', 'JavaScript للويب'),
          description: t3(
            'Apprenez à rendre vos pages interactives',
            'Learn to make your pages interactive',
            'تعلم جعل صفحاتك تفاعلية'
          ),
          levels: [
            {
              title: t3('DOM et Manipulation', 'DOM and Manipulation', 'DOM والمعالجة'),
              content: t3(
                'Apprenez à manipuler le DOM avec JavaScript.',
                'Learn to manipulate the DOM with JavaScript.',
                'تعلم معالجة DOM باستخدام JavaScript.'
              ),
              exercises: [
                {
                  type: 'Code',
                  question: t3(
                    'Écrivez le code pour sélectionner un élément par son ID.',
                    'Write code to select an element by its ID.',
                    'اكتب الكود لتحديد عنصر حسب معرفه.'
                  ),
                  language: 'javascript',
                  codeTemplate: 'const element = document._____(\'monId\');',
                  solution: ['getElementById'],
                  points: 15,
                  difficulty: 'easy'
                },
                {
                  type: 'QCM',
                  question: t3(
                    'Quelle méthode permet de sélectionner tous les éléments d\'une classe ?',
                    'Which method allows selecting all elements of a class?',
                    'ما هي الطريقة التي تسمح بتحديد جميع عناصر فئة؟'
                  ),
                  options: [
                    t3('document.getElementsByClassName()', 'document.getElementsByClassName()', 'document.getElementsByClassName()'),
                    t3('document.getElementById()', 'document.getElementById()', 'document.getElementById()'),
                    t3('document.querySelector()', 'document.querySelector()', 'document.querySelector()'),
                    t3('document.getElements()', 'document.getElements()', 'document.getElements()')
                  ],
                  solution: [0],
                  points: 10,
                  difficulty: 'medium'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: t3('Structures de Données', 'Data Structures', 'هياكل البيانات'),
      type: 'classic',
      order: 3,
      paths: [
        {
          name: t3('Tableaux et Listes', 'Arrays and Lists', 'المصفوفات والقوائم'),
          description: t3(
            'Maîtrisez les structures de données linéaires',
            'Master linear data structures',
            'اتقن هياكل البيانات الخطية'
          ),
          levels: [
            {
              title: t3('Tableaux', 'Arrays', 'المصفوفات'),
              content: t3(
                'Apprenez à utiliser et manipuler les tableaux.',
                'Learn to use and manipulate arrays.',
                'تعلم استخدام ومعالجة المصفوفات.'
              ),
              exercises: [
                {
                  type: 'Code',
                  question: t3(
                    'Écrivez une fonction qui retourne la longueur d\'un tableau.',
                    'Write a function that returns the length of an array.',
                    'اكتب دالة تُرجع طول مصفوفة.'
                  ),
                  language: 'javascript',
                  codeTemplate: 'function longueurTableau(tableau) {\n  return tableau._____;\n}',
                  solution: ['length'],
                  points: 10,
                  difficulty: 'easy'
                },
                {
                  type: 'DataStructure',
                  question: t3(
                    'Ajoutez un élément à la fin d\'un tableau.',
                    'Add an element to the end of an array.',
                    'أضف عنصراً في نهاية المصفوفة.'
                  ),
                  language: 'javascript',
                  codeTemplate: 'const tableau = [1, 2, 3];\ntableau._____(4);',
                  solution: ['push'],
                  points: 15,
                  difficulty: 'easy'
                }
              ]
            },
            {
              title: t3('Listes Chaînées', 'Linked Lists', 'القوائم المرتبطة'),
              content: t3(
                'Découvrez les listes chaînées et leurs opérations.',
                'Discover linked lists and their operations.',
                'اكتشف القوائم المرتبطة وعملياتها.'
              ),
              exercises: [
                {
                  type: 'Code',
                  question: t3(
                    'Implémentez une fonction pour ajouter un nœud au début d\'une liste chaînée.',
                    'Implement a function to add a node to the beginning of a linked list.',
                    'قم بتنفيذ دالة لإضافة عقدة في بداية قائمة مرتبطة.'
                  ),
                  language: 'javascript',
                  codeTemplate: 'function ajouterAuDebut(liste, valeur) {\n  // Complétez ici\n  return _____;\n}',
                  testCases: [
                    { input: [null, 1], expected: { head: 1 } },
                    { input: [{ head: 2, next: null }, 1], expected: { head: 1, next: { head: 2 } } }
                  ],
                  solution: [],
                  points: 30,
                  difficulty: 'hard'
                },
                {
                  type: 'Complexity',
                  question: t3(
                    'Quelle est la complexité temporelle de l\'insertion au début d\'une liste chaînée ?',
                    'What is the time complexity of inserting at the beginning of a linked list?',
                    'ما هي التعقيد الزمني لإدراج في بداية قائمة مرتبطة؟'
                  ),
                  options: [
                    t3('O(1)', 'O(1)', 'O(1)'),
                    t3('O(n)', 'O(n)', 'O(n)'),
                    t3('O(log n)', 'O(log n)', 'O(log n)'),
                    t3('O(n²)', 'O(n²)', 'O(n²)')
                  ],
                  solution: [0],
                  points: 20,
                  difficulty: 'medium'
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
  console.log(`✅ Catégorie créée: ${name.fr}`);
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
    optimizationCriteria, performanceMetrics
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
    solutions: solution || []
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

  if (algorithmSteps) {
    exercise.algorithmSteps = algorithmSteps;
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

  const created = await Exercise.create(exercise);
  console.log(`      🎯 Exercice créé: ${type} - ${question.fr.substring(0, 30)}...`);
  return created;
}

// Fonction principale de seeding
async function seed() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // S'assurer que le type par défaut est défini
    await Category.updateMany(
      { $or: [{ type: { $exists: false } }, { type: null }] },
      { $set: { type: 'classic' } }
    );

    console.log('🌱 Création du plan de cours...\n');

    // Parcourir toutes les catégories
    for (const categoryData of COURSE_PLAN.categories) {
      const category = await createCategory(categoryData.name, categoryData.type, categoryData.order);

      // Parcourir tous les paths de cette catégorie
      for (let pathIndex = 0; pathIndex < categoryData.paths.length; pathIndex++) {
        const pathData = categoryData.paths[pathIndex];
        const path = await createPath(
          category._id,
          pathData.name,
          pathData.description,
          pathIndex + 1
        );

        const levelIds = [];

        // Parcourir tous les levels de ce path
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

          // Parcourir tous les exercices de ce level
          for (const exerciseData of levelData.exercises) {
            const exercise = await createExercise(level._id, exerciseData);
            exerciseIds.push(exercise._id);
          }

          // Mettre à jour le level avec les exercices
          await Level.findByIdAndUpdate(level._id, {
            exercises: exerciseIds
          });
        }

        // Mettre à jour le path avec les levels
        await Path.findByIdAndUpdate(path._id, {
          levels: levelIds
        });
      }
    }

    console.log('\n✅ Plan de cours créé avec succès !');
    console.log('\n📊 Résumé:');
    const categories = await Category.countDocuments({ type: 'classic' });
    const paths = await Path.countDocuments();
    const levels = await Level.countDocuments();
    const exercises = await Exercise.countDocuments();
    console.log(`  - ${categories} catégories`);
    console.log(`  - ${paths} paths`);
    console.log(`  - ${levels} levels`);
    console.log(`  - ${exercises} exercices`);

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

