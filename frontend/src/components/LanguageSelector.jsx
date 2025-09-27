import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const LanguageSelector = ({ className = '', showLabel = true, size = 'medium' }) => {
  const { language, setLanguage, currentLanguage, isLoading } = useLanguage();

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-2',
    large: 'text-lg px-4 py-3'
  };

  return (
    <div className={`language-selector ${className}`}>
      {showLabel && (
        <label className="language-label">
          <span className="label-text">Langue:</span>
        </label>
      )}
      
      <motion.select
        className={`language-select ${sizeClasses[size]}`}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </motion.select>
      
      {isLoading && (
        <motion.div
          className="language-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loading-spinner"></div>
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector;
