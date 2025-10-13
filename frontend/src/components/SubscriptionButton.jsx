// src/components/SubscriptionButton.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SubscriptionModal from './SubscriptionModal';
import './SubscriptionButton.css';

const SubscriptionButton = ({ 
  categoryId = null, 
  categoryName = null,
  className = '',
  variant = 'default' // 'default', 'premium', 'outline'
}) => {
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les plans disponibles
  useEffect(() => {
    if (categoryId) {
      loadPlans();
    }
  }, [categoryId]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/course-access/plans`);
      const data = await response.json();
      
      if (data.success) {
        // Filtrer les plans par catégorie si spécifié
        let filteredPlans = data.plans || [];
        if (categoryId) {
          filteredPlans = filteredPlans.filter(plan => 
            plan.type === 'global' || 
            (plan.type === 'category' && plan.targetId === categoryId)
          );
        }
        setPlans(filteredPlans);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    setShowModal(true);
  };

  const getButtonText = () => {
    if (loading) return 'Chargement...';
    if (categoryId && categoryName) return `Abonnement ${categoryName}`;
    return 'Voir les abonnements';
  };

  const getButtonIcon = () => {
    if (variant === 'premium') return '💎';
    if (variant === 'outline') return '🔓';
    return '📚';
  };

  return (
    <>
      <motion.button
        className={`subscription-button ${variant} ${className}`}
        onClick={handleSubscribe}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading}
      >
        <span className="button-icon">{getButtonIcon()}</span>
        <span className="button-text">{getButtonText()}</span>
        {variant === 'premium' && <span className="premium-badge">Premium</span>}
      </motion.button>

      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        pathId={categoryId}
        pathName={categoryName || 'Catégorie'}
        onSubscribe={() => setShowModal(false)}
      />
    </>
  );
};

export default SubscriptionButton;
