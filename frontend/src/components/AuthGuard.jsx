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
      // Vérifier le localStorage en premier (plus rapide)
      const backendToken = localStorage.getItem('token');
      const backendUser = localStorage.getItem('user');
      const hasBackendAuth = backendToken && backendUser;

      // Si l'authentification est requise
      if (requireAuth) {
        // Si on a un token backend, attendre un peu que le contexte se mette à jour
        if (hasBackendAuth && !currentUser && loading) {
          // Attendre que le contexte charge l'utilisateur depuis localStorage
          const timeout = setTimeout(() => {
            setIsChecking(false);
          }, 500); // Attendre 500ms max
          return () => clearTimeout(timeout);
        }

        // Vérifier si l'utilisateur est connecté (Firebase ou Backend)
        const isAuthenticated = currentUser !== null;
        
        // Si on a un token backend mais pas d'utilisateur dans le contexte, 
        // attendre un peu plus que le contexte se mette à jour
        if (hasBackendAuth && !isAuthenticated) {
          // Donner une chance au contexte de charger l'utilisateur
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Re-vérifier après l'attente
          const backendUserAfterWait = localStorage.getItem('user');
          if (backendUserAfterWait) {
            // L'utilisateur existe toujours, autoriser l'accès
            // Le contexte se mettra à jour bientôt
            setIsChecking(false);
            return;
          }
        }

        // Si toujours pas d'authentification
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
