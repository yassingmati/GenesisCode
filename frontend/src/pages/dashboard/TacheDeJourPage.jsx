import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Progress, Chip, Button, Spinner } from "@nextui-org/react";
import { IconTrophy, IconCalendar, IconCheck, IconRefresh, IconTarget, IconClock, IconFlame } from '@tabler/icons-react';
import { getApiUrl } from '../../utils/apiConfig';

const API_BASE = getApiUrl('/api');

export default function TacheDeJourPage() {
  // States
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [error, setError] = useState(null);

  // Load tasks from API
  const loadTasks = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
      }

      console.log('[TacheDeJourPage] Chargement des tâches...');

      const response = await fetch(`${API_BASE}/assigned-tasks/my-tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('[TacheDeJourPage] Tâches reçues:', data.length);

      // Filter for today's tasks
      const today = new Date();
      const activeTasks = Array.isArray(data) ? data.filter(task => {
        const periodStart = new Date(task.periodStart);
        const periodEnd = new Date(task.periodEnd);
        return today >= periodStart && today <= periodEnd &&
          (task.status === 'active' || task.status === 'pending' || task.status === 'completed');
      }) : [];

      console.log('[TacheDeJourPage] Tâches actives:', activeTasks.length);
      setTasks(activeTasks);

      // Check if all completed
      if (activeTasks.length > 0 && activeTasks.every(t => t.status === 'completed')) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 5000);
      }

    } catch (err) {
      console.error('[TacheDeJourPage] Erreur:', err);
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[TacheDeJourPage] Actualisation automatique...');
      loadTasks(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadTasks]);

  // Calculate completion percentage
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Format target display
  const formatTarget = (target) => {
    if (!target) return 'Aucun objectif';
    const parts = [];
    if (target.exercises_submitted > 0) parts.push(`${target.exercises_submitted} exercice${target.exercises_submitted > 1 ? 's' : ''}`);
    if (target.levels_completed > 0) parts.push(`${target.levels_completed} niveau${target.levels_completed > 1 ? 'x' : ''}`);
    if (target.hours_spent > 0) parts.push(`${Math.round(target.hours_spent * 60)} min`);
    return parts.join(', ') || 'Aucun objectif';
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    if (!current || !target) return 0;

    if (target.exercises_submitted > 0) {
      return Math.min((current.exercises_submitted / target.exercises_submitted) * 100, 100);
    }
    if (target.levels_completed > 0) {
      return Math.min((current.levels_completed / target.levels_completed) * 100, 100);
    }
    if (target.hours_spent > 0) {
      return Math.min((current.hours_spent / target.hours_spent) * 100, 100);
    }
    return 0;
  };

  // Format current progress
  const formatCurrent = (current, target) => {
    if (!current || !target) return '0';

    if (target.exercises_submitted > 0) {
      return `${current.exercises_submitted || 0} / ${target.exercises_submitted}`;
    }
    if (target.levels_completed > 0) {
      return `${current.levels_completed || 0} / ${target.levels_completed}`;
    }
    if (target.hours_spent > 0) {
      const currentMin = Math.round((current.hours_spent || 0) * 60);
      const targetMin = Math.round(target.hours_spent * 60);
      return `${currentMin} / ${targetMin} min`;
    }
    return '0';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'active': return 'En cours';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-red-50 border-red-200">
          <CardBody className="text-center p-8">
            <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                color="primary"
                onClick={() => loadTasks()}
              >
                Réessayer
              </Button>
              <Button
                color="default"
                variant="flat"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
              >
                Se reconnecter
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Reward Overlay */}
      {showReward && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl border-none">
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-white/20 rounded-full">
                <IconTrophy size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Félicitations !</h3>
                <p className="text-white/90">Toutes les tâches du jour sont terminées !</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-none">
        <CardBody className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex flex-wrap items-center gap-2 md:gap-3">
                <IconCalendar size={32} className="shrink-0" />
                <span>Mes Missions du Jour</span>
              </h1>
              <p className="text-blue-100 text-base md:text-lg">
                Voici tes objectifs pour aujourd'hui. Continue comme ça ! 🚀
              </p>
            </div>
            <div className="flex flex-row md:flex-col gap-2 items-center md:items-end w-full md:w-auto justify-between md:justify-end">
              <Chip
                variant="flat"
                classNames={{ base: "bg-white/20", content: "text-white font-bold" }}
                size="md"
              >
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Chip>
              <Button
                size="sm"
                variant="light"
                className="text-white"
                startContent={refreshing ? <Spinner size="sm" color="white" /> : <IconRefresh size={16} />}
                onClick={() => loadTasks(false)}
                isDisabled={refreshing}
              >
                {refreshing ? '...' : 'Actualiser'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Progression globale</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress
              aria-label="Progression globale"
              value={completionPercentage}
              color="warning"
              classNames={{
                indicator: "bg-gradient-to-r from-yellow-400 to-orange-500",
                track: "bg-white/20"
              }}
              size="lg"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-blue-100">
                {completedCount} / {tasks.length} tâches complétées
              </p>
              {completedCount > 0 && (
                <div className="flex items-center gap-1 text-yellow-300">
                  <IconFlame size={16} />
                  <span className="text-sm font-bold">{completedCount} 🔥</span>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tasks List */}
      <div className="grid gap-4">
        {tasks.map(task => {
          const progress = calculateProgress(task.metricsCurrent, task.metricsTarget);
          const isCompleted = task.status === 'completed';

          return (
            <Card
              key={task._id}
              className={`
                border-l-4 transition-all duration-300 hover:shadow-lg
                ${isCompleted
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20'
                  : 'border-blue-500 bg-white dark:bg-gray-800'
                }
              `}
            >
              <CardBody className="p-5">
                <div className="flex items-start gap-4">
                  {/* Completion Icon */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0
                    ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white scale-110'
                      : 'border-gray-300 text-transparent hover:border-blue-400'
                    }
                  `}>
                    <IconCheck size={24} strokeWidth={3} />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Status */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4 mb-2">
                      <h3 className={`
                        text-base md:text-lg font-semibold transition-colors break-words
                        ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100'}
                      `}>
                        {task.templateId?.title || 'Tâche assignée'}
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <Chip
                          size="sm"
                          color={getStatusColor(task.status)}
                          variant="flat"
                        >
                          {getStatusLabel(task.status)}
                        </Chip>
                        {task.autoRenew && (
                          <Chip
                            size="sm"
                            color="secondary"
                            variant="flat"
                            startContent={<IconRefresh size={12} />}
                          >
                            Quotidien
                          </Chip>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {task.templateId?.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.templateId.description}
                      </p>
                    )}

                    {/* Metrics */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Chip
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<IconTarget size={14} />}
                      >
                        Objectif: {formatTarget(task.metricsTarget)}
                      </Chip>
                      <Chip size="sm" variant="flat" color="default">
                        📅 {new Date(task.periodStart).toLocaleDateString('fr-FR')} - {new Date(task.periodEnd).toLocaleDateString('fr-FR')}
                      </Chip>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Progression</span>
                        <span className="font-bold">{formatCurrent(task.metricsCurrent, task.metricsTarget)}</span>
                      </div>
                      <Progress
                        aria-label="Progression de la tâche"
                        size="md"
                        value={progress}
                        color={isCompleted ? "success" : "primary"}
                        classNames={{
                          indicator: isCompleted
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gradient-to-r from-blue-400 to-indigo-600"
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="font-medium">{Math.round(progress)}% complété</span>
                        {task.metricsCurrent?.hours_spent > 0 && (
                          <span className="flex items-center gap-1">
                            <IconClock size={12} />
                            {Math.round(task.metricsCurrent.hours_spent * 60)} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}

        {/* Empty State */}
        {tasks.length === 0 && !error && (
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardBody className="text-center py-16">
              <div className="text-8xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
                Aucune tâche pour aujourd'hui
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Profite de cette journée libre ! Tes parents ou un administrateur peuvent t'assigner de nouvelles missions.
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-sm mt-8 space-y-1 pb-8">
        <p className="flex items-center justify-center gap-2">
          <IconRefresh size={14} />
          Actualisation automatique toutes les 30 secondes
        </p>
        <p className="text-xs">
          Ces tâches sont générées par tes parents ou un administrateur
        </p>
      </div>
    </div>
  );
}