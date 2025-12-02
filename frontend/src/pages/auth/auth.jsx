// src/pages/Auth.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserGraduate, FaUserTie, FaArrowLeft } from 'react-icons/fa';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import axios from 'axios';
import { getApiUrl } from '../../utils/apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';

const auth = getAuth(app);
// En production, utiliser URL relative (même domaine) pour éviter CORS
// En développement, utiliser localhost
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://codegenesis-backend.onrender.com' : getApiUrl(''));

(process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));

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
      const response = await axios.post(`${API_BASE_URL}/api/auth/login/google`, {
        idToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: Number(process.env.REACT_APP_GOOGLE_LOGIN_TIMEOUT_MS || 20000)
      });

      if (!response.data || !response.data.token) {
        throw new Error('Réponse invalide du serveur');
      }

      console.log('✅ Réponse backend reçue:', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        userEmail: response.data.user?.email
      });

      // Stocker le token et les données utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setSuccessMessage('Connexion Google réussie!');

      setTimeout(() => {
        // Vérification robuste des propriétés avec valeurs par défaut
        const user = response.data.user;
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-4 relative overflow-hidden transition-colors duration-300">
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
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 z-10 transition-colors duration-300"
      >
        {/* Left Side - Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <img src={require('../../assets/icons/logo.png')} alt="CodeGenesis Logo" className="h-16 w-auto mx-auto lg:mx-0" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-slate-800 dark:text-white mb-2"
            >
              {type === 'login' ? t('auth.login.welcome') : t('auth.register.welcome')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 dark:text-slate-400"
            >
              {type === 'login'
                ? t('auth.login.subtitle')
                : t('auth.register.subtitle')}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl flex items-center gap-2 text-sm"
                >
                  <span>✓</span> {successMessage}
                </motion.div>
              )}

              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm"
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${errors.email ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'} rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                />
                {errors.email && <span className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1 block">{errors.email}</span>}
              </div>

              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${errors.password ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'} rounded-xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <span className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1 block">{errors.password}</span>}
              </div>

              {type === 'register' && (
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t('auth.confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'} rounded-xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.confirmPassword && <span className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1 block">{errors.confirmPassword}</span>}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block">{t('auth.iAm')}</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer relative group`}>
                  <input
                    type="radio"
                    name="userType"
                    value="student"
                    checked={formData.userType === 'student'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${formData.userType === 'student'
                    ? 'bg-blue-600/10 dark:bg-blue-600/20 border-blue-500 text-blue-600 dark:text-white shadow-[0_0_20px_rgba(59,130,246,0.1)] dark:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}>
                    <FaUserGraduate className={`text-2xl ${formData.userType === 'student' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="font-medium text-sm">{t('auth.student')}</span>
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
                  <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${formData.userType === 'parent'
                    ? 'bg-purple-600/10 dark:bg-purple-600/20 border-purple-500 text-purple-600 dark:text-white shadow-[0_0_20px_rgba(168,85,247,0.1)] dark:shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}>
                    <FaUserTie className={`text-2xl ${formData.userType === 'parent' ? 'text-purple-500 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="font-medium text-sm">{t('auth.parent')}</span>
                  </div>
                </label>
              </div>
            </div>

            {type === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/50"
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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : type === 'login' ? t('auth.login.action') : t('auth.register.action')}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#162032] px-2 text-slate-500">{t('auth.orContinueWith')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full bg-slate-50 dark:bg-white text-slate-700 font-semibold py-3.5 rounded-xl shadow-sm border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              <FcGoogle className="text-xl" />
              <span>{type === 'login' ? t('auth.login.google') : t('auth.register.google')}</span>
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
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
            <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              {t('auth.agree')}{' '}
              <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-400 underline">{t('auth.terms')}</Link> et{' '}
              <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-400 underline">{t('auth.privacy')}</Link>.
            </div>
          </div>
        </div>

        {/* Right Side - Hero/Image */}
        <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 whitespace-pre-line">{t('auth.hero.title')}</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                {t('auth.hero.subtitle')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  ✓
                </div>
                <div>
                  <div className="font-semibold">{t('auth.hero.progress.title')}</div>
                  <div className="text-sm text-blue-100">{t('auth.hero.progress.subtitle')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  ★
                </div>
                <div>
                  <div className="font-semibold">{t('auth.hero.certificates.title')}</div>
                  <div className="text-sm text-blue-100">{t('auth.hero.certificates.subtitle')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;