// src/components/RequestOptimizer.jsx
import React, { useState, useEffect } from 'react';

/**
 * Composant pour optimiser les paramètres de requêtes et éviter le rate limiting
 */
export default function RequestOptimizer() {
  const [config, setConfig] = useState({
    minRequestInterval: 2000,
    cacheDuration: 30000,
    maxRetryCount: 3,
    batchSize: 5,
    enableThrottling: true,
    enableCache: true,
    enableBatchProcessing: true
  });

  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    // Charger la configuration depuis le localStorage
    const savedConfig = localStorage.getItem('requestOptimizerConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('requestOptimizerConfig', JSON.stringify(newConfig));
    setIsOptimized(true);
    
    // Appliquer la configuration globalement
    window.requestOptimizerConfig = newConfig;
  };

  const resetToDefaults = () => {
    const defaultConfig = {
      minRequestInterval: 2000,
      cacheDuration: 30000,
      maxRetryCount: 3,
      batchSize: 5,
      enableThrottling: true,
      enableCache: true,
      enableBatchProcessing: true
    };
    saveConfig(defaultConfig);
  };

  const optimizeForRateLimit = () => {
    const optimizedConfig = {
      minRequestInterval: 5000, // 5 secondes entre les requêtes
      cacheDuration: 60000, // 1 minute de cache
      maxRetryCount: 2, // Moins de retry
      batchSize: 3, // Plus petit batch
      enableThrottling: true,
      enableCache: true,
      enableBatchProcessing: true
    };
    saveConfig(optimizedConfig);
  };

  const optimizeForPerformance = () => {
    const optimizedConfig = {
      minRequestInterval: 1000, // 1 seconde entre les requêtes
      cacheDuration: 15000, // 15 secondes de cache
      maxRetryCount: 5, // Plus de retry
      batchSize: 10, // Plus grand batch
      enableThrottling: true,
      enableCache: true,
      enableBatchProcessing: true
    };
    saveConfig(optimizedConfig);
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    saveConfig(newConfig);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      zIndex: 2000,
      minWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>
        ⚙️ Optimiseur de Requêtes
      </h3>

      {/* Presets d'optimisation */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>🎯 Presets</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={optimizeForRateLimit}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            🚫 Anti Rate Limit
          </button>
          
          <button
            onClick={optimizeForPerformance}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            ⚡ Performance
          </button>
          
          <button
            onClick={resetToDefaults}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            🔄 Défaut
          </button>
        </div>
      </div>

      {/* Configuration détaillée */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>⚙️ Configuration</h4>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Intervalle minimum entre requêtes */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Intervalle minimum entre requêtes (ms)
            </label>
            <input
              type="number"
              value={config.minRequestInterval}
              onChange={(e) => handleConfigChange('minRequestInterval', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            />
            <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Recommandé: 2000ms (2s) pour éviter le rate limiting
            </div>
          </div>

          {/* Durée du cache */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Durée du cache (ms)
            </label>
            <input
              type="number"
              value={config.cacheDuration}
              onChange={(e) => handleConfigChange('cacheDuration', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            />
            <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Recommandé: 30000ms (30s) pour réduire les requêtes
            </div>
          </div>

          {/* Nombre maximum de retry */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Nombre maximum de retry
            </label>
            <input
              type="number"
              value={config.maxRetryCount}
              onChange={(e) => handleConfigChange('maxRetryCount', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            />
            <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Recommandé: 3 pour éviter les requêtes excessives
            </div>
          </div>

          {/* Taille des batches */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Taille des batches
            </label>
            <input
              type="number"
              value={config.batchSize}
              onChange={(e) => handleConfigChange('batchSize', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            />
            <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
              Recommandé: 5 pour éviter le rate limiting
            </div>
          </div>
        </div>
      </div>

      {/* Options avancées */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>🔧 Options Avancées</h4>
        
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={config.enableThrottling}
              onChange={(e) => handleConfigChange('enableThrottling', e.target.checked)}
            />
            <span>Activer le throttling des requêtes</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={config.enableCache}
              onChange={(e) => handleConfigChange('enableCache', e.target.checked)}
            />
            <span>Activer le cache des notifications</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={config.enableBatchProcessing}
              onChange={(e) => handleConfigChange('enableBatchProcessing', e.target.checked)}
            />
            <span>Activer le traitement par batch</span>
          </label>
        </div>
      </div>

      {/* Statut */}
      {isOptimized && (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#155724'
        }}>
          ✅ Configuration optimisée et sauvegardée
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          🔄 Appliquer et Recharger
        </button>
      </div>
    </div>
  );
}










