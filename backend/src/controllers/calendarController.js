// src/controllers/calendarController.js
const SharedCalendar = require('../models/SharedCalendar');
const ParentChild = require('../models/ParentChild');
const UserActivity = require('../models/UserActivity');

// Obtenir le calendrier partagé
exports.getSharedCalendar = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    
    // Vérifier la relation parent-enfant
    const relation = await ParentChild.findOne({ 
      parent: parentId, 
      child: childId,
      status: 'active'
    });
    
    if (!relation) {
      return res.status(404).json({ message: 'Relation parent-enfant non trouvée' });
    }
    
    let calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    
    // Créer le calendrier s'il n'existe pas
    if (!calendar) {
      calendar = new SharedCalendar({
        parent: parentId,
        child: childId,
        events: [],
        sharedGoals: [],
        settings: {
          timezone: 'Europe/Paris',
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '18:00' },
          notifications: {
            email: true,
            push: true,
            reminderMinutes: 15
          }
        }
      });
      await calendar.save();
    }
    
    res.json(calendar);
  } catch (error) {
    console.error('Erreur récupération calendrier:', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter un événement
exports.addEvent = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const eventData = req.body;
    
    // Vérifier la relation
    const relation = await ParentChild.findOne({ 
      parent: parentId, 
      child: childId,
      status: 'active'
    });
    
    if (!relation) {
      return res.status(404).json({ message: 'Relation parent-enfant non trouvée' });
    }
    
    let calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    
    if (!calendar) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    
    // Ajouter l'événement
    const event = {
      ...eventData,
      createdBy: req.user.userType === 'parent' ? 'parent' : 'child',
      timestamp: new Date()
    };
    
    await calendar.addEvent(event);
    
    res.status(201).json({ 
      message: 'Événement ajouté avec succès',
      event: calendar.events[calendar.events.length - 1]
    });
  } catch (error) {
    console.error('Erreur ajout événement:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un événement
exports.updateEvent = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const eventId = req.params.eventId;
    const updateData = req.body;
    
    const calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    
    if (!calendar) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    
    await calendar.updateEvent(eventId, updateData);
    
    res.json({ 
      message: 'Événement mis à jour avec succès',
      event: calendar.events.id(eventId)
    });
  } catch (error) {
    console.error('Erreur mise à jour événement:', error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const eventId = req.params.eventId;
    
    const calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    
    if (!calendar) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    
    calendar.events.id(eventId).remove();
    calendar.lastSync = new Date();
    calendar.syncVersion += 1;
    await calendar.save();
    
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({ error: error.message });
  }
};

// Ajouter un objectif partagé
exports.addSharedGoal = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const goalData = req.body;
    
    const calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    
    if (!calendar) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    
    const goal = {
      ...goalData,
      createdBy: req.user.userType === 'parent' ? 'parent' : 'child',
      status: 'active'
    };
    
    await calendar.addSharedGoal(goal);
    
    res.status(201).json({ 
      message: 'Objectif ajouté avec succès',
      goal: calendar.sharedGoals[calendar.sharedGoals.length - 1]
    });
  } catch (error) {
    console.error('Erreur ajout objectif:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour la progression d'un objectif
exports.updateGoalProgress = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const goalId = req.params.goalId;
    const { newValue } = req.body;
    
    const calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    
    if (!calendar) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    
    await calendar.updateGoalProgress(goalId, newValue);
    
    const goal = calendar.sharedGoals.id(goalId);
    
    res.json({ 
      message: 'Progression mise à jour avec succès',
      goal: goal,
      milestonesCompleted: goal.milestones.filter(m => m.completed)
    });
  } catch (error) {
    console.error('Erreur mise à jour progression:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les événements à venir
exports.getUpcomingEvents = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const days = parseInt(req.query.days) || 7;
    
    const events = await SharedCalendar.getUpcomingEvents(parentId, childId, days);
    
    res.json(events);
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({ error: error.message });
  }
};

// Synchroniser le calendrier
exports.syncCalendar = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { lastSync } = req.body;
    
    const calendar = await SharedCalendar.findOne({ 
      parent: parentId, 
      child: childId,
      lastSync: { $gt: new Date(lastSync) }
    });
    
    if (!calendar) {
      return res.json({ synced: true, changes: [] });
    }
    
    res.json({
      synced: false,
      changes: calendar,
      syncVersion: calendar.syncVersion
    });
  } catch (error) {
    console.error('Erreur synchronisation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les statistiques du calendrier
exports.getCalendarStats = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { period = 'month' } = req.query;
    
    const calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    
    if (!calendar) {
      return res.status(404).json({ message: 'Calendrier non trouvé' });
    }
    
    // Calculer les statistiques
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const eventsInPeriod = calendar.events.filter(event => 
      event.startDate >= startDate && event.startDate <= now
    );
    
    const goalsInPeriod = calendar.sharedGoals.filter(goal => 
      goal.targetDate >= startDate && goal.targetDate <= now
    );
    
    const stats = {
      totalEvents: eventsInPeriod.length,
      completedEvents: eventsInPeriod.filter(e => e.status === 'completed').length,
      totalGoals: goalsInPeriod.length,
      completedGoals: goalsInPeriod.filter(g => g.status === 'completed').length,
      activeGoals: goalsInPeriod.filter(g => g.status === 'active').length,
      averageGoalProgress: goalsInPeriod.length > 0 
        ? goalsInPeriod.reduce((sum, goal) => sum + (goal.currentValue / goal.targetValue), 0) / goalsInPeriod.length
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur statistiques calendrier:', error);
    res.status(500).json({ error: error.message });
  }
};
