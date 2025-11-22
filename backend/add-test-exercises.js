/**
 * Script pour ajouter des exercices de test au niveau 690c7be344d3becb125f0bd1
 */

const mongoose = require('mongoose');
const Exercise = require('./src/models/Exercise');
const Level = require('./src/models/Level');

// Configuration MongoDB - Charger depuis .env si disponible
const path = require('path');
const fs = require('fs');

// Charger .env depuis le répertoire backend
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('⚠️  Fichier .env non trouvé, utilisation des variables d\'environnement système');
  require('dotenv').config();
}

let MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Si pas d'URI ou si c'est localhost, essayer de lire directement depuis le fichier .env
if ((!MONGODB_URI || MONGODB_URI.includes('localhost')) && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  // Chercher toutes les lignes MONGODB_URI et prendre celle qui contient mongodb+srv
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.includes('MONGODB_URI') && line.includes('mongodb+srv')) {
      const match = line.match(/MONGODB_URI=(.+)/);
      if (match) {
        MONGODB_URI = match[1].trim();
        // Nettoyer les guillemets et les retours à la ligne si présents
        MONGODB_URI = MONGODB_URI.replace(/^["']|["']$/g, '').replace(/\r/g, '');
        break;
      }
    }
  }
}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini');
  console.error('💡 Vérifiez que le fichier backend/.env contient MONGODB_URI');
  process.exit(1);
}

// Vérifier que c'est MongoDB Atlas
if (MONGODB_URI.includes('mongodb://localhost') || MONGODB_URI.includes('127.0.0.1')) {
  console.warn('⚠️  ATTENTION: URI pointe vers localhost au lieu de MongoDB Atlas');
  console.warn('💡 Pour utiliser MongoDB Atlas, configurez MONGODB_URI dans backend/.env avec mongodb+srv://...');
  process.exit(1);
}

const uriDisplay = MONGODB_URI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@');
console.log(`📄 URI MongoDB Atlas: ${uriDisplay}`);

// ID du niveau cible - Si non trouvé, le script cherchera par titre
const LEVEL_ID = '690c7be344d3becb125f0bd1';
const LEVEL_TITLE = 'Fonctions et Portées'; // Titre alternatif pour la recherche

