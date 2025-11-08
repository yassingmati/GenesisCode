// Middleware pour vérifier la connexion MongoDB
const mongoose = require('mongoose');

/**
 * Middleware pour vérifier si MongoDB est connecté
 * Retourne une erreur 503 si MongoDB n'est pas connecté
 */
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Service temporairement indisponible. La base de données n\'est pas connectée. Veuillez réessayer plus tard.',
      error: 'MongoDB not connected',
      status: 'degraded'
    });
  }
  next();
};

/**
 * Middleware optionnel qui n'interrompt pas si MongoDB n'est pas connecté
 * Mais ajoute un flag dans la requête
 */
const optionalMongoCheck = (req, res, next) => {
  req.mongoConnected = mongoose.connection.readyState === 1;
  next();
};

module.exports = {
  checkMongoConnection,
  optionalMongoCheck
};

