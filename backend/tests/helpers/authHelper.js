const jwt = require('jsonwebtoken');

/**
 * Helper pour générer des tokens JWT pour les tests
 */
module.exports = {
  /**
   * Génère un token JWT pour un utilisateur
   */
  generateToken(userId, options = {}) {
    const secret = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
    const payload = {
      id: userId.toString(),
      ...options
    };
    
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  },

  /**
   * Génère des headers d'authentification pour les requêtes
   */
  getAuthHeaders(userId, options = {}) {
    const token = this.generateToken(userId, options);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  /**
   * Génère un cookie d'authentification
   */
  getAuthCookie(userId, options = {}) {
    const token = this.generateToken(userId, options);
    return `token=${token}`;
  }
};

