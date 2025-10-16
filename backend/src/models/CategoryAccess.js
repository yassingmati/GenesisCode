// src/models/CategoryAccess.js
const mongoose = require('mongoose');

const categoryAccessSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  
  categoryPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryPlan',
    required: true
  },
  
  // Statut de l'accès
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  
  // Type d'accès
  accessType: {
    type: String,
    enum: ['purchase', 'subscription', 'free', 'admin'],
    required: true
  },
  
  // Date d'achat/activation
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  
  // Date d'expiration
  expiresAt: {
    type: Date,
    index: true
  },
  
  // Informations de paiement
  payment: {
    konnectPaymentId: String,
    amount: Number,
    currency: String,
    status: String
  },
  
  // Niveaux débloqués
  unlockedLevels: [{
    path: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Path'
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Métadonnées
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index composés pour les requêtes fréquentes
categoryAccessSchema.index({ user: 1, category: 1, status: 1 });
categoryAccessSchema.index({ user: 1, status: 1, expiresAt: 1 });
categoryAccessSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthodes statiques
categoryAccessSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    user: userId,
    status: 'active',
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).populate('category categoryPlan');
};

categoryAccessSchema.statics.findActiveByUserAndCategory = function(userId, categoryId) {
  return this.findOne({
    user: userId,
    category: categoryId,
    status: 'active',
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).populate('category categoryPlan');
};

categoryAccessSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    expiresAt: { $lt: new Date() }
  });
};

// Méthodes d'instance
categoryAccessSchema.methods.isActive = function() {
  if (this.status !== 'active') return false;
  if (!this.expiresAt) return true;
  return this.expiresAt > new Date();
};

categoryAccessSchema.methods.isExpired = function() {
  if (this.status === 'expired') return true;
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
};

categoryAccessSchema.methods.expire = function() {
  this.status = 'expired';
  return this.save();
};

categoryAccessSchema.methods.unlockLevel = function(pathId, levelId) {
  const existingUnlock = this.unlockedLevels.find(
    unlock => unlock.path.toString() === pathId.toString() && 
              unlock.level.toString() === levelId.toString()
  );
  
  if (!existingUnlock) {
    this.unlockedLevels.push({
      path: pathId,
      level: levelId,
      unlockedAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

categoryAccessSchema.methods.hasUnlockedLevel = function(pathId, levelId) {
  return this.unlockedLevels.some(
    unlock => unlock.path.toString() === pathId.toString() && 
              unlock.level.toString() === levelId.toString()
  );
};

module.exports = mongoose.model('CategoryAccess', categoryAccessSchema);






