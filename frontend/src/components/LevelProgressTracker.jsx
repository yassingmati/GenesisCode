// src/components/LevelProgressTracker.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import CategoryPaymentService from '../services/categoryPaymentService';

const ProgressContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  margin: 1rem 0;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const LevelList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
`;

const LevelItem = styled.div`
  background: ${props => props.unlocked ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.unlocked ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: ${props => props.unlocked ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.unlocked ? 1 : 0.5};
  position: relative;
  
  &:hover {
    transform: ${props => props.unlocked ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.unlocked ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none'};
  }
  
  ${props => !props.unlocked && `
    &::before {
      content: '🔒';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 1.2rem;
    }
  `}
`;

const LevelNumber = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
`;

const LevelStatus = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const UnlockButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background: #45a049;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LevelProgressTracker = ({ 
  categoryId, 
  pathId, 
  onLevelUnlocked,
  onLevelAccessGranted 
}) => {
  const [levels, setLevels] = useState([]);
  const [unlockedLevels, setUnlockedLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(null);

  useEffect(() => {
    if (categoryId && pathId) {
      fetchLevels();
    }
  }, [categoryId, pathId]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      
      // Récupérer les niveaux du parcours
      const response = await fetch(`/api/paths/${pathId}/levels`);
      if (response.ok) {
        const data = await response.json();
        setLevels(data.levels || []);
      }
      
      // Récupérer les niveaux débloqués
      await fetchUnlockedLevels();
      
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Erreur lors du chargement des niveaux');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnlockedLevels = async () => {
    try {
      const unlocked = [];
      
      for (const level of levels) {
        const accessResponse = await CategoryPaymentService.checkLevelAccess(
          categoryId, 
          pathId, 
          level._id
        );
        
        if (accessResponse.success && accessResponse.access.hasAccess) {
          unlocked.push(level._id);
        }
      }
      
      setUnlockedLevels(unlocked);
      
    } catch (error) {
      console.error('Error fetching unlocked levels:', error);
    }
  };

  const handleUnlockLevel = async (levelId) => {
    try {
      setUnlocking(levelId);
      
      const response = await CategoryPaymentService.unlockLevel(
        categoryId, 
        pathId, 
        levelId
      );
      
      if (response.success) {
        setUnlockedLevels(prev => [...prev, levelId]);
        toast.success('Niveau débloqué avec succès !');
        onLevelUnlocked && onLevelUnlocked(levelId);
      }
      
    } catch (error) {
      console.error('Error unlocking level:', error);
      toast.error('Erreur lors du déblocage du niveau');
    } finally {
      setUnlocking(null);
    }
  };

  const handleLevelClick = (level) => {
    if (isLevelUnlocked(level._id)) {
      onLevelAccessGranted && onLevelAccessGranted(level);
    } else {
      // Empêcher l'accès aux niveaux verrouillés
      toast.warning('Ce niveau est verrouillé. Complétez les niveaux précédents pour continuer.');
    }
  };

  const isLevelUnlocked = (levelId) => {
    return unlockedLevels.includes(levelId);
  };

  const getLevelStatus = (level, index) => {
    if (isLevelUnlocked(level._id)) {
      return 'Débloqué';
    } else if (index === 0) {
      return 'Gratuit';
    } else {
      return 'Verrouillé';
    }
  };

  const getProgressPercentage = () => {
    if (levels.length === 0) return 0;
    return (unlockedLevels.length / levels.length) * 100;
  };

  if (loading) {
    return (
      <ProgressContainer>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner />
          <p>Chargement des niveaux...</p>
        </div>
      </ProgressContainer>
    );
  }

  return (
    <ProgressContainer>
      <ProgressHeader>
        <Title>Progression des Niveaux</Title>
        <div>
          {unlockedLevels.length} / {levels.length} débloqués
        </div>
      </ProgressHeader>
      
      <ProgressBar>
        <ProgressFill percentage={getProgressPercentage()} />
      </ProgressBar>
      
      <LevelList>
        {levels.map((level, index) => (
          <LevelItem
            key={level._id}
            unlocked={isLevelUnlocked(level._id)}
            onClick={() => handleLevelClick(level)}
          >
            <LevelNumber>Niveau {level.order || index + 1}</LevelNumber>
            <LevelStatus>{getLevelStatus(level, index)}</LevelStatus>
            
            {!isLevelUnlocked(level._id) && index > 0 && (
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.8rem', 
                opacity: 0.7,
                color: '#ffcc02'
              }}>
                🔒 Verrouillé
              </div>
            )}
          </LevelItem>
        ))}
      </LevelList>
      
      {levels.length === 0 && (
        <div style={{ textAlign: 'center', opacity: 0.8 }}>
          Aucun niveau disponible pour ce parcours
        </div>
      )}
    </ProgressContainer>
  );
};

export default LevelProgressTracker;
