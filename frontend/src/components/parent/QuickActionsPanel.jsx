// src/components/parent/QuickActionsPanel.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

const ActionsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px 20px 0 0;
  }
`;

const ActionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ActionsTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
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

const ActionIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const ActionTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ActionDescription = styled.p`
  color: #6c757d;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
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

  &.success {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);

    &:hover {
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
    }
  }

  &.warning {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);

    &:hover {
      background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
    }
  }
`;

const EmergencySection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(231, 76, 60, 0.2);
`;

const EmergencyTitle = styled.h4`
  color: #e74c3c;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmergencyActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const EmergencyButton = styled.button`
  padding: 1rem;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #e74c3c;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
  }
`;

const EmergencyIcon = styled.div`
  font-size: 1.5rem;
`;

const EmergencyLabel = styled.div`
  font-size: 0.9rem;
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

export default function QuickActionsPanel({ 
  children = [],
  onAction,
  emergencyActions = true 
}) {
  const [actionStates, setActionStates] = useState({});

  const defaultActions = [
    {
      id: 'pause_all',
      title: 'Pause Immédiate',
      description: 'Suspendre l\'accès de tous les enfants',
      icon: '⏸️',
      color: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      buttonClass: 'warning',
      buttonText: 'Suspendre',
      requiresConfirmation: true
    },
    {
      id: 'extend_time',
      title: 'Temps Supplémentaire',
      description: 'Accorder 30 minutes supplémentaires',
      icon: '⏰',
      color: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      buttonClass: 'primary',
      buttonText: 'Accorder',
      requiresConfirmation: false
    },
    {
      id: 'unlock_content',
      title: 'Débloquer Contenu',
      description: 'Autoriser temporairement le contenu avancé',
      icon: '🔓',
      color: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
      buttonClass: 'success',
      buttonText: 'Débloquer',
      requiresConfirmation: true
    },
    {
      id: 'reward_bonus',
      title: 'Bonus Récompense',
      description: 'Accorder des points bonus à tous les enfants',
      icon: '🎁',
      color: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
      buttonClass: 'primary',
      buttonText: 'Accorder',
      requiresConfirmation: false
    },
    {
      id: 'emergency_override',
      title: 'Contrôle d\'Urgence',
      description: 'Désactiver temporairement tous les contrôles',
      icon: '🚨',
      color: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      buttonClass: 'danger',
      buttonText: 'Activer',
      requiresConfirmation: true
    },
    {
      id: 'send_message',
      title: 'Message Rapide',
      description: 'Envoyer un message à tous les enfants',
      icon: '💬',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      buttonClass: 'primary',
      buttonText: 'Envoyer',
      requiresConfirmation: false
    }
  ];

  const emergencyActionsList = [
    {
      id: 'emergency_pause',
      title: 'Pause d\'Urgence',
      description: 'Arrêt immédiat',
      icon: '🛑'
    },
    {
      id: 'emergency_unlock',
      title: 'Déblocage d\'Urgence',
      description: 'Accès total',
      icon: '🔓'
    },
    {
      id: 'emergency_contact',
      title: 'Contact d\'Urgence',
      description: 'Alerte parent',
      icon: '📞'
    }
  ];

  const handleAction = (action) => {
    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir ${action.title.toLowerCase()} ?`
      );
      if (!confirmed) return;
    }

    setActionStates(prev => ({
      ...prev,
      [action.id]: true
    }));

    // Simuler l'action
    setTimeout(() => {
      setActionStates(prev => ({
        ...prev,
        [action.id]: false
      }));
    }, 2000);

    if (onAction) {
      onAction(action);
    }
  };

  const handleEmergencyAction = (action) => {
    const confirmed = window.confirm(
      `ACTION D'URGENCE: ${action.title}\n\nCette action est irréversible. Continuer ?`
    );
    
    if (confirmed) {
      if (onAction) {
        onAction({ ...action, emergency: true });
      }
    }
  };

  const actions = children.length > 0 ? children : defaultActions;

  return (
    <ActionsContainer>
      <ActionsHeader>
        <ActionsTitle>⚡ Actions Rapides</ActionsTitle>
        <StatusIndicator active={true}>
          ✅ Système actif
        </StatusIndicator>
      </ActionsHeader>

      <ActionsGrid>
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            color={action.color}
            onClick={() => handleAction(action)}
          >
            <ActionIcon>{action.icon}</ActionIcon>
            <ActionTitle>{action.title}</ActionTitle>
            <ActionDescription>{action.description}</ActionDescription>
            <ActionButton
              className={action.buttonClass}
              disabled={actionStates[action.id]}
            >
              {actionStates[action.id] ? '⏳ En cours...' : action.buttonText}
            </ActionButton>
          </ActionCard>
        ))}
      </ActionsGrid>

      {emergencyActions && (
        <EmergencySection>
          <EmergencyTitle>🚨 Actions d'Urgence</EmergencyTitle>
          <EmergencyActions>
            {emergencyActionsList.map((action) => (
              <EmergencyButton
                key={action.id}
                onClick={() => handleEmergencyAction(action)}
              >
                <EmergencyIcon>{action.icon}</EmergencyIcon>
                <EmergencyLabel>{action.title}</EmergencyLabel>
              </EmergencyButton>
            ))}
          </EmergencyActions>
        </EmergencySection>
      )}
    </ActionsContainer>
  );
}
