// src/components/ParentalControlsErrorHandler.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Hook pour gérer les erreurs des contrôles parentaux
 */
export const useParentalControlsErrorHandler = () => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = (error, context = '') => {
    console.error(`Erreur contrôles parentaux ${context}:`, error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
          break;
        case 404:
          errorMessage = 'Enfant non trouvé. Vérifiez que l\'enfant existe.';
          break;
        case 422:
          errorMessage = 'Données invalides. Vérifiez les valeurs saisies.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur serveur (${error.response.status})`;
      }
    } else if (error.request) {
      errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
    } else {
      errorMessage = error.message || 'Erreur inconnue';
    }
    
    setError({ 
      message: errorMessage, 
      context, 
      timestamp: new Date(),
      status: error.response?.status 
    });
  };

  const clearError = () => {
    setError(null);
    setRetryCount(0);
  };

  const retry = async (retryFunction) => {
    if (retryCount >= 3) {
      setError({ 
        message: 'Nombre maximum de tentatives atteint', 
        context: 'retry',
        timestamp: new Date() 
      });
      return false;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await retryFunction();
      clearError();
      return true;
    } catch (error) {
      handleError(error, 'retry');
      return false;
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    error,
    retryCount,
    isRetrying,
    handleError,
    clearError,
    retry
  };
};

/**
 * Composant d'affichage des erreurs des contrôles parentaux
 */
export const ParentalControlsErrorDisplay = ({ error, onRetry, onDismiss, isRetrying }) => {
  if (!error) return null;

  const getErrorIcon = (status) => {
    switch (status) {
      case 401: return '🔐';
      case 403: return '🚫';
      case 404: return '👶';
      case 422: return '⚠️';
      case 500: return '⚠️';
      default: return '❌';
    }
  };

  const getErrorColor = (status) => {
    switch (status) {
      case 401: return '#f39c12';
      case 403: return '#e74c3c';
      case 404: return '#95a5a6';
      case 422: return '#f39c12';
      case 500: return '#e67e22';
      default: return '#e74c3c';
    }
  };

  return (
    <div className="parental-controls-error" style={{
      background: 'linear-gradient(135deg, #fee, #fdd)',
      border: '1px solid #fcc',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1rem 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ fontSize: '2rem', flexShrink: 0 }}>
        {getErrorIcon(error.status)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: '#721c24', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
          Erreur de contrôle parental
        </div>
        <div style={{ color: '#721c24', marginBottom: '0.5rem' }}>
          {error.message}
        </div>
        {error.context && (
          <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Contexte: {error.context}
          </div>
        )}
        <div style={{ color: '#999', fontSize: '0.8rem' }}>
          {new Date(error.timestamp).toLocaleTimeString('fr-FR')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            style={{
              background: isRetrying ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            {isRetrying ? '⏳' : '🔄'} Réessayer
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '0.75rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Hook pour la gestion des contrôles parentaux avec retry automatique
 */
export const useParentalControlsManager = (childId) => {
  const [controls, setControls] = useState({
    dailyTimeLimit: 120,
    weeklyTimeLimit: 840,
    allowedTimeSlots: [],
    contentRestrictions: {
      maxDifficulty: 'medium',
      blockedCategories: [],
      allowAdvancedTopics: false,
      allowPublicDiscussions: false,
      allowChat: false
    },
    // weeklyGoals supprimé pour simplifier l'interface
    notifications: {
      email: true,
      dailyReport: true,
      weeklyReport: true,
      achievementAlerts: true,
      timeLimitAlerts: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const { error, handleError, clearError, retry, isRetrying } = useParentalControlsErrorHandler();

  const fetchControls = async () => {
    try {
      setLoading(true);
      clearError();
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get(`${API_BASE_URL}/api/parent/children/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      if (response.data.controls) {
        setControls(response.data.controls);
      }
    } catch (error) {
      handleError(error, 'fetchControls');
    } finally {
      setLoading(false);
    }
  };

  const saveControls = async () => {
    try {
      setSaving(true);
      clearError();
      setSuccess('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/parent/children/${childId}/controls`,
        { parentalControls: controls },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      setSuccess('Contrôles sauvegardés avec succès');
    } catch (error) {
      handleError(error, 'saveControls');
    } finally {
      setSaving(false);
    }
  };

  const retryFetch = () => {
    return retry(fetchControls);
  };

  const retrySave = () => {
    return retry(saveControls);
  };

  const updateControls = (path, value) => {
    setControls(prev => {
      const newControls = { ...prev };
      const keys = path.split('.');
      let current = newControls;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newControls;
    });
  };

  const addTimeSlot = () => {
    setControls(prev => ({
      ...prev,
      allowedTimeSlots: [...prev.allowedTimeSlots, {
        dayOfWeek: 0,
        startTime: '09:00',
        endTime: '18:00'
      }]
    }));
  };

  const removeTimeSlot = (index) => {
    setControls(prev => ({
      ...prev,
      allowedTimeSlots: prev.allowedTimeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index, field, value) => {
    setControls(prev => ({
      ...prev,
      allowedTimeSlots: prev.allowedTimeSlots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  return {
    controls,
    loading,
    saving,
    error,
    success,
    isRetrying,
    setControls,
    updateControls,
    addTimeSlot,
    removeTimeSlot,
    updateTimeSlot,
    fetchControls,
    saveControls,
    retryFetch,
    retrySave,
    clearError,
    setSuccess
  };
};
