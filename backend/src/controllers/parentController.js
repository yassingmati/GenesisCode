// src/controllers/parentController.js
const ParentChild = require('../models/ParentChild');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const UserActivity = require('../models/UserActivity');

const NotificationController = require('./notificationController');
const mongoose = require('mongoose');

// Inviter un enfant
exports.inviteChild = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childEmail } = req.body;

    if (!childEmail) {
      return res.status(400).json({ message: 'Email de l\'enfant requis' });
    }

    // Vérifier que l'enfant existe
    const child = await User.findOne({ email: childEmail, userType: 'student' });
    if (!child) {
      return res.status(404).json({ message: 'Enfant non trouvé avec cet email' });
    }

    // Vérifier qu'il n'y a pas déjà une relation
    const existingRelation = await ParentChild.findOne({ parent: parentId, child: child._id });
    if (existingRelation) {
      return res.status(409).json({ message: 'Relation déjà existante avec cet enfant' });
    }

    // Créer la relation
    const parentChild = new ParentChild({
      parent: parentId,
      child: child._id,
      status: 'pending'
    });

    await parentChild.save();

    await parentChild.save();

    // Envoyer notification à l'enfant
    await NotificationController.createNotification({
      recipient: child._id,
      type: 'parent_invitation',
      title: 'Nouvelle invitation parent',
      message: 'Un parent souhaite suivre votre progression.',
      data: {
        invitationId: parentChild._id,
        parentId: parentId
      }
    });

    // TODO: Envoyer email d'invitation à l'enfant
    console.log(`Invitation envoyée à ${childEmail} par le parent ${parentId}`);

    res.status(201).json({
      message: 'Invitation envoyée avec succès',
      relation: {
        id: parentChild._id,
        child: {
          id: child._id,
          firstName: child.firstName,
          lastName: child.lastName,
          email: child.email
        },
        status: parentChild.status
      }
    });
  } catch (error) {
    console.error('Erreur invitation enfant:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir la liste des enfants
exports.getChildren = async (req, res) => {
  try {
    const parentId = req.user.id;
    const children = await ParentChild.findByParent(parentId);

    // Enrichir avec les statistiques
    const childrenWithStats = await Promise.all(
      children.map(async (relation) => {
        try {
          const stats = await UserProgress.getUserStats(relation.child._id);
          const recentActivity = await UserActivity.findOne(
            { user: relation.child._id },
            {},
            { sort: { loginTime: -1 } }
          );

          // Calculer le temps utilisé aujourd'hui
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayActivities = await UserActivity.find({
            user: relation.child._id,
            loginTime: { $gte: today }
          });

          const todayTime = todayActivities.reduce((sum, activity) => sum + activity.duration, 0);

          return {
            ...relation,
            stats,
            lastActivity: recentActivity?.loginTime,
            todayTime,
            controls: relation.parentalControls
          };
        } catch (error) {
          console.error(`Erreur stats pour enfant ${relation.child._id}:`, error);
          return {
            ...relation,
            stats: { totalXp: 0, totalExercises: 0, completedExercises: 0, averageScore: 0, totalAttempts: 0 },
            lastActivity: null,
            todayTime: 0,
            controls: relation.parentalControls
          };
        }
      })
    );

    res.json(childrenWithStats);
  } catch (error) {
    console.error('Erreur récupération enfants:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les détails d'un enfant
exports.getChildDetails = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;

    const relation = await ParentChild.findOne({
      parent: parentId,
      child: childId,
      status: 'active'
    }).populate('child');

    if (!relation) {
      return res.status(404).json({ message: 'Enfant non trouvé ou relation inactive' });
    }

    // Statistiques détaillées
    const stats = await UserProgress.getUserStats(childId);
    const recentActivity = await UserActivity.find(
      { user: childId },
      {},
      { sort: { loginTime: -1 }, limit: 10 }
    );

    // Progression par niveau
    const levelProgress = await UserProgress.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(childId) } },
      { $lookup: { from: 'exercises', localField: 'exercise', foreignField: '_id', as: 'exercise' } },
      { $unwind: '$exercise' },
      { $lookup: { from: 'levels', localField: 'exercise.level', foreignField: '_id', as: 'level' } },
      { $unwind: '$level' },
      {
        $group: {
          _id: '$level._id',
          levelName: { $first: '$level.translations.fr.title' },
          totalExercises: { $sum: 1 },
          completedExercises: { $sum: { $cond: ['$completed', 1, 0] } },
          totalXP: { $sum: '$xp' },
          averageScore: { $avg: { $divide: ['$pointsEarned', '$pointsMax'] } }
        }
      }
    ]);

    res.json({
      child: relation.child,
      controls: relation.parentalControls,
      stats,
      recentActivity,
      levelProgress
    });
  } catch (error) {
    console.error('Erreur détails enfant:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour les contrôles parentaux
exports.updateParentalControls = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { parentalControls } = req.body;

    if (!parentalControls) {
      return res.status(400).json({ message: 'Contrôles parentaux requis' });
    }

    const relation = await ParentChild.findOneAndUpdate(
      { parent: parentId, child: childId, status: 'active' },
      { $set: { parentalControls } },
      { new: true }
    );

    if (!relation) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }

    res.json({
      message: 'Contrôles mis à jour avec succès',
      controls: relation.parentalControls
    });
  } catch (error) {
    console.error('Erreur mise à jour contrôles:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir le rapport d'activité
exports.getActivityReport = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { period = 'week' } = req.query; // week, month, year

    // Vérifier la relation
    const relation = await ParentChild.findOne({
      parent: parentId,
      child: childId,
      status: 'active'
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }

    // Calculer la période
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
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Activité de la période
    const activities = await UserActivity.find({
      user: childId,
      loginTime: { $gte: startDate }
    }).sort({ loginTime: -1 });

    // Statistiques agrégées
    const totalTime = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const totalExercises = activities.reduce((sum, activity) => sum + activity.sessionStats.exercisesCompleted, 0);
    const totalXP = activities.reduce((sum, activity) => sum + activity.sessionStats.xpEarned, 0);

    // Vérification des limites
    const dailyTimeLimit = relation.parentalControls.dailyTimeLimit;
    const weeklyTimeLimit = relation.parentalControls.weeklyTimeLimit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = activities.filter(activity => activity.loginTime >= today);
    const todayTime = todayActivities.reduce((sum, activity) => sum + activity.duration, 0);

    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const weekActivities = activities.filter(activity => activity.loginTime >= weekStart);
    const weekTime = weekActivities.reduce((sum, activity) => sum + activity.duration, 0);

    res.json({
      period,
      startDate,
      endDate: now,
      activities,
      summary: {
        totalTime,
        totalExercises,
        totalXP,
        averageSessionTime: activities.length > 0 ? totalTime / activities.length : 0
      },
      limits: {
        daily: {
          used: todayTime,
          limit: dailyTimeLimit,
          percentage: (todayTime / dailyTimeLimit) * 100,
          exceeded: todayTime > dailyTimeLimit
        },
        weekly: {
          used: weekTime,
          limit: weeklyTimeLimit,
          percentage: (weekTime / weeklyTimeLimit) * 100,
          exceeded: weekTime > weeklyTimeLimit
        }
      }
    });
  } catch (error) {
    console.error('Erreur rapport activité:', error);
    res.status(500).json({ error: error.message });
  }
};

// Accepter une invitation (pour l'enfant)
exports.acceptInvitation = async (req, res) => {
  try {
    const childId = req.user.id;
    const { parentId } = req.body;

    const relation = await ParentChild.findOneAndUpdate(
      { parent: parentId, child: childId, status: 'pending' },
      {
        $set: {
          status: 'active',
          acceptedAt: new Date()
        }
      },
      { new: true }
    );

    if (!relation) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }

    res.json({
      message: 'Invitation acceptée avec succès',
      relation: {
        id: relation._id,
        parent: relation.parent,
        status: relation.status
      }
    });
  } catch (error) {
    console.error('Erreur acceptation invitation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Suspendre/activer un enfant
exports.toggleChildStatus = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const relation = await ParentChild.findOneAndUpdate(
      { parent: parentId, child: childId },
      { $set: { status } },
      { new: true }
    );

    if (!relation) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }

    res.json({
      message: `Enfant ${status === 'active' ? 'activé' : 'suspendu'} avec succès`,
      status: relation.status
    });
  } catch (error) {
    console.error('Erreur changement statut:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les analytics avancés pour un enfant
exports.getChildAnalytics = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { period = 'week' } = req.query;

    // Vérifier la relation
    const relation = await ParentChild.findOne({
      parent: parentId,
      child: childId,
      status: 'active'
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }

    // Calculer la période
    const now = new Date();
    let startDate;
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Analytics d'engagement
    const engagementData = await UserActivity.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(childId),
          loginTime: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalTime: { $sum: '$duration' },
          averageSessionTime: { $avg: '$duration' },
          totalExercises: { $sum: '$sessionStats.exercisesCompleted' },
          totalXP: { $sum: '$sessionStats.xpEarned' },
          averageScore: { $avg: '$sessionStats.averageScore' },
          totalBreaks: { $sum: '$sessionStats.breaksTaken' },
          totalRewards: { $sum: '$sessionStats.rewardsEarned' },
          totalGoals: { $sum: '$sessionStats.goalsAchieved' }
        }
      }
    ]);

    // Progression par jour
    const dailyProgression = await UserActivity.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(childId),
          loginTime: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$loginTime' },
            month: { $month: '$loginTime' },
            day: { $dayOfMonth: '$loginTime' }
          },
          totalTime: { $sum: '$duration' },
          totalExercises: { $sum: '$sessionStats.exercisesCompleted' },
          totalXP: { $sum: '$sessionStats.xpEarned' },
          averageScore: { $avg: '$sessionStats.averageScore' },
          sessions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Analytics par heure
    const hourlyAnalytics = await UserActivity.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(childId),
          loginTime: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: { $hour: '$loginTime' },
          sessions: { $sum: 1 },
          totalTime: { $sum: '$duration' },
          averageTime: { $avg: '$duration' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Vérification des limites
    const limits = {
      daily: {
        used: getTodayTime(await UserActivity.find({ user: childId, loginTime: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } })),
        limit: relation.parentalControls.dailyTimeLimit,
        percentage: 0
      },
      weekly: {
        used: engagementData[0]?.totalTime || 0,
        limit: relation.parentalControls.weeklyTimeLimit,
        percentage: 0
      }
    };

    limits.daily.percentage = (limits.daily.used / limits.daily.limit) * 100;
    limits.weekly.percentage = (limits.weekly.used / limits.weekly.limit) * 100;

    res.json({
      period: { type: period, startDate, endDate: now },
      engagement: engagementData[0] || {},
      dailyProgression,
      hourlyAnalytics,
      limits,
      insights: generateChildInsights(engagementData[0], limits)
    });
  } catch (error) {
    console.error('Erreur analytics enfant:', error);
    res.status(500).json({ error: error.message });
  }
};

