import React, { useState, useEffect } from 'react';
import { getCategoryUnlockStatus, getPathUnlockStatus } from '../services/courseService';
import { useAuth } from '../hooks/useAuth';

const LevelUnlockStatus = ({ 
  levelId, 
  pathId, 
  categoryId, 
  levelOrder, 
  levelName,
  compact = false 
}) => {
  const { user } = useAuth();
  const [unlockStatus, setUnlockStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnlockStatus = async () => {
      if (!user?.id || !levelId) {
        setLoading(false);
        return;
      }

      try {
        let status;
        if (categoryId) {
          status = await getCategoryUnlockStatus(user.id, categoryId);
        } else if (pathId) {
          status = await getPathUnlockStatus(user.id, pathId);
        } else {
          setLoading(false);
          return;
        }

        setUnlockStatus(status);
      } catch (error) {
        console.error('Erreur chargement statut déblocage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUnlockStatus();
  }, [user?.id, levelId, pathId, categoryId]);

  const findLevelAccess = (status, targetLevelId) => {
    if (!status?.paths) return null;

    for (const path of status.paths) {
      const level = path.levels.find(l => l.levelId === targetLevelId);
      if (level) return level;
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.8rem',
        color: '#9ca3af'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#e5e7eb',
          animation: 'pulse 2s infinite'
        }} />
        Chargement...
      </div>
    );
  }

  const levelAccess = findLevelAccess(unlockStatus, levelId);
  
  if (!levelAccess) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.8rem',
        color: '#9ca3af'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#e5e7eb'
        }} />
        Non disponible
      </div>
    );
  }

  const isUnlocked = levelAccess.isUnlocked;
  const isCurrentLevel = levelAccess.levelId === levelId;

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.8rem',
        fontWeight: '600'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          background: isUnlocked 
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : isCurrentLevel
            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
            : '#e5e7eb',
          color: isUnlocked ? 'white' : '#6b7280',
          border: isCurrentLevel ? '2px solid #f59e0b' : 'none'
        }}>
          {isUnlocked ? '✓' : levelOrder + 1}
        </div>
        <span style={{
          color: isUnlocked ? '#059669' : isCurrentLevel ? '#d97706' : '#9ca3af'
        }}>
          {isUnlocked ? 'Débloqué' : isCurrentLevel ? 'Verrouillé' : 'Verrouillé'}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      background: isUnlocked 
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))'
        : isCurrentLevel
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))'
        : '#f9fafb',
      border: isCurrentLevel ? '1px solid #f59e0b' : '1px solid #e5e7eb'
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: '600',
        background: isUnlocked 
          ? 'linear-gradient(135deg, #10b981, #059669)'
          : isCurrentLevel
          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
          : '#e5e7eb',
        color: isUnlocked ? 'white' : '#6b7280'
      }}>
        {isUnlocked ? '✓' : levelOrder + 1}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: isUnlocked ? '#059669' : isCurrentLevel ? '#d97706' : '#6b7280'
        }}>
          {levelName}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: '#9ca3af'
        }}>
          {isUnlocked 
            ? 'Niveau débloqué' 
            : isCurrentLevel 
            ? 'Niveau verrouillé - Complétez le niveau précédent'
            : 'Niveau verrouillé'
          }
        </div>
      </div>

      {isCurrentLevel && !isUnlocked && (
        <div style={{
          fontSize: '0.7rem',
          color: '#d97706',
          fontWeight: '600',
          padding: '2px 6px',
          borderRadius: '4px',
          background: 'rgba(245, 158, 11, 0.1)'
        }}>
          🔒
        </div>
      )}
    </div>
  );
};

export default LevelUnlockStatus;
