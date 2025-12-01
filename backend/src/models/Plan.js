// src/models/Plan.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // ex: 'free', 'basic', 'pro'
  name: { type: String, required: true },
  description: { type: String, default: '' },
  priceMonthly: { type: Number, default: null }, // stored in cents (ex: 5000 = 50.00)
  currency: { type: String, default: 'TND' },
  interval: { type: String, enum: ['month', 'year', null], default: 'month' },
  features: { type: [String], default: [] },
  active: { type: Boolean, default: true },
  // Access Control Fields
  type: { type: String, enum: ['global', 'path', 'category'], default: 'global' },
  targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'type' }, // ID of Category or Path
  allowedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Path' }] // Explicit list of allowed paths
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);