// src/pages/Auth.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserGraduate, FaUserTie, FaArrowLeft } from 'react-icons/fa';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';
import * as authService from '../../services/authService';

const auth = getAuth(app);

const Auth = ({ type }) => {
  const { t } = useTranslation();
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
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une lettre majuscule';
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
      let data;

      if (type === 'register') {
        data = await authService.register(formData.email, formData.password, formData.userType);
      } else {
        data = await authService.login(formData.email, formData.password, formData.userType);
      }

      // Nettoyage de toute session précédente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('accessToken');

      // Stockage du token et des données utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

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
          const user = data.user;
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
      let rawMessage = 'Une erreur est survenue';

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          rawMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          rawMessage = error.response.data.error.message || error.response.data.error;
        }
      } else if (error.request) {
        rawMessage = 'Aucune réponse du serveur';
      } else {
        rawMessage = error.message;
      }

      let mappedError = { general: t('auth.errors.default') };

      // Mapping backend messages to translations
      switch (rawMessage) {
        case 'This email is already in use.':
          mappedError = { email: t('auth.errors.emailInUse') };
          break;
        case 'No account is associated with this email.':
        case 'User not found.':
        case 'EMAIL_NOT_FOUND': // Firebase
          mappedError = { email: t('auth.errors.userNotFound') };
          break;
        case 'Incorrect password.':
        case 'INVALID_PASSWORD': // Firebase
          mappedError = { password: t('auth.errors.wrongPassword') };
          break;
        case 'Incorrect email or password.':
        case 'INVALID_LOGIN_CREDENTIALS': // Firebase
          mappedError = { general: t('auth.errors.incorrectCredentials') };
          break;
        case 'Email and password are required.':
          mappedError = { general: t('auth.errors.missingFields') };
          break;
        case 'Password must be at least 6 characters long.':
        case 'Password must be at least 6 characters long and contain at least one uppercase letter.':
          mappedError = { password: 'Le mot de passe doit avoir au moins 6 caractères et une majuscule.' };
          break;
        case 'This account has been disabled.':
        case 'USER_DISABLED': // Firebase
          mappedError = { general: t('auth.errors.accountDisabled') };
          break;
        case 'Invalid email format.':
          mappedError = { email: t('auth.errors.invalidEmail') };
          break;
        default:
          // If translation exists for the raw message, use it, otherwise show raw
          mappedError = { general: rawMessage };
      }

      setErrors(mappedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
      setSuccessMessage('');

      console.log('🔵 Début authentification Google...');

      // Configurer le provider Google
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      // Authentifier avec Google via Firebase
      console.log('🔵 Ouverture popup Google...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('✅ Authentification Firebase réussie:', {
        email: user.email,
        uid: user.uid,
        displayName: user.displayName
      });

      // Obtenir le token ID
      console.log('🔵 Récupération du token ID...');
      const idToken = await user.getIdToken();

      if (!idToken) {
        throw new Error('Token ID non disponible');
      }

      console.log('✅ Token ID obtenu:', idToken.substring(0, 50) + '...');

      // Envoyer le token au backend
      console.log('🔵 Envoi du token au backend...');
      const data = await authService.loginWithGoogle(idToken);

      if (!data || !data.token) {
        throw new Error('Réponse invalide du serveur');
      }

      console.log('✅ Réponse backend reçue:', {
        hasToken: !!data.token,
        hasUser: !!data.user,
        userEmail: data.user?.email
      });

      // Nettoyage de toute session précédente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('accessToken');

      // Stocker le token et les données utilisateur
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessMessage('Connexion Google réussie!');

      setTimeout(() => {
        // Vérification robuste des propriétés avec valeurs par défaut
        const user = data.user;
        const isVerified = user.isVerified ?? false;
        const isProfileComplete = user.isProfileComplete ?? false;

        // Si l'utilisateur n'a pas de rôle défini, rediriger vers la complétion de profil
        if (!user.userType || user.userType === 'undefined') {
          navigate('/complete-profile');
          return;
        }

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
      console.error('❌ Erreur Google Login:', error);

      let errorMessage = 'Échec de la connexion Google';

      // Gestion des erreurs Firebase Auth
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'La fenêtre de connexion a été fermée. Veuillez réessayer.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'La fenêtre popup a été bloquée. Veuillez autoriser les popups pour ce site.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Une autre fenêtre de connexion est déjà ouverte.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
            break;
          default:
            errorMessage = `Erreur d'authentification: ${error.message || error.code}`;
        }
      } else if (error.response) {
        // Erreur du backend
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage = typeof error.response.data.error === 'string'
            ? error.response.data.error
            : error.response.data.error.message || 'Erreur serveur';
        } else {
          errorMessage = `Erreur serveur: ${error.response.status} ${error.response.statusText}`;
        }
        console.error('❌ Erreur backend:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Aucune réponse du serveur. Vérifiez que le backend est démarré.';
        console.error('❌ Pas de réponse serveur:', error.request);
      } else {
        errorMessage = error.message || 'Erreur inconnue';
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-4 relative overflow-y-auto transition-colors duration-300">
      {/* Theme Toggle & Language Selector */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        <LanguageSelector showLabel={false} size="small" />
        <ThemeToggle />
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md font-medium text-sm"
      >
        <FaArrowLeft />
        <span className="hidden sm:inline">{t('auth.backToHome')}</span>
      </Link>

      {/* Background Elements (Dark Mode) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Background Elements (Light Mode) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md md:max-w-5xl m-auto grid grid-cols-1 md:grid-cols-2 gap-0 bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 z-10 transition-colors duration-300 h-auto"
      >
        {/* Left Side - Form */}
        <div className="p-6 md:p-10 flex flex-col justify-center custom-scrollbar">
          <div className="mb-6 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <img src={require('../../assets/icons/logo.png')} alt="GenesisCode Logo" className="h-16 w-auto mx-auto lg:mx-0" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-slate-800 dark:text-white mb-1"
            >
              {type === 'login' ? t('auth.login.welcome') : t('auth.register.welcome')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              {type === 'login'
                ? t('auth.login.subtitle')
                : t('auth.register.subtitle')}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-2 rounded-lg flex items-center gap-2 text-xs"
                >
                  <span>✓</span> {successMessage}
                </motion.div>
              )}

              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-lg text-xs"
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <div className="relative group">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors text-sm" />
                <input
                  type="email"
                  name="email"
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${errors.email ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'} rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                />
                {errors.email && <span className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 ml-1 block">{errors.email}</span>}
              </div>

              <div className="relative group">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${errors.password ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'} rounded-lg py-2.5 pl-9 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
                {errors.password && <span className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 ml-1 block">{errors.password}</span>}

                {/* Password Requirements Checklist (Only show during registration or if password has content) */}
                {(type === 'register' || (formData.password && formData.password.length > 0)) && (
                  <div className="mt-2 ml-1 flex flex-wrap gap-2">
                    <div className={`text-[10px] flex items-center gap-1 ${formData.password.length >= 6 ? 'text-green-500 font-medium' : 'text-slate-400'}`}>
                      <span className={`w-3 h-3 rounded-full flex items-center justify-center border ${formData.password.length >= 6 ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {formData.password.length >= 6 && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      Min. 6 caractères
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-500 font-medium' : 'text-slate-400'}`}>
                      <span className={`w-3 h-3 rounded-full flex items-center justify-center border ${/(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {/(?=.*[A-Z])/.test(formData.password) && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      Une majuscule
                    </div>
                  </div>
                )}
              </div>

              {type === 'register' && (
                <div className="relative group">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors text-sm" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t('auth.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'} rounded-lg py-2.5 pl-9 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                  {errors.confirmPassword && <span className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 ml-1 block">{errors.confirmPassword}</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">{t('auth.iAm')}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`cursor-pointer relative group`}>
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={formData.userType === 'student'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center gap-1.5 ${formData.userType === 'student'
                    ? 'bg-blue-600/10 dark:bg-blue-600/20 border-blue-500 text-blue-600 dark:text-white shadow-[0_0_10px_rgba(59,130,246,0.1)] dark:shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}>
                    <FaUserGraduate className={`text-xl ${formData.userType === 'student' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="font-medium text-xs">{t('auth.student')}</span>
                  </div>
                </label>

                <label className={`cursor-pointer relative group`}>
                  <input
                    type="radio"
                    name="userType"
                    value="parent"
                    checked={formData.userType === 'parent'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center gap-1.5 ${formData.userType === 'parent'
                    ? 'bg-purple-600/10 dark:bg-purple-600/20 border-purple-500 text-purple-600 dark:text-white shadow-[0_0_10px_rgba(168,85,247,0.1)] dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}>
                    <FaUserTie className={`text-xl ${formData.userType === 'parent' ? 'text-purple-500 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="font-medium text-xs">{t('auth.parent')}</span>
                  </div>
                </label>
              </div>
            </div>

            {type === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/50 w-3.5 h-3.5"
                  />
                  {t('auth.rememberMe')}
                </label>
                <Link to="/forgot-password" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : type === 'login' ? t('auth.login.action') : t('auth.register.action')}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-[#121b2e] px-2 text-slate-500">{t('auth.orContinueWith')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full bg-slate-50 dark:bg-white text-slate-700 font-semibold py-2.5 rounded-lg shadow-sm border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
            >
              <FcGoogle className="text-lg" />
              <span>{type === 'login' ? t('auth.login.google') : t('auth.register.google')}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {type === 'login' ? (
              <p>
                {t('auth.login.noAccount')}{' '}
                <Link to="/register" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors">
                  {t('auth.login.link')}
                </Link>
              </p>
            ) : (
              <p>
                {t('auth.register.hasAccount')}{' '}
                <Link to="/login" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors">
                  {t('auth.register.link')}
                </Link>
              </p>
            )}
            <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
              {t('auth.agree')}{' '}
              <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-400 underline">{t('auth.terms')}</Link> et{' '}
              <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-400 underline">{t('auth.privacy')}</Link>.
            </div>
          </div>

        </div>

        {/* Right Side - Hero/Image */}
        <div className="hidden md:flex relative overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-12 text-white items-center justify-center">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 relative"
            >
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full"></div>
              <img src={require('../../assets/icons/logo.png')} alt="Logo" className="w-48 h-auto relative z-10 drop-shadow-2xl" />
            </motion.div>

            <h3 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              {t('auth.hero.title')}
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md mx-auto mb-8">
              {t('auth.hero.subtitle')}
            </p>

            <div className="flex gap-4 justify-center">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 w-32">
                <div className="text-2xl">🚀</div>
                <div className="text-xs font-medium text-slate-300">{t('auth.hero.progress.title')}</div>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 w-32">
                <div className="text-2xl">🏆</div>
                <div className="text-xs font-medium text-slate-300">{t('auth.hero.certificates.title')}</div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Auth;