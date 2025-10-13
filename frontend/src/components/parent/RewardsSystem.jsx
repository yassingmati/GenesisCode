// src/components/parent/RewardsSystem.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const RewardsContainer = styled.div`
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
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    border-radius: 20px 20px 0 0;
  }
`;

const RewardsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const RewardsTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SwitchLabel = styled.span`
  font-weight: 500;
  color: #495057;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  }

  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ccc;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h4`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PointsConfig = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PointsCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const PointsIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const PointsLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const PointsInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 2px solid rgba(243, 156, 18, 0.2);
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f39c12;
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
  }
`;

const RewardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RewardItem = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  }
`;

const RewardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const RewardTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
`;

const RewardCost = styled.div`
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
`;

const RewardDescription = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const RewardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #495057;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  &.edit {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border-color: transparent;

    &:hover {
      background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
    }
  }

  &.delete {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    border-color: transparent;

    &:hover {
      background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
    }
  }
`;

const AddRewardForm = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px dashed rgba(243, 156, 18, 0.3);
  margin-bottom: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border: 2px solid rgba(243, 156, 18, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f39c12;
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid rgba(243, 156, 18, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f39c12;
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.1);
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const FormButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
    }
  }

  &.secondary {
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);

    &:hover {
      background: rgba(108, 117, 125, 0.2);
    }
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default function RewardsSystem({ 
  rewards = {}, 
  onRewardsChange, 
  onSave,
  loading = false,
  saving = false 
}) {
  const [localRewards, setLocalRewards] = useState({
    enabled: true,
    pointsPerExercise: 10,
    pointsPerHour: 50,
    bonusPoints: 25,
    rewardThresholds: [],
    ...rewards
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newReward, setNewReward] = useState({
    points: '',
    reward: '',
    description: ''
  });

  useEffect(() => {
    setLocalRewards({ ...rewards });
  }, [rewards]);

  const handleRewardsChange = (key, value) => {
    const newRewards = { ...localRewards, [key]: value };
    setLocalRewards(newRewards);
    if (onRewardsChange) {
      onRewardsChange(newRewards);
    }
  };

  const addReward = () => {
    if (!newReward.points || !newReward.reward) return;

    const newRewards = {
      ...localRewards,
      rewardThresholds: [
        ...localRewards.rewardThresholds,
        {
          points: parseInt(newReward.points),
          reward: newReward.reward,
          description: newReward.description
        }
      ]
    };
    
    setLocalRewards(newRewards);
    setNewReward({ points: '', reward: '', description: '' });
    setShowAddForm(false);
    
    if (onRewardsChange) {
      onRewardsChange(newRewards);
    }
  };

  const removeReward = (index) => {
    const newRewards = {
      ...localRewards,
      rewardThresholds: localRewards.rewardThresholds.filter((_, i) => i !== index)
    };
    
    setLocalRewards(newRewards);
    if (onRewardsChange) {
      onRewardsChange(newRewards);
    }
  };

  const editReward = (index, updatedReward) => {
    const newRewards = {
      ...localRewards,
      rewardThresholds: localRewards.rewardThresholds.map((reward, i) => 
        i === index ? updatedReward : reward
      )
    };
    
    setLocalRewards(newRewards);
    if (onRewardsChange) {
      onRewardsChange(newRewards);
    }
  };

  return (
    <RewardsContainer>
      <RewardsHeader>
        <RewardsTitle>🏆 Système de Récompenses</RewardsTitle>
        <ToggleSwitch>
          <SwitchLabel>Système activé</SwitchLabel>
          <Switch>
            <SwitchInput
              type="checkbox"
              checked={localRewards.enabled}
              onChange={(e) => handleRewardsChange('enabled', e.target.checked)}
            />
            <SwitchSlider />
          </Switch>
        </ToggleSwitch>
      </RewardsHeader>

      {localRewards.enabled && (
        <>
          {/* Configuration des points */}
          <Section>
            <SectionTitle>⚙️ Configuration des Points</SectionTitle>
            <PointsConfig>
              <PointsCard>
                <PointsIcon>📚</PointsIcon>
                <PointsLabel>Points par exercice</PointsLabel>
                <PointsInput
                  type="number"
                  value={localRewards.pointsPerExercise}
                  onChange={(e) => handleRewardsChange('pointsPerExercise', parseInt(e.target.value))}
                  min="0"
                />
              </PointsCard>
              <PointsCard>
                <PointsIcon>⏰</PointsIcon>
                <PointsLabel>Points par heure</PointsLabel>
                <PointsInput
                  type="number"
                  value={localRewards.pointsPerHour}
                  onChange={(e) => handleRewardsChange('pointsPerHour', parseInt(e.target.value))}
                  min="0"
                />
              </PointsCard>
              <PointsCard>
                <PointsIcon>🎯</PointsIcon>
                <PointsLabel>Points bonus</PointsLabel>
                <PointsInput
                  type="number"
                  value={localRewards.bonusPoints}
                  onChange={(e) => handleRewardsChange('bonusPoints', parseInt(e.target.value))}
                  min="0"
                />
              </PointsCard>
            </PointsConfig>
          </Section>

          {/* Liste des récompenses */}
          <Section>
            <SectionTitle>🎁 Récompenses Disponibles</SectionTitle>
            <RewardsList>
              {localRewards.rewardThresholds.map((reward, index) => (
                <RewardItem key={index}>
                  <RewardHeader>
                    <RewardTitle>{reward.reward}</RewardTitle>
                    <RewardCost>{reward.points} points</RewardCost>
                  </RewardHeader>
                  {reward.description && (
                    <RewardDescription>{reward.description}</RewardDescription>
                  )}
                  <RewardActions>
                    <ActionButton 
                      className="edit"
                      onClick={() => {
                        // TODO: Implémenter l'édition
                        console.log('Edit reward', index);
                      }}
                    >
                      ✏️ Modifier
                    </ActionButton>
                    <ActionButton 
                      className="delete"
                      onClick={() => removeReward(index)}
                    >
                      🗑️ Supprimer
                    </ActionButton>
                  </RewardActions>
                </RewardItem>
              ))}
            </RewardsList>

            {/* Formulaire d'ajout */}
            {showAddForm ? (
              <AddRewardForm>
                <FormRow>
                  <FormInput
                    type="text"
                    placeholder="Nom de la récompense"
                    value={newReward.reward}
                    onChange={(e) => setNewReward({ ...newReward, reward: e.target.value })}
                  />
                  <FormInput
                    type="number"
                    placeholder="Points requis"
                    value={newReward.points}
                    onChange={(e) => setNewReward({ ...newReward, points: e.target.value })}
                    min="0"
                  />
                </FormRow>
                <FormTextarea
                  placeholder="Description de la récompense (optionnel)"
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                />
                <FormButtons>
                  <FormButton 
                    className="secondary"
                    onClick={() => setShowAddForm(false)}
                  >
                    Annuler
                  </FormButton>
                  <FormButton 
                    className="primary"
                    onClick={addReward}
                    disabled={!newReward.points || !newReward.reward}
                  >
                    Ajouter
                  </FormButton>
                </FormButtons>
              </AddRewardForm>
            ) : (
              <ActionButton 
                className="primary"
                onClick={() => setShowAddForm(true)}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                + Ajouter une récompense
              </ActionButton>
            )}
          </Section>
        </>
      )}

      <SaveButton onClick={() => onSave && onSave(localRewards)} disabled={saving}>
        {saving ? 'Sauvegarde...' : 'Sauvegarder le système de récompenses'}
      </SaveButton>
    </RewardsContainer>
  );
}
