// src/pages/parent/ParentDashboard.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import NotificationCenter from '../../components/NotificationCenter';
import FacebookStyleNotifications from '../../components/FacebookStyleNotifications';
import ParentStatsWidget from '../../components/ParentStatsWidget';
import QuickControls from '../../components/QuickControls';
import ActivityChart from '../../components/parent/ActivityChart';
import ContentFiltersManager from '../../components/parent/ContentFiltersManager';
import RewardsSystem from '../../components/parent/RewardsSystem';
import CalendarWidget from '../../components/parent/CalendarWidget';
import QuickActionsPanel from '../../components/parent/QuickActionsPanel';
import ToastComponent, { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DashboardContainer = styled.div`
  padding: 1.5rem;
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
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`;

const TabsContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  overflow: hidden;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'transparent'
  };
  color: ${props => props.active ? 'white' : '#495057'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' 
      : 'rgba(102, 126, 234, 0.1)'
    };
    color: ${props => props.active ? 'white' : '#667eea'};
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
  min-height: 400px;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const WidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const WidgetContainer = styled.div`
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0.25rem;
  cursor: move;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;

  ${WidgetContainer}:hover & {
    opacity: 1;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  justify-content: center;
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

const ChildrenList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 1.5rem 2rem;
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    text-align: center;
  }
`;

const InviteButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    
    &::before {
      left: 100%;
    }
  }
`;

const ChildrenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const ChildCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24px 24px 0 0;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 20px 60px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255, 255, 255, 0.3);
    
    &::after {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const ChildHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ChildName = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.25rem;
`;

const ChildEmail = styled.p`
  color: #6c757d;
  margin: 0.5rem 0;
  font-size: 0.9rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.25rem;
  border-radius: 12px;
  text-align: center;
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
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: countUp 0.8s ease-out;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.3;
  }

  @keyframes countUp {
    from { 
      transform: scale(0.8) translateY(10px); 
      opacity: 0; 
    }
    to { 
      transform: scale(1) translateY(0); 
      opacity: 1; 
    }
  }
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const TimeProgress = styled.div`
  margin: 1rem 0;
`;

const TimeLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.percentage > 100 
    ? 'linear-gradient(135deg, #e74c3c, #c0392b)' 
    : props.percentage > 80 
    ? 'linear-gradient(135deg, #f39c12, #e67e22)' 
    : 'linear-gradient(135deg, #27ae60, #2ecc71)'
  };
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.8s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
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
`;

// LoadingSpinner est maintenant importé comme composant

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 3rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 16px 48px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`;

const EmptyTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const EmptyText = styled.p`
  color: #6c757d;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

