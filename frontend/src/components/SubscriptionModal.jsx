// src/components/SubscriptionModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import SubscriptionService from '../services/subscriptionService';
import KonnectPaymentHandler from './KonnectPaymentHandler';
import './SubscriptionModal.css';
import { toast } from 'react-toastify';

const SubscriptionModal = ({
  isOpen,
  onClose,
  pathId,
  pathName,
  onSubscribe
}) => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [showPaymentHandler, setShowPaymentHandler] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Charger les plans disponibles
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les plans via le service
      const fetchedPlans = await SubscriptionService.getPlans();

      if (fetchedPlans && fetchedPlans.length > 0) {
        setPlans(fetchedPlans);
      } else {
        setError('Aucun plan disponible pour le moment.');
      }

    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Erreur de connexion lors du chargement des plans.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Initiating subscription for plan:', plan._id);

      // Si c'est un plan gratuit ou si on a un code promo (logique gérée par backend pour le prix final)
      // On tente d'abord une souscription directe
      if (!plan.priceMonthly || plan.priceMonthly <= 0) {
        const result = await SubscriptionService.subscribe(plan._id, { promoCode });

        if (result.success) {
          toast.success('Abonnement activé avec succès !');
          onSubscribe?.(plan);
          setTimeout(onClose, 1500);
          return;
        }
      }

      // Pour les plans payants, on passe au handler de paiement
      setSelectedPlan(plan);
      setShowPaymentHandler(true);

    } catch (err) {
      console.error('Error subscribing:', err);
      setError(err.message || 'Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (plan) => {
    console.log('Payment successful for plan:', plan);
    setShowPaymentHandler(false);
    setSelectedPlan(null);
    onSubscribe?.(plan);
    onClose();
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError('Erreur lors du paiement: ' + error.message);
    setShowPaymentHandler(false);
    setSelectedPlan(null);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setShowPaymentHandler(false);
    setSelectedPlan(null);
  };

  const getPlanIcon = (plan) => {
    if (plan.priceMonthly === 0 || !plan.priceMonthly) return '🆓';
    if (plan.name.toLowerCase().includes('premium')) return '💎';
    return '📦';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="subscription-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="subscription-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="subscription-modal-header">
            <div className="modal-header-content">
              <div className="modal-header-icon">
                <span className="header-emoji">🚀</span>
              </div>
              <div className="modal-header-text">
                <h2>Débloquez votre potentiel</h2>
                <p>Choisissez le plan qui vous convient pour accéder à <strong>{pathName}</strong></p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Content */}
          <div className="subscription-modal-content">
            {showPaymentHandler && selectedPlan ? (
              <KonnectPaymentHandler
                plan={selectedPlan}
                promoCode={promoCode}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            ) : loading && !plans.length ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Chargement des plans...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <button onClick={loadPlans} className="retry-btn">Réessayer</button>
              </div>
            ) : (
              <>
                <div className="plans-grid">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan._id}
                      className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="plan-header">
                        <div className="plan-icon-container">
                          <div className="plan-icon">{getPlanIcon(plan)}</div>
                        </div>
                        <h3 className="plan-title">{plan.name}</h3>
                        <div className="plan-price-container">
                          <div className="plan-price">
                            {plan.priceMonthly > 0
                              ? `${(plan.priceMonthly / 100).toFixed(2)} ${plan.currency || 'TND'}`
                              : 'Gratuit'}
                          </div>
                          {plan.priceMonthly > 0 && (
                            <span className="plan-interval">/ {plan.interval === 'year' ? 'an' : 'mois'}</span>
                          )}
                        </div>
                      </div>

                      <div className="plan-description">
                        <p>{plan.description}</p>
                      </div>

                      <div className="plan-features">
                        <ul className="features-list">
                          {plan.features && plan.features.map((feature, index) => (
                            <li key={index} className="feature-item">
                              <span className="feature-check">✓</span>
                              <span className="feature-text">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="plan-button-container">
                        <button
                          className={`plan-button ${plan.priceMonthly > 0 ? 'premium' : 'free'}`}
                          onClick={() => handleSubscribe(plan)}
                          disabled={loading}
                        >
                          {loading ? 'Chargement...' : (plan.priceMonthly > 0 ? "S'abonner" : "Commencer")}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="promo-code-section mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code Promo (Optionnel)</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="ENTREZ VOTRE CODE"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
