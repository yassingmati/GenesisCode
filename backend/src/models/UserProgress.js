// src/models/UserProgress.js
const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
  xp: { type: Number, default: 0, min: 0 },
  completed: { type: Boolean, default: false },
  lastAttempt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  // Nouveaux champs pour le scoring détaillé
  pointsEarned: { type: Number, default: 0, min: 0 },
  pointsMax: { type: Number, default: 10, min: 1 },
  attempts: { type: Number, default: 0, min: 0 },
  bestScore: { type: Number, default: 0, min: 0 }, // Meilleur score obtenu
  details: { type: mongoose.Schema.Types.Mixed, default: {} } // Détails de la dernière soumission
}, {
  timestamps: true
});

// Index composé unique pour empêcher doublons user+exercise
userProgressSchema.index({ user: 1, exercise: 1 }, { unique: true });

// Méthode statique pour ajouter XP atomiquement (upsert) - DEPRECATED, utiliser updateProgress
userProgressSchema.statics.addXp = async function (userId, exerciseId, xpToAdd = 0) {
  console.warn('addXp is deprecated, use updateProgress instead');
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

// Méthode statique améliorée pour mettre à jour le progrès avec scoring détaillé
userProgressSchema.statics.updateProgress = async function (userId, exerciseId, progressData) {
  const {
    xp = 0,
    pointsEarned = 0,
    pointsMax = 10,
    completed = false,
    details = {}
  } = progressData;

  // Valider et convertir les IDs
  const mongoose = require('mongoose');
  const crypto = require('crypto');
  let userObjectId, exerciseObjectId;

  // Pour userId : s'il n'est pas un ObjectId valide, créer un ObjectId déterministe
  // Pour userId : s'il n'est pas un ObjectId valide, créer un ObjectId déterministe
  if (mongoose.isValidObjectId(userId)) {
    userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  } else {
    // Tenter de trouver l'utilisateur par firebaseUid
    // Note: On utilise require ici pour éviter les dépendances circulaires au chargement
    try {
      const User = mongoose.model('User');
      const user = await User.findOne({ firebaseUid: userId });
      if (user) {
        userObjectId = user._id;
      } else {
        // Fallback au hash
        const hash = crypto.createHash('md5').update(userId).digest('hex');
        userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
      }
    } catch (e) {
      // Si le modèle User n'est pas encore enregistré ou autre erreur
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    }
  }

  // Pour exerciseId : doit être un ObjectId valide
  if (!mongoose.isValidObjectId(exerciseId)) {
    throw new Error(`exerciseId invalide: ${exerciseId}`);
  }
  exerciseObjectId = typeof exerciseId === 'string' ? new mongoose.Types.ObjectId(exerciseId) : exerciseId;

  const filter = { user: userObjectId, exercise: exerciseObjectId };
  const now = new Date();

  // Récupérer le progrès existant pour calculer le meilleur score
  const existing = await this.findOne(filter).lean();
  const currentBestScore = existing?.bestScore || 0;
  const newBestScore = Math.max(currentBestScore, pointsEarned);

  const update = {
    $inc: {
      xp,
      attempts: 1
    },
    $set: {
      lastAttempt: now,
      pointsEarned,
      pointsMax,
      bestScore: newBestScore,
      details
    }
  };

  // Marquer comme complété si nécessaire
  if (completed) {
    update.$set.completed = true;
    update.$set.completedAt = now;
  }

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  const updatedProgress = await this.findOneAndUpdate(filter, update, options).exec();

  // --- Mise à jour du User (XP global, stats journalières/mensuelles, Badges) ---
  try {
    const User = mongoose.model('User');
    const BADGES = require('../config/BadgeRegistry');

    // 1. Récupérer l'utilisateur pour vérifier les dates de reset
    const user = await User.findById(userObjectId);
    if (user) {
      const today = new Date();
      const isNewDay = !user.xpStats?.lastDailyReset || user.xpStats.lastDailyReset.getDate() !== today.getDate() || user.xpStats.lastDailyReset.getMonth() !== today.getMonth();
      const isNewMonth = !user.xpStats?.lastMonthlyReset || user.xpStats.lastMonthlyReset.getMonth() !== today.getMonth();

      // Préparer la mise à jour
      const userUpdate = {
        $inc: { totalXP: xp },
        $set: {}
      };

      // Gestion Daily
      if (isNewDay) {
        userUpdate.$set['xpStats.daily'] = xp;
        userUpdate.$set['xpStats.lastDailyReset'] = today;
      } else {
        userUpdate.$inc['xpStats.daily'] = xp;
      }

      // Gestion Monthly
      if (isNewMonth) {
        userUpdate.$set['xpStats.monthly'] = xp;
        userUpdate.$set['xpStats.lastMonthlyReset'] = today;
      } else {
        userUpdate.$inc['xpStats.monthly'] = xp;
      }

      // --- Logique des Badges ---
      const currentBadges = user.badges || [];
      const newBadges = [];

      // Calculer les nouvelles valeurs (approximatives pour la vérification immédiate)
      // Note: totalXP est mis à jour atomiquement, donc on utilise (user.totalXP + xp)
      const projectedTotalXP = (user.totalXP || 0) + xp;

      // On peut aussi avoir besoin du nombre total d'exercices, etc.
      // Pour l'instant on se base sur ce qu'on a ou on fait une requête rapide si besoin d'info agrégée
      // (Optimisation: passer les stats en paramètre ou les stocker sur le user)

      Object.values(BADGES).forEach(badge => {
        if (currentBadges.includes(badge.id)) return; // Déjà acquis

        let earned = false;
        if (badge.criteria.type === 'xp' && projectedTotalXP >= badge.criteria.value) {
          earned = true;
        } else if (badge.criteria.type === 'exercises') {
          // Optimisation: On ne compte que si l'utilisateur n'a pas le badge
          // Ce count peut être coûteux, à utiliser avec parcimonie ou stocker le compteur sur le User
          // Pour l'instant on fait simple
          // Note: completed vient d'être mis à jour dans userProgress, mais countDocuments peut ne pas le voir immédiatement si transaction ? 
          // Non mongo est pas transactionnel par défaut ici. Mais on vient de faire findOneAndUpdate.
          // On peut aussi estimer stats du user si on les avait stockées.
        }
        // Ajouter d'autres types de critères ici (streak, exercises count, etc.)
        // Pour 'exercises', il faudrait count UserProgress. On peut le faire si on veut être précis.

        if (earned) {
          newBadges.push(badge.id);
        }
      });

      if (newBadges.length > 0) {
        userUpdate.$push = { badges: { $each: newBadges } };
      }

      // Appliquer la mise à jour utilisateur
      await User.findByIdAndUpdate(userObjectId, userUpdate);
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour du User XP/Badges:", err);
    // On ne bloque pas le retour du progress si ça échoue, mais on log l'erreur
  }

  return updatedProgress;
};

// Méthode statique pour obtenir les statistiques d'un utilisateur
userProgressSchema.statics.getUserStats = async function (userId) {
  const mongoose = require('mongoose');
  const crypto = require('crypto');

  // Utiliser la même logique de conversion que updateProgress
  let userObjectId;
  if (mongoose.isValidObjectId(userId)) {
    userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  } else {
    // Créer un ObjectId déterministe à partir du userId string
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
  }

  const pipeline = [
    { $match: { user: userObjectId } },
    {
      $group: {
        _id: null,
        totalXp: { $sum: '$xp' },
        totalExercises: { $sum: 1 },
        completedExercises: { $sum: { $cond: ['$completed', 1, 0] } },
        averageScore: { $avg: { $divide: ['$pointsEarned', '$pointsMax'] } },
        totalAttempts: { $sum: '$attempts' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalXp: 0,
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    totalAttempts: 0
  };
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
