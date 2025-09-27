// src/models/UserProgress.js
const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
  xp: { type: Number, default: 0, min: 0 },
  completed: { type: Boolean, default: false },
  lastAttempt: { type: Date, default: null }
}, {
  timestamps: true
});

// Index composé unique pour empêcher doublons user+exercise
userProgressSchema.index({ user: 1, exercise: 1 }, { unique: true });

// Méthode statique pour ajouter XP atomiquement (upsert)
userProgressSchema.statics.addXp = async function(userId, exerciseId, xpToAdd = 0) {
  const filter = { user: userId, exercise: exerciseId };
  const update = {
    $inc: { xp: xpToAdd },
    $set: { lastAttempt: new Date() },
    // marque completed si on ajoute xp > 0 (tu peux ajuster la logique)
    ...(xpToAdd > 0 ? { $setOnInsert: { completed: true } } : {})
  };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  return this.findOneAndUpdate(filter, update, options).exec();
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
