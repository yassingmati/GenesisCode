// src/components/QuickControls.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

const QuickControlsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const ControlsTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ControlCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ControlHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ControlIcon = styled.div`
  font-size: 2rem;
  opacity: 0.8;
`;

const ControlTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ControlDescription = styled.p`
  color: #6c757d;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ControlActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ControlButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    
    &::before {
      left: 100%;
    }
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  }

  &.danger {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);

    &:hover {
      background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
    }
  }
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #27ae60, #2ecc71)' 
    : 'linear-gradient(135deg, #95a5a6, #7f8c8d)'
  };
  color: white;
  margin-bottom: 1rem;
`;

export default function QuickControls({ children, onControlUpdate }) {
  const [controls, setControls] = useState({
    timeLimits: true,
    contentRestrictions: true,
    notifications: true,
    weeklyGoals: true
  });

  const handleToggleControl = (controlType) => {
    setControls(prev => ({
      ...prev,
      [controlType]: !prev[controlType]
    }));
    
    if (onControlUpdate) {
      onControlUpdate(controlType, !controls[controlType]);
    }
  };

  const handleQuickAction = (action, childId) => {
    console.log(`Action: ${action} pour enfant: ${childId}`);
    // Ici vous pouvez implémenter les actions rapides
  };

  return (
    <QuickControlsContainer>
      <ControlsTitle>⚡ Contrôles Rapides</ControlsTitle>
      
      <ControlsGrid>
        <ControlCard color="linear-gradient(135deg, #f39c12 0%, #e67e22 100%)">
          <ControlHeader>
            <ControlIcon>⏰</ControlIcon>
            <ControlTitle>Limites de Temps</ControlTitle>
          </ControlHeader>
          <ControlDescription>
            Gérez rapidement les limites de temps quotidiennes et hebdomadaires
          </ControlDescription>
          <StatusIndicator active={controls.timeLimits}>
            {controls.timeLimits ? '✅ Activé' : '❌ Désactivé'}
          </StatusIndicator>
          <ControlActions>
            <ControlButton onClick={() => handleToggleControl('timeLimits')}>
              {controls.timeLimits ? 'Désactiver' : 'Activer'}
            </ControlButton>
            <ControlButton className="primary" onClick={() => handleQuickAction('adjustTime', 'all')}>
              Ajuster
            </ControlButton>
          </ControlActions>
        </ControlCard>

        <ControlCard color="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
          <ControlHeader>
            <ControlIcon>🔒</ControlIcon>
            <ControlTitle>Restrictions de Contenu</ControlTitle>
          </ControlHeader>
          <ControlDescription>
            Contrôlez l'accès aux contenus et la difficulté des exercices
          </ControlDescription>
          <StatusIndicator active={controls.contentRestrictions}>
            {controls.contentRestrictions ? '✅ Activé' : '❌ Désactivé'}
          </StatusIndicator>
          <ControlActions>
            <ControlButton onClick={() => handleToggleControl('contentRestrictions')}>
              {controls.contentRestrictions ? 'Désactiver' : 'Activer'}
            </ControlButton>
            <ControlButton className="primary" onClick={() => handleQuickAction('adjustContent', 'all')}>
              Configurer
            </ControlButton>
          </ControlActions>
        </ControlCard>

        <ControlCard color="linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)">
          <ControlHeader>
            <ControlIcon>🔔</ControlIcon>
            <ControlTitle>Notifications</ControlTitle>
          </ControlHeader>
          <ControlDescription>
            Gérez les notifications et alertes pour tous vos enfants
          </ControlDescription>
          <StatusIndicator active={controls.notifications}>
            {controls.notifications ? '✅ Activé' : '❌ Désactivé'}
          </StatusIndicator>
          <ControlActions>
            <ControlButton onClick={() => handleToggleControl('notifications')}>
              {controls.notifications ? 'Désactiver' : 'Activer'}
            </ControlButton>
            <ControlButton className="primary" onClick={() => handleQuickAction('configureNotifications', 'all')}>
              Configurer
            </ControlButton>
          </ControlActions>
        </ControlCard>

        {/* Objectifs Hebdomadaires supprimé pour simplifier l'interface */}
      </ControlsGrid>
    </QuickControlsContainer>
  );
}
