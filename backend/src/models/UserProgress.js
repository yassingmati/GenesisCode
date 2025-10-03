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
userProgressSchema.statics.addXp = async function(userId, exerciseId, xpToAdd = 0) {
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
userProgressSchema.statics.updateProgress = async function(userId, exerciseId, progressData) {
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
  if (mongoose.isValidObjectId(userId)) {
    userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  } else {
    // Créer un ObjectId déterministe à partir du userId string
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
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
  return this.findOneAndUpdate(filter, update, options).exec();
};

// Méthode statique pour obtenir les statistiques d'un utilisateur
userProgressSchema.statics.getUserStats = async function(userId) {
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
