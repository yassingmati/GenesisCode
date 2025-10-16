// src/components/BackendSyncStatus.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Composant pour afficher le statut de synchronisation avec le backend
 */
export default function BackendSyncStatus() {
  const [status, setStatus] = useState('checking');
  const [lastSync, setLastSync] = useState(null);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 5000
      });
      const endTime = Date.now();
      
      setLatency(endTime - startTime);
      setLastSync(new Date());
      setStatus('connected');
    } catch (error) {
      setError(error.message);
      setStatus('disconnected');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connecté';
      case 'disconnected': return 'Déconnecté';
      case 'checking': return 'Vérification...';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'disconnected': return '#dc3545';
      case 'checking': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '200px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
    onClick={checkBackendStatus}
    title="Cliquer pour vérifier la connexion"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>
          {getStatusIcon()}
        </span>
        <span style={{
          fontWeight: '600',
          color: getStatusColor(),
          fontSize: '0.9rem'
        }}>
          {getStatusText()}
        </span>
      </div>
      
      {status === 'connected' && latency && (
        <div style={{
          fontSize: '0.8rem',
          color: '#6c757d',
          marginBottom: '0.25rem'
        }}>
          Latence: {latency}ms
        </div>
      )}
      
      {lastSync && (
        <div style={{
          fontSize: '0.8rem',
          color: '#6c757d'
        }}>
          Dernière sync: {lastSync.toLocaleTimeString('fr-FR')}
        </div>
      )}
      
      {error && (
        <div style={{
          fontSize: '0.8rem',
          color: '#dc3545',
          marginTop: '0.25rem'
        }}>
          Erreur: {error}
        </div>
      )}
      
      <div style={{
        fontSize: '0.7rem',
        color: '#999',
        marginTop: '0.25rem'
      }}>
        {API_BASE_URL}
      </div>
    </div>
  );
}










