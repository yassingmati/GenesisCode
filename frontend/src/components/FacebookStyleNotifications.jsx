// src/components/FacebookStyleNotifications.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNotificationCache } from '../hooks/useNotificationCache';
import { useRequestThrottle } from '../hooks/useRequestThrottle';
import { NotificationErrorDisplay } from './NotificationErrorHandler';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Composant de notifications style Facebook avec écon
 */
export default function FacebookStyleNotifications({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(new Set());
  const notificationRef = useRef(null);
  
  const {
    notifications,
    isLoading: loading,
    error,
    retryCount,
    lastFetch,
    isStale,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    isRateLimited
  } = useNotificationCache();
  
  const { throttleRequest, getQueueSize } = useRequestThrottle(2000);

  useEffect(() => {
    if (user) {
      // Utiliser le throttling pour éviter les requêtes excessives
      throttleRequest(() => fetchNotifications());
      requestNotificationPermission();
    }
  }, [user, fetchNotifications, throttleRequest]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.log('Erreur demande permission notifications:', error);
      }
    }
  };



  const handleMarkAsRead = async (notificationId) => {
    if (markingAsRead.has(notificationId)) return;
    
    setMarkingAsRead(prev => new Set([...prev, notificationId]));
    
    try {
      // Utiliser le throttling pour éviter les requêtes excessives
      await throttleRequest(() => markAsRead(notificationId), `mark-${notificationId}`);
      
      // Notification de succès
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Notification marquée comme lue', {
          body: 'La notification a été marquée comme lue',
          icon: '/favicon.ico'
        });
      }
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Utiliser le throttling pour éviter les requêtes excessives
      await throttleRequest(() => markAllAsRead(), 'mark-all');
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'child_progress': return '👧';
      case 'time_limit': return '⏰';
      case 'achievement': return '🏆';
      case 'weekly_report': return '📊';
      case 'parent_invitation': return '👨‍👩‍👧‍👦';
      case 'progress': return '📈';
      case 'reminder': return '🔔';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div className="facebook-notifications" ref={notificationRef}>
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <NotificationErrorDisplay 
              error={error}
              onRetry={() => throttleRequest(() => refreshNotifications())}
              onDismiss={() => {/* clearError sera géré par le cache */}}
              isRetrying={retryCount > 0}
            />
          )}

          {/* Indicateurs de statut */}
          <div className="notification-status" style={{
            padding: '0.5rem 1rem',
            background: isRateLimited ? '#fff3cd' : '#d1ecf1',
            border: `1px solid ${isRateLimited ? '#ffeaa7' : '#bee5eb'}`,
            borderRadius: '6px',
            margin: '0.5rem 0',
            fontSize: '0.8rem',
            color: isRateLimited ? '#856404' : '#0c5460'
          }}>
            {isRateLimited ? (
              <div>⚠️ Rate limit détecté - Utilisation du cache local</div>
            ) : (
              <div>
                📊 Cache: {lastFetch ? `Mis à jour ${Math.floor((Date.now() - lastFetch) / 1000)}s ago` : 'Non initialisé'}
                {getQueueSize() > 0 && ` | Queue: ${getQueueSize()} requêtes en attente`}
                {retryCount > 0 && ` | Retry: ${retryCount}/3`}
              </div>
            )}
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="loading-notifications">
                <div className="spinner"></div>
                <span>Chargement des notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <div className="empty-icon">🔔</div>
                <p>Aucune notification pour le moment</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-avatar">
                      {notification.avatar || getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-body">
                      <div className="notification-title">
                        {notification.title}
                        {!notification.read && <div className="unread-dot"></div>}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-footer">
                        <span className="notification-time">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        {notification.action && (
                          <span className="notification-action">
                            {notification.action}
                          </span>
                        )}
                      </div>
                    </div>
                    <div 
                      className="notification-priority"
                      style={{ backgroundColor: getPriorityColor(notification.priority) }}
                    ></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .facebook-notifications {
          position: relative;
          display: inline-block;
        }

        .notification-bell {
          position: relative;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .notification-bell:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .bell-icon {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .notification-bell:hover .bell-icon {
          transform: rotate(15deg);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .notification-dropdown {
          position: absolute;
          top: 60px;
          right: 0;
          width: 400px;
          max-height: 500px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
          z-index: 1000;
          animation: slideDown 0.3s ease-out;
          overflow: hidden;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }

        .notification-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .mark-all-read {
          background: none;
          border: none;
          color: #007bff;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 5px;
          transition: background 0.2s ease;
        }

        .mark-all-read:hover {
          background: rgba(0, 123, 255, 0.1);
        }

        .notification-content {
          max-height: 400px;
          overflow-y: auto;
        }

        .loading-notifications {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
          color: #666;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-notifications {
          text-align: center;
          padding: 3rem 2rem;
          color: #666;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .notifications-list {
          padding: 0;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .notification-item.unread {
          background: linear-gradient(135deg, #fff3cd, #ffeaa7);
          border-left: 4px solid #f39c12;
        }

        .notification-item.unread:hover {
          background: linear-gradient(135deg, #ffeaa7, #f39c12);
        }

        .notification-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .notification-body {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #e74c3c;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .notification-message {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .notification-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
        }

        .notification-time {
          color: #999;
        }

        .notification-action {
          color: #007bff;
          font-weight: 500;
        }

        .notification-priority {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 3px;
        }

        /* Scrollbar styling */
        .notification-content::-webkit-scrollbar {
          width: 6px;
        }

        .notification-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .notification-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .notification-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
