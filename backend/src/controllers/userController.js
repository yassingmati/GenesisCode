// src/controllers/userController.js
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

/**
 * Retourne le profil de l'utilisateur connecté.
 * On suppose que `protect` met `req.user` (document mongoose) ou au moins { id, firebaseUid }.
 */
exports.getProfile = async (req, res) => {
  try {
    // Si protect attache l'objet utilisateur complet
    if (req.user && req.user._id) {
      return res.json({ message: 'Profil utilisateur', user: req.user });
    }

    // Sinon tenter de récupérer depuis DB via firebaseUid ou id
    const uid = req.user && (req.user.firebaseUid || req.user.id || req.user._id);
    if (!uid) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    const user = await User.findOne({ $or: [{ firebaseUid: uid }, { _id: uid }] })
      .populate('parentAccount', 'firstName lastName email phone')
      .populate({
        path: 'subscriptions',
        populate: { path: 'plan' }
      })
      .populate({
        path: 'categoryAccess',
        populate: { path: 'category' }
      })
      .lean();
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    console.log('DEBUG getProfile user:', user._id);
    console.log('DEBUG subscriptions count:', user.subscriptions ? user.subscriptions.length : 0);
    console.log('DEBUG subscriptions data:', JSON.stringify(user.subscriptions, null, 2));

    res.json({ message: 'Profil utilisateur', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupérer un profil par id (admin ou usage public selon règles d'accès)
 */
exports.getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v').lean();
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Créer un profil utilisateur.
 * Si l'utilisateur existe déjà (firebaseUid), on retourne 409 ou on met à jour (selon besoin).
 */
exports.createProfile = async (req, res) => {
  try {
    const { firebaseUid, email, firstName, lastName, phone, userType } = req.body;
    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid et email requis' });
    }

    const existing = await User.findOne({ firebaseUid });
    if (existing) {
      return res.status(409).json({ error: 'Utilisateur déjà existant', user: existing });
    }

    const user = new User({
      firebaseUid,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      userType: userType || 'student'
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mettre à jour le profil de l'utilisateur connecté (ou d'un autre si admin).
 * Supporte: firstName, lastName, phone, isProfileComplete, badges, roles, subscription, totalXP
 */
exports.updateProfile = async (req, res) => {
  try {
    // cible par défaut : utilisateur connecté
    const targetId = req.params.id || (req.user && (req.user._id || req.user.id));
    if (!targetId) return res.status(400).json({ error: 'Aucun id utilisateur fourni' });

    // fields autorisés à la MAJ
    const allowed = ['firstName', 'lastName', 'phone', 'isProfileComplete', 'badges', 'roles', 'subscription', 'totalXP', 'isVerified', 'userType'];
    const updates = {};
    allowed.forEach(field => {
      if (field in req.body) updates[field] = req.body[field];
    });

    const updated = await User.findByIdAndUpdate(targetId, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supprimer un profil — supprime aussi les UserProgress associés.
 */
exports.deleteProfile = async (req, res) => {
  try {
    const id = req.params.id || (req.user && (req.user._id || req.user.id));
    if (!id) return res.status(400).json({ error: 'Aucun id utilisateur fourni' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    // suppression des progress liés
    await UserProgress.deleteMany({ user: user._id });

    await user.deleteOne();
    res.json({ message: 'Utilisateur et données associées supprimés' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère les progrès / user progress pour un userId (ou connecté)
 */
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && (req.user._id || req.user.id));
    if (!userId) return res.status(400).json({ error: 'userId requis' });

    const progress = await UserProgress.find({ user: userId })
      .populate('exercise')
      .lean();

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Leaderboard : top N users par totalXP
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const period = req.query.period || 'alltime'; // 'daily', 'monthly', 'alltime'

    let sortQuery = { totalXP: -1 };

    if (period === 'daily') {
      // Pour le daily, on veut trier par xpStats.daily, mais seulement s'ils ont été reset aujourd'hui ?
      // Notre logique de mise à jour reset la date. Si la date est vieille, le daily devrait être considéré comme 0.
      // C'est dur de trier purement en DB si on doit vérifier la date du champ.
      // Sauf si on a un cron qui reset tout le monde à minuit.
      // Sans cron, le tri DB est imparfait si des utilisateurs inactifs ont des vieilles valeurs daily non reset.
      // Solution "Lazy": On trie par daily, mais on filtre ou note la date dans le front.
      // Ou mieux: On assume que pour le top 50, les gens sont actifs.
      sortQuery = { 'xpStats.daily': -1 };
    } else if (period === 'monthly') {
      sortQuery = { 'xpStats.monthly': -1 };
    }

    const leaderboard = await User.find()
      .sort(sortQuery)
      .select('firstName lastName email totalXP xpStats badges rank')
      .limit(limit)
      .lean();

    // Petit post-processing pour nettoyer les vielles stats si nécessaire (optionnel pour l'instant)
    const now = new Date();
    const cleanedLeaderboard = leaderboard.map(user => {
      // Logique de validation de la date si nécessaire pour l'affichage
      // Si c'est daily et que la date n'est pas aujourd'hui, on pourrait mettre 0, mais ça ne change pas le tri fait par Mongo.
      return user;
    });

    res.json(cleanedLeaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * Récupérer tous les utilisateurs (Admin seulement)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
