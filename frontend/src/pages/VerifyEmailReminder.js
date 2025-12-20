// src/pages/VerifyEmailReminder.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaSignOutAlt, FaInfoCircle, FaSpinner, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const VerifyEmailReminder = () => {
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success, error, warning
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const pollInterval = useRef(null);

  useEffect(() => {
    // Récupérer l'email de l'utilisateur depuis le localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.email) {
        setUserEmail(userData.email);
        // Start auto-polling
        startPolling();
      } else {
        // En cas d'absence d'email (ex: reload sans session valide), rediriger vers login
        navigate('/login');
      }
    } catch (e) {
      console.error("Erreur parsing user data", e);
      navigate('/login');
    }

    return () => stopPolling();
  }, [navigate]);

  const startPolling = () => {
    // Check every 5 seconds
    stopPolling();
    pollInterval.current = setInterval(() => {
      checkVerificationStatus(true); // true = silent mode (no loading spinner for user)
    }, 5000);
  };

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  const handleResendEmail = async () => {
    setIsSending(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Vous n'êtes pas connecté.");

      await axios.post(getApiUrl('/api/auth/send-verification'), {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('Un nouvel email de vérification a été envoyé !');
      setMessageType('success');
    } catch (error) {
      console.error("Erreur renvoi email:", error);

      // Check for specific backend error code
      const responseData = error.response?.data;
      if (responseData?.error === 'EMAIL_SERVICE_NOT_CONFIGURED') {
        setMessage('Le service d\'email n\'est pas configuré sur le serveur. Veuillez contacter le support.');
        setMessageType('error');
      } else {
        const errorMsg = responseData?.message || error.message || 'Erreur lors de l\'envoi';
        setMessage(errorMsg);
        setMessageType('error');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    stopPolling();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/login');
  };

  const checkVerificationStatus = async (silent = false) => {
    if (!silent) setIsChecking(true);
    if (!silent) setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if (!silent) {
          setMessage('Session expirée. Veuillez vous reconnecter.');
          setMessageType('error');
          setTimeout(() => navigate('/login'), 2000);
        }
        return;
      }

      const response = await axios.get(getApiUrl('/api/users/profile'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && (response.data.isVerified || response.data.user?.isVerified)) {
        // Gérer les deux formats possibles de réponse (data directement ou data.user)
        const user = response.data.user || response.data;

        // Mettre à jour le localStorage avec les nouvelles données
        localStorage.setItem('user', JSON.stringify(user));

        setMessage('Email vérifié avec succès ! Redirection...');
        setMessageType('success');
        stopPolling();

        setTimeout(() => {
          if (user.isProfileComplete) {
            navigate('/dashboard');
          } else {
            navigate('/complete-profile');
          }
        }, 1500);
      } else {
        if (!silent) {
          setMessage('Votre email n\'est pas encore vérifié. Veuillez cliquer sur le lien dans l\'email reçu.');
          setMessageType('warning');
        }
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      if (!silent) {
        setMessage('Impossible de vérifier le statut. Assurez-vous d\'être connecté.');
        setMessageType('error');
      }
    } finally {
      if (!silent) setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-4 relative overflow-hidden transition-colors duration-300">

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-0 dark:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="absolute top-6 left-6 z-50">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          <FaArrowLeft /> Retour à l'accueil
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-slate-200 dark:border-white/10 z-10 relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400"
          >
            <FaEnvelope className="text-4xl" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Vérifiez votre email</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Un lien de vérification à été envoyé à <br />
            <span className="font-semibold text-blue-600 dark:text-blue-300 mt-1 inline-block bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-500/30">{userEmail}</span>
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-yellow-500/10 border border-amber-200 dark:border-yellow-500/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-amber-500 dark:text-yellow-400 text-xl mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-yellow-100/90 space-y-1">
              <p>• Vérifiez votre dossier de spam ou courriers indésirables</p>
              <p>• Le lien expire après 1 heure</p>
              <p className="font-semibold text-green-600 dark:text-green-400 mt-2 flex items-center gap-2">
                <FaSpinner className="animate-spin text-xs" /> Vérification automatique en cours...
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => checkVerificationStatus(false)}
            disabled={isChecking}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-green-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isChecking ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            {isChecking ? 'Vérification en cours...' : 'Vérifier manuellement'}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={isSending}
            className="w-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            {isSending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-sm border ${messageType === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' :
                messageType === 'warning' ? 'bg-amber-50 dark:bg-yellow-500/10 text-amber-700 dark:text-yellow-400 border-amber-200 dark:border-yellow-500/20' :
                  'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
                }`}
            >
              {messageType === 'success' && <FaCheckCircle className="flex-shrink-0 text-lg" />}
              {messageType === 'warning' && <FaExclamationTriangle className="flex-shrink-0 text-lg" />}
              {messageType === 'error' && <FaInfoCircle className="flex-shrink-0 text-lg" />}
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center">
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto hover:underline"
          >
            <FaSignOutAlt /> Se déconnecter / Changer de compte
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailReminder;