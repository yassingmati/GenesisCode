// src/utils/seedPlans.js
require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const MONGO_URI = process.env.MONGO_URI;

const PLANS = [
  { _id: 'free', name: 'Free', priceId: 'price_test_free', priceMonthly: 0, description: 'Accès limité', features: ['Basique'], active: true },
  { _id: 'basic', name: 'Basic', priceId: 'price_test_basic', priceMonthly: 499, description: 'Contenu de base', features: ['Contenu de base', 'Support email'], active: true },
  { _id: 'pro', name: 'Pro', priceId: 'price_test_pro', priceMonthly: 1499, description: 'Accès complet', features: ['Tout le contenu', 'Support prioritaire'], active: true }
];

async function main() {
  if (!MONGO_URI) { console.error('MONGO_URI manquant'); process.exit(1); }

  await mongoose.connect(MONGO_URI.replace('localhost','127.0.0.1'));
  console.log('Mongo connected for seeding');

  for (const p of PLANS) {
    const existing = await Plan.findById(p._id);
    if (existing) {
      console.log('Plan exists, updating:', p._id);
      await Plan.findByIdAndUpdate(p._id, p, { new: true });
    } else {
      console.log('Creating plan:', p._id);
      await Plan.create(p);
    }
  }

  console.log('Done seeding plans.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
