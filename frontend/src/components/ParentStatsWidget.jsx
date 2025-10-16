// src/components/ParentStatsWidget.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const StatsWidget = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const WidgetTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 15px;
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
    height: 4px;
    background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  animation: countUp 0.8s ease-out;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
`;

const StatChange = styled.div`
  font-size: 0.8rem;
  margin-top: 0.5rem;
  color: ${props => props.positive ? '#27ae60' : '#e74c3c'};
  font-weight: 500;
`;

const ChartContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 15px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h3`
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const SimpleChart = styled.div`
  height: 200px;
  display: flex;
  align-items: end;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChartBar = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  height: ${props => props.height}%;
  transition: height 0.8s ease;
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

const ChartLabel = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
`;

export default function ParentStatsWidget({ children }) {
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalXp: 0,
    totalExercises: 0,
    averageScore: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0]
  });

  useEffect(() => {
    if (children && children.length > 0) {
      calculateStats();
    }
  }, [children]);

  const calculateStats = () => {
    const totalChildren = children.length;
    const totalXp = children.reduce((sum, child) => sum + (child.stats?.totalXp || 0), 0);
    const totalExercises = children.reduce((sum, child) => sum + (child.stats?.completedExercises || 0), 0);
    const averageScore = children.reduce((sum, child) => sum + (child.stats?.averageScore || 0), 0) / totalChildren;
    
    // Simulation de données hebdomadaires
    const weeklyProgress = [20, 35, 45, 30, 55, 40, 60];

    setStats({
      totalChildren,
      totalXp,
      totalExercises,
      averageScore: Math.round(averageScore * 100),
      weeklyProgress
    });
  };

  const getWeeklyLabels = () => {
    const today = new Date();
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
    }
    return labels;
  };

  return (
    <StatsWidget>
      <WidgetTitle>📊 Statistiques Globales</WidgetTitle>
      
      <StatsGrid>
        <StatCard color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <StatIcon>👨‍👩‍👧‍👦</StatIcon>
          <StatValue>{stats.totalChildren}</StatValue>
          <StatLabel>Enfants Suivis</StatLabel>
          <StatChange positive>+{stats.totalChildren} cette semaine</StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)">
          <StatIcon>⭐</StatIcon>
          <StatValue>{stats.totalXp.toLocaleString()}</StatValue>
          <StatLabel>XP Total</StatLabel>
          <StatChange positive>+{Math.floor(stats.totalXp * 0.1)} cette semaine</StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #f39c12 0%, #e67e22 100%)">
          <StatIcon>📚</StatIcon>
          <StatValue>{stats.totalExercises}</StatValue>
          <StatLabel>Exercices Terminés</StatLabel>
          <StatChange positive>+{Math.floor(stats.totalExercises * 0.15)} cette semaine</StatChange>
        </StatCard>

        <StatCard color="linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)">
          <StatIcon>🎯</StatIcon>
          <StatValue>{stats.averageScore}%</StatValue>
          <StatLabel>Score Moyen</StatLabel>
          <StatChange positive>+5% cette semaine</StatChange>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <ChartTitle>📈 Progression Hebdomadaire</ChartTitle>
        <SimpleChart>
          {stats.weeklyProgress.map((value, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <ChartBar height={value} />
              <ChartLabel>{getWeeklyLabels()[index]}</ChartLabel>
            </div>
          ))}
        </SimpleChart>
      </ChartContainer>
    </StatsWidget>
  );
}










