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