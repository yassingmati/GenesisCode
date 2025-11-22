// src/controllers/reportsController.js
const ParentChild = require('../models/ParentChild');
const UserActivity = require('../models/UserActivity');
const SharedCalendar = require('../models/SharedCalendar');
const Reward = require('../models/Reward');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

// Générer un rapport détaillé
exports.generateDetailedReport = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { period = 'week', format = 'json' } = req.query;
    
    // Vérifier la relation
    const relation = await ParentChild.findOne({ 
      parent: parentId, 
      child: childId,
      status: 'active'
    }).populate('child');
    
    if (!relation) {
      return res.status(404).json({ message: 'Relation parent-enfant non trouvée' });
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
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Récupérer les données d'activité
    const activities = await UserActivity.find({
      user: childId,
      loginTime: { $gte: startDate, $lte: now }
    }).sort({ loginTime: -1 });
    
    // Statistiques d'activité
    const activityStats = await UserActivity.getUserActivitySummary(childId, startDate, now);
    
    // Progression par jour
    const dailyProgress = await UserActivity.aggregate([
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
          sessions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Objectifs du calendrier
    const calendar = await SharedCalendar.findOne({ parent: parentId, child: childId });
    const goalsInPeriod = calendar ? calendar.sharedGoals.filter(goal => 
      goal.targetDate >= startDate && goal.targetDate <= now
    ) : [];
    
    // Récompenses gagnées
    const rewards = await Reward.find({
      child: childId,
      createdAt: { $gte: startDate, $lte: now }
    });
    
    // Analyse des tendances
    const trends = {
      timeSpent: calculateTrend(activities.map(a => a.duration)),
      exercisesCompleted: calculateTrend(activities.map(a => a.sessionStats.exercisesCompleted)),
      xpEarned: calculateTrend(activities.map(a => a.sessionStats.xpEarned)),
      averageScore: calculateTrend(activities.map(a => a.sessionStats.averageScore))
    };
    
    // Vérification des limites
    const limits = {
      daily: {
        used: getTodayTime(activities),
        limit: relation.parentalControls.dailyTimeLimit,
        percentage: (getTodayTime(activities) / relation.parentalControls.dailyTimeLimit) * 100
      },
      weekly: {
        used: activityStats.totalTime,
        limit: relation.parentalControls.weeklyTimeLimit,
        percentage: (activityStats.totalTime / relation.parentalControls.weeklyTimeLimit) * 100
      }
    };
    
    const report = {
      child: {
        id: relation.child._id,
        name: `${relation.child.firstName} ${relation.child.lastName}`,
        email: relation.child.email
      },
      period: {
        type: period,
        startDate,
        endDate: now
      },
      summary: {
        totalSessions: activityStats.totalSessions,
        totalTime: activityStats.totalTime,
        totalExercises: activityStats.totalExercises,
        totalXP: activityStats.totalXP,
        averageScore: activityStats.averageScore,
        goalsCompleted: goalsInPeriod.filter(g => g.status === 'completed').length,
        rewardsEarned: rewards.length
      },
      dailyProgress,
      trends,
      limits,
      activities: activities.slice(0, 50), // Limiter pour la performance
      goals: goalsInPeriod,
      rewards: rewards.slice(0, 20)
    };
    
    if (format === 'pdf') {
      try {
        // Créer un nouveau document PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Définir les en-têtes de réponse
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rapport-${childId}-${period}.pdf"`);

        // Pipe le PDF vers la réponse
        doc.pipe(res);

        // En-tête du document
        doc.fontSize(20).text('Rapport d\'Activité - GenesisCode', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Enfant: ${relation.child.firstName} ${relation.child.lastName}`, { align: 'left' });
        doc.text(`Période: ${period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}`, { align: 'left' });
        doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'left' });
        doc.moveDown();

        // Statistiques principales
        doc.fontSize(16).text('Statistiques Principales', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Temps total: ${report.stats.totalTime} minutes`);
        doc.text(`Exercices complétés: ${report.stats.totalExercises}`);
        doc.text(`Score moyen: ${report.stats.averageScore}%`);
        doc.text(`Sessions: ${report.stats.totalSessions}`);
        doc.text(`Pauses: ${report.stats.totalBreaks}`);
        doc.text(`Objectifs complétés: ${report.stats.goalsCompleted}`);
        doc.text(`Récompenses gagnées: ${report.stats.rewardsEarned}`);
        doc.moveDown();

        // Tendances
        if (report.trends && Object.keys(report.trends).length > 0) {
          doc.fontSize(16).text('Tendances', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11);
          if (report.trends.timeTrend) {
            doc.text(`Tendance temps: ${report.trends.timeTrend > 0 ? '+' : ''}${report.trends.timeTrend}%`);
          }
          if (report.trends.scoreTrend) {
            doc.text(`Tendance score: ${report.trends.scoreTrend > 0 ? '+' : ''}${report.trends.scoreTrend}%`);
          }
          doc.moveDown();
        }

        // Activités récentes
        if (report.activities && report.activities.length > 0) {
          doc.fontSize(16).text('Activités Récentes', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);
          report.activities.slice(0, 20).forEach((activity, index) => {
            const date = new Date(activity.loginTime).toLocaleDateString('fr-FR');
            const time = new Date(activity.loginTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            doc.text(`${index + 1}. ${date} ${time} - ${activity.action || 'Connexion'}`);
            if (activity.duration) {
              doc.text(`   Durée: ${activity.duration} minutes`, { indent: 20 });
            }
          });
          doc.moveDown();
        }

        // Objectifs
        if (report.goals && report.goals.length > 0) {
          doc.fontSize(16).text('Objectifs', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);
          report.goals.forEach((goal, index) => {
            const status = goal.status === 'completed' ? '✓' : '○';
            doc.text(`${status} ${goal.title || `Objectif ${index + 1}`}`);
            if (goal.description) {
              doc.text(`   ${goal.description}`, { indent: 20 });
            }
          });
          doc.moveDown();
        }

        // Récompenses
        if (report.rewards && report.rewards.length > 0) {
          doc.fontSize(16).text('Récompenses', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(10);
          report.rewards.forEach((reward, index) => {
            doc.text(`${index + 1}. ${reward.name || `Récompense ${index + 1}`}`);
            if (reward.points) {
              doc.text(`   Points: ${reward.points}`, { indent: 20 });
            }
          });
          doc.moveDown();
        }

        // Pied de page
        doc.fontSize(8).text(
          `Généré le ${new Date().toLocaleString('fr-FR')} - GenesisCode Learning Platform`,
          { align: 'center' }
        );

        // Finaliser le PDF
        doc.end();
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        res.status(500).json({ error: 'Erreur lors de la génération du PDF', details: error.message });
      }
    } else {
      res.json(report);
    }
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les analytics avancés
exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const parentId = req.user.id;
    const childId = req.params.childId;
    const { period = 'month' } = req.query;
    
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Analytics d'engagement
    const engagementAnalytics = await UserActivity.aggregate([
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
          totalRewards: { $sum: '$sessionStats.rewardsEarned' }
        }
      }
    ]);
    
    // Analytics par heure de la journée
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
    
    // Analytics par jour de la semaine
    const weeklyAnalytics = await UserActivity.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(childId),
          loginTime: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$loginTime' },
          sessions: { $sum: 1 },
          totalTime: { $sum: '$duration' },
          totalExercises: { $sum: '$sessionStats.exercisesCompleted' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    // Progression temporelle
    const progressionData = await UserActivity.aggregate([
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
          averageScore: { $avg: '$sessionStats.averageScore' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Comparaison avec les objectifs
    const relation = await ParentChild.findOne({ parent: parentId, child: childId });
    const goals = relation.parentalControls.weeklyGoals;
    
    const goalComparison = {
      exercises: {
        target: goals.minExercises,
        achieved: engagementAnalytics[0]?.totalExercises || 0,
        percentage: engagementAnalytics[0]?.totalExercises 
          ? (engagementAnalytics[0].totalExercises / goals.minExercises) * 100 
          : 0
      },
      studyTime: {
        target: goals.minStudyTime,
        achieved: engagementAnalytics[0]?.totalTime || 0,
        percentage: engagementAnalytics[0]?.totalTime 
          ? (engagementAnalytics[0].totalTime / goals.minStudyTime) * 100 
          : 0
      },
      score: {
        target: goals.targetScore,
        achieved: Math.round((engagementAnalytics[0]?.averageScore || 0) * 100),
        percentage: engagementAnalytics[0]?.averageScore 
          ? (engagementAnalytics[0].averageScore * 100) / goals.targetScore 
          : 0
      }
    };
    
    const analytics = {
      period: { type: period, startDate, endDate: now },
      engagement: engagementAnalytics[0] || {},
      hourly: hourlyAnalytics,
      weekly: weeklyAnalytics,
      progression: progressionData,
      goalComparison,
      insights: generateInsights(engagementAnalytics[0], goalComparison)
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Erreur analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les comparaisons multi-enfants
exports.getMultiChildComparison = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { period = 'month' } = req.query;
    
    // Récupérer tous les enfants du parent
    const children = await ParentChild.findByParent(parentId);
    
    if (children.length === 0) {
      return res.json({ children: [], comparison: {} });
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Analytics pour chaque enfant
    const childrenData = await Promise.all(
      children.map(async (child) => {
        const activities = await UserActivity.find({
          user: child.child._id,
          loginTime: { $gte: startDate, $lte: now }
        });
        
        const stats = await UserActivity.getUserActivitySummary(child.child._id, startDate, now);
        
        return {
          child: {
            id: child.child._id,
            name: `${child.child.firstName} ${child.child.lastName}`,
            email: child.child.email
          },
          stats: {
            totalSessions: stats.totalSessions,
            totalTime: stats.totalTime,
            totalExercises: stats.totalExercises,
            totalXP: stats.totalXP,
            averageScore: stats.averageScore
          },
          activities: activities.length
        };
      })
    );
    
    // Calculer les moyennes et comparaisons
    const totals = childrenData.reduce((acc, child) => ({
      totalSessions: acc.totalSessions + child.stats.totalSessions,
      totalTime: acc.totalTime + child.stats.totalTime,
      totalExercises: acc.totalExercises + child.stats.totalExercises,
      totalXP: acc.totalXP + child.stats.totalXP,
      averageScore: acc.averageScore + child.stats.averageScore
    }), { totalSessions: 0, totalTime: 0, totalExercises: 0, totalXP: 0, averageScore: 0 });
    
    const averages = {
      totalSessions: totals.totalSessions / childrenData.length,
      totalTime: totals.totalTime / childrenData.length,
      totalExercises: totals.totalExercises / childrenData.length,
      totalXP: totals.totalXP / childrenData.length,
      averageScore: totals.averageScore / childrenData.length
    };
    
    // Ajouter les comparaisons à chaque enfant
    childrenData.forEach(child => {
      child.comparison = {
        sessions: child.stats.totalSessions > averages.totalSessions ? 'above' : 'below',
        time: child.stats.totalTime > averages.totalTime ? 'above' : 'below',
        exercises: child.stats.totalExercises > averages.totalExercises ? 'above' : 'below',
        xp: child.stats.totalXP > averages.totalXP ? 'above' : 'below',
        score: child.stats.averageScore > averages.averageScore ? 'above' : 'below'
      };
    });
    
    res.json({
      period: { type: period, startDate, endDate: now },
      children: childrenData,
      averages,
      totals
    });
  } catch (error) {
    console.error('Erreur comparaison multi-enfants:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fonctions utilitaires
function calculateTrend(values) {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
}

function getTodayTime(activities) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return activities
    .filter(activity => activity.loginTime >= today)
    .reduce((sum, activity) => sum + activity.duration, 0);
}

function generateInsights(engagement, goalComparison) {
  const insights = [];
  
  if (goalComparison.exercises.percentage >= 100) {
    insights.push('Objectif d\'exercices atteint ! 🎉');
  } else if (goalComparison.exercises.percentage >= 80) {
    insights.push('Proche de l\'objectif d\'exercices ! 💪');
  }
  
  if (goalComparison.studyTime.percentage >= 100) {
    insights.push('Temps d\'étude objectif atteint ! 📚');
  } else if (goalComparison.studyTime.percentage < 50) {
    insights.push('Temps d\'étude en dessous de l\'objectif 📈');
  }
  
  if (goalComparison.score.percentage >= 100) {
    insights.push('Score moyen excellent ! ⭐');
  } else if (goalComparison.score.percentage < 70) {
    insights.push('Score moyen à améliorer 📊');
  }
  
  if (engagement?.totalBreaks > 0) {
    insights.push(`Pauses prises: ${engagement.totalBreaks} - Bon équilibre ! ⏰`);
  }
  
  return insights;
}