// Exercices de test à créer
const testExercises = [
  // Exercice QCM
  {
    translations: {
      fr: {
        name: 'QCM - Fonctions fléchées',
        question: 'Quelle est la syntaxe correcte pour une fonction fléchée en JavaScript ?',
        explanation: 'Les fonctions fléchées utilisent la syntaxe () => {}'
      },
      en: {
        name: 'QCM - Arrow Functions',
        question: 'What is the correct syntax for an arrow function in JavaScript?',
        explanation: 'Arrow functions use the syntax () => {}'
      },
      ar: {
        name: 'QCM - الدوال السهمية',
        question: 'ما هو الصيغة الصحيحة للدالة السهمية في JavaScript؟',
        explanation: 'الدوال السهمية تستخدم الصيغة () => {}'
      }
    },
    type: 'QCM',
    points: 10,
    difficulty: 'easy',
    options: [
      { id: 'opt-0', text: 'function() {}' },
      { id: 'opt-1', text: '() => {}', correct: true },
      { id: 'opt-2', text: '=> function() {}' },
      { id: 'opt-3', text: 'function => {}' }
    ],
    solutions: ['opt-1']
  },

  // Exercice Code
  {
    translations: {
      fr: {
        name: 'Code - Créer une fonction fléchée',
        question: 'Créez une fonction fléchée nommée "multiply" qui prend deux paramètres a et b et retourne leur produit.',
        explanation: 'const multiply = (a, b) => a * b;'
      },
      en: {
        name: 'Code - Create an arrow function',
        question: 'Create an arrow function named "multiply" that takes two parameters a and b and returns their product.',
        explanation: 'const multiply = (a, b) => a * b;'
      },
      ar: {
        name: 'كود - إنشاء دالة سهمية',
        question: 'أنشئ دالة سهمية باسم "multiply" تأخذ معاملين a و b وتعيد حاصل ضربهما.',
        explanation: 'const multiply = (a, b) => a * b;'
      }
    },
    type: 'Code',
    points: 15,
    difficulty: 'medium',
    language: 'javascript',
    codeSnippet: '// Créez votre fonction ici\n',
    testCases: [
      { input: 'multiply(2, 3)', expected: '6', points: 5, public: true },
      { input: 'multiply(5, 4)', expected: '20', points: 5, public: true },
      { input: 'multiply(0, 10)', expected: '0', points: 5, public: false }
    ],
    solutions: ['const multiply = (a, b) => a * b;']
  },

  // Exercice TextInput
  {
    translations: {
      fr: {
        name: 'Texte - Portée des variables',
        question: 'Quel mot-clé permet de déclarer une variable avec une portée de bloc en JavaScript ?',
        explanation: 'Le mot-clé "let" permet de déclarer une variable avec une portée de bloc.'
      },
      en: {
        name: 'Text - Variable scope',
        question: 'Which keyword allows declaring a variable with block scope in JavaScript?',
        explanation: 'The keyword "let" allows declaring a variable with block scope.'
      },
      ar: {
        name: 'نص - نطاق المتغيرات',
        question: 'ما هي الكلمة المفتاحية التي تسمح بتعريف متغير بنطاق كتلة في JavaScript؟',
        explanation: 'الكلمة المفتاحية "let" تسمح بتعريف متغير بنطاق كتلة.'
      }
    },
    type: 'TextInput',
    points: 5,
    difficulty: 'easy',
    solutions: ['let', 'const']
  },

  // Exercice OrderBlocks
  {
    translations: {
      fr: {
        name: 'Ordre - Structure d\'une fonction',
        question: 'Remettez les blocs dans le bon ordre pour créer une fonction fléchée valide.',
        explanation: 'Une fonction fléchée commence par const/let, puis le nom, puis les paramètres, puis =>, puis le corps.'
      },
      en: {
        name: 'Order - Function structure',
        question: 'Reorder the blocks to create a valid arrow function.',
        explanation: 'An arrow function starts with const/let, then the name, then parameters, then =>, then the body.'
      },
      ar: {
        name: 'ترتيب - هيكل الدالة',
        question: 'أعد ترتيب الكتل لإنشاء دالة سهمية صحيحة.',
        explanation: 'تبدأ الدالة السهمية بـ const/let، ثم الاسم، ثم المعاملات، ثم =>، ثم الجسم.'
      }
    },
    type: 'OrderBlocks',
    points: 10,
    difficulty: 'medium',
    blocks: [
      { id: 'block-0', code: 'const' },
      { id: 'block-1', code: 'multiply' },
      { id: 'block-2', code: '=' },
      { id: 'block-3', code: '(a, b)' },
      { id: 'block-4', code: '=>' },
      { id: 'block-5', code: 'a * b;' }
    ],
    solutions: [['block-0', 'block-1', 'block-2', 'block-3', 'block-4', 'block-5']]
  },

  // Exercice Matching
  {
    translations: {
      fr: {
        name: 'Association - Concepts de fonctions',
        question: 'Associez chaque concept à sa définition correcte.',
        explanation: 'Les fonctions fléchées sont une syntaxe moderne, les fonctions déclarées sont hoisted, etc.'
      },
      en: {
        name: 'Matching - Function concepts',
        question: 'Match each concept to its correct definition.',
        explanation: 'Arrow functions are modern syntax, declared functions are hoisted, etc.'
      },
      ar: {
        name: 'مطابقة - مفاهيم الدوال',
        question: 'طابق كل مفهوم مع تعريفه الصحيح.',
        explanation: 'الدوال السهمية هي صيغة حديثة، والدوال المعلنة يتم رفعها، إلخ.'
      }
    },
    type: 'Matching',
    points: 12,
    difficulty: 'medium',
    prompts: [
      { id: 'prompt-0', content: 'Fonction fléchée' },
      { id: 'prompt-1', content: 'Fonction déclarée' },
      { id: 'prompt-2', content: 'Portée de bloc' },
      { id: 'prompt-3', content: 'Hoisting' }
    ],
    matches: [
      { id: 'match-0', content: 'Syntaxe moderne () => {}' },
      { id: 'match-1', content: 'function nom() {}' },
      { id: 'match-2', content: 'Variables accessibles dans {}' },
      { id: 'match-3', content: 'Remontée des déclarations' }
    ],
    solutions: [
      { prompt: 'prompt-0', match: 'match-0' },
      { prompt: 'prompt-1', match: 'match-1' },
      { prompt: 'prompt-2', match: 'match-2' },
      { prompt: 'prompt-3', match: 'match-3' }
    ]
  }
];

