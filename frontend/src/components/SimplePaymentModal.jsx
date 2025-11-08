import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiLoader, FiCreditCard } from 'react-icons/fi';
import { getApiUrl } from '../utils/apiConfig';
import './SimplePaymentModal.css';

const SimplePaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error

  // Charger les plans
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://codegenesis-backend.onrender.com' 
          : getApiUrl(''));
      const response = await fetch(`${apiUrl}/api/plans`);
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
        console.log('Plans chargés:', data.plans);
      } else {
        throw new Error(data.message || 'Erreur de chargement des plans');
      }
    } catch (err) {
      console.error('Erreur chargement plans:', err);
      setError('Erreur de connexion au serveur');
      
      // Plans de fallback
      setPlans([
        {
          _id: 'free',
          name: 'Gratuit',
          description: 'Accès aux premières leçons',
          price: 0,
          currency: 'TND',
          features: ['Première leçon gratuite', 'Contenu de base']
        },
        {
          _id: 'premium-debutant',
          name: 'Premium Débutant',
          description: 'Accès aux parcours débutant',
          price: 19.99,
          currency: 'TND',
          features: ['Parcours débutant', 'Exercices illimités', 'Support email']
        },
        {
          _id: 'premium-global',
          name: 'Premium Global',
          description: 'Accès à tous les parcours',
          price: 49.99,
          currency: 'TND',
          features: ['Tous les parcours', 'Support prioritaire', 'Certificats']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setLoading(true);
      setError(null);
      setPaymentStatus('processing');

      console.log('Initiating subscription for plan:', plan._id);

      const apiUrl = process.env.REACT_APP_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://codegenesis-backend.onrender.com' 
          : getApiUrl(''));
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const userEmail = user ? JSON.parse(user).email : 'user@genesis.com';
      
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiUrl}/api/payment/init`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId: plan._id,
          customerEmail: userEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.freeAccess) {
          // Plan gratuit - accès immédiat
          setPaymentStatus('success');
          setTimeout(() => {
            onSuccess?.(plan);
            onClose();
          }, 2000);
        } else if (data.paymentUrl) {
          // Plan payant - redirection vers Konnect
          console.log('Redirection vers Konnect:', data.paymentUrl);
          window.open(data.paymentUrl, '_blank');
          
          // Simuler le succès après 3 secondes (pour la démo)
          setTimeout(() => {
            setPaymentStatus('success');
            setTimeout(() => {
              onSuccess?.(plan);
              onClose();
            }, 2000);
          }, 3000);
        }
      } else {
        throw new Error(data.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (err) {
      console.error('Erreur subscription:', err);
      setError(err.message || 'Erreur lors de l\'abonnement');
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Gratuit';
    return `${price} TND`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="simple-payment-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="simple-payment-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="simple-payment-header">
            <h2>🚀 Choisissez votre abonnement</h2>
            <p>Débloquez votre potentiel de programmation</p>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          {/* Content */}
          <div className="simple-payment-content">
            {loading && !plans.length ? (
              <div className="loading-state">
                <FiLoader className="spinner" />
                <p>Chargement des plans...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <button onClick={loadPlans} className="retry-btn">
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="plans-grid">
                {plans.map((plan) => (
                  <motion.div
                    key={plan._id}
                    className={`plan-card ${plan._id === 'premium-global' ? 'popular' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: plans.indexOf(plan) * 0.1 }}
                  >
                    <div className="plan-icon">
                      {plan._id === 'free' ? '🆓' : plan._id === 'premium-debutant' ? '⭐' : '👑'}
                    </div>
                    <h3>{plan.name}</h3>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-price">
                      {formatPrice(plan.price)}
                    </div>
                    <ul className="plan-features">
                      {plan.features.map((feature, index) => (
                        <li key={index}>
                          <FiCheck className="feature-icon" /> {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="subscribe-btn"
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading || paymentStatus === 'processing'}
                    >
                      {loading && paymentStatus === 'processing' ? (
                        <>
                          <FiLoader className="spinner" /> Traitement...
                        </>
                      ) : plan.price === 0 ? (
                        'Commencer Gratuitement'
                      ) : (
                        'S\'abonner'
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Status Messages */}
            {paymentStatus === 'success' && (
              <div className="success-message">
                <FiCheck className="success-icon" />
                <h3>Abonnement réussi !</h3>
                <p>Votre accès a été activé avec succès.</p>
              </div>
            )}

            {paymentStatus === 'error' && (
              <div className="error-message">
                <FiX className="error-icon" />
                <h3>Erreur de paiement</h3>
                <p>Une erreur s'est produite. Veuillez réessayer.</p>
                <button onClick={() => setPaymentStatus('idle')} className="retry-btn">
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SimplePaymentModal;
