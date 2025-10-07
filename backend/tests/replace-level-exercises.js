const mongoose = require('mongoose');
const Level = require('../src/models/Level');
const Exercise = require('../src/models/Exercise');

// Configuration de la base de données
const MONGODB_URI = 'mongodb://localhost:27017/codegenesis';

// ID du niveau à modifier
const LEVEL_ID = '68c973738b6e19e85d67e35a';

// Nouveaux exercices de test avec leurs corrections
const newExercises = [
  {
    type: 'QCM',
    question: 'Quelle est la complexité temporelle du tri par sélection ?',
    options: [
      { id: 'a', text: 'O(n)' },
      { id: 'b', text: 'O(n log n)' },
      { id: 'c', text: 'O(n²)' },
      { id: 'd', text: 'O(log n)' }
    ],
    solutions: ['c'],
    points: 10,
    difficulty: 'easy',
    timeLimit: 5,
    attemptsAllowed: 3,
    hint: 'Pensez au nombre de comparaisons nécessaires',
    translations: {
      fr: {
        name: 'Complexité du tri par sélection',
        question: 'Quelle est la complexité temporelle du tri par sélection ?',
        explanation: 'Le tri par sélection a une complexité O(n²) car il effectue n(n-1)/2 comparaisons dans le pire des cas.'
      },
      en: {
        name: 'Selection Sort Complexity',
        question: 'What is the time complexity of selection sort?',
        explanation: 'Selection sort has O(n²) complexity because it performs n(n-1)/2 comparisons in the worst case.'
      },
      ar: {
        name: 'تعقيد ترتيب الاختيار',
        question: 'ما هو التعقيد الزمني لترتيب الاختيار؟',
        explanation: 'ترتيب الاختيار له تعقيد O(n²) لأنه يقوم بـ n(n-1)/2 مقارنة في أسوأ الحالات.'
      }
    }
  },
  {
    type: 'Code',
    question: 'Écrivez une fonction qui calcule la factorielle d\'un nombre',
    language: 'javascript',
    codeSnippet: 'function factorielle(n) {\n  // Votre code ici\n}',
    testCases: [
      { input: [0], expected: 1, public: true, points: 2 },
      { input: [1], expected: 1, public: true, points: 2 },
      { input: [5], expected: 120, public: true, points: 3 },
      { input: [10], expected: 3628800, public: false, points: 3 }
    ],
    solutions: [
      'function factorielle(n) {\n  if (n <= 1) return 1;\n  return n * factorielle(n - 1);\n}',
      'function factorielle(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}'
    ],
    points: 15,
    difficulty: 'medium',
    timeLimit: 15,
    attemptsAllowed: 3,
    hint: 'Utilisez la récursion ou une boucle',
    translations: {
      fr: {
        name: 'Fonction factorielle',
        question: 'Écrivez une fonction qui calcule la factorielle d\'un nombre',
        explanation: 'La factorielle de n est le produit de tous les entiers positifs inférieurs ou égaux à n.'
      },
      en: {
        name: 'Factorial Function',
        question: 'Write a function that calculates the factorial of a number',
        explanation: 'The factorial of n is the product of all positive integers less than or equal to n.'
      },
      ar: {
        name: 'دالة المضروب',
        question: 'اكتب دالة تحسب مضروب رقم',
        explanation: 'مضروب n هو حاصل ضرب جميع الأعداد الصحيحة الموجبة الأصغر من أو تساوي n.'
      }
    }
  },
  {
    type: 'Algorithm',
    question: 'Remettez les étapes de l\'algorithme de tri par sélection dans le bon ordre',
    algorithmSteps: [
      { id: '1', step: 'Trouver le plus petit élément dans le tableau' },
      { id: '2', step: 'Échanger cet élément avec le premier élément' },
      { id: '3', step: 'Répéter pour le reste du tableau (sans le premier élément)' },
      { id: '4', step: 'Continuer jusqu\'à ce que tout le tableau soit trié' }
    ],
    solutions: [['1', '2', '3', '4']],
    points: 12,
    difficulty: 'medium',
    timeLimit: 10,
    attemptsAllowed: 3,
    hint: 'Commencez par trouver le plus petit élément',
    translations: {
      fr: {
        name: 'Étapes du tri par sélection',
        question: 'Remettez les étapes de l\'algorithme de tri par sélection dans le bon ordre',
        explanation: 'Le tri par sélection trouve d\'abord le plus petit élément, puis l\'échange avec le premier.'
      },
      en: {
        name: 'Selection Sort Steps',
        question: 'Put the selection sort algorithm steps in the correct order',
        explanation: 'Selection sort first finds the smallest element, then swaps it with the first.'
      },
      ar: {
        name: 'خطوات ترتيب الاختيار',
        question: 'ضع خطوات خوارزمية ترتيب الاختيار بالترتيب الصحيح',
        explanation: 'ترتيب الاختيار يجد أولاً أصغر عنصر، ثم يبدله مع الأول.'
      }
    }
  },
  {
    type: 'OrderBlocks',
    question: 'Remettez les blocs de code dans le bon ordre pour créer un programme valide',
    blocks: [
      { id: '1', code: 'let x = 5;' },
      { id: '2', code: 'console.log("Valeur initiale:", x);' },
      { id: '3', code: 'x = x + 1;' },
      { id: '4', code: 'console.log("Valeur finale:", x);' }
    ],
    solutions: [['1', '2', '3', '4']],
    points: 8,
    difficulty: 'easy',
    timeLimit: 8,
    attemptsAllowed: 3,
    hint: 'Pensez à l\'ordre d\'exécution logique',
    translations: {
      fr: {
        name: 'Ordre des blocs de code',
        question: 'Remettez les blocs de code dans le bon ordre pour créer un programme valide',
        explanation: 'Un programme doit déclarer les variables avant de les utiliser.'
      },
      en: {
        name: 'Code Block Order',
        question: 'Put the code blocks in the correct order to create a valid program',
        explanation: 'A program must declare variables before using them.'
      },
      ar: {
        name: 'ترتيب كتل الكود',
        question: 'ضع كتل الكود بالترتيب الصحيح لإنشاء برنامج صالح',
        explanation: 'يجب على البرنامج أن يعلن المتغيرات قبل استخدامها.'
      }
    }
  },
  {
    type: 'TextInput',
    question: 'Quel est le nom de la fonction JavaScript pour afficher du texte dans la console ?',
    solutions: ['console.log', 'console.log()'],
    points: 5,
    difficulty: 'easy',
    timeLimit: 3,
    attemptsAllowed: 2,
    hint: 'Commence par "console"',
    translations: {
      fr: {
        name: 'Fonction d\'affichage',
        question: 'Quel est le nom de la fonction JavaScript pour afficher du texte dans la console ?',
        explanation: 'console.log() est la fonction standard pour afficher des informations dans la console JavaScript.'
      },
      en: {
        name: 'Display Function',
        question: 'What is the name of the JavaScript function to display text in the console?',
        explanation: 'console.log() is the standard function to display information in the JavaScript console.'
      },
      ar: {
        name: 'دالة العرض',
        question: 'ما اسم دالة JavaScript لعرض النص في وحدة التحكم؟',
        explanation: 'console.log() هي الدالة القياسية لعرض المعلومات في وحدة تحكم JavaScript.'
      }
    }
  },
  {
    type: 'FillInTheBlank',
    question: 'Complétez la phrase : JavaScript est un langage de programmation _____',
    template: 'JavaScript est un langage de programmation _____',
    gaps: [
      { id: 'gap1', placeholder: 'type', hint: 'Pensez au typage' }
    ],
    solutions: { gap1: 'dynamique' },
    points: 6,
    difficulty: 'easy',
    timeLimit: 5,
    attemptsAllowed: 2,
    hint: 'Le type est déterminé à l\'exécution',
    translations: {
      fr: {
        name: 'Complétion de phrase',
        question: 'Complétez la phrase : JavaScript est un langage de programmation _____',
        explanation: 'JavaScript est un langage de programmation dynamique car les types sont déterminés à l\'exécution.'
      },
      en: {
        name: 'Sentence Completion',
        question: 'Complete the sentence: JavaScript is a _____ programming language',
        explanation: 'JavaScript is a dynamic programming language because types are determined at runtime.'
      },
      ar: {
        name: 'إكمال الجملة',
        question: 'أكمل الجملة: JavaScript هو لغة برمجة _____',
        explanation: 'JavaScript هي لغة برمجة ديناميكية لأن الأنواع تُحدد في وقت التشغيل.'
      }
    }
  },
  {
    type: 'SpotTheError',
    question: 'Identifiez les lignes contenant des erreurs dans ce code',
    codeSnippet: 'function calculer(a, b) {\n  let result = a + b\n  return result\n}',
    language: 'javascript',
    solutions: [2], // Ligne 2 manque le point-virgule
    points: 8,
    difficulty: 'medium',
    timeLimit: 8,
    attemptsAllowed: 3,
    hint: 'Vérifiez la syntaxe JavaScript',
    translations: {
      fr: {
        name: 'Détection d\'erreurs',
        question: 'Identifiez les lignes contenant des erreurs dans ce code',
        explanation: 'En JavaScript, il est recommandé d\'utiliser des points-virgules à la fin des instructions.'
      },
      en: {
        name: 'Error Detection',
        question: 'Identify the lines containing errors in this code',
        explanation: 'In JavaScript, it is recommended to use semicolons at the end of statements.'
      },
      ar: {
        name: 'كشف الأخطاء',
        question: 'حدد الأسطر التي تحتوي على أخطاء في هذا الكود',
        explanation: 'في JavaScript، يُنصح باستخدام الفواصل المنقوطة في نهاية العبارات.'
      }
    }
  },
  {
    type: 'ScratchBlocks',
    question: 'Créez un programme Scratch qui affiche "Bonjour" puis "Monde"',
    scratchBlocks: [
      { id: 'start', type: 'event', text: 'Quand le drapeau vert est cliqué' },
      { id: 'say1', type: 'looks', text: 'Dire "Bonjour" pendant 2 secondes' },
      { id: 'say2', type: 'looks', text: 'Dire "Monde" pendant 2 secondes' }
    ],
    solutions: [['start', 'say1', 'say2']],
    points: 10,
    difficulty: 'easy',
    timeLimit: 10,
    attemptsAllowed: 3,
    hint: 'Commencez par l\'événement, puis les actions',
    translations: {
      fr: {
        name: 'Programme Scratch',
        question: 'Créez un programme Scratch qui affiche "Bonjour" puis "Monde"',
        explanation: 'Un programme Scratch commence toujours par un événement, suivi des actions.'
      },
      en: {
        name: 'Scratch Program',
        question: 'Create a Scratch program that displays "Hello" then "World"',
        explanation: 'A Scratch program always starts with an event, followed by actions.'
      },
      ar: {
        name: 'برنامج Scratch',
        question: 'أنشئ برنامج Scratch يعرض "مرحبا" ثم "العالم"',
        explanation: 'يبدأ برنامج Scratch دائماً بحدث، يليه الإجراءات.'
      }
    }
  }
];

