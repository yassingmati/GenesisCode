// src/components/parent/ActivityChart.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ChartContainer = styled.div`
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
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px 20px 0 0;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PeriodButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.active ? 'white' : '#667eea'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)' : 'rgba(102, 126, 234, 0.1)'};
    transform: translateY(-1px);
  }
`;

const ChartContent = styled.div`
  position: relative;
  height: 300px;
  display: flex;
  align-items: end;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChartBar = styled.div`
  flex: 1;
  background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 4px 4px 0 0;
  height: ${props => props.height}%;
  transition: height 0.8s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 4px;

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

  &:hover {
    transform: scaleY(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
  font-weight: 500;
`;

const ChartValue = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  white-space: nowrap;

  ${ChartBar}:hover & {
    opacity: 1;
  }
`;

const LineChart = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const LinePath = styled.path`
  fill: none;
  stroke: ${props => props.color || '#667eea'};
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const AreaPath = styled.path`
  fill: ${props => props.color || 'rgba(102, 126, 234, 0.1)'};
  opacity: 0.6;
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
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid #f5c6cb;
  text-align: center;
`;

export default function ActivityChart({ 
  data = [], 
  type = 'bar', 
  title = 'Activité',
  period = 'week',
  onPeriodChange,
  loading = false,
  error = null,
  colors = ['#667eea', '#764ba2', '#f39c12', '#e74c3c', '#27ae60']
}) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Normaliser les données pour l'affichage
  const normalizedData = data.map((item, index) => ({
    ...item,
    height: Math.max((item.value / Math.max(...data.map(d => d.value))) * 100, 2),
    color: colors[index % colors.length]
  }));

  const handleBarHover = (index) => {
    setHoveredBar(index);
  };

  const handleBarLeave = () => {
    setHoveredBar(null);
  };

  if (loading) {
    return (
      <ChartContainer>
        <LoadingSpinner>Chargement des données...</LoadingSpinner>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </ChartContainer>
    );
  }

  if (data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>📊 {title}</ChartTitle>
        <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
          Aucune donnée disponible
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>📊 {title}</ChartTitle>
        {onPeriodChange && (
          <ChartControls>
            {['day', 'week', 'month', 'year'].map(periodType => (
              <PeriodButton
                key={periodType}
                active={period === periodType}
                onClick={() => onPeriodChange(periodType)}
              >
                {periodType === 'day' ? 'Jour' : 
                 periodType === 'week' ? 'Semaine' :
                 periodType === 'month' ? 'Mois' : 'Année'}
              </PeriodButton>
            ))}
          </ChartControls>
        )}
      </ChartHeader>

      <ChartContent>
        {type === 'bar' ? (
          normalizedData.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <ChartBar
                height={item.height}
                color={item.color}
                onMouseEnter={() => handleBarHover(index)}
                onMouseLeave={handleBarLeave}
              >
                <ChartValue>
                  {item.value} {item.unit || ''}
                </ChartValue>
              </ChartBar>
              <ChartLabel>{item.label}</ChartLabel>
            </div>
          ))
        ) : type === 'line' ? (
          <LineChart viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(102, 126, 234, 0.3)" />
                <stop offset="100%" stopColor="rgba(102, 126, 234, 0.05)" />
              </linearGradient>
            </defs>
            
            {/* Zone sous la courbe */}
            <AreaPath
              d={`M 0,100 ${normalizedData.map((item, index) => {
                const x = (index / (normalizedData.length - 1)) * 100;
                const y = 100 - item.height;
                return `L ${x},${y}`;
              }).join(' ')} L 100,100 Z`}
              color="url(#areaGradient)"
            />
            
            {/* Ligne */}
            <LinePath
              d={`M 0,${100 - normalizedData[0]?.height || 50} ${normalizedData.map((item, index) => {
                const x = (index / (normalizedData.length - 1)) * 100;
                const y = 100 - item.height;
                return `L ${x},${y}`;
              }).join(' ')}`}
              color="#667eea"
            />
            
            {/* Points */}
            {normalizedData.map((item, index) => {
              const x = (index / (normalizedData.length - 1)) * 100;
              const y = 100 - item.height;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#667eea"
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </LineChart>
        ) : null}
      </ChartContent>
    </ChartContainer>
  );
}
