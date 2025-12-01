// src/models/User.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  konnectPaymentId: { type: String, default: null },
  konnectStatus: { type: String, default: null },
  planId: { type: String, default: null },
  status: { type: String, enum: ['active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid', null], default: null },
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
  // DEPRECATED: Use the 'subscriptions' virtual instead (see below)
  subscription: { type: subscriptionSchema, default: {} },
  isVerified: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  totalXP: { type: Number, default: 0, min: 0 },
  badges: { type: [String], default: [] },
  rank: { type: Number, default: 0 },
  roles: { type: [String], default: [] },

  // Nouveaux champs pour l'espace parent
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Contrôles parentaux appliqués (pour les enfants)
  appliedParentalControls: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // Préférences de notification
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour récupérer tous les abonnements de l'utilisateur
userSchema.virtual('subscriptions', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'user'
});

// Indexes utiles
userSchema.index({ firebaseUid: 1 });
userSchema.index({ totalXP: -1 });

module.exports = mongoose.model('User', userSchema);
