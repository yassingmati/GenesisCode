// src/hooks/useRequestThrottle.js
import { useRef, useCallback } from 'react';

/**
 * Hook pour throttler les requêtes et éviter le rate limiting
 */
export const useRequestThrottle = (minInterval = 1000) => {
  const lastRequestTimeRef = useRef(0);
  const pendingRequestsRef = useRef(new Set());
  const requestQueueRef = useRef([]);

  const isRequestAllowed = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    return timeSinceLastRequest >= minInterval;
  }, [minInterval]);

  const throttleRequest = useCallback(async (requestFn, requestId = null) => {
    const id = requestId || Math.random().toString(36).substr(2, 9);
    
    // Si une requête avec le même ID est déjà en cours, on l'annule
    if (requestId && pendingRequestsRef.current.has(requestId)) {
      console.log(`Requête ${requestId} déjà en cours, annulation`);
      return null;
    }

    // Si le throttling est actif, on met en queue
    if (!isRequestAllowed()) {
      console.log('Throttling actif, mise en queue de la requête');
      return new Promise((resolve, reject) => {
        requestQueueRef.current.push({ requestFn, resolve, reject, id });
      });
    }

    return executeRequest(requestFn, id);
  }, [isRequestAllowed]);

  const executeRequest = useCallback(async (requestFn, id) => {
    try {
      pendingRequestsRef.current.add(id);
      lastRequestTimeRef.current = Date.now();
      
      const result = await requestFn();
      
      // Traiter la queue après la requête
      setTimeout(() => {
        processQueue();
      }, 100);
      
      return result;
    } finally {
      pendingRequestsRef.current.delete(id);
    }
  }, []);

  const processQueue = useCallback(() => {
    if (requestQueueRef.current.length === 0) return;
    
    if (!isRequestAllowed()) {
      // Attendre un peu plus
      setTimeout(processQueue, 100);
      return;
    }

    const nextRequest = requestQueueRef.current.shift();
    if (nextRequest) {
      executeRequest(nextRequest.requestFn, nextRequest.id)
        .then(nextRequest.resolve)
        .catch(nextRequest.reject);
    }
  }, [isRequestAllowed, executeRequest]);

  const clearQueue = useCallback(() => {
    requestQueueRef.current.forEach(({ reject }) => {
      reject(new Error('Queue cleared'));
    });
    requestQueueRef.current = [];
  }, []);

  const getQueueSize = useCallback(() => {
    return requestQueueRef.current.length;
  }, []);

  const getPendingRequests = useCallback(() => {
    return Array.from(pendingRequestsRef.current);
  }, []);

  return {
    throttleRequest,
    isRequestAllowed,
    clearQueue,
    getQueueSize,
    getPendingRequests
  };
};




