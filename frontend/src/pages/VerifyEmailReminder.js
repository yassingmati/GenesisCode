// src/pages/VerifyEmailReminder.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import '../styles/VerifyEmail.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));

const VerifyEmailReminder = () => {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer l'email de l'utilisateur depuis localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.email) {
      setUserEmail(userData.email);
    }
  }, []);

  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-verification`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setMessage('Un nouvel email de vérification a été envoyé!');
      setIsSuccess(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de l\'envoi');
      setIsSuccess(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const checkVerificationStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.isVerified) {
        // Si l'email est maintenant vérifié, rediriger vers la prochaine étape
        if (response.data.isProfileComplete) {
          navigate('/dashboard');
        } else {
          navigate('/complete-profile');
        }
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
    }
  };

  return (
    <div className="email-reminder">
      <div className="reminder-card">
        <h2>Vérification Email Requise</h2>
        
        <div className="reminder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v8h-2zm0 10h2v2h-2z"/>
          </svg>
        </div>
        
        <p>
          Un email de vérification a été envoyé à <strong>{userEmail}</strong>.
          Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.
        </p>
        
        <p className="note">
          <strong>Note:</strong> 
          <ul>
            <li>Vérifiez votre dossier de spam ou indésirables</li>
            <li>Le lien de vérification expire après 1 heure</li>
            <li>Cliquez sur le bouton ci-dessous si vous n'avez pas reçu l'email</li>
          </ul>
        </p>
        
        <button 
          onClick={handleResendEmail} 
          disabled={isSending}
          className="resend-button"
        >
          {isSending ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}
        </button>
        
        <button 
          onClick={checkVerificationStatus}
          className="check-button"
        >
          J'ai vérifié mon email
        </button>
        
        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="actions">
          <button className="logout-button" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailReminder;