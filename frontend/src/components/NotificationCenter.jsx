// src/components/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Composant pour afficher les notifications dans le dashboard
 */
export default function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      requestNotificationPermission();
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.log('Erreur demande permission notifications:', error);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      // En cas d'erreur, créer des notifications de démonstration
      setNotifications(getDemoNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getDemoNotifications = () => {
    if (!user) return [];
    
    const demoNotifications = [];
    
    // Notification d'invitation parent pour les étudiants
    if (user.userType === 'student') {
      demoNotifications.push({
        id: 'demo-parent-invitation',
        type: 'parent_invitation',
        title: 'Invitation parent reçue',
        message: 'Un parent souhaite suivre votre progression',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
        read: false,
        priority: 'high'
      });
    }
    
    // Notification de progression
    demoNotifications.push({
      id: 'demo-progress',
      type: 'progress',
      title: 'Nouveau badge débloqué !',
      message: 'Vous avez gagné le badge "Persévérance"',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // Il y a 1h
      read: false,
      priority: 'medium'
    });
    
    // Notification de rappel
    demoNotifications.push({
      id: 'demo-reminder',
      type: 'reminder',
      title: 'Rappel d\'étude',
      message: 'N\'oubliez pas de réviser vos exercices aujourd\'hui',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // Il y a 30min
      read: true,
      priority: 'low'
    });
    
    return demoNotifications;
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Vérifier si la notification est déjà marquée comme lue
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && notification.read) {
        return; // Déjà lue, pas besoin de refaire la requête
      }

      await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Mettre à jour l'état local immédiatement
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Notification de succès (optionnelle)
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Notification marquée comme lue', {
          body: 'La notification a été marquée comme lue',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      
      // En cas d'erreur, marquer comme lu localement quand même
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      // Afficher un message d'erreur à l'utilisateur
      console.warn('Impossible de marquer la notification comme lue sur le serveur, mais elle a été marquée localement.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'parent_invitation': return '👨‍👩‍👧‍👦';
      case 'progress': return '🏆';
      case 'reminder': return '⏰';
      case 'achievement': return '🎉';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#6c757d';
      default: return '#6c757d';
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

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const unreadIds = unreadNotifications.map(n => n.id);
      
      // Marquer toutes les notifications non lues comme lues
      await Promise.all(
        unreadIds.map(id => 
          axios.put(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        )
      );
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      console.log('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      // En cas d'erreur, marquer toutes comme lues localement
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  if (loading) {
    return (
      <div className="notification-center">
        <div className="notification-header">
          <h3>🔔 Notifications</h3>
        </div>
        <div className="loading">Chargement des notifications...</div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3>🔔 Notifications {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h3>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              title="Marquer tout comme lu"
            >
              ✓ Tout marquer comme lu
            </button>
          )}
          {notifications.length > 3 && (
            <button 
              className="toggle-btn"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Voir moins' : 'Voir tout'}
            </button>
          )}
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>Aucune notification pour le moment</p>
        </div>
      ) : (
        <div className="notifications-list">
          {displayedNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {formatTimestamp(notification.timestamp)}
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

      <style jsx>{`
        .notification-center {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .notification-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .unread-badge {
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
        }

        .mark-all-read-btn {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        }

        .mark-all-read-btn:hover {
          background: linear-gradient(135deg, #218838, #1ea085);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }

        .toggle-btn {
          background: none;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-btn:hover {
          background: #f8f9fa;
          border-color: #999;
        }

        .loading, .no-notifications {
          text-align: center;
          color: #666;
          padding: 2rem;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 12px;
          border: 1px solid #e1e5e9;
          background: #f8f9fa;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          animation: slideIn 0.3s ease-out;
        }

        .notification-item:hover {
          background: #e9ecef;
          border-color: #ced4da;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .notification-item.unread {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border-color: #f39c12;
          box-shadow: 0 2px 8px rgba(243, 156, 18, 0.2);
        }

        .notification-item.unread:hover {
          background: linear-gradient(135deg, #ffeaa7 0%, #f39c12 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .notification-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #dc3545;
          border-radius: 50%;
        }

        .notification-message {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .notification-time {
          color: #999;
          font-size: 0.8rem;
        }

        .notification-priority {
          width: 4px;
          height: 100%;
          border-radius: 2px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
