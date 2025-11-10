// src/components/SubscribeButton.jsx
import React, { useState } from 'react';
import SubscriptionService from '../services/subscriptionService';
import { toast } from 'react-toastify';
import './SubscribeButton.css';

const SubscribeButton = ({ planId, returnUrl }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!planId) {
      toast.error('ID du plan manquant');
      return;
    }

    try {
      setLoading(true);
      console.log('💳 Abonnement au plan:', planId);

      // Appeler le service d'abonnement
      const result = await SubscriptionService.subscribe(planId, {
        returnUrl: returnUrl || `${window.location.origin}/payments/konnect-return`
      });

      console.log('✅ Résultat abonnement:', result);

      // Si c'est un plan gratuit, l'abonnement est déjà activé
      if (result.subscription && result.subscription.status === 'active') {
        toast.success('Abonnement activé avec succès!');
        // Recharger la page pour mettre à jour l'état
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      // Si c'est un plan payant, rediriger vers l'URL de paiement Konnect
      if (result.paymentUrl) {
        console.log('🔗 Redirection vers Konnect:', result.paymentUrl);
        // Vérifier que l'URL est correcte (doit contenir payment_ref)
        if (result.paymentUrl.includes('payment_ref=') || result.paymentUrl.includes('gateway.sandbox.konnect.network') || result.paymentUrl.includes('gateway.konnect.network')) {
          // Ouvrir dans un nouvel onglet pour ne pas perdre la page actuelle
          window.open(result.paymentUrl, '_blank');
          toast.info('Redirection vers la page de paiement...');
        } else {
          console.error('❌ URL de paiement invalide:', result.paymentUrl);
          toast.error('URL de paiement invalide. Veuillez contacter le support.');
        }
      } else {
        toast.error('URL de paiement non disponible');
      }
    } catch (error) {
      console.error('❌ Erreur abonnement:', error);
      toast.error(error.message || 'Erreur lors de l\'abonnement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="subscribe-button"
      onClick={handleSubscribe}
      disabled={loading}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.2s'
      }}
    >
      {loading ? 'Chargement...' : 'S\'abonner'}
    </button>
  );
};

export default SubscribeButton;