// Appliquer un template de contrôles
exports.applyControlTemplate = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { template } = req.body;

    const relation = await ParentChild.findOne({
      parent: parentId,
      child: childId,
      status: 'active'
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }

    let newControls = { ...relation.parentalControls };

    switch (template) {
      case 'strict':
        newControls = {
          ...newControls,
          dailyTimeLimit: 60,
          weeklyTimeLimit: 300,
          contentRestrictions: {
            ...newControls.contentRestrictions,
            contentFilterLevel: 'strict',
            autoBlockInappropriate: true,
            allowAdvancedTopics: false,
            allowPublicDiscussions: false,
            allowChat: false
          },
          mandatoryBreaks: {
            enabled: true,
            breakInterval: 20,
            breakDuration: 10,
            maxConsecutiveTime: 30
          },
          advancedControls: {
            ...newControls.advancedControls,
            securityMode: 'strict',
            blockInappropriateContent: true,
            requireParentApproval: true
          }
        };
        break;

      case 'balanced':
        newControls = {
          ...newControls,
          dailyTimeLimit: 120,
          weeklyTimeLimit: 600,
          contentRestrictions: {
            ...newControls.contentRestrictions,
            contentFilterLevel: 'moderate',
            autoBlockInappropriate: true,
            allowAdvancedTopics: true,
            allowPublicDiscussions: false,
            allowChat: false
          },
          mandatoryBreaks: {
            enabled: true,
            breakInterval: 30,
            breakDuration: 5,
            maxConsecutiveTime: 60
          },
          advancedControls: {
            ...newControls.advancedControls,
            securityMode: 'standard',
            blockInappropriateContent: true,
            requireParentApproval: false
          }
        };
        break;

      case 'permissive':
        newControls = {
          ...newControls,
          dailyTimeLimit: 180,
          weeklyTimeLimit: 900,
          contentRestrictions: {
            ...newControls.contentRestrictions,
            contentFilterLevel: 'basic',
            autoBlockInappropriate: false,
            allowAdvancedTopics: true,
            allowPublicDiscussions: true,
            allowChat: true
          },
          mandatoryBreaks: {
            enabled: false,
            breakInterval: 45,
            breakDuration: 5,
            maxConsecutiveTime: 90
          },
          advancedControls: {
            ...newControls.advancedControls,
            securityMode: 'permissive',
            blockInappropriateContent: false,
            requireParentApproval: false
          }
        };
        break;

      default:
        return res.status(400).json({ message: 'Template invalide' });
    }

    relation.parentalControls = newControls;
    await relation.save();

    res.json({
      message: `Template ${template} appliqué avec succès`,
      controls: relation.parentalControls
    });
  } catch (error) {
    console.error('Erreur application template:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fonctions utilitaires
function getTodayTime(activities) {
  return activities.reduce((sum, activity) => sum + activity.duration, 0);
}

function generateChildInsights(engagement, limits) {
  const insights = [];

  if (limits.daily.percentage > 100) {
    insights.push('Limite quotidienne dépassée ⚠️');
  } else if (limits.daily.percentage > 80) {
    insights.push('Proche de la limite quotidienne 📊');
  }

  if (limits.weekly.percentage > 100) {
    insights.push('Limite hebdomadaire dépassée ⚠️');
  }

  if (engagement?.totalBreaks > 0) {
    insights.push(`Pauses prises: ${engagement.totalBreaks} - Bon équilibre ! ⏰`);
  }

  if (engagement?.totalRewards > 0) {
    insights.push(`Récompenses gagnées: ${engagement.totalRewards} 🏆`);
  }

  return insights;
}