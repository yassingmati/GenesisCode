const logger = require('../config/logger');

exports.languageMiddleware = (req, res, next) => {
  const acceptedLangs = ['fr', 'en', 'ar'];
  req.language = 
    req.query.lang || 
    req.headers['accept-language']?.split(',')[0]?.substring(0, 2) || 
    'fr';
  
  if (!acceptedLangs.includes(req.language)) {
    req.language = 'fr';
  }
  
  logger.debug(`Language detected: ${req.language}`);
  next();
};

// Middleware de validation des ObjectId
exports.validateObjectId = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

// Middleware de validation des traductions
exports.validateTranslations = (field) => (req, res, next) => {
  const translations = req.body[field];
  
  if (!translations || 
      typeof translations.fr !== 'string' || 
      typeof translations.en !== 'string' || 
      typeof translations.ar !== 'string') {
    return res.status(400).json({ 
      error: 'Translations must include fr, en and ar as strings' 
    });
  }
  
  next();
};