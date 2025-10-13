// src/components/ParentAuthGuard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ParentAuthGuard - Composant de protection spécifique aux parents
 * Vérifie que l'utilisateur est connecté et a le type "parent"
 */
export default function ParentAuthGuard({ children }) {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkParentAuth = async () => {
      try {
        // Attendre que le contexte d'auth soit initialisé
        if (loading) {
          return;
        }

        // Vérifier le token et les données utilisateur
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          setError('Vous devez être connecté pour accéder à cette page');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        let userData;
        try {
          userData = JSON.parse(userStr);
        } catch (e) {
          setError('Données utilisateur corrompues. Veuillez vous reconnecter.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Vérifier le type d'utilisateur
        if (userData.userType !== 'parent') {
          setError('Accès refusé : cette page est réservée aux parents');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        // Vérifier que le profil est complet
        if (!userData.isProfileComplete) {
          setError('Veuillez compléter votre profil avant d\'accéder à l\'espace parent');
          setTimeout(() => navigate('/complete-profile'), 2000);
          return;
        }

        // Vérifier que l'email est vérifié
        if (!userData.isVerified) {
          setError('Veuillez vérifier votre email avant d\'accéder à l\'espace parent');
          setTimeout(() => navigate('/verify-email-reminder'), 2000);
          return;
        }

        // Tout est OK
        setIsChecking(false);
      } catch (error) {
        console.error('Erreur vérification auth parent:', error);
        setError('Erreur de vérification. Veuillez vous reconnecter.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    checkParentAuth();
  }, [currentUser, loading, navigate]);

  // Afficher un loader pendant la vérification
  if (loading || isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Vérification de l'accès parent...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Afficher l'erreur si il y en a une
  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '1rem 2rem',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          maxWidth: '500px'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🔒 Accès refusé</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
          Redirection automatique en cours...
        </p>
      </div>
    );
  }

  // Afficher le contenu si tout est OK
  return children;
}
