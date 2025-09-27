// src/models/User.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  konnectPaymentId: { type: String, default: null },
  konnectStatus: { type: String, default: null },
  planId: { type: String, default: null },
  status: { type: String, enum: ['active','past_due','canceled','incomplete','trialing','unpaid', null], default: null },
  currentPeriodEnd: { type: Date, default: null },
  cancelAtPeriodEnd: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  userType: { type: String, enum: ['student', 'parent'], required: true, default: 'student' },
  subscription: { type: subscriptionSchema, default: {} },
  isVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  totalXP: { type: Number, default: 0, min: 0 },
  badges: { type: [String], default: [] },
  rank: { type: Number, default: 0 },
  roles: { type: [String], default: [] }
}, { timestamps: true });

// Indexes utiles
userSchema.index({ firebaseUid: 1 });
userSchema.index({ totalXP: -1 });

module.exports = mongoose.model('User', userSchema);
