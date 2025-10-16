const mongoose = require('mongoose');

const categoryTranslationSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  translations: {
    fr: categoryTranslationSchema,
    en: categoryTranslationSchema,
    ar: categoryTranslationSchema
  },
  // Type de catégorie: 'classic' (par défaut) ou 'specific' (langue spécifique)
  type: { type: String, enum: ['classic', 'specific'], default: 'classic', index: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true,
  autoIndex: false
});

// Index composé unique pour éviter les doublons
categorySchema.index({ 
  'translations.fr.name': 1,
  'translations.en.name': 1,
  'translations.ar.name': 1
}, { unique: true });

module.exports = mongoose.model('Category', categorySchema);