// src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { getApiUrl } from '../utils/apiConfig';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : getApiUrl(''));

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien de vérification invalide ou expiré.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify-email?token=${token}`);
        const data = await res.text(); // Backend might return text or JSON

        // Handle both text and JSON responses
        let responseMsg = data;
        try {
          const json = JSON.parse(data);
          responseMsg = json.message || json;
        } catch (e) {
          // It's plain text
        }

        if (res.ok || responseMsg.includes('succès') || responseMsg.includes('successfully') || responseMsg.includes('already verified')) {
          setStatus('success');
          setMessage('Votre email a été vérifié avec succès !');

          // If user is logged in locally, update their verified status
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.email) {
            localStorage.setItem('user', JSON.stringify({ ...user, isVerified: true }));
          }

          // Removed auto-redirect to let user read the message
        } else {
          setStatus('error');
          setMessage(responseMsg || 'Le lien a expiré ou est invalide.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Impossible de contacter le serveur.');
      }
    };

    verify();
  }, [token]);

  const handleContinue = () => {
    // Force redirection to the custom domain
    window.location.href = 'https://genesiscode-platform.com/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 z-10 text-center relative"
      >
        <div className="flex justify-center mb-8">
          {status === 'loading' && (
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse"></div>
              <FaSpinner className="text-5xl text-blue-400 animate-spin relative z-10" />
            </div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 border border-green-500/30"
            >
              <FaCheckCircle className="text-4xl" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 border border-red-500/30"
            >
              <FaExclamationCircle className="text-4xl" />
            </motion.div>
          )}
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-3"
        >
          {status === 'loading' ? 'Vérification...' :
            status === 'success' ? 'Email Vérifié !' : 'Erreur de vérification'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-300 mb-8 leading-relaxed"
        >
          {message}
        </motion.p>

        {status === 'success' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-green-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Continuer <FaArrowRight />
          </motion.button>
        )}

        {status === 'error' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/login')}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-xl transition-all border border-white/5"
          >
            Retour à la connexion
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
