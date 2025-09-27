  const mongoose = require('mongoose');

  const translationSchema = new mongoose.Schema({
    fr: { type: String, required: true },
    en: { type: String, required: true },
    ar: { type: String, required: true }
  }, { _id: false });

  module.exports = translationSchema;