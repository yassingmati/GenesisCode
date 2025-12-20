// src/components/FacebookStyleNotifications.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationCache } from '../hooks/useNotificationCache';
import { useRequestThrottle } from '../hooks/useRequestThrottle';
import { NotificationErrorDisplay } from './NotificationErrorHandler';
import { IconBell, IconCheck, IconChecks, IconAlertCircle, IconClock, IconTrophy, IconChartBar, IconUsers } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant de notifications style Facebook avec redirection et design amélioré
 */
export default function FacebookStyleNotifications({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    isLoading: loading,
    error,
    retryCount,
    lastFetch,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    isRateLimited
  } = useNotificationCache();

  const { throttleRequest } = useRequestThrottle(2000);

  useEffect(() => {
    if (user) {
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

  const getRedirectUrl = (notification) => {
    // Si une URL est fournie dans la notif, l'utiliser (ex: data.url ou link)
    if (notification.link || notification.data?.url) {
      return notification.link || notification.data?.url;
    }

    switch (notification.type) {
      case 'parent_invitation': return '/dashboard/profile'; // Pour accepter l'invitation
      case 'progress': return '/dashboard/achievements';
      case 'achievement': return '/dashboard/achievements';
      case 'reminder': return '/dashboard';
      case 'weekly_report': return '/parent/dashboard'; // Pour les parents
      case 'child_progress': return '/parent/dashboard';
      case 'warning': return '/dashboard/settings';
      default: return '/dashboard';
    }
  };

  const handleNotificationClick = async (notification) => {
    // 1. Marquer comme lu si nécessaire
    if (!notification.read) {
      // Ne pas attendre pour la navigation, faire l'appel en fond
      throttleRequest(() => markAsRead(notification.id), `mark-${notification.id}`);
    }

    // 2. Rediriger
    const url = getRedirectUrl(notification);
    setIsOpen(false);
    navigate(url);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation(); // Éviter de fermer le dropdown si on clique sur le bouton
    try {
      await throttleRequest(() => markAllAsRead(), 'mark-all');
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'parent_invitation': return <IconUsers className="text-blue-500" size={20} />;
      case 'progress': return <IconChartBar className="text-green-500" size={20} />;
      case 'achievement': return <IconTrophy className="text-yellow-500" size={20} />;
      case 'reminder': return <IconClock className="text-purple-500" size={20} />;
      case 'warning': return <IconAlertCircle className="text-red-500" size={20} />;
      default: return <IconBell className="text-gray-500" size={20} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Moins d'une minute
    if (diff < 60000) return 'À l\'instant';
    // Moins d'une heure
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    // Moins d'un jour
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
    // Plus d'un jour
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Notifications</span>
        <IconBell size={24} className="text-slate-600 dark:text-slate-300" />

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  <IconChecks size={14} />
                  Tout lu
                </button>
              )}
            </div>

            {/* Error & Status */}
            {error && (
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <NotificationErrorDisplay
                  error={error}
                  onRetry={() => fetchNotifications(true)}
                  isRetrying={retryCount > 0}
                  compact
                />
              </div>
            )}

            {/* Content list */}
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                  <span className="text-xs">Chargement...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
                    <IconBell size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Aucune notification</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        relative group flex gap-4 px-4 py-3 cursor-pointer transition-colors duration-200
                        ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                      `}
                    >
                      <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate pr-4 ${!notification.read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-2 ${!notification.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                          {notification.message}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                className="w-full py-1.5 text-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Voir tout l'historique
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
