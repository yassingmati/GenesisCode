// src/middlewares/flexibleAuthMiddleware.js
// Middleware qui accepte à la fois les users et les admins
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

function extractToken(req) {
  // Vérifier d'abord le cookie adminToken (priorité pour les admins)
  if (req.cookies?.adminToken) {
    return { token: req.cookies.adminToken, isAdminToken: true };
  }
  // Vérifier le header Authorization
  if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    // Pour l'instant, on ne peut pas déterminer si c'est un token admin sans le décoder
    // On laissera protectUserOrAdmin essayer les deux secrets
    return { token, isAdminToken: false };
  }
  // Vérifier paramètre token (utile pour prévisualisation fichiers via URL directe)
  if (req.query?.token) {
    return { token: req.query.token, isAdminToken: false };
  }
  // Vérifier le cookie token standard
  if (req.cookies?.token) {
    return { token: req.cookies.token, isAdminToken: false };
  }
  return null;
}

exports.protectUserOrAdmin = async (req, res, next) => {
  try {
    console.log('🔒 protectUserOrAdmin - Début de vérification');
    console.log('   URL:', req.originalUrl || req.url);
    console.log('   Method:', req.method);
    console.log('   Authorization header:', req.headers.authorization ? 'Present' : 'Missing');

    const tokenInfo = extractToken(req);

    if (!tokenInfo || !tokenInfo.token) {
      console.log('❌ protectUserOrAdmin: Token manquant');
      return res.status(401).json({ success: false, message: 'Veuillez vous connecter pour accéder à cette ressource' });
    }

    const token = tokenInfo.token;
    const userSecret = process.env.JWT_SECRET || 'devsecret';
    const adminSecret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';

    let decoded;
    let isAdmin = false;
    let secretUsed = null;

    // Si les secrets sont différents, essayer les deux secrets pour déterminer le type
    if (adminSecret !== userSecret) {
      // Essayer d'abord avec adminSecret (priorité pour les admins)
      try {
        decoded = jwt.verify(token, adminSecret);
        secretUsed = 'admin';
        isAdmin = true;
        console.log('✅ Token vérifié avec adminSecret');
      } catch (adminErr) {
        // Si échec avec adminSecret, essayer avec userSecret
        try {
          decoded = jwt.verify(token, userSecret);
          secretUsed = 'user';
          isAdmin = false;
          console.log('✅ Token vérifié avec userSecret');
        } catch (userErr) {
          // Les deux secrets ont échoué
          const error = adminErr || userErr;
          console.error('❌ JWT verification failed for both secrets:', error?.message || error);
          console.error('   Token (premiers 50 chars):', token.substring(0, 50));
          console.error('   Admin Secret:', adminSecret.substring(0, 10) + '...');
          console.error('   User Secret:', userSecret.substring(0, 10) + '...');
          return res.status(401).json({
            success: false,
            message: error?.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide'
          });
        }
      }
    } else {
      // Secrets identiques, essayer avec le secret unique
      try {
        decoded = jwt.verify(token, userSecret);
        secretUsed = 'user';
        console.log('✅ Token vérifié avec secret unique (secrets identiques)');
        // Si les secrets sont identiques, on ne peut pas déterminer si c'est un admin
        // On va essayer de trouver dans Admin puis dans User
      } catch (err) {
        console.error('❌ JWT verification failed:', err?.message || err);
        console.error('   Token (premiers 50 chars):', token.substring(0, 50));
        return res.status(401).json({
          success: false,
          message: err?.name === 'TokenExpiredError' ? 'Session expirée' : 'Token invalide'
        });
      }
    }

    // Si c'est un token admin (signé avec JWT_ADMIN_SECRET), chercher dans Admin
    if (isAdmin && secretUsed === 'admin') {
      try {
        const admin = await Admin.findById(decoded.id)
          .select('email')
          .lean()
          .exec();
        if (admin) {
          req.admin = { id: admin._id, email: admin.email, roles: ['admin'] };
          req.user = {
            id: admin._id,
            email: admin.email,
            roles: ['admin'],
            role: 'admin',
            isProfileComplete: true,
            isVerified: true,
            subscription: null
          };
          return next();
        }
        // Si admin pas trouvé, essayer User (fallback pour les users avec rôle admin)
        console.log('⚠️ Admin non trouvé avec ID:', decoded.id, '- Recherche dans User...');
        const currentUser = await User.findById(decoded.id)
          .select('email roles role subscription isVerified isProfileComplete')
          .lean()
          .exec();
        if (currentUser) {
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
          if (roles.includes('admin')) {
            req.admin = { id: currentUser._id, email: currentUser.email, roles: ['admin'] };
            console.log('✅ User avec rôle admin trouvé:', currentUser.email);
          } else {
            console.log('⚠️ User trouvé mais sans rôle admin:', currentUser.email);
          }
          return next();
        }
        console.error('❌ Ni Admin ni User trouvé avec ID:', decoded.id);
        return res.status(401).json({ success: false, message: "Admin ou utilisateur introuvable pour ce token" });
      } catch (err) {
        console.error('Error finding admin in protectUserOrAdmin:', err);
        return res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'admin" });
      }
    }

    // Si les secrets sont identiques, essayer d'abord dans Admin puis dans User
    if (adminSecret === userSecret) {
      // Essayer d'abord dans Admin
      try {
        const admin = await Admin.findById(decoded.id)
          .select('email')
          .lean()
          .exec();
        if (admin) {
          req.admin = { id: admin._id, email: admin.email, roles: ['admin'] };
          req.user = {
            id: admin._id,
            email: admin.email,
            roles: ['admin'],
            role: 'admin',
            isProfileComplete: true,
            isVerified: true,
            subscription: null
          };
          return next();
        }
      } catch (err) {
        console.error('Error finding admin (secrets identical) in protectUserOrAdmin:', err);
        // Continue to try User
      }
    }

    // Sinon, chercher dans User
    const currentUser = await User.findById(decoded.id)
      .select('email roles role subscription isVerified isProfileComplete')
      .lean()
      .exec();

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "L'utilisateur associé à ce token n'existe plus (ID: " + decoded.id + ")" });
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
    console.error('flexibleAuthMiddleware.protectUserOrAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

