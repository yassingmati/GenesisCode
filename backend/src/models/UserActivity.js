// src/models/UserActivity.js
const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  
  // Session de connexion
  sessionId: { type: String, required: true },
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
  duration: { type: Number, default: 0 }, // en minutes
  
  // Activité pendant la session
  activities: [{
    type: { 
      type: String, 
      enum: ['login', 'exercise_start', 'exercise_complete', 'level_start', 'level_complete', 'logout', 'time_limit_reached', 'page_view', 'action', 'break_start', 'break_end', 'reward_earned', 'goal_achieved', 'content_blocked', 'parent_approval_requested', 'parent_approval_granted', 'parent_approval_denied'] 
    },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    metadata: {
      ip: { type: String },
      userAgent: { type: String },
      location: { type: String },
      device: { type: String }
    }
  }],
  
  // Statistiques de la session
  sessionStats: {
    exercisesCompleted: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // minutes
    averageScore: { type: Number, default: 0 },
    breaksTaken: { type: Number, default: 0 },
    rewardsEarned: { type: Number, default: 0 },
    goalsAchieved: { type: Number, default: 0 },
    contentBlocks: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
userActivitySchema.index({ user: 1, loginTime: -1 });
userActivitySchema.index({ user: 1, 'activities.timestamp': -1 });

// Méthodes statiques
userActivitySchema.statics.getUserActivitySummary = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        loginTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalTime: { $sum: '$duration' },
        totalExercises: { $sum: '$sessionStats.exercisesCompleted' },
        totalXP: { $sum: '$sessionStats.xpEarned' },
        averageScore: { $avg: '$sessionStats.averageScore' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalSessions: 0,
    totalTime: 0,
    totalExercises: 0,
    totalXP: 0,
    averageScore: 0
  };
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
