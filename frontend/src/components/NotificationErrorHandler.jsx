// src/components/NotificationErrorHandler.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Hook personnalisé pour gérer les erreurs de notifications
 */
export const useNotificationErrorHandler = () => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = (error, context = '') => {
    console.error(`Erreur notification ${context}:`, error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.response) {
      // Erreur de réponse du serveur
      switch (error.response.status) {
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Accès refusé. Vérifiez vos permissions.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = `Erreur serveur (${error.response.status})`;
      }
    } else if (error.request) {
      // Erreur de réseau
      errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
    } else {
      // Autre erreur
      errorMessage = error.message || 'Erreur inconnue';
    }
    
    setError({ message: errorMessage, context, timestamp: new Date() });
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
 * Composant d'affichage des erreurs de notifications
 */
export const NotificationErrorDisplay = ({ error, onRetry, onDismiss, isRetrying }) => {
  if (!error) return null;

  const getErrorIcon = (status) => {
    switch (status) {
      case 401: return '🔐';
      case 403: return '🚫';
      case 404: return '❓';
      case 500: return '⚠️';
      default: return '❌';
    }
  };

  const getErrorColor = (status) => {
    switch (status) {
      case 401: return '#f39c12';
      case 403: return '#e74c3c';
      case 404: return '#95a5a6';
      case 500: return '#e67e22';
      default: return '#e74c3c';
    }
  };

  return (
    <div className="notification-error" style={{
      background: 'linear-gradient(135deg, #fee, #fdd)',
      border: '1px solid #fcc',
      borderRadius: '8px',
      padding: '1rem',
      margin: '1rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ fontSize: '1.5rem' }}>
        {getErrorIcon(error.status)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: '#721c24', marginBottom: '0.25rem' }}>
          Erreur de notification
        </div>
        <div style={{ color: '#721c24', fontSize: '0.9rem' }}>
          {error.message}
        </div>
        {error.context && (
          <div style={{ color: '#999', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Contexte: {error.context}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            style={{
              background: isRetrying ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem'
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
              borderRadius: '4px',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem'
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
 * Hook pour la gestion des notifications avec retry automatique
 */
export const useNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError, retry, isRetrying } = useNotificationErrorHandler();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      clearError();
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 secondes de timeout
      });
      
      setNotifications(response.data || []);
    } catch (error) {
      handleError(error, 'fetch');
      // En cas d'erreur, utiliser des notifications de démonstration
      setNotifications(getDemoNotifications());
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      handleError(error, 'markAsRead');
      // Marquer comme lu localement même en cas d'erreur
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await Promise.all(
        unreadNotifications.map(notification => 
          axios.put(`${API_BASE_URL}/api/notifications/${notification.id}/read`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          })
        )
      );
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      handleError(error, 'markAllAsRead');
      // Marquer toutes comme lues localement
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  const retryFetch = () => {
    return retry(fetchNotifications);
  };

  return {
    notifications,
    loading,
    error,
    isRetrying,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    retryFetch,
    clearError
  };
};

// Notifications de démonstration
const getDemoNotifications = () => [
  {
    id: 'demo-1',
    type: 'child_progress',
    title: 'Progrès de votre enfant',
    message: 'Marie a terminé 3 nouveaux exercices aujourd\'hui',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    priority: 'high'
  },
  {
    id: 'demo-2',
    type: 'time_limit',
    title: 'Limite de temps atteinte',
    message: 'Pierre a atteint sa limite de temps quotidienne',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    priority: 'high'
  },
  {
    id: 'demo-3',
    type: 'achievement',
    title: 'Nouveau badge débloqué',
    message: 'Sophie a gagné le badge "Persévérance"',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    priority: 'medium'
  }
];




