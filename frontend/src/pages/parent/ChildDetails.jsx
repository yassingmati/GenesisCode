import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiConfig';
import { Card, CardBody, CardHeader, Button, Progress, Chip, Avatar, Tooltip } from "@nextui-org/react";
import {
  IconArrowLeft,
  IconTrophy,
  IconCheck,
  IconChartBar,
  IconActivity,
  IconSettings,
  IconClock,
  IconBook
} from '@tabler/icons-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ChildDetails() {
  const { childId } = useParams();
  const navigate = useNavigate();
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
        <Card className="bg-red-50 border-red-200 text-red-700 p-6 max-w-md">
          <h3 className="font-bold text-lg mb-2">Erreur</h3>
          <p className="mb-4">{error}</p>
          <Button color="primary" variant="flat" onPress={() => navigate('/parent/dashboard')}>
            Retour au dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!childData) return null;

  const { child, stats, recentActivity, levelProgress, controls } = childData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
                {child.firstName} {child.lastName}
                <Chip size="sm" color="success" variant="flat">Actif</Chip>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{child.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              color="primary"
              variant="flat"
              startContent={<IconChartBar size={18} />}
              onClick={() => navigate(`/parent/child/${childId}/report`)}
            >
              Rapport complet
            </Button>
            <Button
              color="secondary"
              startContent={<IconSettings size={18} />}
              onClick={() => navigate(`/parent/child/${childId}/controls`)}
            >
              Contrôles
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'XP Total', value: stats.totalXp, icon: <IconTrophy className="text-yellow-500" />, color: "warning" },
            { label: 'Exercices', value: stats.completedExercises, icon: <IconCheck className="text-green-500" />, color: "success" },
            { label: 'Score Moyen', value: `${Math.round(stats.averageScore * 100)}%`, icon: <IconChartBar className="text-blue-500" />, color: "primary" },
            { label: 'Temps (Semaine)', value: '3h 15m', icon: <IconClock className="text-purple-500" />, color: "secondary" } // Mock data for now if not in stats
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white dark:bg-slate-800 shadow-sm">
              <CardBody className="flex flex-row items-center gap-4 p-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-slate-800 shadow-sm h-full">
              <CardHeader className="flex justify-between p-6 pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <IconActivity size={20} className="text-blue-500" />
                  Activité Récente
                </h3>
              </CardHeader>
              <CardBody className="p-4">
                {recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-1">
                    {recentActivity.map((activity, index) => {
                      const activityType = activity.activities && activity.activities.length > 0
                        ? activity.activities[activity.activities.length - 1].type
                        : 'Session';

                      return (
                        <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                              <IconBook size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-200">{activityType}</p>
                              <p className="text-xs text-gray-500">{formatDate(activity.loginTime)}</p>
                            </div>
                          </div>
                          <Chip size="sm" variant="dot" color="success">Complété</Chip>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Aucune activité récente enregistrée.
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Level Progress */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white dark:bg-slate-800 shadow-sm h-full">
              <CardHeader className="p-6 pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <IconTrophy size={20} className="text-yellow-500" />
                  Progression Niveaux
                </h3>
              </CardHeader>
              <CardBody className="p-6 flex flex-col gap-6">
                {levelProgress && levelProgress.length > 0 ? (
                  levelProgress.map((level, index) => {
                    const percent = Math.round((level.completedExercises / level.totalExercises) * 100) || 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-200">{level.levelName || `Niveau ${index + 1}`}</span>
                          <span className="text-xs text-gray-500">{level.completedExercises}/{level.totalExercises}</span>
                        </div>
                        <Progress
                          value={percent}
                          color={percent === 100 ? "success" : "primary"}
                          size="sm"
                          className="max-w-full"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Aucune progression.
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Controls Summary */}
        <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <CardBody className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full">
                <IconSettings size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Paramètres de Contrôle Parental</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl">
                  Limite quotidienne: <span className="font-medium text-gray-900 dark:text-white">{controls.dailyTimeLimit} min</span> •
                  Difficulté Max: <span className="font-medium text-gray-900 dark:text-white">{controls.contentRestrictions.maxDifficulty}</span>
                </p>
              </div>
            </div>
            <Button
              variant="bordered"
              color="primary"
              onClick={() => navigate(`/parent/child/${childId}/controls`)}
            >
              Modifier les règles
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
