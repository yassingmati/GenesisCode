const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      message: 'Validation error',
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {})
    });
  }
  
  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Erreur Firebase
  if (err.code && err.code.startsWith('storage/')) {
    return res.status(500).json({ 
      message: 'Storage error',
      error: err.message 
    });
  }
  
  // Erreur MongoDB
  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  // Erreur générique
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};