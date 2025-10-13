// src/middlewares/parentalControls.js
const ParentChild = require('../models/ParentChild');
const UserActivity = require('../models/UserActivity');

// Middleware pour vérifier les contrôles parentaux
exports.checkParentalControls = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    
    // Si c'est un parent, pas de restrictions
    if (userType === 'parent') {
      return next();
    }
    
    // Vérifier s'il y a des contrôles parentaux
    const parentRelation = await ParentChild.findOne({ 
      child: userId, 
      status: 'active' 
    });
    
    if (!parentRelation) {
      return next();
    }
    
    const controls = parentRelation.parentalControls;
    
    // Vérifier les limites de temps
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Temps utilisé aujourd'hui
    const todayActivities = await UserActivity.find({
      user: userId,
      loginTime: { $gte: today }
    });
    
    const todayTime = todayActivities.reduce((sum, activity) => sum + activity.duration, 0);
    
    if (todayTime >= controls.dailyTimeLimit) {
      return res.status(429).json({ 
        message: 'Limite de temps quotidienne atteinte',
        limit: controls.dailyTimeLimit,
        used: todayTime,
        type: 'time_limit_exceeded'
      });
    }
    
    // Vérifier les plages horaires
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substring(0, 5);
    
    const allowedSlot = controls.allowedTimeSlots.find(slot => 
      slot.dayOfWeek === currentDay &&
      currentTime >= slot.startTime &&
      currentTime <= slot.endTime
    );
    
    if (controls.allowedTimeSlots.length > 0 && !allowedSlot) {
      return res.status(403).json({ 
        message: 'Accès non autorisé à cette heure',
        currentTime,
        allowedSlots: controls.allowedTimeSlots,
        type: 'time_slot_restricted'
      });
    }
    
    // Ajouter les contrôles à la requête
    req.parentalControls = controls;
    req.parentRelation = parentRelation;
    
    next();
  } catch (error) {
    console.error('Erreur vérification contrôles parentaux:', error);
    next(); // Continuer en cas d'erreur
  }
};

// Middleware pour enregistrer l'activité
exports.trackActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.sessionID || req.headers['x-session-id'] || 'default-session';
    
    if (!userId) {
      return next();
    }
    
    // Enregistrer l'activité
    await UserActivity.findOneAndUpdate(
      { user: userId, sessionId, logoutTime: null },
      {
        $push: {
          activities: {
            type: req.method === 'GET' ? 'page_view' : 'action',
            details: {
              path: req.path,
              method: req.method,
              timestamp: new Date(),
              userAgent: req.headers['user-agent']
            }
          }
        }
      },
      { upsert: true, new: true }
    );
    
    next();
  } catch (error) {
    console.error('Erreur tracking activité:', error);
    next();
  }
};

// Middleware pour vérifier les restrictions de contenu avancées
exports.checkContentRestrictions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    
    // Si c'est un parent, pas de restrictions
    if (userType === 'parent') {
      return next();
    }
    
    // Vérifier s'il y a des contrôles parentaux
    const parentRelation = await ParentChild.findOne({ 
      child: userId, 
      status: 'active' 
    });
    
    if (!parentRelation) {
      return next();
    }
    
    const restrictions = parentRelation.parentalControls.contentRestrictions;
    
    // Vérifier les restrictions de difficulté pour les exercices
    if (req.path.includes('/exercises') && req.method === 'GET') {
      // Si on récupère un exercice spécifique, vérifier sa difficulté
      if (req.params.exerciseId) {
        // Cette vérification sera faite dans le contrôleur d'exercice
        req.contentRestrictions = restrictions;
      }
    }
    
    // Vérifier l'accès aux discussions publiques
    if (req.path.includes('/discussions') && !restrictions.allowPublicDiscussions) {
      return res.status(403).json({ 
        message: 'Accès aux discussions publiques non autorisé',
        type: 'content_restricted'
      });
    }
    
    // Vérifier l'accès au chat
    if (req.path.includes('/chat') && !restrictions.allowChat) {
      return res.status(403).json({ 
        message: 'Accès au chat non autorisé',
        type: 'content_restricted'
      });
    }
    
    // Vérifier l'accès aux sujets avancés
    if (req.path.includes('/advanced') && !restrictions.allowAdvancedTopics) {
      return res.status(403).json({ 
        message: 'Accès aux sujets avancés non autorisé',
        type: 'content_restricted'
      });
    }
    
    // Nouveaux contrôles de contenu avancés
    if (req.body && typeof req.body === 'object') {
      // Vérifier les mots-clés bloqués
      if (restrictions.blockedKeywords && restrictions.blockedKeywords.length > 0) {
        const content = JSON.stringify(req.body).toLowerCase();
        const blockedKeyword = restrictions.blockedKeywords.find(keyword => 
          content.includes(keyword.toLowerCase())
        );
        
        if (blockedKeyword) {
          return res.status(403).json({ 
            message: `Contenu bloqué: mot-clé interdit détecté`,
            type: 'content_blocked',
            blockedKeyword: blockedKeyword
          });
        }
      }
      
      // Vérifier le niveau de filtrage
      if (restrictions.contentFilterLevel === 'strict') {
        // Logique de filtrage strict
        if (req.path.includes('/social') || req.path.includes('/community')) {
          return res.status(403).json({ 
            message: 'Accès aux fonctionnalités sociales non autorisé',
            type: 'content_restricted'
          });
        }
      }
    }
    
    req.contentRestrictions = restrictions;
    next();
  } catch (error) {
    console.error('Erreur vérification restrictions contenu:', error);
    next();
  }
};

