import React from 'react';

/**
 * Composant ErrorMessage - Affichage des erreurs
 */
const ErrorMessage = ({ 
  message, 
  title = 'Erreur',
  type = 'error',
  onRetry = null,
  onClose = null,
  showDetails = false,
  details = null
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '❌';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'warning': return 'error-warning';
      case 'info': return 'error-info';
      case 'success': return 'error-success';
      default: return 'error-error';
    }
  };

  return (
    <div className={`error-message ${getTypeClass()}`}>
      <div className="error-header">
        <div className="error-icon">
          {getTypeIcon()}
        </div>
        <div className="error-title">
          {title}
        </div>
        {onClose && (
          <button 
            className="error-close"
            onClick={onClose}
            title="Fermer"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="error-content">
        <div className="error-text">
          {message}
        </div>
        
        {showDetails && details && (
          <div className="error-details">
            <details>
              <summary>Détails techniques</summary>
              <pre className="error-details-content">
                {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
      
      {(onRetry || onClose) && (
        <div className="error-actions">
          {onRetry && (
            <button 
              className="error-retry"
              onClick={onRetry}
            >
              🔄 Réessayer
            </button>
          )}
          {onClose && (
            <button 
              className="error-close-btn"
              onClick={onClose}
            >
              ✕ Fermer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;