// src/components/LockedLevelCard.jsx
import React from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const LockedContainer = styled.div`
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border: 2px solid #ddd;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
  position: relative;
  cursor: not-allowed;
  opacity: 0.7;
  transition: all 0.3s ease;
  
  &:hover {
    transform: none;
    box-shadow: none;
  }
  
  &::before {
    content: '🔒';
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 2rem;
    opacity: 0.5;
  }
`;

const LockIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1.3rem;
`;

const Description = styled.p`
  margin: 0 0 1.5rem 0;
  color: #888;
  line-height: 1.5;
  font-size: 1rem;
`;

const Requirements = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #856404;
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  
  &::before {
    content: '✓';
    color: #28a745;
    font-weight: bold;
    margin-right: 0.5rem;
  }
`;

const ProgressInfo = styled.div`
  background: rgba(0, 123, 255, 0.1);
  border: 1px solid #007bff;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #004085;
  font-size: 0.9rem;
`;

const LockedLevelCard = ({ 
  level, 
  categoryId, 
  pathId, 
  onPurchaseCategory,
  requirements = [],
  progressInfo = null 
}) => {
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.warning('Ce niveau est verrouillé. Complétez les niveaux précédents pour continuer.');
  };

  return (
    <LockedContainer onClick={handleClick}>
      <LockIcon>🔒</LockIcon>
      
      <Title>Niveau {level.order} - Verrouillé</Title>
      
      <Description>
        Ce niveau n'est pas encore débloqué. Vous devez compléter les niveaux précédents pour y accéder.
      </Description>
      
      {requirements.length > 0 && (
        <Requirements>
          <strong>Prérequis pour débloquer ce niveau :</strong>
          {requirements.map((req, index) => (
            <RequirementItem key={index}>
              {req}
            </RequirementItem>
          ))}
        </Requirements>
      )}
      
      {progressInfo && (
        <ProgressInfo>
          <strong>Progression :</strong> {progressInfo}
        </ProgressInfo>
      )}
      
      <div style={{ 
        marginTop: '1.5rem', 
        fontSize: '0.9rem', 
        color: '#666',
        fontStyle: 'italic'
      }}>
        💡 Complétez les niveaux précédents pour débloquer ce contenu
      </div>
      
      {onPurchaseCategory && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPurchaseCategory();
            }}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Acheter l'accès à la catégorie
          </button>
        </div>
      )}
    </LockedContainer>
  );
};

export default LockedLevelCard;







