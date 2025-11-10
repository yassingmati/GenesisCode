// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { getApiUrl } from '../../utils/apiConfig';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    if (!email) {
      setErrors({ email: 'L\'email est requis' });
      setIsSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email invalide' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.success) {
        setIsSubmitted(true);
        toast.success('Email de réinitialisation envoyé!');
      } else {
        throw new Error(response.data?.message || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur:', error);
      let errorMessage = 'Une erreur est survenue';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur. Vérifiez que le backend est démarré.';
      } else {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <style>{authCSS}</style>
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">CodeGenesis</div>
          <h2>Mot de passe oublié</h2>
          <p>
            {isSubmitted 
              ? 'Vérifiez votre boîte email' 
              : 'Entrez votre adresse email pour recevoir un lien de réinitialisation'}
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="success-container">
            <div className="success-icon-large">✓</div>
            <h3>Email envoyé!</h3>
            <p>
              Si un compte avec cet email existe, un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            </p>
            <p className="success-note">
              Vérifiez votre boîte de réception et votre dossier spam. Le lien expirera dans 1 heure.
            </p>
            <div className="action-buttons">
              <Link to="/login" className="back-button">
                <FaArrowLeft /> Retour à la connexion
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            
            <div className={`form-group ${errors.email ? 'error' : ''}`}>
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="spinner"></div>
              ) : 'Envoyer le lien de réinitialisation'}
            </button>
            
            <div className="auth-footer">
              <Link to="/login" className="back-link">
                <FaArrowLeft /> Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
      
      <div className="auth-hero">
        <div className="hero-content">
          <h2>Réinitialisation de mot de passe</h2>
          <p>
            Nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe
          </p>
        </div>
      </div>
    </div>
  );
};

// CSS pour la page ForgotPassword
const authCSS = `
.auth-container {
  display: flex;
  min-height: 100vh;
  background: #f7f9fc;
  font-family: 'Inter', sans-serif;
}

.auth-card {
  flex: 1;
  max-width: 500px;
  padding: 3rem 2rem;
  background: #fff;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.auth-hero {
  flex: 1;
  background: linear-gradient(135deg, #4a90e2 0%, #7b61ff 100%);
  color: white;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  font-size: 2rem;
  font-weight: 800;
  color: #4a90e2;
  margin-bottom: 1rem;
}

.auth-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.auth-header p {
  color: #666;
  margin-bottom: 0;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-group.error .input-icon {
  color: #e74c3c;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
  font-size: 1rem;
}

input {
  width: 100%;
  padding: 14px 20px 14px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fafafa;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  background: #fff;
}

input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}

.general-error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.auth-button {
  width: 100%;
  padding: 14px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  position: relative;
}

.auth-button:hover:not(:disabled) {
  background: #3a78c1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.auth-button:disabled {
  background: #a0c4f3;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-container {
  text-align: center;
  padding: 2rem 0;
}

.success-icon-large {
  width: 80px;
  height: 80px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 auto 1.5rem;
  animation: fadeIn 0.5s ease;
}

.success-container h3 {
  color: #333;
  margin-bottom: 1rem;
}

.success-container p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.success-note {
  color: #999;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.action-buttons {
  margin-top: 2rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 24px;
  background: #4a90e2;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #3a78c1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a90e2;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #3a78c1;
  text-decoration: underline;
}

.hero-content {
  text-align: center;
}

.hero-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.1rem;
  opacity: 0.9;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 992px) {
  .auth-container {
    flex-direction: column;
  }
  
  .auth-card {
    max-width: 100%;
    padding: 2rem;
  }
  
  .auth-hero {
    padding: 2rem;
    text-align: center;
  }
}
`;

export default ForgotPassword;

