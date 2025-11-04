// src/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Références
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  
  // Identifiants Konnect
  konnectPaymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  merchantOrderId: {
    type: String,
    required: true,
    index: true
  },
  
  // Montant et devise
  amount: {
    type: Number,
    required: true
  },
  
  currency: {
    type: String,
    default: 'TND'
  },
  
  // Statut du paiement
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Informations Konnect
  konnectStatus: {
    type: String,
    default: null
  },
  
  // URLs de paiement
  paymentUrl: {
    type: String,
    default: null
  },
  
  returnUrl: {
    type: String,
    default: null
  },
  
  cancelUrl: {
    type: String,
    default: null
  },
  
  // Métadonnées
  description: {
    type: String,
    default: null
  },
  
  customerEmail: {
    type: String,
    required: true
  },
  
  // Dates importantes
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  expiredAt: {
    type: Date,
    default: null
  },
  
  // Période couverte par le paiement
  periodStart: {
    type: Date,
    default: null
  },
  
  periodEnd: {
    type: Date,
    default: null
  },
  
  // Webhook et notifications
  webhookReceived: {
    type: Boolean,
    default: false
  },
  
  webhookReceivedAt: {
    type: Date,
    default: null
  },
  
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  // Données brutes Konnect
  konnectResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Erreurs
  errorMessage: {
    type: String,
    default: null
  },
  
  errorCode: {
    type: String,
    default: null
  },
  
  // Métadonnées additionnelles
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index composés
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ konnectPaymentId: 1 });
paymentSchema.index({ merchantOrderId: 1 });
paymentSchema.index({ initiatedAt: -1 });
paymentSchema.index({ completedAt: -1 });

// Méthodes statiques
paymentSchema.statics.findByKonnectId = function(konnectPaymentId) {
  return this.findOne({ konnectPaymentId });
};

paymentSchema.statics.findByMerchantOrderId = function(merchantOrderId) {
  return this.findOne({ merchantOrderId });
};

paymentSchema.statics.findPendingPayments = function() {
  return this.find({
    status: { $in: ['pending', 'processing'] },
    initiatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24h
  });
};

paymentSchema.statics.findCompletedPayments = function(userId, limit = 10) {
  return this.find({
    user: userId,
    status: 'completed'
  })
  .sort({ completedAt: -1 })
  .limit(limit)
  .populate('plan');
};

// Méthodes d'instance
paymentSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

paymentSchema.methods.isPending = function() {
  return ['pending', 'processing'].includes(this.status);
};

paymentSchema.methods.isFailed = function() {
  return ['failed', 'cancelled', 'expired'].includes(this.status);
};

paymentSchema.methods.markAsCompleted = function(konnectResponse = {}) {
  this.status = 'completed';
  this.konnectStatus = konnectResponse.status || 'completed';
  this.completedAt = new Date();
  this.konnectResponse = konnectResponse;
  this.webhookReceived = true;
  this.webhookReceivedAt = new Date();
  return this.save();
};

paymentSchema.methods.markAsFailed = function(errorMessage, errorCode = null) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  return this.save();
};

paymentSchema.methods.markAsExpired = function() {
  this.status = 'expired';
  this.expiredAt = new Date();
  return this.save();
};

paymentSchema.methods.setPeriod = function(startDate, endDate) {
  this.periodStart = startDate;
  this.periodEnd = endDate;
  return this.save();
};

// Middleware pre-save
paymentSchema.pre('save', function(next) {
  // Auto-expire pending payments after 24 hours
  if (this.isPending() && this.initiatedAt) {
    const hoursSinceInitiation = (Date.now() - this.initiatedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceInitiation > 24) {
      this.status = 'expired';
      this.expiredAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);







