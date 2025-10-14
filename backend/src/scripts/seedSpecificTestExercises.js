const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codegenesis';
  await mongoose.connect(MONGODB_URI);

  console.log('Seeding test exercises for specific categories...');

  const categories = await Category.find({ type: 'specific' }).lean();
  console.log(`Found ${categories.length} specific categories`);

  let createdCount = 0;

  for (const cat of categories) {
    let paths = await Path.find({ category: cat._id }).lean();
    if (!paths.length) {
      // create a default path if none
      const newPath = await Path.create({
        category: cat._id,
        translations: {
          fr: { name: 'Parcours Démo', description: 'Parcours auto-généré' },
          en: { name: 'Demo Path', description: 'Auto-generated path' },
          ar: { name: 'مسار تجريبي', description: 'مسار مولد تلقائياً' }
        },
        order: 1
      });
      paths = [newPath.toObject()];
    }
    console.log(`- Category ${cat.translations?.fr?.name || cat._id}: ${paths.length} paths`);

    for (const path of paths) {
      let levels = await Level.find({ path: path._id }).lean();
      if (!levels.length) {
        const newLevel = await Level.create({
          path: path._id,
          translations: {
            fr: { title: 'Niveau 1', content: 'Contenu auto-généré' },
            en: { title: 'Level 1', content: 'Auto-generated content' },
            ar: { title: 'المستوى 1', content: 'محتوى مولد تلقائياً' }
          },
          order: 1
        });
        levels = [newLevel.toObject()];
      }
      console.log(`  · Path ${path.translations?.fr?.name || path._id}: ${levels.length} levels`);

      for (const level of levels) {
        // Create a QCM exercise
        const qcm = new Exercise({
          level: level._id,
          type: 'QCM',
          translations: {
            fr: { name: 'QCM Test', question: 'Quelle option est correcte ?', explanation: 'Explication QCM' },
            en: { name: 'QCM Test', question: 'Which option is correct?', explanation: 'QCM explanation' },
            ar: { name: 'اختبار QCM', question: 'أي خيار صحيح؟', explanation: 'شرح QCM' }
          },
          options: [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' }
          ],
          solutions: ['b'],
          points: 10,
          difficulty: 'easy',
          shuffle: true
        });

        // Create a Code exercise
        const code = new Exercise({
          level: level._id,
          type: 'Code',
          translations: {
            fr: { name: 'Code Test', question: 'Retourne la somme de a et b', explanation: 'Utilise + pour additionner' },
            en: { name: 'Code Test', question: 'Return the sum of a and b', explanation: 'Use + to add numbers' },
            ar: { name: 'اختبار كود', question: 'أرجع مجموع a و b', explanation: 'استخدم + للجمع' }
          },
          codeSnippet: 'function add(a, b) {\n  // TODO\n}',
          language: 'js',
          testCases: [
            { input: { a: 1, b: 2 }, expected: 3, points: 1, public: true },
            { input: { a: -1, b: 5 }, expected: 4, points: 1, public: false }
          ],
          points: 20,
          difficulty: 'easy'
        });

        await Exercise.insertMany([qcm, code]);
        createdCount += 2;
      }
    }
  }

  console.log(`Done. Created ${createdCount} exercises.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});


