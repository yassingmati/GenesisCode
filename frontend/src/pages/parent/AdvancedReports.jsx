import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityChart from '../../components/parent/ActivityChart';
import { getApiUrl } from '../../utils/apiConfig';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Card, CardBody, Select, SelectItem, Button, Tooltip, Spinner } from '@nextui-org/react';
import { IconChartBar, IconDownload, IconRefresh, IconArrowLeft, IconClock, IconBook, IconTrophy, IconPlayerPause, IconTarget } from '@tabler/icons-react';

export default function AdvancedReports() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('week');
  const [selectedChild, setSelectedChild] = useState('all');
  const [loading, setLoading] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    fetchChildren();
    if (selectedChild !== 'all') {
      fetchReportsData();
    }
  }, [period, selectedChild]);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/parent/children'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data);
        if (data.length > 0 && selectedChild === 'all') {
          setSelectedChild(data[0].child._id);
        }
      }
    } catch (error) {
      console.error('Erreur chargement enfants:', error);
    }
  };

  const fetchReportsData = async () => {
    if (selectedChild === 'all') return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/parent/children/${selectedChild}/analytics?period=${period}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Transform API data to match component expectations if necessary
        // API returns: { engagement: {}, dailyProgression: [], hourlyAnalytics: [], limits: {} }

        const transformedData = {
          stats: {
            totalTime: data.engagement?.totalTime ? Math.round(data.engagement.totalTime / 60) : 0, // Convert seconds to minutes if needed
            totalExercises: data.engagement?.totalExercises || 0,
            averageScore: data.engagement?.averageScore ? Math.round(data.engagement.averageScore) : 0,
            totalSessions: data.engagement?.totalSessions || 0,
            totalBreaks: data.engagement?.totalBreaks || 0,
            totalRewards: data.engagement?.totalRewards || 0
          },
          activityData: data.dailyProgression ? data.dailyProgression.map(d => ({
            label: `${d._id.day}/${d._id.month}`,
            value: Math.round(d.totalTime / 60)
          })) : [],
          // Comparison data would ideally come from a different endpoint or aggregation
          comparisonData: []
        };

        setReportsData(transformedData);
      }
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportsData) return;

    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Titre
      doc.setFontSize(18);
      doc.text('Rapport Avancé - GenesisCode', 20, yPos);
      yPos += 15;

      // Informations de période
      doc.setFontSize(12);
      doc.text(`Période: ${period}`, 20, yPos);
      yPos += 10;

      // Statistiques principales
      doc.setFontSize(14);
      doc.text('Statistiques Principales', 20, yPos);
      yPos += 10;

      doc.setFontSize(10);
      const stats = reportsData.stats;
      doc.text(`Temps total: ${stats.totalTime} minutes`, 20, yPos);
      yPos += 7;
      doc.text(`Exercices complétés: ${stats.totalExercises}`, 20, yPos);
      yPos += 7;
      doc.text(`Score moyen: ${stats.averageScore}%`, 20, yPos);
      yPos += 15;

      // Date de génération
      doc.setFontSize(8);
      doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, 20, doc.internal.pageSize.height - 10);

      doc.save(`rapport-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    }
  };

  const handleExportExcel = () => {
    if (!reportsData) return;
    try {
      const workbook = XLSX.utils.book_new();
      const statsData = [
        ['Statistique', 'Valeur'],
        ['Temps total (minutes)', reportsData.stats.totalTime],
        ['Exercices complétés', reportsData.stats.totalExercises],
        ['Score moyen (%)', reportsData.stats.averageScore]
      ];
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');
      XLSX.writeFile(workbook, `rapport-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Erreur export Excel:', error);
    }
  };

  if (loading && !reportsData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <Spinner size="lg" color="primary" label="Chargement des rapports..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Navigation */}
        <Button
          variant="light"
          startContent={<IconArrowLeft size={18} />}
          onPress={() => navigate('/parent/dashboard')}
          className="text-gray-600 dark:text-gray-300"
        >
          Retour au Dashboard
        </Button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <IconChartBar size={28} className="text-primary" />
              Rapports Avancés
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Analytics détaillés pour optimiser l'apprentissage
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              selectedKeys={[period]}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-32"
              size="sm"
              label="Période"
              disallowEmptySelection
            >
              <SelectItem key="day" value="day">Jour</SelectItem>
              <SelectItem key="week" value="week">Semaine</SelectItem>
              <SelectItem key="month" value="month">Mois</SelectItem>
            </Select>

            <Select
              selectedKeys={selectedChild !== 'all' ? [selectedChild] : []}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-48"
              size="sm"
              label="Enfant"
              placeholder="Sélectionner"
            >
              {children.map(childData => (
                <SelectItem key={childData.child._id} value={childData.child._id}>
                  {childData.child.firstName}
                </SelectItem>
              ))}
            </Select>

            <Button isIconOnly variant="flat" onPress={handleExportPDF} title="Export PDF">
              <IconDownload size={20} />
            </Button>
            <Button isIconOnly variant="flat" onPress={fetchReportsData} title="Actualiser">
              <IconRefresh size={20} />
            </Button>
          </div>
        </div>

        {reportsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                  <IconClock size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Temps Total</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reportsData.stats.totalTime} <span className="text-sm font-normal">min</span>
                  </h3>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                  <IconBook size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exercices</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reportsData.stats.totalExercises}
                  </h3>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <IconTarget size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score Moyen</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reportsData.stats.averageScore}%
                  </h3>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                  <IconTrophy size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Récompenses</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reportsData.stats.totalRewards}
                  </h3>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Sélectionnez un enfant pour voir les rapports
          </div>
        )}

        {reportsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-slate-800 p-4 shadow-sm border border-gray-200 dark:border-slate-700">
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Progression Quotidienne</h3>
                <div className="h-[300px]">
                  <ActivityChart
                    data={reportsData.activityData}
                    title="Activité"
                    type="bar"
                    period={period}
                  />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white dark:bg-slate-800 p-4 shadow-sm border border-gray-200 dark:border-slate-700">
              <CardBody>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Répartition de l'Activité</h3>
                <div className="h-[300px]">
                  {/* Placeholder for pie chart or similar */}
                  <ActivityChart
                    data={reportsData.activityData}
                    title="Tendance"
                    type="line"
                    period={period}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
