// Page d'annulation de paiement Konnect
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiXCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from '../hooks/useTranslation';
import './PaymentCancel.css';

const PaymentCancel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const paymentRef = searchParams.get('payment_ref');
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');

    console.log('Payment cancel parameters:', { paymentRef, status, reason });

    if (paymentRef) {
      setPaymentData({
        paymentRef,
        status,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  }, [searchParams]);

  const handleRetry = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="payment-cancel-container">
      <motion.div
        className="payment-cancel-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="cancel-icon">
          <FiXCircle />
        </div>

        <h1>❌ Paiement Annulé</h1>
        <p className="cancel-message">
          Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
        </p>

        {paymentData && (
          <div className="payment-details">
            <h3>Détails de l'annulation</h3>
            <div className="detail-item">
              <span className="label">ID de paiement:</span>
              <span className="value">{paymentData.paymentRef}</span>
            </div>
            <div className="detail-item">
              <span className="label">Statut:</span>
              <span className="value cancelled">Annulé</span>
            </div>
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">
                {new Date(paymentData.timestamp).toLocaleString('fr-FR')}
              </span>
            </div>
            {paymentData.reason && (
              <div className="detail-item">
                <span className="label">Raison:</span>
                <span className="value">{paymentData.reason}</span>
              </div>
            )}
          </div>
        )}

        <div className="cancel-reasons">
          <h3>🤔 Pourquoi le paiement a-t-il été annulé ?</h3>
          <ul>
            <li>• Vous avez fermé la fenêtre de paiement</li>
            <li>• Vous avez cliqué sur "Annuler"</li>
            <li>• Problème de connexion internet</li>
            <li>• Timeout de la session de paiement</li>
          </ul>
        </div>

        <div className="action-buttons">
          <motion.button
            className="btn-primary"
            onClick={handleRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw />
            Réessayer le paiement
          </motion.button>

          <motion.button
            className="btn-secondary"
            onClick={handleGoBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft />
            Retour
          </motion.button>

          <motion.button
            className="btn-outline"
            onClick={handleGoHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retour à l'accueil
          </motion.button>
        </div>

        <div className="help-section">
          <h3>💡 Besoin d'aide ?</h3>
          <p>
            Si vous rencontrez des problèmes avec le paiement, contactez notre support :
          </p>
          <div className="contact-info">
            <p>📧 Email: support@genesis.com</p>
            <p>📞 Téléphone: +216 XX XXX XXX</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
