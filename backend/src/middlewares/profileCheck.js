const User = require('../models/User');

exports.checkProfileComplete = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Stocker l'état de complétion du profil dans la requête
    req.isProfileComplete = user.isProfileComplete;
    req.userData = user;
    
    next();
  } catch (error) {
    console.error('Erreur vérification profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};