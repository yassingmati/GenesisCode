// src/scripts/seedSpecificCategories.js
const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');

function t3(fr, en, ar) {
  return { fr, en, ar };
}

async function createSpecificCategory(nameFr, nameEn, nameAr, order) {
  const existing = await Category.findOne({ 'translations.fr.name': nameFr });
  if (existing) return existing;
  return Category.create({
    translations: t3({ name: nameFr }, { name: nameEn }, { name: nameAr }),
    type: 'specific',
    order: order || 0
  });
}

async function createPath(categoryId, order, frName, enName, arName, frDesc = '', enDesc = '', arDesc = '') {
  return Path.create({
    translations: {
      fr: { name: frName, description: frDesc },
      en: { name: enName, description: enDesc },
      ar: { name: arName, description: arDesc }
    },
    category: categoryId,
    order
  });
}

async function createLevel(pathId, order, frTitle, enTitle, arTitle, frContent, enContent, arContent) {
  return Level.create({
    translations: {
      fr: { title: frTitle, content: frContent },
      en: { title: enTitle, content: enContent },
      ar: { title: arTitle, content: arContent }
    },
    path: pathId,
    order
  });
}

async function createQCMExercise(levelId, baseId, questionFr, questionEn, questionAr, options, correctIdx = [0]) {
  return Exercise.create({
    translations: {
      fr: { name: `QCM ${baseId}`, question: questionFr, explanation: '' },
      en: { name: `MCQ ${baseId}`, question: questionEn, explanation: '' },
      ar: { name: `اختيار متعدد ${baseId}`, question: questionAr, explanation: '' }
    },
    type: 'QCM',
    options: options.map((text, i) => ({ id: `${baseId}-${i}`, text })),
    solutions: correctIdx,
    level: levelId,
    points: 10,
    allowPartial: false
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genesis', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    console.log('🌱 Seeding specific categories (Java, Python, React, C++)');

    // Ensure backfill type
    await Category.updateMany({ $or: [ { type: { $exists: false } }, { type: null } ] }, { $set: { type: 'classic' } });

    const java = await createSpecificCategory('Java', 'Java', 'جافا', 1);
    const python = await createSpecificCategory('Python', 'Python', 'بايثون', 2);
    const react = await createSpecificCategory('React', 'React', 'ريأكت', 3);
    const cpp = await createSpecificCategory('C++', 'C++', 'سي++', 4);

    const entries = [
      { cat: java, paths: [
        { name: ['Bases Java', 'Java Basics', 'أساسيات جافا'] },
        { name: ['POO en Java', 'OOP in Java', 'البرمجة كائنية التوجه في جافا'] }
      ]},
      { cat: python, paths: [
        { name: ['Bases Python', 'Python Basics', 'أساسيات بايثون'] },
        { name: ['Data Science Intro', 'Data Science Intro', 'مقدمة علم البيانات'] }
      ]},
      { cat: react, paths: [
        { name: ['React Débutant', 'React Beginner', 'مبتدئ ريأكت'] },
        { name: ['React Hooks', 'React Hooks', 'ريأكت هوكس'] }
      ]},
      { cat: cpp, paths: [
        { name: ['Bases C++', 'C++ Basics', 'أساسيات سي++'] },
        { name: ['POO en C++', 'OOP in C++', 'البرمجة كائنية التوجه في سي++'] }
      ]},
    ];

    for (const entry of entries) {
      let order = 1;
      for (const p of entry.paths) {
        const [fr, en, ar] = p.name;
        const pathDoc = await createPath(entry.cat._id, order++, fr, en, ar, '', '', '');

        // Create 3 simple levels per path
        for (let i = 1; i <= 3; i++) {
          const lvl = await createLevel(
            pathDoc._id,
            i,
            `${fr} – Niveau ${i}`,
            `${en} – Level ${i}`,
            `${ar} – المستوى ${i}`,
            `Contenu du niveau ${i} pour ${fr}`,
            `Level ${i} content for ${en}`,
            `محتوى المستوى ${i} لـ ${ar}`
          );

          // Add 1-2 QCM exercises per level
          await createQCMExercise(
            lvl._id,
            `${fr.replace(/\s+/g,'_').toLowerCase()}_${i}_q1`,
            `Question ${i} sur ${fr} ?`,
            `Question ${i} about ${en}?`,
            `سؤال ${i} حول ${ar}?`,
            ['Option A', 'Option B', 'Option C'],
            [0]
          );
          await createQCMExercise(
            lvl._id,
            `${fr.replace(/\s+/g,'_').toLowerCase()}_${i}_q2`,
            `Deuxième question ${i} sur ${fr} ?`,
            `Second question ${i} about ${en}?`,
            `السؤال الثاني ${i} حول ${ar}?`,
            ['Choix 1', 'Choix 2', 'Choix 3'],
            [1]
          );
        }
      }
    }

    console.log('✅ Seeding done.');
  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;









