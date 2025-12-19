// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function extractToken(req) {
  // Vérifier d'abord le header Authorization
  if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  // Vérifier le cookie token standard
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  // Note: adminToken est géré par flexibleAuthMiddleware ou adminAuthMiddleware
  return null;
}

exports.protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Veuillez vous connecter pour accéder à cette ressource' });
    }

    const secret = process.env.JWT_SECRET || 'devsecret';
    if (!secret) {
      console.error('JWT_SECRET non défini');
      return res.status(500).json({ success: false, message: 'Configuration serveur manquante' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.error('JWT verification failed:', err?.message || err);
      return res.status(401).json({
        success: false,
        message: err?.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide'
      });
    }

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: 'Token invalide: ID manquant' });
    }





    const currentUser = await User.findById(decoded.id)
      .select('email roles role subscription isVerified isProfileComplete')
      .lean()
      .exec();

    console.log('DEBUG AUTH: Found user:', currentUser ? currentUser._id : 'null');

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
      isVerified: !!currentUser.isVerified,
      subscription: currentUser.subscription || null
    };

    // Si l'utilisateur a le rôle admin, définir aussi req.admin
    if (roles.includes('admin')) {
      req.admin = {
        id: currentUser._id,
        email: currentUser.email,
        roles: ['admin']
      };
    }

    next();
  } catch (error) {
    console.error('authMiddleware.protect error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// alias pour compatibilité (certaines routes attendent userProtect)
exports.userProtect = exports.protect;

// Middleware pour vérifier que l'utilisateur est admin
exports.adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentification requise' });
    }
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : (req.user.role ? [req.user.role] : []);
    if (!userRoles.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Permissions administrateur requises'
      });
    }
    next();
  } catch (err) {
    console.error('adminOnly error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

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

// Middleware optionnel pour l'authentification (pour les tests)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'devsecret';
      if (secret) {
        try {
          const decoded = jwt.verify(token, secret);
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
          }
        } catch (err) {
          // Token invalide, continuer sans authentification
          console.log('Token invalide, continuant sans authentification');
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error in optionalAuth middleware:', error);
    next();
  }
};
