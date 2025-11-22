#!/usr/bin/env node
/**
 * Duplicate videos/pdfs configuration from a source level to other levels.
 *
 * Usage:
 *   node scripts/copy-level-media.js <SOURCE_LEVEL_ID> [--all]
 *
 * - By default, media is copied only to levels that belong to the same path as the source level.
 * - Pass --all to copy media to ALL levels in the database (use with caution).
 *
 * Requirements:
 *   - backend/.env must contain MONGODB_URI pointing to your database.
 *   - The source level must already have videos/pdfs fields populated.
 */

const path = require('path');
const mongoose = require('mongoose');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Level = require('../src/models/Level');

const SOURCE_ID = process.argv[2];
const COPY_ALL = process.argv.includes('--all');

async function main() {
  if (!SOURCE_ID) {
    console.error('❌ Source level ID manquant.');
    console.error('Usage: node scripts/copy-level-media.js <SOURCE_LEVEL_ID> [--all]');
    process.exit(1);
  }

  if (!mongoose.isValidObjectId(SOURCE_ID)) {
    console.error(`❌ ID invalide: ${SOURCE_ID}`);
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI non défini dans backend/.env');
    process.exit(1);
  }

  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connecté à MongoDB');

  const sourceLevel = await Level.findById(SOURCE_ID).lean();
  if (!sourceLevel) {
    console.error(`❌ Niveau source introuvable: ${SOURCE_ID}`);
    process.exit(1);
  }

  const videos = sourceLevel.videos || {};
  const pdfs = sourceLevel.pdfs || {};

  if (Object.keys(videos).length === 0 && Object.keys(pdfs).length === 0) {
    console.warn('⚠️ Le niveau source ne contient ni vidéos ni PDFs. Rien à copier.');
    process.exit(0);
  }

  const filter = COPY_ALL
    ? { _id: { $ne: sourceLevel._id } }
    : { path: sourceLevel.path, _id: { $ne: sourceLevel._id } };

  const targetCount = await Level.countDocuments(filter);
  if (targetCount === 0) {
    console.warn('⚠️ Aucun niveau cible correspondant au filtre.');
    process.exit(0);
  }

  console.log(`📋 Niveau source: ${SOURCE_ID}`);
  console.log(`   Path: ${sourceLevel.path}`);
  console.log(`   Vidéos disponibles: ${Object.keys(videos).join(', ') || 'Aucune'}`);
  console.log(`   PDFs disponibles: ${Object.keys(pdfs).join(', ') || 'Aucun'}`);
  console.log(`🎯 Niveaux cibles: ${targetCount} (${COPY_ALL ? 'tous les niveaux' : 'même parcours uniquement'})`);

  const result = await Level.updateMany(filter, {
    $set: {
      videos,
      pdfs
    }
  });

  console.log('✅ Mise à jour effectuée');
  console.log(`   Documents modifiés: ${result.modifiedCount}`);

  await mongoose.disconnect();
  console.log('🔌 Déconnexion MongoDB');
}

main().catch(async (err) => {
  console.error('❌ Erreur:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});



