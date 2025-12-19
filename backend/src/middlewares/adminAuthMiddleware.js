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
      console.warn('🔒 Admin auth failed: No token provided');
      console.warn('📍 Request path:', req.path);
      console.warn('🔑 Headers:', req.headers.authorization ? 'Bearer token present' : 'No authorization header');
      return res.status(401).json({
        success: false,
        message: 'Token admin manquant. Connectez-vous.',
        code: 'NO_TOKEN'
      });
    }

    const secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ CRITICAL: JWT_ADMIN_SECRET or JWT_SECRET not defined in environment');
      return res.status(500).json({
        success: false,
        message: 'Configuration serveur manquante',
        code: 'NO_SECRET'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
      console.log('✅ Token JWT vérifié avec succès pour admin ID:', decoded.id);
    } catch (err) {
      console.warn('🔒 Admin auth failed: JWT verification error');
      console.warn('📍 Request path:', req.path);
      console.warn('❌ Error:', err.message);

      // Distinguish between expired and invalid tokens
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expiré. Veuillez vous reconnecter.',
          code: 'TOKEN_EXPIRED'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré',
        code: 'INVALID_TOKEN'
      });
    }

    const admin = await Admin.findById(decoded.id).lean().exec();
    if (!admin) {
      console.warn('🔒 Admin auth failed: Admin not found in database');
      console.warn('📍 Request path:', req.path);
      console.warn('🆔 Admin ID from token:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Admin introuvable pour ce token',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    console.log('✅ Admin authentifié:', admin.email);

    // Fournir un contexte cohérent pour les middlewares existants
    req.admin = { id: admin._id, email: admin.email, roles: admin.roles || ['admin'] };
    req.user = { id: admin._id, email: admin.email, roles: Array.isArray(admin.roles) && admin.roles.length ? admin.roles : ['admin'] };

    next();
  } catch (err) {
    console.error('❌ adminProtect error:', err);
    console.error('📍 Request path:', req.path);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur (adminProtect)',
      code: 'SERVER_ERROR'
    });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.admin) {
    console.warn('🔒 Admin-only access denied: No admin in request');
    console.warn('📍 Request path:', req.path);
    return res.status(403).json({
      success: false,
      message: 'Accès admin requis',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};






