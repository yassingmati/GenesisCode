import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarWidget from '../../components/parent/CalendarWidget';
import { getApiUrl } from '../../utils/apiConfig';
import { Card, CardBody, CardHeader, Button, Tabs, Tab, Select, SelectItem, Spinner, Progress, Badge } from "@nextui-org/react";
import { IconCalendar, IconList, IconPlus, IconRefresh, IconArrowLeft } from '@tabler/icons-react';

export default function SharedCalendar() {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState('all');
  const [viewMode, setViewMode] = useState('calendar');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [goals, setGoals] = useState([]);
  const [children, setChildren] = useState([]);
  const [lastSync, setLastSync] = useState(new Date());

  // Mock Data
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
          'Content-Type': `application/json`
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
      await new Promise(resolve => setTimeout(resolve, 500));
      setGoals(mockGoals);
    } catch (error) {
      console.error('Erreur chargement objectifs:', error);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
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
      'study_session': 'primary',
      'break': 'warning',
      'goal': 'success',
      'reward': 'danger',
      'restriction': 'secondary',
      'custom': 'default'
    };
    return colors[type] || 'default';
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

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" label="Chargement du calendrier..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              onClick={() => navigate('/parent/dashboard')}
            >
              <IconArrowLeft />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <IconCalendar className="text-blue-500" />
                Calendrier Partagé
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Synchronisation temps réel des événements et objectifs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Dernière sync: {lastSync.toLocaleTimeString('fr-FR')}
            </span>
            <Button
              isIconOnly
              variant="flat"
              color="primary"
              onClick={handleSync}
              isLoading={loading}
            >
              <IconRefresh size={18} />
            </Button>
          </div>
        </div>

        {/* Controls Bar */}
        <Card className="shadow-sm">
          <CardBody className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-4 w-full md:w-auto items-center">
              <Select
                label="Enfant"
                placeholder="Tous les enfants"
                selectedKeys={[selectedChild]}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="max-w-xs"
                size="sm"
              >
                <SelectItem key="all" value="all">Tous les enfants</SelectItem>
                {children.map(child => (
                  <SelectItem key={child.child._id} value={child.child._id}>
                    {child.child.firstName} {child.child.lastName}
                  </SelectItem>
                ))}
              </Select>

              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'calendar' ? 'solid' : 'light'}
                  color={viewMode === 'calendar' ? 'primary' : 'default'}
                  startContent={<IconCalendar size={16} />}
                  onClick={() => setViewMode('calendar')}
                >
                  Calendrier
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'solid' : 'light'}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  startContent={<IconList size={16} />}
                  onClick={() => setViewMode('list')}
                >
                  Liste
                </Button>
              </div>
            </div>

            <Button
              color="success"
              className="text-white font-medium"
              startContent={<IconPlus size={18} />}
              onClick={() => handleAddEvent(new Date())}
            >
              Ajouter un événement
            </Button>
          </CardBody>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Calendar/Events) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm min-h-[600px]">
              <CardBody className="p-0">
                {viewMode === 'calendar' ? (
                  <div className="p-4">
                    <CalendarWidget
                      events={events}
                      onEventClick={handleEventClick}
                      onAddEvent={handleAddEvent}
                    />
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-gray-700 dark:text-white mb-4">Tous les événements</h3>
                    {events.map((event) => (
                      <div key={event.id} className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className={`w-1 self-stretch rounded-full bg-${getEventColor(event.type)}-500`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                            <Chip size="sm" color={getEventColor(event.type)} variant="flat">
                              {getEventTypeLabel(event.type)}
                            </Chip>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                          <div className="text-xs text-gray-400 mt-2 flex gap-2">
                            <span>{formatTime(event.startDate)}</span>
                            {event.endDate && <span>- {formatTime(event.endDate)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column (Goals & Upcoming) */}
          <div className="space-y-6">
            {/* Upcoming Events (Only in Calendar View) */}
            {viewMode === 'calendar' && (
              <Card className="shadow-sm">
                <CardHeader className="font-bold text-gray-700 dark:text-white px-6 pt-6">
                  📅 Événements à venir
                </CardHeader>
                <CardBody className="p-6 space-y-3">
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                      <div className={`w-1 rounded-full bg-${getEventColor(event.type)}-500`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{event.title}</p>
                        <p className="text-xs text-gray-500">{formatTime(event.startDate)}</p>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && <p className="text-gray-500 text-sm italic">Aucun événement à venir.</p>}
                </CardBody>
              </Card>
            )}

            {/* Shared Goals */}
            <Card className="shadow-sm">
              <CardHeader className="font-bold text-gray-700 dark:text-white px-6 pt-6">
                🎯 Objectifs Partagés
              </CardHeader>
              <CardBody className="p-6 space-y-6">
                {goals.map(goal => {
                  const percent = (goal.currentValue / goal.targetValue) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-gray-500">{goal.currentValue}/{goal.targetValue}</span>
                      </div>
                      <Progress
                        value={percent}
                        color="success"
                        size="sm"
                        className="max-w-full"
                      />
                      <p className="text-xs text-gray-400 mt-1">{goal.description}</p>
                    </div>
                  );
                })}
                {goals.length === 0 && <p className="text-gray-500 text-sm italic">Aucun objectif défini.</p>}
              </CardBody>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
