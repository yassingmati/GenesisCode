// src/models/CourseAccess.js
const mongoose = require('mongoose');

const courseAccessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  path: { type: mongoose.Schema.Types.ObjectId, ref: 'Path', required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', default: null },
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', default: null },
  
  // Type d'accès
  accessType: { 
    type: String, 
    enum: ['free', 'preview', 'subscription', 'unlocked'], 
    required: true 
  },
  
  // Source de l'accès
  source: {
    type: String,
    enum: ['default', 'subscription', 'purchase', 'admin'],
    default: 'default'
  },
  
  // Métadonnées
  unlockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  
  // Configuration
  canView: { type: Boolean, default: true },
  canInteract: { type: Boolean, default: false },
  canDownload: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Index pour améliorer les performances
courseAccessSchema.index({ user: 1, path: 1, level: 1 });
courseAccessSchema.index({ user: 1, accessType: 1, isActive: 1 });
courseAccessSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthodes statiques
courseAccessSchema.statics.checkAccess = async function(userId, pathId, levelId = null, exerciseId = null) {
  const query = { user: userId, path: pathId, isActive: true };
  if (levelId) query.level = levelId;
  if (exerciseId) query.exercise = exerciseId;
  
  const access = await this.findOne(query).populate('path level exercise');
  return access;
};

courseAccessSchema.statics.grantAccess = async function(userId, pathId, accessType, options = {}) {
  const accessData = {
    user: userId,
    path: pathId,
    accessType,
    canView: options.canView !== false,
    canInteract: options.canInteract || false,
    canDownload: options.canDownload || false,
    expiresAt: options.expiresAt || null
  };
  
  if (options.levelId) accessData.level = options.levelId;
  if (options.exerciseId) accessData.exercise = options.exerciseId;
  
  return await this.create(accessData);
};

module.exports = mongoose.model('CourseAccess', courseAccessSchema);
