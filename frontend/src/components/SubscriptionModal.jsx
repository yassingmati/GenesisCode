// src/components/SubscriptionModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import API_CONFIG from '../config/api';
import KonnectPaymentHandler from './KonnectPaymentHandler';
import './SubscriptionModal.css';

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
      
      // Plans par défaut en cas d'erreur API
      const defaultPlans = [
        {
          _id: 'free',
          name: 'Gratuit',
          description: 'Accès à la première leçon de chaque parcours',
          priceMonthly: null,
          currency: 'TND',
          interval: null,
          features: ['Première leçon gratuite', 'Accès limité'],
          type: 'global',
          active: true
        },
        {
          _id: 'premium-global',
          name: 'Premium Global',
          description: 'Accès complet à tous les parcours',
          priceMonthly: 4999,
          currency: 'TND',
          interval: 'month',
          features: ['Tous les parcours', 'Exercices illimités', 'Support prioritaire'],
          type: 'global',
          active: true
        },
        {
          _id: 'premium-debutant',
          name: 'Premium Débutant',
          description: 'Accès aux parcours débutant',
          priceMonthly: 1999,
          currency: 'TND',
          interval: 'month',
          features: ['Parcours débutant', 'Exercices illimités'],
          type: 'category',
          active: true
        }
      ];
      
      try {
        // Utiliser l'endpoint /api/subscriptions/plans qui récupère les plans depuis MongoDB Atlas
        const url = API_CONFIG.getFullUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION_PLANS);
        const response = await fetch(url, { headers: API_CONFIG.getPublicHeaders() });
        const data = await response.json();

        // Adapter les plans côté client pour l'affichage
        if (data?.success && Array.isArray(data?.plans) && data.plans.length > 0) {
          console.log('📋 Plans récupérés depuis MongoDB Atlas:', data.plans.length);
          
          // Filtrer les plans actifs
          const activePlans = data.plans.filter(p => p.active !== false);
          console.log(`✅ ${activePlans.length} plans actifs trouvés sur ${data.plans.length}`);
          
          const adapted = activePlans.map(p => {
            return {
              _id: p._id || p.id,
              id: p.id || p._id,
              name: p.name || 'Plan',
              description: p.description || '',
              priceMonthly: p.priceMonthly || null,
              currency: p.currency || 'TND',
              interval: p.interval || null,
              features: Array.isArray(p.features) ? p.features : [],
              type: 'global',
              isPopular: false,
              active: p.active !== false
            };
          });

          if (adapted.length > 0) {
            setPlans(adapted);
            console.log('✅ Plans chargés depuis MongoDB Atlas:', adapted);
          } else {
            console.warn('⚠️ Aucun plan actif après filtrage');
            throw new Error('Aucun plan actif retourné');
          }
        } else {
          console.warn('⚠️ Réponse invalide ou aucun plan:', data);
          throw new Error('Réponse invalide des plans');
        }
      } catch (apiError) {
        console.warn('⚠️ Erreur API plans, fallback plans par défaut:', apiError.message);
        setPlans(defaultPlans);
        console.log('Plans par défaut chargés:', defaultPlans);
      }
      
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Initiating subscription for plan:', plan._id);
      console.log('PathId:', pathId);

      if (plan._id === 'free') {
        // Plan gratuit - accès immédiat
        setError('Plan gratuit - accès immédiat accordé !');
        setTimeout(() => {
          onClose();
        }, 2000);
        return;
      }

      // Pour les plans payants, utiliser le gestionnaire de paiement Konnect
      setSelectedPlan(plan);
      setShowPaymentHandler(true);

    } catch (err) {
      console.error('Error subscribing:', err);
      setError('Erreur lors de l\'initialisation du paiement');
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

  const formatPrice = (priceCents) => {
    if (!priceCents) return 'Gratuit';
    return `${(priceCents / 100).toFixed(2)} TND`;
  };

  const getPlanIcon = (plan) => {
    if (plan._id === 'free') return '🆓';
    if (plan.isPopular) return '⭐';
    if (plan.type === 'global') return '🌍';
    if (plan.type === 'path') return '📚';
    if (plan.type === 'category') return '📁';
    if (plan.type === 'language') return '🌐';
    return '💎';
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
          {/* Header amélioré */}
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
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="subscription-modal-content">
            {showPaymentHandler && selectedPlan ? (
              <KonnectPaymentHandler
                plan={selectedPlan}
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
                <button onClick={loadPlans} className="retry-btn">
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="plans-grid">
                {plans && Array.isArray(plans) && plans.length > 0 ? plans.map((plan) => (
                  <motion.div
                    key={plan._id}
                    className={`plan-card ${plan.isPopular ? 'popular' : ''} ${plan._id === 'free' ? 'free-plan' : ''}`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.isPopular && (
                      <div className="popular-badge">
                        <span className="badge-icon">⭐</span>
                        <span className="badge-text">Populaire</span>
                      </div>
                    )}
                    
                    <div className="plan-header">
                      <div className="plan-icon-container">
                        <div className="plan-icon">{getPlanIcon(plan)}</div>
                      </div>
                      <h3 className="plan-title">{plan.name}</h3>
                      <div className="plan-price-container">
                        <div className="plan-price">
                          {plan.priceMonthly && plan.priceMonthly > 0 
                            ? `${(plan.priceMonthly/100).toFixed(2)} ${plan.currency || 'TND'}`
                            : 'Gratuit'}
                        </div>
                        {plan.priceMonthly && plan.priceMonthly > 0 && plan.interval && (
                          <span className="plan-interval">
                            / {plan.interval === 'month' ? 'mois' : plan.interval === 'year' ? 'an' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="plan-description">
                      <p>{plan.description}</p>
                    </div>

                    <div className="plan-features">
                      <div className="features-header">
                        <span className="features-title">Fonctionnalités incluses</span>
                      </div>
                      <ul className="features-list">
                        {Array.isArray(plan.features) && plan.features.length > 0 
                          ? plan.features.map((feature, index) => (
                              <li key={index} className="feature-item">
                                <span className="feature-check">✓</span>
                                <span className="feature-text">{feature}</span>
                              </li>
                            ))
                          : (
                            <li className="feature-item" style={{color: '#999', fontStyle: 'italic'}}>
                              Aucun avantage listé
                            </li>
                          )}
                      </ul>
                    </div>

                    <div className="plan-button-container">
                      <button
                        className={`plan-button ${plan._id === 'free' ? 'free' : 'premium'}`}
                        onClick={() => handleSubscribe(plan)}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="button-spinner"></div>
                        ) : plan._id === 'free' ? (
                          <>
                            <span className="button-icon">🆓</span>
                            <span className="button-text">Commencer Gratuitement</span>
                          </>
                        ) : (
                          <>
                            <span className="button-icon">💎</span>
                            <span className="button-text">
                              S'abonner - {plan.priceMonthly && plan.priceMonthly > 0 
                                ? `${(plan.priceMonthly/100).toFixed(2)} ${plan.currency || 'TND'}`
                                : 'Gratuit'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="no-plans">
                    <p>Aucun plan disponible pour le moment.</p>
                    <button onClick={loadPlans} className="retry-btn">
                      Recharger
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer amélioré */}
          <div className="subscription-modal-footer">
            <div className="footer-content">
              <div className="footer-features">
                <div className="footer-feature">
                  <span className="footer-icon">💳</span>
                  <span className="footer-text">Paiement sécurisé</span>
                </div>
                <div className="footer-feature">
                  <span className="footer-icon">🔒</span>
                  <span className="footer-text">Données protégées</span>
                </div>
                <div className="footer-feature">
                  <span className="footer-icon">🎯</span>
                  <span className="footer-text">Satisfaction garantie</span>
                </div>
              </div>
              <div className="footer-note">
                <p>Powered by Konnect • Annulation possible à tout moment</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