async function addTestExercises() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10
    });
    console.log('✅ Connecté à MongoDB Atlas');

    // Vérifier que le niveau existe
    let level = await Level.findById(LEVEL_ID);
    if (!level) {
      // Essayer de trouver le niveau par titre
      console.log(`⚠️  Niveau ${LEVEL_ID} non trouvé, recherche par titre "${LEVEL_TITLE}"...`);
      level = await Level.findOne({ 
        $or: [
          { 'translations.fr.title': LEVEL_TITLE },
          { 'translations.en.title': LEVEL_TITLE },
          { title: LEVEL_TITLE }
        ]
      });
      
      if (!level) {
        // Essayer "Les Fonctions" comme alternative
        console.log('⚠️  Recherche du niveau "Les Fonctions"...');
        level = await Level.findOne({ 
          $or: [
            { 'translations.fr.title': 'Les Fonctions' },
            { 'translations.fr.title': /Fonction/i }
          ]
        });
      }
      
      if (!level) {
        // Lister les niveaux disponibles
        const allLevels = await Level.find().limit(10);
        console.log('\n📋 Niveaux disponibles (10 premiers):');
        allLevels.forEach(l => {
          console.log(`  - ${l._id}: ${l.translations?.fr?.title || l.title || 'Sans titre'}`);
        });
        throw new Error(`Niveau ${LEVEL_ID} ou "${LEVEL_TITLE}" non trouvé. Utilisez un ID valide parmi ceux listés ci-dessus.`);
      }
      
      console.log(`✅ Niveau trouvé par titre: ${level.translations?.fr?.title || level.title || 'Sans titre'} (${level._id})`);
    } else {
      console.log(`✅ Niveau trouvé par ID: ${level.translations?.fr?.title || level.title || 'Sans titre'} (${level._id})`);
    }
    
    // Mettre à jour LEVEL_ID pour utiliser le niveau trouvé
    const finalLevelId = level._id.toString();

    // Créer les exercices
    console.log(`\n📝 Création de ${testExercises.length} exercices...`);
    const createdExercises = [];

    for (let i = 0; i < testExercises.length; i++) {
      const exerciseData = testExercises[i];
      exerciseData.level = finalLevelId;

      const exercise = new Exercise(exerciseData);
      await exercise.save();
      createdExercises.push(exercise);

      console.log(`  ✅ Exercice ${i + 1}/${testExercises.length} créé: ${exercise.translations.fr.name} (${exercise.type})`);
    }

    console.log(`\n✅ ${createdExercises.length} exercices créés avec succès dans MongoDB Atlas !`);
    console.log('\n📋 Résumé:');
    createdExercises.forEach((ex, idx) => {
      console.log(`  ${idx + 1}. ${ex.translations.fr.name} - ${ex.type} - ${ex.points} pts - ${ex.difficulty}`);
    });

    // Afficher les IDs des exercices créés
    console.log('\n🆔 IDs des exercices créés:');
    createdExercises.forEach((ex, idx) => {
      console.log(`  ${idx + 1}. ${ex._id}`);
    });

    // Vérifier que les exercices sont bien dans la base de données
    console.log('\n🔍 Vérification dans MongoDB Atlas...');
    const verifyExercises = await Exercise.find({ level: finalLevelId });
    console.log(`✅ ${verifyExercises.length} exercice(s) trouvé(s) pour le niveau ${finalLevelId}`);
    
    // Vérifier le niveau
    const verifyLevel = await Level.findById(finalLevelId).populate('exercises');
    if (verifyLevel) {
      console.log(`✅ Niveau vérifié: ${verifyLevel.translations?.fr?.title || verifyLevel.title}`);
      console.log(`✅ Total exercices dans le niveau: ${verifyExercises.length}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  addTestExercises()
    .then(() => {
      console.log('\n✅ Script terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur lors de l\'exécution:', error);
      process.exit(1);
    });
}

module.exports = { addTestExercises, testExercises };

