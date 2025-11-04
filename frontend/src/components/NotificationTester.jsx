// src/components/NotificationTester.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Composant de test pour les notifications
 */
export default function NotificationTester({ user }) {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      details,
      timestamp: new Date()
    }]);
  };

  const runNotificationTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const token = localStorage.getItem('token');
    if (!token) {
      addTestResult('Authentication', 'error', 'Token d\'authentification manquant');
      setIsRunning(false);
      return;
    }

    // Test 1: Récupération des notifications
    try {
      addTestResult('Fetch Notifications', 'running', 'Test de récupération des notifications...');
      
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      addTestResult('Fetch Notifications', 'success', 
        `Notifications récupérées avec succès (${response.data.length} notifications)`,
        { count: response.data.length, data: response.data }
      );
    } catch (error) {
      addTestResult('Fetch Notifications', 'error', 
        `Erreur lors de la récupération: ${error.message}`,
        { error: error.response?.data, status: error.response?.status }
      );
    }

    // Test 2: Création d'une notification de test
    try {
      addTestResult('Create Notification', 'running', 'Test de création d\'une notification...');
      
      const testNotification = {
        type: 'test',
        title: 'Test de notification',
        message: 'Ceci est une notification de test',
        priority: 'low'
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/notifications`, testNotification, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      addTestResult('Create Notification', 'success', 
        'Notification de test créée avec succès',
        { notification: response.data }
      );
    } catch (error) {
      addTestResult('Create Notification', 'error', 
        `Erreur lors de la création: ${error.message}`,
        { error: error.response?.data, status: error.response?.status }
      );
    }

    // Test 3: Marquage comme lu
    try {
      addTestResult('Mark as Read', 'running', 'Test de marquage comme lu...');
      
      // Récupérer les notifications pour avoir un ID
      const notificationsResponse = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (notificationsResponse.data.length > 0) {
        const notificationId = notificationsResponse.data[0].id;
        
        const response = await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        addTestResult('Mark as Read', 'success', 
          'Notification marquée comme lue avec succès',
          { notificationId, response: response.data }
        );
      } else {
        addTestResult('Mark as Read', 'warning', 
          'Aucune notification disponible pour le test'
        );
      }
    } catch (error) {
      addTestResult('Mark as Read', 'error', 
        `Erreur lors du marquage: ${error.message}`,
        { error: error.response?.data, status: error.response?.status }
      );
    }

    // Test 4: Permissions de notifications du navigateur
    try {
      addTestResult('Browser Permissions', 'running', 'Test des permissions du navigateur...');
      
      if ('Notification' in window) {
        const permission = Notification.permission;
        addTestResult('Browser Permissions', 'success', 
          `Permissions du navigateur: ${permission}`,
          { permission }
        );
      } else {
        addTestResult('Browser Permissions', 'warning', 
          'Notifications du navigateur non supportées'
        );
      }
    } catch (error) {
      addTestResult('Browser Permissions', 'error', 
        `Erreur lors du test des permissions: ${error.message}`
      );
    }

    // Test 5: Test de connectivité
    try {
      addTestResult('Connectivity', 'running', 'Test de connectivité...');
      
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 5000
      });
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      addTestResult('Connectivity', 'success', 
        `Connectivité OK (latence: ${latency}ms)`,
        { latency, response: response.data }
      );
    } catch (error) {
      addTestResult('Connectivity', 'error', 
        `Erreur de connectivité: ${error.message}`,
        { error: error.response?.data, status: error.response?.status }
      );
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'running': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'running': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      margin: '2rem 0',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50' }}>
        🧪 Testeur de Notifications
      </h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={runNotificationTests}
          disabled={isRunning}
          style={{
            background: isRunning ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            marginRight: '1rem'
          }}
        >
          {isRunning ? '⏳ Tests en cours...' : '🚀 Lancer les tests'}
        </button>
        
        <button
          onClick={clearResults}
          disabled={isRunning}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          🗑️ Effacer les résultats
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
            Résultats des tests ({testResults.length})
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '6px',
                  padding: '1rem',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
                  {getStatusIcon(result.status)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: getStatusColor(result.status),
                    marginBottom: '0.25rem'
                  }}>
                    {result.test}
                  </div>
                  <div style={{ color: '#495057', marginBottom: '0.25rem' }}>
                    {result.message}
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                    {result.timestamp.toLocaleTimeString('fr-FR')}
                  </div>
                  
                  {result.details && (
                    <details style={{ marginTop: '0.5rem' }}>
                      <summary style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#007bff' }}>
                        Voir les détails
                      </summary>
                      <pre style={{
                        background: '#f8f9fa',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}











