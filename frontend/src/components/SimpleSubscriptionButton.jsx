import React, { useState } from 'react';
import SimplePaymentModal from './SimplePaymentModal';
import './SimpleSubscriptionButton.css';

const SimpleSubscriptionButton = ({ variant = 'default', className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (plan) => {
    console.log('Subscription successful for plan:', plan);
    // Ici vous pouvez ajouter la logique pour mettre à jour l'état de l'utilisateur
    alert(`Abonnement réussi au plan: ${plan.name}`);
  };

  return (
    <>
      <button 
        className={`simple-subscription-btn ${variant} ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        {variant === 'premium' ? '🚀 S\'abonner' : '💳 Voir les plans'}
      </button>
      
      <SimplePaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default SimpleSubscriptionButton;
