// src/components/CategoryLanguageSelector.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api';
import './CategoryLanguageSelector.css';

const CategoryLanguageSelector = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', description: 'Apprendre en français' },
    { code: 'en', label: 'English', flag: '🇺🇸', description: 'Learn in English' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳', description: 'تعلم بالعربية', isRTL: true }
  ];

  useEffect(() => {
    loadCategories();
  }, [selectedLanguage]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(API_CONFIG.getFullUrl('/courses/categories'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const cats = data.categories || [];

        // Filtrer les catégories qui ont du contenu dans la langue sélectionnée
        const categoriesWithLanguage = cats.filter(cat => {
          const translation = cat.translations?.[selectedLanguage];
          return translation && translation.name;
        });

        setCategories(categoriesWithLanguage);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
  };

  const handleCategorySelect = (category) => {
    navigate(`/courses/category/${category._id}`);
  };

  const selectedLang = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="category-language-selector">
      <motion.div
        className="selector-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* En-tête */}
        <div className="selector-header">
          <h2 className="selector-title">
            <span className="title-icon">🌍</span>
            {t('chooseYourLanguage') || 'Choisissez votre langue'}
          </h2>
          <p className="selector-subtitle">
            {t('selectLanguageDesc') || 'Sélectionnez la langue dans laquelle vous souhaitez apprendre'}
          </p>
        </div>

        {/* Sélection de langue */}
        <div className="language-cards">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              className={`language-card ${selectedLanguage === lang.code ? 'selected' : ''}`}
              onClick={() => handleLanguageSelect(lang.code)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="language-flag">{lang.flag}</div>
              <h3 className={`language-label ${lang.isRTL ? 'rtl' : ''}`}>{lang.label}</h3>
              <p className={`language-description ${lang.isRTL ? 'rtl' : ''}`}>{lang.description}</p>
              {selectedLanguage === lang.code && (
                <motion.div
                  className="selected-indicator"
                  layoutId="selected"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Catégories disponibles dans la langue sélectionnée */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLanguage}
            className="categories-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">📚</span>
                {t('availableCategories') || 'Catégories disponibles'} ({selectedLang?.label})
              </h3>
              <p className="section-subtitle">
                {categories.length} {t('categoriesAvailable') || 'catégories disponibles'}
              </p>
            </div>

            {loading ? (
              <div className="categories-loading">
                <div className="loading-spinner"></div>
                <p>{t('loading') || 'Chargement...'}</p>
              </div>
            ) : categories.length > 0 ? (
              <div className="categories-grid">
                {categories.map((category, index) => {
                  const translation = category.translations?.[selectedLanguage];

                  return (
                    <motion.div
                      key={category._id}
                      className="category-card"
                      onClick={() => handleCategorySelect(category)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="category-content">
                        <div className="category-header">
                          <h4 className={`category-name ${selectedLang?.isRTL ? 'rtl' : ''}`}>
                            {translation?.name || category.name}
                          </h4>
                          <span className="category-icon">→</span>
                        </div>
                        <p className={`category-description ${selectedLang?.isRTL ? 'rtl' : ''}`}>
                          {translation?.description || category.description || t('noDescription')}
                        </p>
                        <div className="category-footer">
                          <span className="category-badge">
                            {selectedLang?.flag} {selectedLang?.label}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="no-categories">
                <div className="no-categories-icon">📭</div>
                <h4>{t('noCategoriesAvailable') || 'Aucune catégorie disponible'}</h4>
                <p>{t('noCategoriesInLanguage') || `Aucune catégorie n'est encore disponible en ${selectedLang?.label}`}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CategoryLanguageSelector;

