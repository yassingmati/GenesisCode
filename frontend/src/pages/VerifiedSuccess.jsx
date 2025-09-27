import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VerifiedSuccess.css';

const VerifiedSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="verified-container">
      <div className="verified-card">
        <div className="verified-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <h2>Email Vérifié avec Succès!</h2>
        
        <p>
          Votre adresse email a été vérifiée avec succès. 
          Vous pouvez maintenant vous connecter à votre compte.
        </p>
        
        <p className="redirect-message">
          Vous serez redirigé vers la page de connexion dans 5 secondes...
        </p>
        
        <button 
          className="login-button"
          onClick={() => navigate('/login')}
        >
          Se connecter maintenant
        </button>
      </div>
    </div>
  );
};

export default VerifiedSuccess;