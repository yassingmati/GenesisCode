// src/models/Reward.js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  child: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  
  // Informations sur la récompense
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['points', 'badge', 'privilege', 'material', 'experience'],
    default: 'points'
  },
  
  // Coût et valeur
  cost: { type: Number, required: true }, // points nécessaires
  value: { type: mongoose.Schema.Types.Mixed }, // valeur de la récompense
  
  // Disponibilité
  available: { type: Boolean, default: true },
  maxUses: { type: Number, default: 1 }, // -1 = illimité
  currentUses: { type: Number, default: 0 },
  
  // Période de validité
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  
  // Conditions d'obtention
  conditions: {
    minLevel: { type: Number, default: 1 },
    requiredAchievements: { type: [String], default: [] },
    maxPerDay: { type: Number, default: -1 },
    maxPerWeek: { type: Number, default: -1 }
  },
  
  // Métadonnées
  category: { 
    type: String, 
    enum: ['study', 'behavior', 'achievement', 'special', 'custom'],
    default: 'study'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'premium'],
    default: 'medium'
  },
  tags: { type: [String], default: [] },
  
  // Statut
  status: { 
    type: String, 
    enum: ['draft', 'active', 'paused', 'expired', 'archived'],
    default: 'draft'
  },
  
  // Statistiques
  stats: {
    totalRedeemed: { type: Number, default: 0 },
    totalPointsSpent: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
rewardSchema.index({ parent: 1, child: 1, available: 1 });
rewardSchema.index({ type: 1, category: 1, status: 1 });
rewardSchema.index({ cost: 1, priority: 1 });

// Méthodes statiques
rewardSchema.statics.findByParent = function(parentId) {
  return this.find({ parent: parentId, status: { $ne: 'archived' } })
    .populate('child', 'firstName lastName email')
    .sort({ priority: -1, cost: 1 })
    .lean();
};

rewardSchema.statics.findByChild = function(childId) {
  return this.find({ 
    child: childId, 
    available: true,
    status: 'active',
    validFrom: { $lte: new Date() },
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: { $gte: new Date() } }
    ]
  })
  .populate('parent', 'firstName lastName')
  .sort({ priority: -1, cost: 1 })
  .lean();
};

rewardSchema.statics.findAffordable = function(childId, availablePoints) {
  return this.find({
    child: childId,
    available: true,
    status: 'active',
    cost: { $lte: availablePoints },
    validFrom: { $lte: new Date() },
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: { $gte: new Date() } }
    ]
  })
  .sort({ priority: -1, cost: 1 })
  .lean();
};

// Méthodes d'instance
rewardSchema.methods.canBeRedeemed = function(childPoints, childLevel, childAchievements) {
  // Vérifier les points
  if (this.cost > childPoints) return false;
  
  // Vérifier la disponibilité
  if (!this.available || this.status !== 'active') return false;
  
  // Vérifier la période de validité
  const now = new Date();
  if (this.validFrom > now) return false;
  if (this.validUntil && this.validUntil < now) return false;
  
  // Vérifier les conditions
  if (this.conditions.minLevel > childLevel) return false;
  
  // Vérifier les achievements requis
  for (const achievement of this.conditions.requiredAchievements) {
    if (!childAchievements.includes(achievement)) return false;
  }
  
  // Vérifier les limites d'usage
  if (this.maxUses > 0 && this.currentUses >= this.maxUses) return false;
  
  return true;
};

rewardSchema.methods.redeem = function() {
  if (this.currentUses < this.maxUses || this.maxUses === -1) {
    this.currentUses += 1;
    this.stats.totalRedeemed += 1;
    this.stats.totalPointsSpent += this.cost;
    
    if (this.maxUses > 0 && this.currentUses >= this.maxUses) {
      this.available = false;
    }
    
    return this.save();
  }
  throw new Error('Reward no longer available');
};

rewardSchema.methods.rate = function(rating) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const totalRating = this.stats.averageRating * this.stats.ratingCount;
  this.stats.ratingCount += 1;
  this.stats.averageRating = (totalRating + rating) / this.stats.ratingCount;
  
  return this.save();
};

module.exports = mongoose.model('Reward', rewardSchema);
