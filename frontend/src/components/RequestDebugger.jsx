// src/components/RequestDebugger.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Composant pour déboguer les requêtes et détecter les problèmes de rate limiting
 */
export default function RequestDebugger() {
  const [requests, setRequests] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    errors: 0,
    rateLimited: 0,
    averageTime: 0
  });

  useEffect(() => {
    if (!isMonitoring) return;

    // Intercepter les requêtes axios
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const requestId = Math.random().toString(36).substr(2, 9);
        const startTime = Date.now();
        
        setRequests(prev => [...prev, {
          id: requestId,
          url: config.url,
          method: config.method?.toUpperCase(),
          startTime,
          status: 'pending',
          timestamp: new Date()
        }]);

        return { ...config, requestId, startTime };
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        const endTime = Date.now();
        const duration = endTime - (response.config.startTime || endTime);
        
        setRequests(prev => prev.map(req => 
          req.id === response.config.requestId 
            ? { ...req, status: 'success', duration, endTime }
            : req
        ));

        updateStats('success', duration);
        return response;
      },
      (error) => {
        const endTime = Date.now();
        const duration = endTime - (error.config?.startTime || endTime);
        const isRateLimited = error.response?.status === 429 || 
                              error.response?.status === 503 ||
                              error.message?.includes('rate limit');
        
        setRequests(prev => prev.map(req => 
          req.id === error.config?.requestId 
            ? { 
                ...req, 
                status: 'error', 
                duration, 
                endTime,
                error: error.message,
                isRateLimited
              }
            : req
        ));

        updateStats(isRateLimited ? 'rateLimited' : 'error', duration);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [isMonitoring]);

  const updateStats = (type, duration) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.total += 1;
      
      if (type === 'success') {
        newStats.success += 1;
      } else if (type === 'error') {
        newStats.errors += 1;
      } else if (type === 'rateLimited') {
        newStats.rateLimited += 1;
      }
      
      // Calculer le temps moyen
      newStats.averageTime = ((newStats.averageTime * (newStats.total - 1)) + duration) / newStats.total;
      
      return newStats;
    });
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setRequests([]);
    setStats({ total: 0, success: 0, errors: 0, rateLimited: 0, averageTime: 0 });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const clearRequests = () => {
    setRequests([]);
    setStats({ total: 0, success: 0, errors: 0, rateLimited: 0, averageTime: 0 });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatDuration = (duration) => {
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
        🔍 Debugger de Requêtes
      </h4>

      {/* Contrôles */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          style={{
            background: isMonitoring ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          {isMonitoring ? '⏹️ Arrêter' : '▶️ Démarrer'} Monitoring
        </button>
        
        <button
          onClick={clearRequests}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          🗑️ Effacer
        </button>
      </div>

      {/* Statistiques */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        fontSize: '0.8rem'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📊 Statistiques</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div>Total: {stats.total}</div>
          <div style={{ color: '#28a745' }}>Succès: {stats.success}</div>
          <div style={{ color: '#dc3545' }}>Erreurs: {stats.errors}</div>
          <div style={{ color: '#ffc107' }}>Rate Limited: {stats.rateLimited}</div>
          <div>Temps moyen: {formatDuration(stats.averageTime)}</div>
          <div style={{ color: stats.rateLimited > 0 ? '#dc3545' : '#28a745' }}>
            Status: {stats.rateLimited > 0 ? '⚠️ Rate Limited' : '✅ OK'}
          </div>
        </div>
      </div>

      {/* Liste des requêtes */}
      {requests.length > 0 && (
        <div>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
            📋 Requêtes ({requests.length})
          </div>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {requests.slice(-10).reverse().map((request) => (
              <div
                key={request.id}
                style={{
                  background: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.7rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <span style={{ fontSize: '1rem' }}>
                    {getStatusIcon(request.status)}
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: getStatusColor(request.status)
                  }}>
                    {request.method} {request.url?.replace(API_BASE_URL, '')}
                  </span>
                  {request.duration && (
                    <span style={{ color: '#6c757d' }}>
                      ({formatDuration(request.duration)})
                    </span>
                  )}
                </div>
                
                {request.error && (
                  <div style={{ color: '#dc3545', fontSize: '0.6rem' }}>
                    Erreur: {request.error}
                  </div>
                )}
                
                {request.isRateLimited && (
                  <div style={{ color: '#ffc107', fontSize: '0.6rem' }}>
                    ⚠️ Rate Limited
                  </div>
                )}
                
                <div style={{ color: '#6c757d', fontSize: '0.6rem' }}>
                  {request.timestamp.toLocaleTimeString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isMonitoring && (
        <div style={{
          textAlign: 'center',
          color: '#6c757d',
          fontSize: '0.8rem',
          padding: '2rem'
        }}>
          Cliquez sur "Démarrer Monitoring" pour commencer
        </div>
      )}
    </div>
  );
}










