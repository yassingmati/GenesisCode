// Grant category access to a user by category name (e.g., "débutant") or id
// Usage:
//   node scripts/grant-category-access.js --user <userId> --category "debuttant"
//   node scripts/grant-category-access.js --user <userId> --categoryId <categoryId>
// Env:
//   MONGODB_URI or MONGO_URI must be set

require('dotenv').config();
const mongoose = require('mongoose');

const Category = require('../src/models/Category');
const CategoryPlan = require('../src/models/CategoryPlan');
const CategoryAccess = require('../src/models/CategoryAccess');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const val = args[i + 1];
    if (!key || val == null) continue;
    if (key === '--user') out.userId = val;
    if (key === '--category') out.categoryName = val;
    if (key === '--categoryId') out.categoryId = val;
  }
  return out;
}

async function ensurePlanForCategory(category) {
  let plan = await CategoryPlan.findOne({ category: category._id, active: true });
  if (plan) return plan;

  // Create a default free plan if none exists
  plan = new CategoryPlan({
    category: category._id,
    price: 0,
    currency: 'TND',
    paymentType: 'one_time',
    accessDuration: 365,
    active: true,
    translations: {
      fr: {
        name: `Accès ${category?.translations?.fr?.name || 'Catégorie'}`,
        description: `Accès complet à la catégorie ${category?.translations?.fr?.name || ''}`
      },
      en: {
        name: `Access ${category?.translations?.en?.name || 'Category'}`,
        description: `Complete access to ${category?.translations?.en?.name || 'category'}`
      },
      ar: {
        name: `الوصول إلى ${category?.translations?.ar?.name || 'الفئة'}`,
        description: `وصول كامل لفئة ${category?.translations?.ar?.name || ''}`
      }
    },
    features: [
      'Accès à tous les parcours de la catégorie',
      'Déblocage progressif des niveaux',
    ],
    order: category.order || 0
  });
  await plan.save();
  return plan;
}

async function main() {
  const { userId, categoryName, categoryId } = parseArgs();
  if (!userId || (!categoryName && !categoryId)) {
    console.error('Usage: node scripts/grant-category-access.js --user <userId> --category "debuttant" | --categoryId <id>');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI/MONGO_URI');
    process.exit(2);
  }

  try {
    await mongoose.connect(uri);

    // Resolve category by id or by fuzzy name
    let preferred;
    if (categoryId) {
      preferred = await Category.findById(categoryId).lean();
      if (!preferred) throw new Error(`Catégorie introuvable pour id: ${categoryId}`);
    } else {
      // Find category by name in translations, tolerant to accents and typos like "debuttant"
      const needle = categoryName.trim();
      const base = needle
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9\s_-]/g, '');
      const rx = new RegExp(base.replace(/\s+/g, '.*'), 'i');

      const categories = await Category.find({
        $or: [
          { 'translations.fr.name': { $regex: rx } },
          { 'translations.en.name': { $regex: rx } },
          { 'translations.ar.name': { $regex: rx } },
          { name: { $regex: rx } },
          { slug: { $regex: rx } }
        ]
      }).lean();

      if (!categories.length) {
        throw new Error(`Aucune catégorie trouvée pour: ${categoryName}`);
      }

      preferred = categories.find(c => /debut|début/i.test(
        (c?.translations?.fr?.name || c?.translations?.en?.name || c?.slug || '')
      )) || categories[0];
    }

    const plan = await ensurePlanForCategory(preferred);

    // Upsert an active access (accessType 'admin')
    let access = await CategoryAccess.findOne({ user: userId, category: preferred._id });
    if (!access) {
      access = new CategoryAccess({
        user: userId,
        category: preferred._id,
        categoryPlan: plan._id,
        accessType: 'admin',
        status: 'active',
        expiresAt: null
      });
    } else {
      access.categoryPlan = plan._id;
      access.accessType = 'admin';
      access.status = 'active';
      access.expiresAt = null;
    }
    await access.save();

    // Optionally unlock first levels of all paths in this category
    // (kept simple: not fetching levels here to avoid heavy writes)

    console.log(JSON.stringify({
      success: true,
      message: 'Category access granted',
      userId,
      category: {
        id: String(preferred._id),
        name: preferred?.translations?.fr?.name || preferred?.translations?.en?.name || preferred?.slug
      },
      planId: String(plan._id),
      accessId: String(access._id)
    }, null, 2));

    await mongoose.connection.close();
  } catch (err) {
    console.error('Grant failed:', err && err.message ? err.message : err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(3);
  }
}

main();


