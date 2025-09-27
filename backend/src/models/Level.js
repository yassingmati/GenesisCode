// models/Level.js
const { Schema, model, Types } = require('mongoose');

const levelTranslationSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const multilingualPathSchema = new Schema({
  fr: { type: String },
  en: { type: String },
  ar: { type: String }
}, { _id: false });

const levelSchema = new Schema({
  translations: {
    fr: levelTranslationSchema,
    en: levelTranslationSchema,
    ar: levelTranslationSchema
  },
  path: { type: Types.ObjectId, ref: 'Path', required: true },
  order: { type: Number, default: 0 },
  exercises: [{ type: Types.ObjectId, ref: 'Exercise' }],
  videos: multilingualPathSchema, // chemins relatifs pour les vidéos (par langue)
  pdfs: multilingualPathSchema    // chemins relatifs pour les PDFs (par langue)
}, {
  timestamps: true
});

module.exports = model('Level', levelSchema);
