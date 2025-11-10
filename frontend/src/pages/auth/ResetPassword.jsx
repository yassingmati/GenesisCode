// src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { getApiUrl } from '../../utils/apiConfig';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));

const ResetPassword = () => {
  const { token: tokenParam } = useParams(); // Token depuis l'URL path
  const [searchParams] = useSearchParams();
  const tokenQuery = searchParams.get('token'); // Token depuis query string
  const token = tokenParam || tokenQuery; // Priorité au paramètre de route
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(null); // null = vérification en cours, true = valide, false = invalide

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Token de réinitialisation manquant');
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.success) {
        setIsSuccess(true);
        toast.success('Mot de passe réinitialisé avec succès!');
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Erreur lors de la réinitialisation');
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

  if (tokenValid === null) {
    return (
      <div className="auth-container">
        <style>{authCSS}</style>
        <div className="auth-card">
          <div className="loading-container">
            <div className="spinner-large"></div>
            <p>Vérification du token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="auth-container">
        <style>{authCSS}</style>
        <div className="auth-card">
          <div className="error-container">
            <div className="error-icon">✕</div>
            <h3>Token invalide ou expiré</h3>
            <p>
              Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
            </p>
            <Link to="/forgot-password" className="auth-button">
              Demander un nouveau lien
            </Link>
            <Link to="/login" className="back-link">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="auth-container">
        <style>{authCSS}</style>
        <div className="auth-card">
          <div className="success-container">
            <div className="success-icon-large">
              <FaCheckCircle />
            </div>
            <h3>Mot de passe réinitialisé!</h3>
            <p>
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <p className="redirect-note">
              Redirection vers la page de connexion...
            </p>
            <Link to="/login" className="auth-button">
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <style>{authCSS}</style>
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">CodeGenesis</div>
          <h2>Réinitialiser le mot de passe</h2>
          <p>Créez un nouveau mot de passe sécurisé</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          <div className={`form-group ${errors.password ? 'error' : ''}`}>
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Nouveau mot de passe"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
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
          
          <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
            <FaLock className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
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
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="spinner"></div>
            ) : 'Réinitialiser le mot de passe'}
          </button>
          
          <div className="auth-footer">
            <Link to="/login" className="back-link">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
      
      <div className="auth-hero">
        <div className="hero-content">
          <h2>Nouveau mot de passe</h2>
          <p>
            Choisissez un mot de passe sécurisé pour protéger votre compte
          </p>
        </div>
      </div>
    </div>
  );
};

// CSS pour la page ResetPassword (identique à ForgotPassword avec quelques ajustements)
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
  text-decoration: none;
  display: block;
  text-align: center;
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

.spinner-large {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(74, 144, 226, 0.2);
  border-radius: 50%;
  border-top-color: #4a90e2;
  animation: spin 1s ease-in-out infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-container, .error-container, .loading-container {
  text-align: center;
  padding: 2rem 0;
}

.success-icon-large, .error-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 auto 1.5rem;
  animation: fadeIn 0.5s ease;
}

.success-icon-large {
  background: #28a745;
  color: white;
}

.error-icon {
  background: #e74c3c;
  color: white;
}

.success-container h3, .error-container h3 {
  color: #333;
  margin-bottom: 1rem;
}

.success-container p, .error-container p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.redirect-note {
  color: #999;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
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

export default ResetPassword;

