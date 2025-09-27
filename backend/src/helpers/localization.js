module.exports.getLocalizedContent = (translations, language, field = null) => {
  const defaultLang = 'fr';
  
  if (field) {
    return translations[language]?.[field] || 
           translations[defaultLang]?.[field] || 
           '';
  }
  
  return translations[language] || translations[defaultLang] || {};
};