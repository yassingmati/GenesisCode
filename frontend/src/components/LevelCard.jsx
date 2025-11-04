// src/components/LevelCard.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const LevelContainer = styled.div`
  background: ${props => props.unlocked ? 'white' : '#f8f9fa'};
  border: 2px solid ${props => props.unlocked ? '#28a745' : '#dee2e6'};
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  transition: all 0.3s ease;
  cursor: pointer;
  opacity: 1;
  position: relative;
  
  &:hover {
    transform: ${props => props.unlocked ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.unlocked ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'};
  }
  
  
`;

const LevelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const LevelTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
`;

const LevelStatus = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #d4edda;
  color: #155724;
`;

const LevelDescription = styled.p`
  margin: 0 0 1rem 0;
  color: ${props => props.unlocked ? '#666' : '#999'};
  line-height: 1.5;
`;

const LevelActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#545b62'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

// Access control removed

const LevelCard = ({ 
  level, 
  onLevelClick,
  onPurchaseCategory,
  showActions = true 
}) => {
  // Access control removed

  const handleLevelClick = (e) => {
    onLevelClick && onLevelClick(level);
  };

  const handlePurchaseClick = (e) => {
    e.stopPropagation();
    onPurchaseCategory && onPurchaseCategory();
  };

  // Loading/access checks removed

  const isUnlocked = true;

  return (
    <LevelContainer onClick={handleLevelClick}>
      
      <LevelHeader>
        <LevelTitle>
          Niveau {level.order}
        </LevelTitle>
        <LevelStatus>
          Débloqué
        </LevelStatus>
      </LevelHeader>
      
      <LevelDescription>
        {level.translations?.fr?.content || 'Contenu du niveau'}
      </LevelDescription>
      
      {showActions && (
        <LevelActions>
          <ActionButton primary onClick={handleLevelClick}>
            Commencer
          </ActionButton>
        </LevelActions>
      )}
    </LevelContainer>
  );
};

export default LevelCard;
