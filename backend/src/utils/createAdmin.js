// src/utils/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  if (!MONGO_URI) { console.error('MONGO_URI manquant'); process.exit(1); }
  await mongoose.connect(MONGO_URI.replace('localhost','127.0.0.1'));
  console.log('Mongo connected for admin creation');

  const adminData = {
    firebaseUid: 'seed-admin-uid',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'Seed',
    phone: '',
    userType: 'parent',
    role: 'admin',
    isVerified: true,
    isProfileComplete: true,
    totalXP: 0,
    badges: [],
    subscription: {}
  };

  let user = await User.findOne({ email: adminData.email });
  if (user) {
    console.log('Admin exists:', user.email);
  } else {
    user = await User.create(adminData);
    console.log('Admin created:', user.email);
  }

  console.log('NOTE: Ce script crée seulement le document user. Assure-toi que ton système d\'auth (Firebase) reconnaisse cet utilisateur si nécessaire.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
