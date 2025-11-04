const Category = require('../../models/Category');

module.exports = async function seedCategories(ctx) {
  const classic = [
    { fr: 'Débutant', en: 'Beginner', ar: 'مبتدئ', type: 'classic', order: 1 },
    { fr: 'Intermédiaire', en: 'Intermediate', ar: 'متوسط', type: 'classic', order: 2 },
    { fr: 'Avancé', en: 'Advanced', ar: 'متقدم', type: 'classic', order: 3 },
  ];

  const specifics = [
    { key: 'java', fr: 'Java', en: 'Java', ar: 'جافا' },
    { key: 'python', fr: 'Python', en: 'Python', ar: 'بايثون' },
    { key: 'cpp', fr: 'C++', en: 'C++', ar: 'سي++' },
    { key: 'csharp', fr: 'C#', en: 'C#', ar: 'سي شارب' },
    { key: 'javascript', fr: 'JavaScript', en: 'JavaScript', ar: 'جافاسكريبت' },
    { key: 'typescript', fr: 'TypeScript', en: 'TypeScript', ar: 'تايب سكريبت' },
    { key: 'angular', fr: 'Angular', en: 'Angular', ar: 'أنجولار' },
    { key: 'react', fr: 'React', en: 'React', ar: 'ريأكت' },
    { key: 'nodejs', fr: 'Node.js', en: 'Node.js', ar: 'نود.جي إس' },
    { key: 'sql', fr: 'SQL', en: 'SQL', ar: 'إس كيو إل' },
  ];

  // Upsert classic
  for (const c of classic) {
    const query = {
      'translations.fr.name': c.fr,
      'translations.en.name': c.en,
      'translations.ar.name': c.ar
    };
    const doc = {
      translations: { fr: { name: c.fr }, en: { name: c.en }, ar: { name: c.ar } },
      type: 'classic',
      order: c.order
    };
    if (ctx.DRY) continue;
    await Category.updateOne(query, { $setOnInsert: doc }, { upsert: true });
  }

  // Upsert specifics
  let order = 1;
  for (const s of specifics) {
    const query = {
      'translations.fr.name': s.fr,
      'translations.en.name': s.en,
      'translations.ar.name': s.ar
    };
    const doc = {
      translations: { fr: { name: s.fr }, en: { name: s.en }, ar: { name: s.ar } },
      type: 'specific',
      order
    };
    order++;
    if (ctx.DRY) continue;
    await Category.updateOne(query, { $setOnInsert: doc }, { upsert: true });
  }
};


