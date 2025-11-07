// src/pages/parent/AdvancedReports.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import ActivityChart from '../../components/parent/ActivityChart';
import { getApiUrl } from '../../utils/apiConfig';

const ReportsContainer = styled.div`
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

const PeriodSelector = styled.select`
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

const ExportButton = styled.button`
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

const RefreshButton = styled.button`
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
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
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 40px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255, 255, 255, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 
    0 4px 16px rgba(0,0,0,0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(0,0,0,0.15),
      0 0 0 1px rgba(255, 255, 255, 0.3);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
`;

const ComparisonTable = styled.div`
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const TableHeader = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
  background: rgba(102, 126, 234, 0.05);
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: #495057;
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.05);
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

export default function AdvancedReports() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('week');
  const [selectedChild, setSelectedChild] = useState('all');
  const [loading, setLoading] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [children, setChildren] = useState([]);

  // Données simulées pour les tests
  const mockData = {
    week: {
      stats: {
        totalTime: 420,
        totalExercises: 45,
        averageScore: 78,
        totalSessions: 12,
        totalBreaks: 8,
        totalRewards: 3
      },
      activityData: [
        { label: 'Lun', value: 45 },
        { label: 'Mar', value: 60 },
        { label: 'Mer', value: 30 },
        { label: 'Jeu', value: 75 },
        { label: 'Ven', value: 90 },
        { label: 'Sam', value: 65 },
        { label: 'Dim', value: 55 }
      ],
      comparisonData: [
        { child: 'Alice', time: 420, exercises: 45, score: 78 },
        { child: 'Bob', time: 380, exercises: 38, score: 82 },
        { child: 'Charlie', time: 350, exercises: 42, score: 75 }
      ]
    },
    month: {
      stats: {
        totalTime: 1680,
        totalExercises: 180,
        averageScore: 76,
        totalSessions: 48,
        totalBreaks: 32,
        totalRewards: 12
      },
      activityData: [
        { label: 'Sem 1', value: 420 },
        { label: 'Sem 2', value: 380 },
        { label: 'Sem 3', value: 450 },
        { label: 'Sem 4', value: 430 }
      ],
      comparisonData: [
        { child: 'Alice', time: 1680, exercises: 180, score: 76 },
        { child: 'Bob', time: 1520, exercises: 165, score: 79 },
        { child: 'Charlie', time: 1400, exercises: 158, score: 73 }
      ]
    }
  };

  useEffect(() => {
    fetchChildren();
    fetchReportsData();
  }, [period, selectedChild]);

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

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // Simulation d'un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReportsData(mockData[period]);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    console.log('Export PDF en cours...');
    // TODO: Implémenter l'export PDF
  };

  const handleExportExcel = () => {
    console.log('Export Excel en cours...');
    // TODO: Implémenter l'export Excel
  };

  const handleRefresh = () => {
    fetchReportsData();
  };

  if (loading) {
    return (
      <ReportsContainer>
        <LoadingSpinner>Chargement des rapports...</LoadingSpinner>
      </ReportsContainer>
    );
  }

  return (
    <ReportsContainer>
      <BackButton onClick={() => navigate('/parent/dashboard')}>
        ← Retour au Dashboard
      </BackButton>

      <Header>
        <HeaderTitle>📊 Rapports Avancés</HeaderTitle>
        <HeaderSubtitle>
          Analytics détaillés et comparaisons pour optimiser l'apprentissage
        </HeaderSubtitle>
      </Header>

      <ControlsBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontWeight: '600', color: '#2c3e50' }}>Période:</label>
          <PeriodSelector value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">Jour</option>
            <option value="week">Semaine</option>
            <option value="month">Mois</option>
            <option value="year">Année</option>
          </PeriodSelector>
        </div>

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

        <ExportButton onClick={handleExportPDF}>
          📄 Export PDF
        </ExportButton>

        <ExportButton onClick={handleExportExcel}>
          📊 Export Excel
        </ExportButton>

        <RefreshButton onClick={handleRefresh} title="Actualiser">
          🔄
        </RefreshButton>
      </ControlsBar>

      {reportsData && (
        <>
          {/* Statistiques principales */}
          <StatsGrid>
            <StatCard>
              <StatIcon>⏰</StatIcon>
              <StatValue>{reportsData.stats.totalTime}</StatValue>
              <StatLabel>Minutes totales</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>📚</StatIcon>
              <StatValue>{reportsData.stats.totalExercises}</StatValue>
              <StatLabel>Exercices complétés</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>🎯</StatIcon>
              <StatValue>{reportsData.stats.averageScore}%</StatValue>
              <StatLabel>Score moyen</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>🔄</StatIcon>
              <StatValue>{reportsData.stats.totalSessions}</StatValue>
              <StatLabel>Sessions</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>⏸️</StatIcon>
              <StatValue>{reportsData.stats.totalBreaks}</StatValue>
              <StatLabel>Pauses prises</StatLabel>
            </StatCard>
            <StatCard>
              <StatIcon>🏆</StatIcon>
              <StatValue>{reportsData.stats.totalRewards}</StatValue>
              <StatLabel>Récompenses gagnées</StatLabel>
            </StatCard>
          </StatsGrid>

          {/* Graphiques */}
          <ChartsGrid>
            <ChartCard>
              <ActivityChart 
                data={reportsData.activityData}
                title="Activité dans le temps"
                type="line"
                period={period}
              />
            </ChartCard>
            <ChartCard>
              <ActivityChart 
                data={reportsData.activityData}
                title="Répartition des activités"
                type="bar"
                period={period}
              />
            </ChartCard>
          </ChartsGrid>

          {/* Tableau de comparaison */}
          <ComparisonTable>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
              📊 Comparaison Multi-Enfants
            </h3>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Enfant</TableHeader>
                  <TableHeader>Temps (min)</TableHeader>
                  <TableHeader>Exercices</TableHeader>
                  <TableHeader>Score Moyen</TableHeader>
                  <TableHeader>Performance</TableHeader>
                </tr>
              </thead>
              <tbody>
                {reportsData.comparisonData.map((child, index) => (
                  <TableRow key={index}>
                    <TableCell>{child.child}</TableCell>
                    <TableCell>{child.time}</TableCell>
                    <TableCell>{child.exercises}</TableCell>
                    <TableCell>{child.score}%</TableCell>
                    <TableCell>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: child.score >= 80 
                          ? 'linear-gradient(135deg, #27ae60, #2ecc71)' 
                          : child.score >= 70 
                          ? 'linear-gradient(135deg, #f39c12, #e67e22)'
                          : 'linear-gradient(135deg, #e74c3c, #c0392b)',
                        color: 'white'
                      }}>
                        {child.score >= 80 ? 'Excellent' : child.score >= 70 ? 'Bon' : 'À améliorer'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </ComparisonTable>
        </>
      )}
    </ReportsContainer>
  );
}
