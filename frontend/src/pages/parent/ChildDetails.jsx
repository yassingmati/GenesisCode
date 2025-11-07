// src/pages/parent/ChildDetails.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiConfig';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
`;

const BackButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #545b62;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e9ecef;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.percentage > 100 ? '#dc3545' : props.percentage > 80 ? '#ffc107' : '#28a745'};
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.3s ease;
`;

const ActivityList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityType = styled.span`
  font-weight: 600;
  color: #495057;
`;

const ActivityTime = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const LevelProgressList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const LevelItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const LevelName = styled.span`
  font-weight: 600;
  color: #495057;
`;

const LevelStats = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
  }

  &.primary {
    background: #007bff;
    color: white;
    border-color: #007bff;

    &:hover {
      background: #0056b3;
    }
  }
`;

export default function ChildDetails() {
  const { childId } = useParams();
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildDetails();
  }, [childId]);

  const fetchChildDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));
      const response = await fetch(`${API_BASE_URL}/api/parent/children/${childId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des détails');
      }
      
      const data = await response.json();
      setChildData(data);
    } catch (error) {
      console.error('Erreur chargement détails:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/parent/dashboard';
  };

  const handleManageControls = () => {
    window.location.href = `/parent/child/${childId}/controls`;
  };

  const handleViewReport = () => {
    window.location.href = `/parent/child/${childId}/report`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Chargement des détails...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={handleBack}>Retour au dashboard</BackButton>
      </Container>
    );
  }

  if (!childData) {
    return (
      <Container>
        <ErrorMessage>Aucune donnée trouvée pour cet enfant</ErrorMessage>
        <BackButton onClick={handleBack}>Retour au dashboard</BackButton>
      </Container>
    );
  }

  const { child, stats, recentActivity, levelProgress } = childData;

  return (
    <Container>
      <Header>
        <Title>Détails - {child.firstName} {child.lastName}</Title>
        <BackButton onClick={handleBack}>← Retour</BackButton>
      </Header>

      <Grid>
        {/* Statistiques générales */}
        <Card>
          <CardTitle>📊 Statistiques générales</CardTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalXp}</StatValue>
              <StatLabel>XP Total</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.completedExercises}</StatValue>
              <StatLabel>Exercices terminés</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{Math.round(stats.averageScore * 100)}%</StatValue>
              <StatLabel>Score moyen</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.totalAttempts}</StatValue>
              <StatLabel>Total tentatives</StatLabel>
            </StatCard>
          </StatsGrid>
        </Card>

        {/* Contrôles parentaux */}
        <Card>
          <CardTitle>🔒 Contrôles parentaux</CardTitle>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Temps quotidien:</strong> {childData.controls.dailyTimeLimit} min
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Difficulté max:</strong> {childData.controls.contentRestrictions.maxDifficulty}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Plages horaires:</strong> {childData.controls.allowedTimeSlots.length} configurées
            </div>
            <ActionButton 
              className="primary" 
              onClick={handleManageControls}
            >
              Gérer les contrôles
            </ActionButton>
          </div>
        </Card>
      </Grid>

      <Grid>
        {/* Activité récente */}
        <Card>
          <CardTitle>🕒 Activité récente</CardTitle>
          <ActivityList>
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem key={index}>
                  <ActivityType>
                    {activity.activities && activity.activities.length > 0 
                      ? activity.activities[activity.activities.length - 1].type 
                      : 'Session'
                    }
                  </ActivityType>
                  <ActivityTime>
                    {formatDate(activity.loginTime)}
                  </ActivityTime>
                </ActivityItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                Aucune activité récente
              </div>
            )}
          </ActivityList>
        </Card>

        {/* Progression par niveau */}
        <Card>
          <CardTitle>📚 Progression par niveau</CardTitle>
          <LevelProgressList>
            {levelProgress && levelProgress.length > 0 ? (
              levelProgress.map((level, index) => (
                <LevelItem key={index}>
                  <LevelName>{level.levelName || `Niveau ${index + 1}`}</LevelName>
                  <LevelStats>
                    {level.completedExercises}/{level.totalExercises} exercices
                  </LevelStats>
                </LevelItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                Aucune progression enregistrée
              </div>
            )}
          </LevelProgressList>
        </Card>
      </Grid>

      <ActionButtons>
        <ActionButton onClick={handleViewReport}>
          📈 Voir le rapport complet
        </ActionButton>
        <ActionButton onClick={handleManageControls}>
          ⚙️ Gérer les contrôles
        </ActionButton>
      </ActionButtons>
    </Container>
  );
}
