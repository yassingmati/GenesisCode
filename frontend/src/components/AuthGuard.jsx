import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthGuard - Composant de protection d'authentification
 * Vérifie si l'utilisateur est connecté et redirige vers login si nécessaire
 */
export default function AuthGuard({ children, requireAuth = true }) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Attendre que le contexte d'auth soit initialisé
      if (loading) {
        return;
      }

      // Si l'authentification est requise
      if (requireAuth) {
        // Vérifier si l'utilisateur est connecté (Firebase ou Backend)
        const isAuthenticated = currentUser !== null;
        
        // Vérifier aussi le localStorage pour les utilisateurs backend
        const backendToken = localStorage.getItem('token');
        const backendUser = localStorage.getItem('user');
        const hasBackendAuth = backendToken && backendUser;

        if (!isAuthenticated && !hasBackendAuth) {
          console.log('🔒 Accès refusé - Redirection vers login');
          navigate('/login', { replace: true });
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [currentUser, loading, requireAuth, navigate]);

  // Afficher un loader pendant la vérification
  if (loading || isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Inter, system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Vérification de l'authentification...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si l'authentification n'est pas requise ou si l'utilisateur est connecté
  return children;
}

/**
 * Hook pour vérifier l'état d'authentification
 */
export function useAuthGuard() {
  const { currentUser, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!loading) {
      const backendToken = localStorage.getItem('token');
      const backendUser = localStorage.getItem('user');
      const hasBackendAuth = backendToken && backendUser;
      
      setIsAuthenticated(currentUser !== null || hasBackendAuth);
    }
  }, [currentUser, loading]);

  return { isAuthenticated, loading };
}
