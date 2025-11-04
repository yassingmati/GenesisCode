import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const LevelUnlockNotification = ({ 
  isVisible, 
  onClose, 
  nextLevel, 
  autoHide = true,
  duration = 5000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoHide, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Attendre la fin de l'animation
  };

  if (!isVisible) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      maxWidth: '400px',
      width: '100%'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Effet de brillance */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: 'shine 2s infinite'
        }} />

        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ×
        </button>

        {/* Contenu de la notification */}
        <div style={{ paddingRight: '32px' }}>
          {/* Icône et titre */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '32px',
              animation: 'bounce 1s infinite'
            }}>
              🎉
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '700'
              }}>
                Niveau Débloqué !
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                opacity: 0.9
              }}>
                Félicitations !
              </p>
            </div>
          </div>

          {/* Détails du niveau */}
          {nextLevel && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {nextLevel.levelName || 'Nouveau niveau'}
              </div>
              <div style={{
                fontSize: '0.8rem',
                opacity: 0.8
              }}>
                {nextLevel.message || 'Vous pouvez maintenant accéder à ce niveau'}
              </div>
            </div>
          )}

          {/* Message d'encouragement */}
          <div style={{
            fontSize: '0.85rem',
            opacity: 0.9,
            fontStyle: 'italic'
          }}>
            Continuez votre apprentissage ! 🚀
          </div>
        </div>

        {/* Barre de progression pour l'auto-hide */}
        {autoHide && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'rgba(255, 255, 255, 0.8)',
              animation: `progress ${duration}ms linear forwards`
            }} />
          </div>
        )}
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes progress {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default LevelUnlockNotification;
