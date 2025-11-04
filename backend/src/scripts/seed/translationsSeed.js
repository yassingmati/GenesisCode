const Category = require('../../models/Category');
const Path = require('../../models/Path');
const Level = require('../../models/Level');
const Exercise = require('../../models/Exercise');

module.exports = async function seedTranslations(ctx) {
  // Ensure all docs have fr/en/ar fields filled (fallbacks)
  const langs = ctx.langs || ['fr','en','ar'];

  const fill = (translations, fields) => {
    const base = translations.fr || translations.en || translations.ar || {};
    for (const l of ['fr','en','ar']) {
      translations[l] = translations[l] || {};
      for (const f of fields) {
        if (translations[l][f] == null && base[f] != null) translations[l][f] = base[f];
      }
    }
    return translations;
  };

  const cats = await Category.find({});
  for (const c of cats) {
    c.translations = fill(c.translations || {}, ['name']);
    await c.save();
  }

  const paths = await Path.find({});
  for (const p of paths) {
    p.translations = fill(p.translations || {}, ['name','description']);
    await p.save();
  }

  const levels = await Level.find({});
  for (const l of levels) {
    l.translations = fill(l.translations || {}, ['title','content']);
    await l.save();
  }

  const exercises = await Exercise.find({});
  for (const e of exercises) {
    e.translations = fill(e.translations || {}, ['name','question','explanation']);
    await e.save();
  }
};


