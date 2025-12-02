// src/components/SubscribeButton.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionService from '../services/subscriptionService';
import { toast } from 'react-toastify';
import './SubscribeButton.css';

const SubscribeButton = ({ plan, returnUrl, customClass }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!plan) {
      toast.error('Plan manquant');
      return;
    }

    // Si c'est un plan gratuit, on souscrit directement
    if (!plan.priceMonthly || plan.priceMonthly <= 0) {
      try {
        setLoading(true);
        const result = await SubscriptionService.subscribe(plan._id || plan.id, {
          returnUrl: returnUrl || `${window.location.origin}/payments/konnect-return`
        });

        if (result.subscription && result.subscription.status === 'active') {
          toast.success('Abonnement activé avec succès!');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        console.error('❌ Erreur abonnement:', error);
        toast.error(error.message || 'Erreur lors de l\'abonnement.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Si c'est payant, on redirige vers la page de sélection
    navigate('/payment-selection', { state: { plan } });
  };

  return (
    <button
      className={`subscribe-button ${customClass || ''}`}
      onClick={handleSubscribe}
      disabled={loading}
    >
      {loading ? 'Chargement...' : 'S\'abonner'}
    </button>
  );
};

export default SubscribeButton;

