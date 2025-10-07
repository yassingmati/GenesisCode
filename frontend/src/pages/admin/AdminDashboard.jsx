// src/admin/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Conteneur principal
const Container = styled.div`
  padding: 2rem;
`;

// Titres
const Title = styled.h1`
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-weight: 700;
  font-size: 2.2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  animation: ${fadeIn} 0.7s ease-out;
`;

// Grid de cards
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

// Une card individuelle
const Card = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  text-align: center;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 4px;
    background: ${props => props.color};
  }
`;

// Icône dans la card
const CardIcon = styled.div`
  width: 70px; height: 70px;
  border-radius: 50%;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.2rem;
  color: white;
  font-size: 1.8rem;
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.1);
    animation: ${pulse} 1.5s infinite;
  }
`;

const CardTitle = styled.h3`
  margin-bottom: 0.8rem;
  color: #34495e;
  font-weight: 600;
  font-size: 1.1rem;
`;

const CardValue = styled.p`
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

// Container du graphique
const ChartContainer = styled.div`
  background: #fff;
  padding: 1.8rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const ChartTitle = styled.h2`
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
`;

const Chart = styled.div`
  height: 300px;
  background: linear-gradient(120deg, #f6f9fc, #eef2f7);
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  gap: 1.2rem;
`;

const Bar = styled.div`
  flex: 1;
  background: ${props => props.color};
  height: ${props => props.height}%;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 0.8s ease;

  &::before {
    content: '${props => props.label}';
    position: absolute;
    top: -25px; left: 0;
    width: 100%;
    text-align: center;
    font-weight: 600;
    color: #2c3e50;
  }

  &::after {
    content: '${props => props.value}';
    position: absolute;
    bottom: -30px; left: 0;
    width: 100%;
    text-align: center;
    font-weight: 600;
    color: #7f8c8d;
  }
`;

// Spinner de chargement
const Spinner = styled.div`
  width: 50px; height: 50px;
  border: 5px solid rgba(52,152,219,0.2);
  border-top: 5px solid #3498db;
  border-radius: 50%;
  margin: 2rem auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
  font-weight: 500;
`;

export default function AdminDashboard() {
  const [stats, setStats]       = useState({ users:0, courses:0, payments:0, contentItems:0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [chartData] = useState([
    { label: 'Lun', value: 65, color: '#3498db' },
    { label: 'Mar', value: 82, color: '#2ecc71' },
    { label: 'Mer', value: 47, color: '#e74c3c' },
    { label: 'Jeu', value: 73, color: '#f39c12' },
    { label: 'Ven', value: 91, color: '#9b59b6' },
    { label: 'Sam', value: 58, color: '#1abc9c' },
    { label: 'Dim', value: 34, color: '#d35400' },
  ]);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/dashboard-stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setLoading(false);
      });
  }, []);

  return (
    <Container>
      <Title>Bienvenue sur le Dashboard Admin</Title>
      <Subtitle>Consultez les statistiques et les indicateurs clés</Subtitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <Spinner />
      ) : (
        <>
          <CardGrid>
            <Card color="#3498db">
              <CardIcon bg="#3498db">👥</CardIcon>
              <CardTitle>Utilisateurs</CardTitle>
              <CardValue>{stats.users}</CardValue>
            </Card>
            <Card color="#2ecc71">
              <CardIcon bg="#2ecc71">📚</CardIcon>
              <CardTitle>Cours</CardTitle>
              <CardValue>{stats.courses}</CardValue>
            </Card>
            <Card color="#e74c3c">
              <CardIcon bg="#e74c3c">💳</CardIcon>
              <CardTitle>Paiements</CardTitle>
              <CardValue>{stats.payments}</CardValue>
            </Card>
            <Card color="#f39c12">
              <CardIcon bg="#f39c12">📝</CardIcon>
              <CardTitle>Contenu</CardTitle>
              <CardValue>{stats.contentItems}</CardValue>
            </Card>
          </CardGrid>

          <ChartContainer>
            <ChartTitle>Activité hebdomadaire</ChartTitle>
            <Chart>
              {chartData.map((item,i) => (
                <Bar
                  key={i}
                  color={item.color}
                  height={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </Chart>
          </ChartContainer>
        </>
      )}
    </Container>
  );
}
