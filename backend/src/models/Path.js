const { Schema, model, Types } = require('mongoose');

const pathTranslationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const pathSchema = new Schema({
  translations: {
    fr: pathTranslationSchema,
    en: pathTranslationSchema,
    ar: pathTranslationSchema
  },
  category: { type: Types.ObjectId, ref: 'Category', required: true },
  order: { type: Number, default: 0 },
  levels: [{ type: Types.ObjectId, ref: 'Level' }]
}, {
  timestamps: true
});

module.exports = model('Path', pathSchema);