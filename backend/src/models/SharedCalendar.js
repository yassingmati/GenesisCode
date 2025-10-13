// src/models/SharedCalendar.js
const mongoose = require('mongoose');

const sharedCalendarSchema = new mongoose.Schema({
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
  
  // Événements du calendrier
  events: [{
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { 
      type: String, 
      enum: ['study_session', 'break', 'goal', 'reward', 'restriction', 'custom'],
      default: 'custom'
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: { 
      type: String, 
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending'
    },
    createdBy: { 
      type: String, 
      enum: ['parent', 'child', 'system'],
      default: 'parent'
    },
    requiresApproval: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  }],
  
  // Objectifs partagés
  sharedGoals: [{
    title: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date, required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: 'points' },
    category: { 
      type: String, 
      enum: ['study_time', 'exercises', 'score', 'streak', 'custom'],
      default: 'study_time'
    },
    status: { 
      type: String, 
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active'
    },
    createdBy: { 
      type: String, 
      enum: ['parent', 'child'],
      default: 'parent'
    },
    milestones: [{
      value: { type: Number, required: true },
      reward: { type: String },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    }]
  }],
  
  // Paramètres du calendrier
  settings: {
    timezone: { type: String, default: 'Europe/Paris' },
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // 1 = lundi
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminderMinutes: { type: Number, default: 15 }
    }
  },
  
  // Synchronisation
  lastSync: { type: Date, default: Date.now },
  syncVersion: { type: Number, default: 1 }
}, {
  timestamps: true
});

// Index composé unique
sharedCalendarSchema.index({ parent: 1, child: 1 }, { unique: true });

// Index pour les requêtes fréquentes
sharedCalendarSchema.index({ 'events.startDate': 1, 'events.endDate': 1 });
sharedCalendarSchema.index({ 'sharedGoals.targetDate': 1 });

// Méthodes statiques
sharedCalendarSchema.statics.findByParent = function(parentId) {
  return this.find({ parent: parentId })
    .populate('child', 'firstName lastName email')
    .lean();
};

sharedCalendarSchema.statics.findByChild = function(childId) {
  return this.findOne({ child: childId })
    .populate('parent', 'firstName lastName email')
    .lean();
};

sharedCalendarSchema.statics.getUpcomingEvents = function(parentId, childId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.findOne({ parent: parentId, child: childId })
    .where('events.startDate').gte(startDate).lte(endDate)
    .where('events.status').in(['pending', 'active'])
    .lean();
};

// Méthodes d'instance
sharedCalendarSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  this.lastSync = new Date();
  this.syncVersion += 1;
  return this.save();
};

sharedCalendarSchema.methods.updateEvent = function(eventId, updateData) {
  const event = this.events.id(eventId);
  if (event) {
    Object.assign(event, updateData);
    this.lastSync = new Date();
    this.syncVersion += 1;
    return this.save();
  }
  throw new Error('Event not found');
};

sharedCalendarSchema.methods.addSharedGoal = function(goalData) {
  this.sharedGoals.push(goalData);
  this.lastSync = new Date();
  this.syncVersion += 1;
  return this.save();
};

sharedCalendarSchema.methods.updateGoalProgress = function(goalId, newValue) {
  const goal = this.sharedGoals.id(goalId);
  if (goal) {
    goal.currentValue = newValue;
    
    // Vérifier les milestones
    goal.milestones.forEach(milestone => {
      if (!milestone.completed && goal.currentValue >= milestone.value) {
        milestone.completed = true;
        milestone.completedAt = new Date();
      }
    });
    
    // Mettre à jour le statut
    if (goal.currentValue >= goal.targetValue) {
      goal.status = 'completed';
    }
    
    this.lastSync = new Date();
    this.syncVersion += 1;
    return this.save();
  }
  throw new Error('Goal not found');
};

module.exports = mongoose.model('SharedCalendar', sharedCalendarSchema);
