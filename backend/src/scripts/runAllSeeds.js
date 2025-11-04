/*
  Seed Orchestrator: runs categories, levels, paths, exercises, translations
  Usage: node src/scripts/runAllSeeds.js --lang=fr,en,ar [--dry]
*/

require('dotenv').config();
const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI/MONGO_URI not set');
  await mongoose.connect(uri);
}

async function main() {
  const argv = process.argv.slice(2).join(' ');
  const DRY = /--dry/.test(argv);
  const langsArg = (argv.match(/--lang=([^\s]+)/) || [])[1] || 'fr,en,ar';
  const langs = langsArg.split(',');

  await connect();
  console.log('Connected to MongoDB.');

  const ctx = { DRY, langs };

  const run = async (name, fn) => {
    console.log(`\n=== Running seed: ${name} ===`);
    try {
      await fn(ctx);
      console.log(`✔ ${name} done`);
    } catch (e) {
      console.error(`✖ ${name} failed:`, e && e.message ? e.message : e);
      throw e;
    }
  };

  await run('categoriesSeed', require('./seed/categoriesSeed'));
  await run('pathsSeed', require('./seed/pathsSeed'));
  await run('levelsSeed', require('./seed/levelsSeed'));
  await run('exercisesSeed', require('./seed/exercisesSeed'));
  await run('translationsSeed', require('./seed/translationsSeed'));

  await mongoose.connection.close();
  console.log('All seeds completed.');
}

main().catch(async (e) => {
  console.error('Seed run failed:', e);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});


