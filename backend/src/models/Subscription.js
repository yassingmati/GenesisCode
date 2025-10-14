// src/models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  
  // Statut de l'abonnement
  status: {
    type: String,
    enum: ['pending', 'active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid'],
    default: 'pending',
    index: true
  },
  
  // Informations de paiement Konnect
  konnectPaymentId: {
    type: String,
    default: null,
    index: true
  },
  
  konnectStatus: {
    type: String,
    default: null
  },
  
  // Période d'abonnement
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  
  currentPeriodEnd: {
    type: Date,
    required: true,
    index: true
  },
  
  // Gestion de l'annulation
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  
  canceledAt: {
    type: Date,
    default: null
  },
  
  // Métadonnées
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Historique des paiements
  paymentHistory: [{
    konnectPaymentId: String,
    amount: Number,
    currency: String,
    status: String,
    paidAt: Date,
    periodStart: Date,
    periodEnd: Date
  }],
  
  // Notifications
  lastNotificationSent: {
    type: Date,
    default: null
  },
  
  // Renouvellement automatique
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  // Accès accordés
  grantedAccess: [{
    path: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Path'
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level'
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date
  }]
}, {
  timestamps: true
});

// Index composés pour les requêtes fréquentes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1, status: 1 });
subscriptionSchema.index({ konnectPaymentId: 1 });

// Méthodes statiques
subscriptionSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({
    user: userId,
    status: 'active',
    currentPeriodEnd: { $gt: new Date() }
  }).populate('plan');
};

subscriptionSchema.statics.findExpiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    status: 'active',
    currentPeriodEnd: { $lte: futureDate },
    autoRenew: true
  }).populate('user plan');
};

subscriptionSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    currentPeriodEnd: { $lt: new Date() }
  }).populate('user plan');
};

// Méthodes d'instance
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
};

subscriptionSchema.methods.isExpired = function() {
  return this.currentPeriodEnd < new Date();
};

subscriptionSchema.methods.isExpiringSoon = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.currentPeriodEnd <= futureDate && this.currentPeriodEnd > new Date();
};

subscriptionSchema.methods.cancel = function() {
  this.cancelAtPeriodEnd = true;
  this.canceledAt = new Date();
  return this.save();
};

subscriptionSchema.methods.reactivate = function() {
  this.cancelAtPeriodEnd = false;
  this.canceledAt = null;
  return this.save();
};

subscriptionSchema.methods.extendPeriod = function(months = 1) {
  const newEndDate = new Date(this.currentPeriodEnd);
  newEndDate.setMonth(newEndDate.getMonth() + months);
  this.currentPeriodEnd = newEndDate;
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);


