const supportedLanguages = ['fr', 'en', 'ar'];

module.exports = (req, res, next) => {
  // 1. Vérifier le paramètre de requête
  if (req.query.lang && supportedLanguages.includes(req.query.lang)) {
    req.language = req.query.lang;
    return next();
  }

  // 2. Vérifier le header Accept-Language
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',')
      .map(lang => lang.split(';')[0].trim().substring(0, 2));
    
    for (const lang of languages) {
      if (supportedLanguages.includes(lang)) {
        req.language = lang;
        return next();
      }
    }
  }

  // 3. Vérifier les cookies
  if (req.cookies?.language && supportedLanguages.includes(req.cookies.language)) {
    req.language = req.cookies.language;
    return next();
  }

  // 4. Défaut : français
  req.language = 'fr';
  next();
};