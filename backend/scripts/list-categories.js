// List categories with IDs and translated names
// Usage: node scripts/list-categories.js

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI/MONGO_URI');
    process.exit(2);
  }
  try {
    await mongoose.connect(uri);
    const cats = await Category.find({}).sort({ createdAt: -1 }).lean();
    const out = cats.map(c => ({
      id: String(c._id),
      slug: c.slug || null,
      fr: c?.translations?.fr?.name || null,
      en: c?.translations?.en?.name || null,
      ar: c?.translations?.ar?.name || null,
    }));
    console.log(JSON.stringify(out, null, 2));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

main();


