// src/middlewares/roleMiddleware.js
const User = require('../models/User');

/**
 * Middleware pour vérifier les permissions d'admin
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'UNAUTHORIZED'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Vérifier les rôles admin
    const isAdmin = user.roles && user.roles.includes('admin');
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Permissions administrateur requises',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();

  } catch (error) {
    console.error('Erreur middleware admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification des permissions',
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};

/**
 * Middleware pour vérifier les permissions utilisateur
 */
exports.requireUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'UNAUTHORIZED'
      });
    }

    next();

  } catch (error) {
    console.error('Erreur middleware user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification des permissions',
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};

/**
 * Middleware pour vérifier les permissions parent
 */
exports.requireParent = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
        code: 'UNAUTHORIZED'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Vérifier le type d'utilisateur parent
    const isParent = user.userType === 'parent';
    if (!isParent) {
      return res.status(403).json({
        success: false,
        message: 'Permissions parent requises',
        code: 'PARENT_REQUIRED'
      });
    }

    next();

  } catch (error) {
    console.error('Erreur middleware parent:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification des permissions',
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};