async function replaceExercises() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie');

    // Vérifier que le niveau existe
    const level = await Level.findById(LEVEL_ID);
    if (!level) {
      throw new Error(`Niveau avec l'ID ${LEVEL_ID} non trouvé`);
    }
    console.log(`✅ Niveau trouvé: ${level.title}`);

    // Supprimer tous les exercices existants du niveau
    const existingExercises = await Exercise.find({ level: LEVEL_ID });
    console.log(`📝 ${existingExercises.length} exercices existants trouvés`);

    if (existingExercises.length > 0) {
      await Exercise.deleteMany({ level: LEVEL_ID });
      console.log(`🗑️ ${existingExercises.length} exercices supprimés`);
    }

    // Créer les nouveaux exercices
    console.log('🆕 Création des nouveaux exercices...');
    const createdExercises = [];

    for (let i = 0; i < newExercises.length; i++) {
      const exerciseData = {
        ...newExercises[i],
        level: LEVEL_ID,
        order: i + 1
      };

      const exercise = await Exercise.create(exerciseData);
      createdExercises.push(exercise);
      console.log(`✅ Exercice ${i + 1} créé: ${exercise.translations.fr.name} (${exercise.type})`);
    }

    // Mettre à jour le niveau avec les nouveaux exercices
    await Level.findByIdAndUpdate(LEVEL_ID, {
      exercises: createdExercises.map(ex => ex._id)
    });

    console.log(`\n🎉 Succès ! ${createdExercises.length} nouveaux exercices créés pour le niveau ${LEVEL_ID}`);
    console.log('\n📋 Résumé des exercices créés:');
    createdExercises.forEach((ex, i) => {
      console.log(`${i + 1}. ${ex.translations.fr.name} (${ex.type}) - ${ex.points} pts`);
    });

    console.log('\n🔧 Corrections des exercices:');
    createdExercises.forEach((ex, i) => {
      console.log(`\n${i + 1}. ${ex.translations.fr.name} (${ex.type}):`);
      if (ex.type === 'QCM') {
        console.log(`   Réponse correcte: ${ex.solutions.join(', ')}`);
      } else if (ex.type === 'Code') {
        console.log(`   Solution: ${ex.solutions[0]}`);
      } else if (ex.type === 'Algorithm' || ex.type === 'OrderBlocks' || ex.type === 'ScratchBlocks') {
        console.log(`   Ordre correct: ${ex.solutions[0].join(' → ')}`);
      } else if (ex.type === 'TextInput') {
        console.log(`   Réponse: ${ex.solutions.join(' ou ')}`);
      } else if (ex.type === 'FillInTheBlank') {
        console.log(`   Complétion: ${JSON.stringify(ex.solutions)}`);
      } else if (ex.type === 'SpotTheError') {
        console.log(`   Lignes avec erreurs: ${ex.solutions.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connexion fermée');
  }
}

// Exécuter le script
replaceExercises();

