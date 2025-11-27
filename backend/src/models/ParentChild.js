// src/models/ParentChild.js
const mongoose = require('mongoose');

const parentChildSchema = new mongoose.Schema({
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

  // Contrôles parentaux
  parentalControls: {
    // Limites de temps
    dailyTimeLimit: { type: Number, default: 120 }, // minutes par jour
    weeklyTimeLimit: { type: Number, default: 840 }, // minutes par semaine (14h)

    // Plages horaires autorisées
    allowedTimeSlots: [{
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = dimanche
      startTime: { type: String }, // "09:00"
      endTime: { type: String }    // "18:00"
    }],

    // Contrôles de contenu avancés
    contentRestrictions: {
      maxDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
      blockedCategories: { type: [String], default: [] },
      allowAdvancedTopics: { type: Boolean, default: false },
      allowPublicDiscussions: { type: Boolean, default: false },
      allowChat: { type: Boolean, default: false },

      // Nouveaux filtres de contenu
      blockedKeywords: { type: [String], default: [] },
      allowedCategories: { type: [String], default: [] },
      contentFilterLevel: {
        type: String,
        enum: ['none', 'basic', 'moderate', 'strict'],
        default: 'moderate'
      },
      autoBlockInappropriate: { type: Boolean, default: true }
    },

    // Pauses obligatoires
    mandatoryBreaks: {
      enabled: { type: Boolean, default: false },
      breakInterval: { type: Number, default: 30 }, // minutes entre pauses
      breakDuration: { type: Number, default: 5 }, // durée pause en minutes
      maxConsecutiveTime: { type: Number, default: 60 }, // temps max consécutif
      reminderBeforeBreak: { type: Number, default: 5 } // rappel avant pause
    },

    // Objectifs et récompenses
    weeklyGoals: {
      minExercises: { type: Number, default: 5 },
      minStudyTime: { type: Number, default: 300 }, // minutes
      targetScore: { type: Number, default: 70 } // pourcentage
    },

    // Système de récompenses
    rewards: {
      enabled: { type: Boolean, default: true },
      pointsPerExercise: { type: Number, default: 10 },
      pointsPerHour: { type: Number, default: 50 },
      bonusPoints: { type: Number, default: 25 },
      rewardThresholds: [{
        points: { type: Number, required: true },
        reward: { type: String, required: true },
        description: { type: String }
      }]
    },

    // Notifications
    notifications: {
      email: { type: Boolean, default: true },
      dailyReport: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      achievementAlerts: { type: Boolean, default: true },
      timeLimitAlerts: { type: Boolean, default: true },
      breakReminders: { type: Boolean, default: true },
      rewardNotifications: { type: Boolean, default: true }
    },

    // Contrôles avancés
    advancedControls: {
      securityMode: {
        type: String,
        enum: ['standard', 'strict', 'permissive'],
        default: 'standard'
      },
      blockInappropriateContent: { type: Boolean, default: true },
      requireParentApproval: { type: Boolean, default: false },
      emergencyOverride: { type: Boolean, default: true },
      activityLogging: { type: Boolean, default: true }
    }
  },

  // Statut de la relation
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'revoked'],
    default: 'pending'
  },

  // Métadonnées
  invitedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  lastActivityCheck: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index composé unique
parentChildSchema.index({ parent: 1, child: 1 }, { unique: true });

// Méthodes statiques
parentChildSchema.statics.findByParent = function (parentId) {
  return this.find({ parent: parentId, status: { $in: ['active', 'pending'] } })
    .populate('child', 'firstName lastName email totalXP badges userType')
    .lean();
};

parentChildSchema.statics.findByChild = function (childId) {
  return this.findOne({ child: childId, status: 'active' })
    .populate('parent', 'firstName lastName email')
    .lean();
};

module.exports = mongoose.model('ParentChild', parentChildSchema);