export default function ParentDashboard() {
  const { t } = useTranslation();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [widgets, setWidgets] = useState([
    { id: 'stats', component: 'ParentStatsWidget', visible: true },
    { id: 'controls', component: 'QuickControls', visible: true },
    { id: 'actions', component: 'QuickActionsPanel', visible: true },
    { id: 'calendar', component: 'CalendarWidget', visible: true },
    { id: 'filters', component: 'ContentFiltersManager', visible: false },
    { id: 'rewards', component: 'RewardsSystem', visible: false }
  ]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const { toasts, removeToast, success, error: showError, info } = useToast();

  useEffect(() => {
    fetchChildren();
    loadUser();
    
    // Gestion de la connectivité
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (children.length > 0) {
      fetchAnalytics();
      fetchCalendarEvents();
    }
  }, [children]);

  const loadUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erreur parsing user data:', error);
      }
    }
  };

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // Vérifier que l'utilisateur est connecté et a le bon type
      if (!token) {
        throw new Error('Aucun token d\'authentification trouvé');
      }
      
      if (!user) {
        throw new Error('Aucune donnée utilisateur trouvée');
      }
      
      const userData = JSON.parse(user);
      if (userData.userType !== 'parent') {
        throw new Error('Accès refusé : vous devez être un parent pour accéder à cette page');
      }
      
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/parent/children`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 403) {
          throw new Error('Accès refusé. Vérifiez que vous êtes bien connecté en tant que parent.');
        } else {
          throw new Error(`Erreur serveur (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error('Erreur chargement enfants:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteChild = () => {
    window.location.href = '/parent/invite-child';
  };

  const handleRefresh = () => {
    setLastUpdate(new Date());
    fetchChildren();
    success('Données actualisées avec succès', 'Actualisation');
  };

  const handleViewDetails = (childId) => {
    window.location.href = `/parent/child/${childId}`;
  };

  const handleManageControls = (childId) => {
    window.location.href = `/parent/child/${childId}/controls`;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const toggleWidget = (widgetId) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/reports/comparison?period=week`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      // Récupérer les événements pour tous les enfants
      const events = [];
      for (const child of children) {
        const response = await fetch(`${API_BASE_URL}/api/calendar/${child.child._id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const calendarData = await response.json();
          events.push(...(calendarData.events || []));
        }
      }
      
      setCalendarEvents(events);
    } catch (error) {
      console.error('Erreur chargement calendrier:', error);
    }
  };

  const handleAction = (action) => {
    console.log('Action rapide:', action);
    success(`Action "${action.title}" exécutée`, 'Action Rapide');
  };

  const handleCalendarEventClick = (event) => {
    console.log('Événement cliqué:', event);
  };

  const handleAddEvent = (date) => {
    console.log('Ajouter événement pour:', date);
  };

  const handleFiltersChange = (filters) => {
    console.log('Filtres mis à jour:', filters);
  };

  const handleRewardsChange = (rewards) => {
    console.log('Récompenses mises à jour:', rewards);
  };

  const handleSaveFilters = (filters) => {
    console.log('Sauvegarde filtres:', filters);
    success('Filtres de contenu sauvegardés', 'Configuration');
  };

  const handleSaveRewards = (rewards) => {
    console.log('Sauvegarde récompenses:', rewards);
    success('Système de récompenses sauvegardé', 'Configuration');
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner message="Chargement des enfants..." />
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>
          <h3>Erreur</h3>
          <p>{error}</p>
          <button onClick={fetchChildren} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Réessayer
          </button>
        </div>
      </DashboardContainer>
    );
  }

  const renderWidget = (widget) => {
    switch (widget.component) {
      case 'ParentStatsWidget':
        return <ParentStatsWidget children={children} />;
      case 'QuickControls':
  return (
        <QuickControls 
          children={children} 
          onControlUpdate={(controlType, isActive) => {
            console.log(`Contrôle ${controlType} ${isActive ? 'activé' : 'désactivé'}`);
          }}
        />
        );
      case 'QuickActionsPanel':
        return <QuickActionsPanel onAction={handleAction} />;
      case 'CalendarWidget':
        return (
          <CalendarWidget 
            events={calendarEvents}
            onEventClick={handleCalendarEventClick}
            onAddEvent={handleAddEvent}
          />
        );
      case 'ContentFiltersManager':
        return (
          <ContentFiltersManager 
            onFiltersChange={handleFiltersChange}
            onSave={handleSaveFilters}
          />
        );
      case 'RewardsSystem':
        return (
          <RewardsSystem 
            onRewardsChange={handleRewardsChange}
            onSave={handleSaveRewards}
          />
        );
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <ViewToggle>
              <ViewButton 
                active={viewMode === 'grid'} 
                onClick={() => handleViewModeChange('grid')}
              >
                📊 Vue Grille
              </ViewButton>
              <ViewButton 
                active={viewMode === 'list'} 
                onClick={() => handleViewModeChange('list')}
              >
                📋 Vue Liste
              </ViewButton>
            </ViewToggle>

            <WidgetsGrid>
              {widgets.filter(w => w.visible).map((widget) => (
                <WidgetContainer key={widget.id}>
                  <DragHandle>⋮⋮</DragHandle>
                  {renderWidget(widget)}
                </WidgetContainer>
              ))}
            </WidgetsGrid>

      {children.length === 0 ? (
        <EmptyState>
          <EmptyIcon>👨‍👩‍👧‍👦</EmptyIcon>
          <EmptyTitle>Aucun enfant invité</EmptyTitle>
          <EmptyText>
            Commencez par inviter votre enfant en utilisant son email pour suivre ses progrès.
          </EmptyText>
          <InviteButton onClick={handleInviteChild}>
            Inviter mon premier enfant
          </InviteButton>
        </EmptyState>
      ) : (
              viewMode === 'grid' ? (
        <ChildrenGrid>
          {children.map((child) => (
            <ChildCard key={child.child._id}>
              <ChildHeader>
                <div>
                  <ChildName>{child.child.firstName} {child.child.lastName}</ChildName>
                  <ChildEmail>{child.child.email}</ChildEmail>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#28a745'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#28a745',
                      animation: 'pulse 2s infinite'
                    }} />
                    <span>Actif</span>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '2rem',
                  position: 'relative',
                  animation: 'bounce 2s infinite'
                }}>👦</div>
              </ChildHeader>
              
              <StatsGrid>
                <StatCard>
                  <StatValue>{child.stats.totalXp}</StatValue>
                  <StatLabel>XP Total</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{child.stats.completedExercises}</StatValue>
                  <StatLabel>Exercices</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{Math.round(child.stats.averageScore * 100)}%</StatValue>
                  <StatLabel>Score Moyen</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{child.stats.totalAttempts}</StatValue>
                  <StatLabel>Tentatives</StatLabel>
                </StatCard>
              </StatsGrid>

              <TimeProgress>
                <TimeLabel>
                  <span>Temps aujourd'hui</span>
                  <span>{child.todayTime} / {child.controls.dailyTimeLimit} min</span>
                </TimeLabel>
                <ProgressBar>
                  <ProgressFill 
                    percentage={(child.todayTime / child.controls.dailyTimeLimit) * 100}
                  />
                </ProgressBar>
              </TimeProgress>

              <ActionButtons>
                <ActionButton onClick={() => handleViewDetails(child.child._id)}>
                  Voir détails
                </ActionButton>
                <ActionButton 
                  className="primary" 
                  onClick={() => handleManageControls(child.child._id)}
                >
                  Contrôles
                </ActionButton>
              </ActionButtons>
            </ChildCard>
          ))}
        </ChildrenGrid>
              ) : (
                <ChildrenList>
                  {children.map((child) => (
                    <div key={child.child._id} style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                          {child.child.firstName} {child.child.lastName}
                        </h3>
                        <p style={{ margin: '0', color: '#6c757d' }}>{child.child.email}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => handleViewDetails(child.child._id)}>
                          Voir détails
                        </button>
                        <button onClick={() => handleManageControls(child.child._id)}>
                          Contrôles
                        </button>
                      </div>
                    </div>
                  ))}
                </ChildrenList>
              )
            )}
          </>
        );
      case 'analytics':
        return (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#2c3e50' }}>📊 Analytics Avancés</h3>
            {analyticsData ? (
              <ActivityChart 
                data={analyticsData.children?.map(child => ({
                  label: `${child.child.firstName} ${child.child.lastName}`,
                  value: child.stats.totalTime,
                  unit: 'min'
                })) || []}
                title="Temps d'activité par enfant"
                type="bar"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                Chargement des analytics...
              </div>
            )}
          </div>
        );
      case 'calendar':
        return (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#2c3e50' }}>📅 Calendrier Partagé</h3>
            <CalendarWidget 
              events={calendarEvents}
              onEventClick={handleCalendarEventClick}
              onAddEvent={handleAddEvent}
            />
          </div>
        );
      case 'settings':
        return (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#2c3e50' }}>⚙️ Configuration</h3>
            <div style={{ display: 'grid', gap: '2rem' }}>
              <ContentFiltersManager 
                onFiltersChange={handleFiltersChange}
                onSave={handleSaveFilters}
              />
              <RewardsSystem 
                onRewardsChange={handleRewardsChange}
                onSave={handleSaveRewards}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div>
            <Title>Tableau de bord Parent</Title>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              color: '#6c757d'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isOnline ? '#28a745' : '#dc3545',
                animation: isOnline ? 'pulse 2s infinite' : 'none'
              }} />
              <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
              <span>•</span>
              <span>Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}</span>
            </div>
          </div>
          {user && user.userType === 'parent' && (
            <FacebookStyleNotifications user={user} />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#667eea',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(102, 126, 234, 0.1)';
              e.target.style.transform = 'rotate(180deg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'rotate(0deg)';
            }}
            title="Actualiser"
          >
            🔄
          </button>
          <InviteButton onClick={handleInviteChild}>
            + Inviter un enfant
          </InviteButton>
        </div>
      </Header>

      <TabsContainer>
        <TabsHeader>
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => handleTabChange('overview')}
          >
            🏠 Vue d'ensemble
          </TabButton>
          <TabButton 
            active={activeTab === 'analytics'} 
            onClick={() => handleTabChange('analytics')}
          >
            📊 Analytics
          </TabButton>
          <TabButton 
            active={activeTab === 'calendar'} 
            onClick={() => handleTabChange('calendar')}
          >
            📅 Calendrier
          </TabButton>
          <TabButton 
            active={activeTab === 'settings'} 
            onClick={() => handleTabChange('settings')}
          >
            ⚙️ Configuration
          </TabButton>
        </TabsHeader>
        <TabContent>
          {renderTabContent()}
        </TabContent>
      </TabsContainer>

        <ToastComponent toasts={toasts} onRemove={removeToast} />
      </DashboardContainer>
    );
  }
