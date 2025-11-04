const Category = require('../../models/Category');
const Path = require('../../models/Path');

module.exports = async function seedPaths(ctx) {
  if (ctx.DRY) return;

  const categories = await Category.find({}).lean();
  for (const c of categories) {
    const paths = [
      {
        translations: {
          fr: { name: 'Fondations', description: 'Bases essentielles' },
          en: { name: 'Foundations', description: 'Essential basics' },
          ar: { name: 'الأساسيات', description: 'الأساسيات الضرورية' }
        },
        order: 1
      },
      {
        translations: {
          fr: { name: 'Noyau', description: 'Concepts clés' },
          en: { name: 'Core', description: 'Core concepts' },
          ar: { name: 'المحور', description: 'المفاهيم الأساسية' }
        },
        order: 2
      },
      {
        translations: {
          fr: { name: 'Projets', description: 'Mise en pratique' },
          en: { name: 'Projects', description: 'Hands-on practice' },
          ar: { name: 'المشاريع', description: 'تطبيق عملي' }
        },
        order: 3
      }
    ];

    for (const p of paths) {
      await Path.updateOne(
        {
          'translations.fr.name': p.translations.fr.name,
          category: c._id
        },
        { $setOnInsert: { ...p, category: c._id } },
        { upsert: true }
      );
    }
  }
};


