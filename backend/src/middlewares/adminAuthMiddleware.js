// src/middlewares/adminAuthMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function extractToken(req) {
  if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies?.adminToken) {
    return req.cookies.adminToken;
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
}

exports.adminProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token admin manquant. Connectez-vous.' });
    }

    const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_ADMIN_SECRET ou JWT_SECRET non défini.');
      return res.status(500).json({ success: false, message: 'Configuration serveur manquante' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.warn('JWT verification failed for admin token:', err && err.message ? err.message : err);
      return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }

    const admin = await Admin.findById(decoded.id).lean().exec();
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin introuvable pour ce token' });
    }

    // Fournir un contexte cohérent pour les middlewares existants
    req.admin = { id: admin._id, email: admin.email, roles: admin.roles || ['admin'] };
    req.user = { id: admin._id, email: admin.email, roles: Array.isArray(admin.roles) && admin.roles.length ? admin.roles : ['admin'] };

    next();
  } catch (err) {
    console.error('adminProtect error:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur (adminProtect)' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ success: false, message: 'Accès admin requis' });
  }
  next();
};




