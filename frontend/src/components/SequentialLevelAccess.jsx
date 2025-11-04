import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoryUnlockStatus, getPathUnlockStatus } from '../services/courseService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';

const SequentialLevelAccess = ({ 
  children, 
  levelId, 
  pathId, 
  categoryId, 
  onAccessDenied,
  showUnlockStatus = true 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unlockStatus, setUnlockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id || !levelId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer le statut de déblocage
        let status;
        if (categoryId) {
          status = await getCategoryUnlockStatus(user.id, categoryId);
        } else if (pathId) {
          status = await getPathUnlockStatus(user.id, pathId);
        } else {
          throw new Error('CategoryId ou PathId requis pour vérifier l\'accès');
        }

        setUnlockStatus(status);

        // Vérifier si l'utilisateur a accès à ce niveau
        const levelAccess = findLevelAccess(status, levelId);
        setHasAccess(levelAccess?.canAccess || false);

        if (!levelAccess?.canAccess && onAccessDenied) {
          onAccessDenied(levelAccess);
        }

      } catch (err) {
        console.error('Erreur vérification accès niveau:', err);
        setError(err.message);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user?.id, levelId, pathId, categoryId, onAccessDenied]);

  const findLevelAccess = (status, targetLevelId) => {
    if (!status?.paths) return null;

    for (const path of status.paths) {
      const level = path.levels.find(l => l.levelId === targetLevelId);
      if (level) {
        return {
          ...level,
          pathName: path.pathName,
          pathOrder: path.pathOrder
        };
      }
    }
    return null;
  };

  const handleUnlockAction = () => {
    if (unlockStatus?.categoryPlan) {
      // Rediriger vers la page de paiement
      navigate(`/category-plans/${unlockStatus.categoryId}`);
    } else {
      // Rediriger vers le niveau précédent
      const previousLevel = findPreviousUnlockedLevel();
      if (previousLevel) {
        navigate(`/courses/levels/${previousLevel.levelId}`);
      }
    }
  };

  const findPreviousUnlockedLevel = () => {
    if (!unlockStatus?.paths) return null;

    for (const path of unlockStatus.paths) {
      const unlockedLevels = path.levels.filter(l => l.isUnlocked);
      if (unlockedLevels.length > 0) {
        return unlockedLevels[unlockedLevels.length - 1];
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!hasAccess) {
    const levelAccess = findLevelAccess(unlockStatus, levelId);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Inter, system-ui'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {/* Icône de verrouillage */}
          <div style={{
            fontSize: '64px',
            marginBottom: '20px',
            opacity: 0.7
          }}>
            🔒
          </div>

          {/* Titre */}
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            Niveau Verrouillé
          </h2>

          {/* Message */}
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.6'
          }}>
            {unlockStatus?.categoryPlan 
              ? 'Vous devez acheter l\'accès à cette catégorie pour débloquer ce niveau.'
              : 'Complétez les niveaux précédents pour débloquer ce niveau.'
            }
          </p>

          {/* Statut de déblocage */}
          {showUnlockStatus && unlockStatus && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Progression
              </h3>
              
              {unlockStatus.paths.map(path => (
                <div key={path.pathId} style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '8px'
                  }}>
                    {path.pathName}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {path.levels.map(level => (
                      <div
                        key={level.levelId}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: level.isUnlocked 
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : level.levelId === levelId
                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                            : '#e5e7eb',
                          color: level.isUnlocked ? 'white' : '#6b7280',
                          border: level.levelId === levelId ? '2px solid #f59e0b' : 'none'
                        }}
                        title={level.levelName}
                      >
                        {level.levelOrder + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {unlockStatus?.categoryPlan ? (
              <button
                onClick={handleUnlockAction}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                💳 Acheter l'accès
              </button>
            ) : (
              <button
                onClick={handleUnlockAction}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                ← Retour au niveau précédent
              </button>
            )}
            
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                padding: '12px 24px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              🏠 Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  // L'utilisateur a accès, afficher le contenu
  return children;
};

export default SequentialLevelAccess;
