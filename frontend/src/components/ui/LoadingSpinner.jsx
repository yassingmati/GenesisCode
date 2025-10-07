import React from 'react';

/**
 * Composant LoadingSpinner - Indicateur de chargement
 */
const LoadingSpinner = ({ 
  message = 'Chargement...', 
  size = 'medium',
  color = 'primary'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'spinner-small';
      case 'large': return 'spinner-large';
      default: return 'spinner-medium';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'secondary': return 'spinner-secondary';
      case 'success': return 'spinner-success';
      case 'warning': return 'spinner-warning';
      case 'error': return 'spinner-error';
      default: return 'spinner-primary';
    }
  };

  return (
    <div className={`loading-spinner ${getSizeClass()} ${getColorClass()}`}>
      <div className="spinner-container">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="spinner-message">
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;