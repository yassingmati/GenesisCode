const mongoose = require('mongoose');

const userLevelProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, {
  timestamps: true
});

userLevelProgressSchema.index({ user: 1, level: 1 }, { unique: true });

module.exports = mongoose.model('UserLevelProgress', userLevelProgressSchema);