// Middleware pour enregistrer le début de session
exports.startSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.sessionID || req.headers['x-session-id'] || 'default-session';
    
    if (!userId) {
      return next();
    }
    
    // Vérifier s'il y a déjà une session active
    const existingSession = await UserActivity.findOne({
      user: userId,
      sessionId,
      logoutTime: null
    });
    
    if (!existingSession) {
      // Créer une nouvelle session
      await UserActivity.create({
        user: userId,
        sessionId,
        loginTime: new Date(),
        activities: [{
          type: 'login',
          timestamp: new Date(),
          details: {
            userAgent: req.headers['user-agent'],
            ip: req.ip
          }
        }]
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur démarrage session:', error);
    next();
  }
};

// Middleware pour enregistrer la fin de session
exports.endSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.sessionID || req.headers['x-session-id'] || 'default-session';
    
    if (!userId) {
      return next();
    }
    
    // Trouver la session active
    const session = await UserActivity.findOne({
      user: userId,
      sessionId,
      logoutTime: null
    });
    
    if (session) {
      const now = new Date();
      const duration = Math.round((now - session.loginTime) / (1000 * 60)); // en minutes
      
      await UserActivity.findByIdAndUpdate(session._id, {
        logoutTime: now,
        duration: duration,
        $push: {
          activities: {
            type: 'logout',
            timestamp: now,
            details: {
              duration: duration
            }
          }
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur fin session:', error);
    next();
  }
};

// Middleware pour mettre à jour les statistiques de session
exports.updateSessionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.sessionID || req.headers['x-session-id'] || 'default-session';
    
    if (!userId) {
      return next();
    }
    
    // Mettre à jour les statistiques si c'est une action d'exercice
    if (req.path.includes('/exercises') && req.method === 'POST') {
      const session = await UserActivity.findOne({
        user: userId,
        sessionId,
        logoutTime: null
      });
      
      if (session) {
        const updates = {};
        
        // Si c'est une soumission d'exercice
        if (req.path.includes('/submit')) {
          updates.$inc = {
            'sessionStats.exercisesCompleted': 1
          };
          
          // Ajouter l'activité
          updates.$push = {
            activities: {
              type: 'exercise_complete',
              timestamp: new Date(),
              details: {
                exerciseId: req.params.exerciseId,
                score: req.body.pointsEarned || 0
              }
            }
          };
        }
        
        if (Object.keys(updates).length > 0) {
          await UserActivity.findByIdAndUpdate(session._id, updates);
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Erreur mise à jour stats session:', error);
    next();
  }
};

// Middleware pour vérifier les pauses obligatoires
exports.checkMandatoryBreaks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;
    
    // Si c'est un parent, pas de restrictions
    if (userType === 'parent') {
      return next();
    }
    
    // Vérifier s'il y a des contrôles parentaux
    const parentRelation = await ParentChild.findOne({ 
      child: userId, 
      status: 'active' 
    });
    
    if (!parentRelation || !parentRelation.parentalControls.mandatoryBreaks.enabled) {
      return next();
    }
    
    const breakSettings = parentRelation.parentalControls.mandatoryBreaks;
    const sessionId = req.sessionID || req.headers['x-session-id'] || 'default-session';
    
    // Trouver la session active
    const session = await UserActivity.findOne({
      user: userId,
      sessionId,
      logoutTime: null
    });
    
    if (session) {
      const now = new Date();
      const sessionDuration = Math.round((now - session.loginTime) / (1000 * 60)); // en minutes
      
      // Vérifier si une pause est nécessaire
      if (sessionDuration >= breakSettings.breakInterval) {
        // Vérifier si l'utilisateur a pris une pause récemment
        const lastBreak = session.activities
          .filter(activity => activity.type === 'break_start')
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        
        if (!lastBreak || (now - new Date(lastBreak.timestamp)) / (1000 * 60) >= breakSettings.breakInterval) {
          return res.status(429).json({ 
            message: 'Pause obligatoire requise',
            type: 'mandatory_break_required',
            breakDuration: breakSettings.breakDuration,
            timeSinceLastBreak: lastBreak ? Math.round((now - new Date(lastBreak.timestamp)) / (1000 * 60)) : sessionDuration,
            settings: breakSettings
          });
        }
      }
      
      // Vérifier le temps consécutif maximum
      if (sessionDuration >= breakSettings.maxConsecutiveTime) {
        return res.status(429).json({ 
          message: 'Temps consécutif maximum atteint',
          type: 'max_consecutive_time_reached',
          maxConsecutiveTime: breakSettings.maxConsecutiveTime,
          currentTime: sessionDuration
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Erreur vérification pauses obligatoires:', error);
    next();
  }
};

// Middleware pour enregistrer les pauses
exports.recordBreak = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.sessionID || req.headers['x-session-id'] || 'default-session';
    const { breakType = 'mandatory' } = req.body;
    
    if (!userId) {
      return next();
    }
    
    const session = await UserActivity.findOne({
      user: userId,
      sessionId,
      logoutTime: null
    });
    
    if (session) {
      await UserActivity.findByIdAndUpdate(session._id, {
        $inc: { 'sessionStats.breaksTaken': 1 },
        $push: {
          activities: {
            type: breakType === 'start' ? 'break_start' : 'break_end',
            timestamp: new Date(),
            details: {
              breakType,
              duration: breakType === 'end' ? req.body.duration : null
            }
          }
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur enregistrement pause:', error);
    next();
  }
};
