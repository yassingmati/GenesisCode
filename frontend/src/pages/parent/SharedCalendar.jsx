// src/pages/parent/SharedCalendar.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../../components/parent/CalendarWidget';
import { getApiUrl } from '../../utils/apiConfig';

const CalendarContainer = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const HeaderTitle = styled.h1`
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderSubtitle = styled.p`
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
`;

const ControlsBar = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ChildSelector = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ViewButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${props => props.active ? 'white' : '#667eea'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
      : 'rgba(102, 126, 234, 0.1)'
    };
    transform: translateY(-1px);
  }
`;

const AddEventButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
  }
`;

const SyncButton = styled.button`
  padding: 0.75rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: rotate(180deg);
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CalendarSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const EventsList = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const EventItem = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.color || '#667eea'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const EventTitle = styled.h4`
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const EventTime = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
`;

const EventDescription = styled.p`
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const EventType = styled.div`
  display: inline-block;
  background: ${props => props.color || '#667eea'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const GoalsSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const GoalItem = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border-left: 4px solid #27ae60;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const GoalTitle = styled.h4`
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const GoalProgress = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const BackButton = styled.button`
  padding: 1rem 2rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #6c757d;
`;

export default function SharedCalendar() {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState('all');
  const [viewMode, setViewMode] = useState('calendar');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [children, setChildren] = useState([]);
  const [lastSync, setLastSync] = useState(new Date());

  // Données simulées pour les tests
  const mockEvents = [
    {
      id: 1,
      title: 'Session d\'étude - Mathématiques',
      description: 'Révision des équations du second degré',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      type: 'study_session',
      color: '#3498db'
    },
    {
      id: 2,
      title: 'Pause obligatoire',
      description: 'Temps de repos après 1h d\'activité',
      startDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 1.25 * 60 * 60 * 1000).toISOString(),
      type: 'break',
      color: '#f39c12'
    },
    {
      id: 3,
      title: 'Objectif hebdomadaire',
      description: 'Compléter 10 exercices de français',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'goal',
      color: '#27ae60'
    }
  ];

  const mockGoals = [
    {
      id: 1,
      title: 'Objectif Mathématiques',
      description: 'Compléter 20 exercices cette semaine',
      targetValue: 20,
      currentValue: 12,
      unit: 'exercices',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: 'Temps d\'étude',
      description: 'Étudier 2h par jour',
      targetValue: 14,
      currentValue: 8,
      unit: 'heures',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    fetchChildren();
    fetchEvents();
    fetchGoals();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));
      
      const response = await fetch(`${API_BASE_URL}/api/parent/children`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (error) {
      console.error('Erreur chargement enfants:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simulation d'un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      // Simulation d'un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 500));
      setGoals(mockGoals);
    } catch (error) {
      console.error('Erreur chargement objectifs:', error);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      // Simulation de synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastSync(new Date());
      fetchEvents();
      fetchGoals();
    } catch (error) {
      console.error('Erreur synchronisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    console.log('Événement cliqué:', event);
  };

  const handleAddEvent = (date) => {
    console.log('Ajouter événement pour:', date);
  };

  const getEventColor = (type) => {
    const colors = {
      'study_session': '#3498db',
      'break': '#f39c12',
      'goal': '#27ae60',
      'reward': '#e74c3c',
      'restriction': '#9b59b6',
      'custom': '#6c757d'
    };
    return colors[type] || '#6c757d';
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      'study_session': 'Session d\'étude',
      'break': 'Pause',
      'goal': 'Objectif',
      'reward': 'Récompense',
      'restriction': 'Restriction',
      'custom': 'Personnalisé'
    };
    return labels[type] || 'Événement';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <CalendarContainer>
        <LoadingSpinner>Chargement du calendrier...</LoadingSpinner>
      </CalendarContainer>
    );
  }

  return (
    <CalendarContainer>
      <BackButton onClick={() => navigate('/parent/dashboard')}>
        ← Retour au Dashboard
      </BackButton>

      <Header>
        <HeaderTitle>📅 Calendrier Partagé</HeaderTitle>
        <HeaderSubtitle>
          Synchronisation temps réel des événements et objectifs avec vos enfants
        </HeaderSubtitle>
      </Header>

      <ControlsBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', color: '#2c3e50' }}>Enfant:</label>
          <ChildSelector value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
            <option value="all">Tous les enfants</option>
            {children.map(child => (
              <option key={child.child._id} value={child.child._id}>
                {child.child.firstName} {child.child.lastName}
              </option>
            ))}
          </ChildSelector>
        </div>

        <ViewToggle>
          <ViewButton 
            active={viewMode === 'calendar'} 
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendrier
          </ViewButton>
          <ViewButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            📋 Liste
          </ViewButton>
        </ViewToggle>

        <AddEventButton onClick={() => handleAddEvent(new Date())}>
          ➕ Ajouter un événement
        </AddEventButton>

        <SyncButton onClick={handleSync} title="Synchroniser">
          🔄
        </SyncButton>

        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
          Dernière sync: {lastSync.toLocaleTimeString('fr-FR')}
        </div>
      </ControlsBar>

      {viewMode === 'calendar' ? (
        <CalendarGrid>
          <CalendarSection>
            <CalendarWidget 
              events={events}
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
            />
          </CalendarSection>
          <EventsList>
            <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
              📅 Événements à venir
            </h3>
            {events.slice(0, 5).map((event) => (
              <EventItem key={event.id} color={getEventColor(event.type)}>
                <EventHeader>
                  <EventTitle>{event.title}</EventTitle>
                  <EventTime>
                    {formatTime(event.startDate)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </EventTime>
                </EventHeader>
                <EventDescription>{event.description}</EventDescription>
                <EventType color={getEventColor(event.type)}>
                  {getEventTypeLabel(event.type)}
                </EventType>
              </EventItem>
            ))}
          </EventsList>
        </CalendarGrid>
      ) : (
        <EventsList>
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            📋 Tous les événements
          </h3>
          {events.map((event) => (
            <EventItem key={event.id} color={getEventColor(event.type)}>
              <EventHeader>
                <EventTitle>{event.title}</EventTitle>
                <EventTime>
                  {formatTime(event.startDate)}
                  {event.endDate && ` - ${formatTime(event.endDate)}`}
                </EventTime>
              </EventHeader>
              <EventDescription>{event.description}</EventDescription>
              <EventType color={getEventColor(event.type)}>
                {getEventTypeLabel(event.type)}
              </EventType>
            </EventItem>
          ))}
        </EventsList>
      )}

      {/* Section des objectifs */}
      <GoalsSection>
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          🎯 Objectifs Partagés
        </h3>
        {goals.map((goal) => (
          <GoalItem key={goal.id}>
            <GoalHeader>
              <GoalTitle>{goal.title}</GoalTitle>
              <GoalProgress>
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </GoalProgress>
            </GoalHeader>
            <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
              {goal.description}
            </p>
            <ProgressBar>
              <ProgressFill percentage={(goal.currentValue / goal.targetValue) * 100} />
            </ProgressBar>
          </GoalItem>
        ))}
      </GoalsSection>
    </CalendarContainer>
  );
}
