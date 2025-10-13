// src/components/PerformanceMonitor.jsx
import React, { useState, useEffect } from 'react';

/**
 * Composant pour surveiller les performances et détecter les problèmes de lag
 */
export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    queueSize: 0,
    lastUpdate: null
  });

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    // Simulation de métriques réelles
    const now = Date.now();
    const newMetrics = {
      requestCount: Math.floor(Math.random() * 100),
      averageResponseTime: Math.floor(Math.random() * 2000) + 100,
      errorRate: Math.random() * 10,
      cacheHitRate: Math.random() * 100,
      queueSize: Math.floor(Math.random() * 20),
      lastUpdate: now
    };

    setMetrics(newMetrics);

    // Détection d'alertes
    const newAlerts = [];
    
    if (newMetrics.averageResponseTime > 1000) {
      newAlerts.push({
        type: 'warning',
        message: 'Temps de réponse élevé détecté',
        timestamp: now
      });
    }

    if (newMetrics.errorRate > 5) {
      newAlerts.push({
        type: 'error',
        message: 'Taux d\'erreur élevé détecté',
        timestamp: now
      });
    }

    if (newMetrics.queueSize > 10) {
      newAlerts.push({
        type: 'warning',
        message: 'Queue de requêtes saturée',
        timestamp: now
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // Garder seulement les 10 dernières
    }
  };

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.good) return '#28a745';
    if (value <= thresholds.warning) return '#ffc107';
    return '#dc3545';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR');
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
        📊 Monitoring des Performances
      </h4>

      {/* Métriques principales */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          fontSize: '0.8rem'
        }}>
          <div style={{
            background: '#f8f9fa',
            padding: '0.5rem',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#495057' }}>Requêtes</div>
            <div style={{ 
              color: getStatusColor(metrics.requestCount, { good: 20, warning: 50 }),
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {metrics.requestCount}
            </div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '0.5rem',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#495057' }}>Temps moyen</div>
            <div style={{ 
              color: getStatusColor(metrics.averageResponseTime, { good: 500, warning: 1000 }),
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {metrics.averageResponseTime}ms
            </div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '0.5rem',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#495057' }}>Erreurs</div>
            <div style={{ 
              color: getStatusColor(metrics.errorRate, { good: 2, warning: 5 }),
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {metrics.errorRate.toFixed(1)}%
            </div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '0.5rem',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: '#495057' }}>Cache</div>
            <div style={{ 
              color: getStatusColor(100 - metrics.cacheHitRate, { good: 20, warning: 50 }),
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {metrics.cacheHitRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Queue de requêtes */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          background: metrics.queueSize > 5 ? '#fff3cd' : '#d1ecf1',
          border: `1px solid ${metrics.queueSize > 5 ? '#ffeaa7' : '#bee5eb'}`,
          borderRadius: '6px',
          padding: '0.5rem',
          fontSize: '0.8rem',
          color: metrics.queueSize > 5 ? '#856404' : '#0c5460'
        }}>
          <div style={{ fontWeight: '600' }}>
            Queue: {metrics.queueSize} requêtes
            {metrics.queueSize > 5 && ' ⚠️'}
          </div>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
            🚨 Alertes ({alerts.length})
          </div>
          <div style={{ maxHeight: '150px', overflow: 'auto' }}>
            {alerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  background: alert.type === 'error' ? '#f8d7da' : '#fff3cd',
                  border: `1px solid ${alert.type === 'error' ? '#f5c6cb' : '#ffeaa7'}`,
                  borderRadius: '4px',
                  padding: '0.5rem',
                  marginBottom: '0.25rem',
                  fontSize: '0.7rem',
                  color: alert.type === 'error' ? '#721c24' : '#856404'
                }}
              >
                <div style={{ fontWeight: '600' }}>
                  {alert.type === 'error' ? '❌' : '⚠️'} {alert.message}
                </div>
                <div style={{ color: '#6c757d' }}>
                  {formatTime(alert.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setAlerts([])}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.7rem',
            cursor: 'pointer'
          }}
        >
          Effacer alertes
        </button>
        <button
          onClick={updateMetrics}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.5rem',
            fontSize: '0.7rem',
            cursor: 'pointer'
          }}
        >
          Actualiser
        </button>
      </div>
    </div>
  );
}




