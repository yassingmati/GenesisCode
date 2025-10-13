// src/pages/Auth.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import axios from 'axios';

const auth = getAuth(app);
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Auth = ({ type }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    userType: 'student' // Nouveau champ pour le type d'utilisateur
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    // Validation
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (type === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Appel API avec URL absolue
      const endpoint = type === 'register' 
        ? `${API_BASE_URL}/api/auth/register` 
        : `${API_BASE_URL}/api/auth/login`;
      
      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password,
        userType: formData.userType // Inclure le type d'utilisateur
      });
      
      // Stockage du token et des données utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccessMessage(type === 'register' 
        ? 'Compte créé! Vérifiez votre email' 
        : 'Connexion réussie!'
      );
      
      // Redirection basée sur le type et l'état du profil
      setTimeout(() => {
        if (type === 'register') {
          navigate('/login');
        } else {
          // Vérification robuste des propriétés avec valeurs par défaut
          const user = response.data.user;
          const isVerified = user.isVerified ?? false;
          const isProfileComplete = user.isProfileComplete ?? false;
          
          if (!isVerified) {
            navigate('/verify-email-reminder');
          } 
          else if (!isProfileComplete) {
            navigate('/complete-profile');
          } else {
            // Redirection basée sur le type d'utilisateur
            if (user.userType === 'parent') {
              navigate('/parent/dashboard');
            } else {
              navigate('/dashboard');
            }
          }
        }
      }, 1500);
      
    } catch (error) {
      console.error('Erreur:', error);
      let errorMessage = 'Une erreur est survenue';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error.message || error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      } else {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await axios.post(`${API_BASE_URL}/api/auth/login/google`, {
        idToken
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccessMessage('Connexion Google réussie!');
      
      setTimeout(() => {
        // Vérification robuste des propriétés avec valeurs par défaut
        const user = response.data.user;
        const isVerified = user.isVerified ?? false;
        const isProfileComplete = user.isProfileComplete ?? false;
        
        if (!isVerified) {
          navigate('/verify-email-reminder');
        } 
        else if (!isProfileComplete) {
          navigate('/complete-profile');
        } else {
          // Redirection basée sur le type d'utilisateur
          if (user.userType === 'parent') {
            navigate('/parent/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      }, 1500);
      
    } catch (error) {
      console.error('Erreur Google Login:', error);
      let errorMessage = 'Échec de la connexion Google';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error.message || error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur';
      } else {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">CodeGenesis</div>
          <h2>{type === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
          <p>
            {type === 'login' 
              ? 'Connectez-vous pour accéder à votre espace' 
              : 'Créez un compte pour commencer'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {successMessage && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              {successMessage}
            </div>
          )}
          
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
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className={`form-group ${errors.password ? 'error' : ''}`}>
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          {type === 'register' && (
            <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmez le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Sélection du type d'utilisateur */}
          <div className="form-group user-type-selection">
            <label className="user-type-label">Je suis :</label>
            <div className="user-type-options">
              <label className={`user-type-option ${formData.userType === 'student' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="student"
                  checked={formData.userType === 'student'}
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span className="option-icon">👦</span>
                  <span className="option-text">Étudiant</span>
                </span>
              </label>
              <label className={`user-type-option ${formData.userType === 'parent' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="userType"
                  value="parent"
                  checked={formData.userType === 'parent'}
                  onChange={handleChange}
                />
                <span className="option-content">
                  <span className="option-icon">👨‍👩‍👧‍👦</span>
                  <span className="option-text">Parent</span>
                </span>
              </label>
            </div>
          </div>
          
          {type === 'login' && (
            <div className="remember-forgot">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Se souvenir de moi
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Mot de passe oublié ?
              </Link>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="spinner"></div>
            ) : type === 'login' ? 'Se connecter' : 'Créer un compte'}
          </button>
          
          <div className="divider">
            <span>ou</span>
          </div>
          
          <button 
            type="button" 
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <FcGoogle className="google-icon" />
            {type === 'login' ? 'Se connecter avec Google' : 'S\'inscrire avec Google'}
          </button>
        </form>
        
        <div className="auth-footer">
          {type === 'login' ? (
            <p>
              Vous n'avez pas de compte ? <Link to="/register">S'inscrire</Link>
            </p>
          ) : (
            <p>
              Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
          )}
          
          <div className="terms">
            En vous inscrivant, vous acceptez nos 
            <Link to="/terms"> Conditions d'utilisation</Link> et 
            notre <Link to="/privacy">Politique de confidentialité</Link>.
          </div>
        </div>
      </div>
      
      <div className="auth-hero">
        <div className="hero-content">
          <h2>Plateforme d'apprentissage</h2>
          <p>
            Accédez à votre compte pour profiter de toutes nos fonctionnalités
          </p>
        </div>
      </div>
    </div>
  );
};

// CSS pour les pages d'authentification
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

/* Styles pour la sélection du type d'utilisateur */
.user-type-selection {
  margin-bottom: 1.5rem;
}

.user-type-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.user-type-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.user-type-option {
  flex: 1;
  cursor: pointer;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  background: white;
  position: relative;
}

.user-type-option:hover {
  border-color: #4a90e2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
}

.user-type-option.selected {
  border-color: #4a90e2;
  background: linear-gradient(135deg, #4a90e2 0%, #7b61ff 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.user-type-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.option-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.option-text {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-type-option.selected .option-text {
  color: white;
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

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  font-size: 1.1rem;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #555;
  cursor: pointer;
}

.remember-me input {
  width: auto;
  padding: 0;
  margin: 0;
}

.forgot-password {
  color: #4a90e2;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #3a78c1;
  text-decoration: underline;
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

.auth-button:hover {
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

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 1.5rem;
}

.divider span {
  display: inline-block;
  padding: 0 10px;
  background: white;
  color: #777;
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
  z-index: 0;
}

.google-button {
  width: 100%;
  padding: 14px;
  background: white;
  color: #444;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.google-button:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.google-icon {
  font-size: 1.4rem;
}

.auth-footer {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
}

.auth-footer a {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-footer a:hover {
  color: #3a78c1;
  text-decoration: underline;
}

.terms {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #888;
}

.terms a {
  color: #4a90e2;
  margin: 0 4px;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: fadeIn 0.5s ease;
}

.success-icon {
  background: #28a745;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
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

@media (max-width: 576px) {
  .remember-forgot {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
}
`;

// Composant LoginPage
export const LoginPage = () => {
  return (
    <>
      <style>{authCSS}</style>
      <Auth type="login" />
    </>
  );
};

// Composant RegisterPage
export const RegisterPage = () => {
  return (
    <>
      <style>{authCSS}</style>
      <Auth type="register" />
    </>
  );
};