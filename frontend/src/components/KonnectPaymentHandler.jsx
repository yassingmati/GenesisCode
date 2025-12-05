// Composant de gestion des paiements Konnect - Version Reformulée
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import KonnectService from '../services/konnectService';
import SubscriptionService from '../services/subscriptionService';
import CategoryPaymentService from '../services/categoryPaymentService';
import { FiLoader, FiCheckCircle, FiXCircle, FiAlertCircle, FiExternalLink, FiCreditCard } from 'react-icons/fi';
import './KonnectPaymentHandler.css';

const KonnectPaymentHandler = ({
  plan,
  onSuccess,
  onError,
  onCancel,
  customerEmail = 'user@genesis.com',
  promoCode = null
}) => {
  const { t } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState('initializing'); // initializing, ready, processing, success, failed, cancelled
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [isFreeAccess, setIsFreeAccess] = useState(false);

  useEffect(() => {
    initializePayment();
  }, [plan]);

  const initializePayment = async () => {
    try {
      setPaymentStatus('initializing');
      setErrorMessage(null);
      setIsFreeAccess(false);

      console.log('🚀 Initialisation du paiement pour le plan:', plan);

      // Vérifier que le plan a un ID
      const planId = plan._id || plan.id;
      if (!planId) {
        throw new Error('ID du plan manquant');
      }

      // Déterminer si c'est un plan d'abonnement global ou un plan de catégorie
      const isGlobalPlan = plan.type === 'global' || !plan.raw; // Plans depuis SubscriptionModal sont globaux
      const isCategoryPlan = plan.type === 'category' || plan.raw; // Plans de catégorie ont raw

      console.log('📋 Type de plan:', { isGlobalPlan, isCategoryPlan, planType: plan.type, hasRaw: !!plan.raw });

      let result;
      try {
        if (isGlobalPlan) {
          // Plan d'abonnement global - utiliser SubscriptionService.subscribe
          console.log('💳 Utilisation SubscriptionService pour plan global:', planId);
          result = await SubscriptionService.subscribe(planId, {
            promoCode,
            returnUrl: `${window.location.origin}/payment/success`,
            cancelUrl: `${window.location.origin}/payment/cancel`
          });

          // Adapter la réponse pour le format attendu
          if (result.subscription && result.subscription.status === 'active') {
            // Plan gratuit activé
            result = {
              success: true,
              freeAccess: true,
              plan: plan,
              message: result.message || 'Abonnement activé avec succès'
            };
          } else if (result.paymentUrl) {
            // Plan payant - URL de paiement disponible
            result = {
              success: true,
              paymentUrl: result.paymentUrl,
              konnectPaymentId: result.konnect?.id || result.konnectPaymentId,
              plan: plan,
              message: result.message || 'Paiement créé. Rediriger l\'utilisateur vers paymentUrl'
            };
          } else {
            throw new Error(result.message || result.error || 'Erreur lors de l\'abonnement');
          }
        } else {
          // Plan de catégorie - utiliser CategoryPaymentService.initCategoryPayment
          console.log('💳 Utilisation CategoryPaymentService pour plan catégorie:', planId);

          // Extraire l'ID de la catégorie
          // Le plan contient category qui peut être un objet ou un ID
          const categoryId = plan.category?._id || plan.category || plan.targetId;

          if (!categoryId) {
            throw new Error("ID de la catégorie introuvable dans le plan");
          }

          const returnUrl = `${window.location.origin}/payment/success`;
          const cancelUrl = `${window.location.origin}/payment/cancel`;

          result = await CategoryPaymentService.initCategoryPayment(categoryId, returnUrl, cancelUrl);
        }
      } catch (e) {
        // Ne pas utiliser buildPaymentUrl car elle construit une URL incorrecte
        // L'URL de paiement doit toujours venir du backend depuis l'API Konnect
        console.error('❌ Erreur initialisation paiement:', e);
        throw new Error(`Erreur lors de l'initialisation du paiement: ${e.message || 'Erreur inconnue'}`);
      }

      if (result.success) {
        if (result.freeAccess) {
          // Accès gratuit - pas de paiement nécessaire
          setPaymentStatus('success');
          setIsFreeAccess(true);
          setPaymentUrl(null);
          setPaymentId(null);

          console.log('✅ Accès gratuit accordé:', result.plan);

          // Appeler le callback de succès
          if (onSuccess) {
            onSuccess({
              type: 'free_access',
              plan: result.plan,
              message: result.message
            });
          }
          return;
        }

        // Plan payant - initialiser le paiement
        if (result.paymentUrl) {
          setPaymentUrl(result.paymentUrl);
          setPaymentId(result.konnectPaymentId);
          setPaymentStatus('ready');

          console.log('🔗 URL de paiement générée:', result.paymentUrl);
        } else {
          throw new Error('URL de paiement non générée');
        }
      } else {
        throw new Error(result.message || 'Erreur lors de l\'initialisation du paiement');
      }

    } catch (error) {
      console.error('❌ Erreur initialisation paiement:', error);
      setErrorMessage(error.message || 'Erreur lors de l\'initialisation du paiement');
      setPaymentStatus('failed');
      onError?.(error);
    }
  };

  const handlePayment = async () => {
    if (!paymentUrl) {
      setErrorMessage('URL de paiement non disponible');
      setPaymentStatus('failed');
      return;
    }

    try {
      setPaymentStatus('processing');
      setErrorMessage(null);

      console.log('🔗 Ouverture de la page de paiement Konnect:', paymentUrl);

      // Ouvrir la page de paiement dans une nouvelle fenêtre
      const paymentWindow = window.open(
        paymentUrl,
        'konnect_payment',
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,toolbar=no,menubar=no,location=no'
      );

      if (!paymentWindow) {
        throw new Error('Impossible d\'ouvrir la fenêtre de paiement. Vérifiez les bloqueurs de popup.');
      }

      setPaymentWindow(paymentWindow);

      // Vérifier si la fenêtre est fermée
      const checkClosed = setInterval(() => {
        if (paymentWindow.closed) {
          clearInterval(checkClosed);
          setPaymentStatus('cancelled');
          onCancel?.();
        }
      }, 1000);

      // Timeout après 30 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!paymentWindow.closed) {
          paymentWindow.close();
        }
        if (paymentStatus === 'processing') {
          setPaymentStatus('failed');
          setErrorMessage('Timeout du paiement');
        }
      }, 30 * 60 * 1000);

    } catch (error) {
      console.error('❌ Erreur ouverture paiement:', error);
      setErrorMessage(error.message);
      setPaymentStatus('failed');
      onError?.(error);
    }
  };

  const handleCancel = () => {
    if (paymentWindow && !paymentWindow.closed) {
      paymentWindow.close();
    }
    setPaymentStatus('cancelled');
    onCancel?.();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'initializing':
        return <FiLoader className="animate-spin" />;
      case 'ready':
        return <FiCreditCard />;
      case 'processing':
        return <FiLoader className="animate-spin" />;
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'failed':
        return <FiXCircle className="text-red-500" />;
      case 'cancelled':
        return <FiAlertCircle className="text-yellow-500" />;
      default:
        return <FiAlertCircle />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'initializing':
        return 'Initialisation du paiement...';
      case 'ready':
        return isFreeAccess ? 'Accès gratuit accordé !' : 'Prêt pour le paiement';
      case 'processing':
        return 'Redirection vers Konnect...';
      case 'success':
        return isFreeAccess ? 'Accès gratuit activé !' : 'Paiement réussi !';
      case 'failed':
        return errorMessage || 'Erreur de paiement';
      case 'cancelled':
        return 'Paiement annulé';
      default:
        return 'État inconnu';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="konnect-payment-handler">
      <div className="payment-status">
        <div className="status-icon">
          {getStatusIcon()}
        </div>
        <div className="status-content">
          <h3 className={`status-title ${getStatusColor()}`}>
            {getStatusMessage()}
          </h3>

          {plan && (
            <div className="plan-info">
              <h4>{plan.name}</h4>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price">
                {isFreeAccess ? (
                  <span className="price-free">Gratuit</span>
                ) : (
                  <span className="price-amount">
                    {plan.priceMonthly ? `${(plan.priceMonthly / 100).toFixed(2)} ${plan.currency}` : 'Gratuit'}
                  </span>
                )}
              </div>
            </div>
          )}

          {paymentUrl && paymentStatus === 'ready' && (
            <div className="payment-actions">
              <button
                onClick={handlePayment}
                className="btn-payment"
                disabled={paymentStatus === 'processing'}
              >
                <FiExternalLink />
                Payer avec Konnect
              </button>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="processing-info">
              <p>Redirection vers la page de paiement Konnect...</p>
              <p className="text-sm text-gray-500">
                Si la page ne s'ouvre pas, vérifiez les bloqueurs de popup.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
              <FiAlertCircle />
              <span>{errorMessage}</span>
            </div>
          )}

          {paymentStatus === 'ready' && (
            <div className="cancel-actions">
              <button
                onClick={handleCancel}
                className="btn-cancel"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KonnectPaymentHandler;