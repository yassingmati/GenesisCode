const Level = require('../../models/Level');
const Exercise = require('../../models/Exercise');

module.exports = async function seedExercises(ctx) {
  if (ctx.DRY) return;

  const levels = await Level.find({}).lean();
  for (const lvl of levels) {
    const baseDifficulty = lvl.order === 1 ? 'easy' : (lvl.order === 2 ? 'medium' : 'hard');

    const samples = [
      {
        type: 'QCM',
        translations: {
          fr: { name: 'JVM', question: 'À quoi sert la JVM ?', explanation: 'Elle exécute le bytecode Java.' },
          en: { name: 'JVM', question: 'What does the JVM do?', explanation: 'It executes Java bytecode.' },
          ar: { name: 'JVM', question: 'ما وظيفة JVM؟', explanation: 'تشغل البايت كود لجافا.' }
        },
        options: [
          { id: 'a', text: 'Compiler Java en C' },
          { id: 'b', text: 'Gérer la mémoire seulement' },
          { id: 'c', text: 'Exécuter le bytecode Java' },
          { id: 'd', text: 'Traduire HTML' }
        ],
        solutions: ['c'],
        points: 10
      },
      {
        type: 'TextInput',
        translations: {
          fr: { name: 'Complexité', question: 'Définissez la complexité algorithmique.', explanation: '' },
          en: { name: 'Complexity', question: 'Define algorithmic complexity.', explanation: '' },
          ar: { name: 'التعقيد', question: 'عرف التعقيد الخوارزمي.', explanation: '' }
        },
        solutions: ['mesure des ressources (temps/espace) selon la taille d’entrée'],
        points: 10
      },
      {
        type: 'Code',
        translations: {
          fr: { name: 'Inverser chaîne', question: 'Écrivez une fonction qui inverse une chaîne.', explanation: '' },
          en: { name: 'Reverse string', question: 'Write a function to reverse a string.', explanation: '' },
          ar: { name: 'اعكس النص', question: 'اكتب دالة لعكس نص.', explanation: '' }
        },
        language: 'javascript',
        codeSnippet: 'function reverse(s) { /* ... */ }',
        testCases: [
          { input: 'abc', expected: 'cba', points: 5, public: true },
          { input: 'hello', expected: 'olleh', points: 5, public: false }
        ],
        solutions: [{ tests: true }],
        points: 10
      }
    ];

    // create 5 exercises per level (repeat/variant)
    let createdCount = 0;
    for (let i = 0; i < samples.length; i++) {
      const ex = samples[i];
      const query = {
        'translations.fr.name': ex.translations.fr.name,
        level: lvl._id,
        type: ex.type
      };
      const payload = { ...ex, level: lvl._id, difficulty: baseDifficulty };
      const created = await Exercise.findOneAndUpdate(query, { $setOnInsert: payload }, { upsert: true, new: true, setDefaultsOnInsert: true });
      await Exercise.updateOne({ _id: created._id }, { $set: { difficulty: baseDifficulty } });
      createdCount++;
    }
  }
};


