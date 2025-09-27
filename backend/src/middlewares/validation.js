const { isValidObjectId } = require('mongoose');

exports.validateObjectId = (paramName) => (req, res, next) => {
  if (!isValidObjectId(req.params[paramName])) {
    return res.status(400).json({ error: 'Format ID invalide' });
  }
  next();
};

exports.validateTranslations = (req, res, next) => {
  const translations = req.body.translations;
  const required = ['fr', 'en', 'ar'];
  
  if (!translations) {
    return res.status(400).json({ error: 'Traductions requises' });
  }
  
  const missing = required.filter(lang => !translations[lang]?.name);
  if (missing.length) {
    return res.status(400).json({ 
      error: `Traductions manquantes: ${missing.join(', ')}` 
    });
  }
  
  next();
};