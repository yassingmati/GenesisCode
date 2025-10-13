// Page de succès de paiement Konnect
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiArrowRight, FiHome } from 'react-icons/fi';
import { useTranslation } from '../hooks/useTranslation';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const paymentRef = searchParams.get('payment_ref');
    const status = searchParams.get('status');
    const planId = searchParams.get('plan_id');

    console.log('Payment success parameters:', { paymentRef, status, planId });

    if (paymentRef && status === 'success') {
      setPaymentData({
        paymentRef,
        status,
        planId,
        timestamp: new Date().toISOString()
      });
    }

    setLoading(false);

    // Redirection automatique après 10 secondes
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="payment-success-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <motion.div
        className="payment-success-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="success-icon">
          <FiCheckCircle />
        </div>

        <h1>🎉 Paiement Réussi !</h1>
        <p className="success-message">
          Félicitations ! Votre abonnement a été activé avec succès.
        </p>

        {paymentData && (
          <div className="payment-details">
            <h3>Détails du paiement</h3>
            <div className="detail-item">
              <span className="label">ID de paiement:</span>
              <span className="value">{paymentData.paymentRef}</span>
            </div>
            <div className="detail-item">
              <span className="label">Statut:</span>
              <span className="value success">Confirmé</span>
            </div>
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">
                {new Date(paymentData.timestamp).toLocaleString('fr-FR')}
              </span>
            </div>
            {paymentData.planId && (
              <div className="detail-item">
                <span className="label">Plan:</span>
                <span className="value">{paymentData.planId}</span>
              </div>
            )}
          </div>
        )}

        <div className="success-features">
          <h3>🚀 Votre abonnement inclut :</h3>
          <ul>
            <li>✓ Accès illimité aux cours</li>
            <li>✓ Exercices interactifs</li>
            <li>✓ Certificats de completion</li>
            <li>✓ Support prioritaire</li>
            <li>✓ Mises à jour gratuites</li>
          </ul>
        </div>

        <div className="action-buttons">
          <motion.button
            className="btn-primary"
            onClick={handleContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowRight />
            Continuer vers le Dashboard
          </motion.button>

          <motion.button
            className="btn-secondary"
            onClick={handleGoHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiHome />
            Retour à l'accueil
          </motion.button>
        </div>

        <div className="auto-redirect">
          <p>Redirection automatique vers le dashboard dans 10 secondes...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;