import React from 'react';
import './LanguageCard.css';

const LanguageCard = ({ 
  language, 
  colors, 
  onClick, 
  isHovered = false,
  index = 0 
}) => {
  return (
    <div
      className={`language-card ${isHovered ? 'hovered' : ''}`}
      onClick={onClick}
      style={{
        '--card-bg': colors.bg,
        '--card-border': colors.border,
        '--card-text': colors.text,
        '--animation-delay': `${index * 0.1}s`
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Sélectionner ${language}`}
    >
      {/* Decorative background */}
      <div className="card-decoration" />
      
      <div className="card-content">
        <h3 className="language-name">
          {language}
        </h3>
        
        <p className="language-description">
          Commence ton apprentissage en {language}
        </p>
        
        <div className="language-action">
          Voir les parcours →
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="card-overlay" />
    </div>
  );
};

export default LanguageCard;
