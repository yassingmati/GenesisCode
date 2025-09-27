// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Veuillez vous connecter pour accéder à cette ressource' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET non défini');
      return res.status(500).json({ success: false, message: 'Configuration serveur manquante' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error('JWT verification failed:', err && err.message ? err.message : err);
      return res.status(401).json({ success: false, message: err.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide' });
    }

    const currentUser = await User.findById(decoded.id).lean().exec();
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "L'utilisateur associé à ce token n'existe plus" });
    }

    // Construire req.user avec compatibilité roles/role
    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : (currentUser.role ? [currentUser.role] : []);
    req.user = {
      id: currentUser._id,
      email: currentUser.email,
      roles,
      role: roles.length > 0 ? roles[0] : undefined,
      isProfileComplete: !!currentUser.isProfileComplete,
      isVerified: !!currentUser.isVerified
    };

    next();
  } catch (error) {
    console.error('authMiddleware.protect error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// alias pour compatibilité (certaines routes attendent userProtect)
exports.userProtect = exports.protect;

exports.roleMiddleware = (...rolesAllowed) => {
  return (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Authentification requise' });
      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : (req.user.role ? [req.user.role] : []);
      const allowed = rolesAllowed.some(r => userRoles.includes(r));
      if (!allowed) {
        return res.status(403).json({ success: false, message: `Votre rôle (${userRoles.join(',') || 'non défini'}) ne permet pas d'accéder à cette ressource` });
      }
      next();
    } catch (err) {
      console.error('roleMiddleware error:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
};
