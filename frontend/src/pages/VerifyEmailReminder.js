// src/pages/VerifyEmailReminder.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../utils/apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPaperPlane, FaCheckCircle, FaSignOutAlt, FaInfoCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));

const VerifyEmailReminder = () => {
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success, error, warning
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.email) {
      setUserEmail(userData.email);
    }
  }, []);

  const handleResendEmail = async () => {
    setIsSending(true);
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-verification`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMessage('Un nouvel email de vérification a été envoyé !');
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de l\'envoi');
      setMessageType('error');
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
    setIsChecking(true);
    setMessage('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.isVerified) {
        setMessage('Email vérifié avec succès ! Redirection...');
        setMessageType('success');
        setTimeout(() => {
          if (response.data.isProfileComplete) {
            navigate('/dashboard');
          } else {
            navigate('/complete-profile');
          }
        }, 1500);
      } else {
        setMessage('Votre email n\'est pas encore vérifié. Veuillez vérifier votre boîte de réception.');
        setMessageType('warning');
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error);
      setMessage('Impossible de vérifier le statut. Veuillez réessayer.');
      setMessageType('error');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/10 z-10 relative"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
            <FaEnvelope className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Vérifiez votre email</h2>
          <p className="text-slate-300">
            Un lien de vérification a été envoyé à <br />
            <span className="text-white font-medium bg-white/10 px-2 py-1 rounded mt-1 inline-block">{userEmail}</span>
          </p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-yellow-400 text-xl mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-100/90 space-y-1">
              <p>• Vérifiez votre dossier de spam ou indésirables</p>
              <p>• Le lien expire après 1 heure</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={checkVerificationStatus}
            disabled={isChecking}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-green-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isChecking ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            {isChecking ? 'Vérification...' : 'J\'ai vérifié mon email'}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={isSending}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            {isSending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-sm ${messageType === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                messageType === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
            >
              {messageType === 'success' && <FaCheckCircle className="flex-shrink-0 text-lg" />}
              {messageType === 'warning' && <FaExclamationTriangle className="flex-shrink-0 text-lg" />}
              {messageType === 'error' && <FaInfoCircle className="flex-shrink-0 text-lg" />}
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <FaSignOutAlt /> Se déconnecter
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailReminder;