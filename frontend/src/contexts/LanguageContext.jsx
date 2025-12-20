import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export { LanguageContext };

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Récupérer la langue sauvegardée ou utiliser le français par défaut
    const savedLanguage = localStorage.getItem('codegenesis-language');
    return savedLanguage || 'fr';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sauvegarder la langue dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('codegenesis-language', language);
  }, [language]);

  const changeLanguage = async (newLanguage) => {
    setIsLoading(true);
    try {
      // Simuler un délai pour l'effet de transition
      await new Promise(resolve => setTimeout(resolve, 300));
      setLanguage(newLanguage);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageInfo = (langCode) => {
    const languages = {
      fr: { code: 'fr', label: 'Français', flag: '🇫🇷', direction: 'ltr' },
      en: { code: 'en', label: 'English', flag: '🇺🇸', direction: 'ltr' },
      ar: { code: 'ar', label: 'العربية', flag: '🇹🇳', direction: 'rtl' }
    };
    return languages[langCode] || languages.fr;
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    isLoading,
    getLanguageInfo,
    currentLanguage: getLanguageInfo(language)
  };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={getLanguageInfo(language).direction}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
