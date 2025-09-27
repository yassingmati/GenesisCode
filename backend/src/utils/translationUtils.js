const logger = require('../config/logger');

exports.validateTranslations = (translations) => {
  const valid = 
    translations &&
    typeof translations.fr === 'string' &&
    typeof translations.en === 'string' &&
    typeof translations.ar === 'string';
  
  if (!valid) {
    logger.warn(`Invalid translation format: ${JSON.stringify(translations)}`);
  }
  
  return valid;
};

exports.getLocalized = (obj, lang) => {
  const languages = ['fr', 'en', 'ar'];
  const defaultLang = 'fr';
  
  if (!obj) return null;
  
  if (typeof obj === 'object') {
    // Pour les objets de traduction
    return obj[lang] || obj[defaultLang] || Object.values(obj)[0];
  }
  
  return obj;
};