const Path = require('../../models/Path');
const Level = require('../../models/Level');

module.exports = async function seedLevels(ctx) {
  if (ctx.DRY) return;

  const paths = await Path.find({}).lean();
  for (const p of paths) {
    const levels = [
      {
        translations: {
          fr: { title: 'Niveau 1', content: 'Introduction et bases' },
          en: { title: 'Level 1', content: 'Introduction and basics' },
          ar: { title: 'المستوى 1', content: 'مقدمة وأساسيات' }
        },
        order: 1
      },
      {
        translations: {
          fr: { title: 'Niveau 2', content: 'Approfondissement' },
          en: { title: 'Level 2', content: 'Deepening knowledge' },
          ar: { title: 'المستوى 2', content: 'تعميق المعرفة' }
        },
        order: 2
      },
      {
        translations: {
          fr: { title: 'Niveau 3', content: 'Projets avancés' },
          en: { title: 'Level 3', content: 'Advanced projects' },
          ar: { title: 'المستوى 3', content: 'مشاريع متقدمة' }
        },
        order: 3
      }
    ];

    for (const lvl of levels) {
      const created = await Level.findOneAndUpdate(
        { path: p._id, order: lvl.order },
        { $setOnInsert: { ...lvl, path: p._id } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // ensure level id in Path.levels array
      await Path.updateOne({ _id: p._id }, { $addToSet: { levels: created._id } });
    }
  }
};


