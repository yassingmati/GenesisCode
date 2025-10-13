// src/hooks/useNotificationCache.js
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Hook pour gérer le cache et le throttling des notifications
 */
export const useNotificationCache = () => {
  const [cache, setCache] = useState({
    notifications: [],
    lastFetch: null,
    isStale: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const lastRequestTimeRef = useRef(0);
  
  // Configuration du throttling
  const MIN_REQUEST_INTERVAL = 2000; // 2 secondes minimum entre les requêtes
  const CACHE_DURATION = 30000; // 30 secondes de cache
  const MAX_RETRY_COUNT = 3;
  const RETRY_DELAYS = [1000, 2000, 5000]; // Délais progressifs pour retry

  const isRateLimited = (error) => {
    return error.response?.status === 429 || 
           error.response?.status === 503 ||
           error.message?.includes('rate limit') ||
           error.message?.includes('trop de requêtes');
  };

  const getRetryDelay = (retryCount) => {
    return RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)] || 10000;
  };

  const shouldFetch = useCallback(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - (cache.lastFetch || 0);
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    return (
      !cache.lastFetch || 
      timeSinceLastFetch > CACHE_DURATION ||
      cache.isStale
    ) && timeSinceLastRequest > MIN_REQUEST_INTERVAL;
  }, [cache.lastFetch, cache.isStale]);

  const fetchNotifications = useCallback(async (force = false) => {
    if (!force && !shouldFetch()) {
      console.log('Notifications en cache, pas de requête nécessaire');
      return cache.notifications;
    }

    if (isLoading) {
      console.log('Requête déjà en cours, attente...');
      return cache.notifications;
    }

    const now = Date.now();
    if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
      console.log('Throttling: attente avant nouvelle requête');
      return cache.notifications;
    }

    try {
      setIsLoading(true);
      setError(null);
      lastRequestTimeRef.current = now;

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const notifications = response.data || [];
      
      setCache({
        notifications,
        lastFetch: now,
        isStale: false
      });
      
      setRetryCount(0);
      return notifications;

    } catch (error) {
      console.error('Erreur fetch notifications:', error);
      setError(error);
      
      if (isRateLimited(error)) {
        console.warn('Rate limit détecté, utilisation du cache');
        return cache.notifications;
      }

      // Retry avec backoff exponentiel
      if (retryCount < MAX_RETRY_COUNT) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retry dans ${delay}ms (tentative ${retryCount + 1}/${MAX_RETRY_COUNT})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchNotifications(true);
        }, delay);
      }

      return cache.notifications;
    } finally {
      setIsLoading(false);
    }
  }, [cache, isLoading, retryCount, shouldFetch]);

  const markAsRead = useCallback(async (notificationId) => {
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

      // Mise à jour optimiste du cache
      setCache(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      }));

    } catch (error) {
      console.error('Erreur marquage notification:', error);
      
      if (isRateLimited(error)) {
        console.warn('Rate limit lors du marquage, mise à jour locale uniquement');
      }
      
      // Mise à jour locale même en cas d'erreur
      setCache(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      }));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = cache.notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Traitement par batch pour éviter le rate limiting
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < unreadNotifications.length; i += batchSize) {
        batches.push(unreadNotifications.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.all(
          batch.map(notification => 
            axios.put(`${API_BASE_URL}/api/notifications/${notification.id}/read`, {}, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 5000
            })
          )
        );
        
        // Délai entre les batches pour éviter le rate limiting
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Mise à jour du cache
      setCache(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => ({ ...notif, read: true }))
      }));

    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      
      if (isRateLimited(error)) {
        console.warn('Rate limit lors du marquage en masse, mise à jour locale');
      }
      
      // Mise à jour locale
      setCache(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => ({ ...notif, read: true }))
      }));
    }
  }, [cache.notifications]);

  const invalidateCache = useCallback(() => {
    setCache(prev => ({ ...prev, isStale: true }));
  }, []);

  const refreshNotifications = useCallback(() => {
    invalidateCache();
    return fetchNotifications(true);
  }, [invalidateCache, fetchNotifications]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    notifications: cache.notifications,
    isLoading,
    error,
    retryCount,
    lastFetch: cache.lastFetch,
    isStale: cache.isStale,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    invalidateCache,
    refreshNotifications,
    isRateLimited: error && isRateLimited(error)
  };
};




