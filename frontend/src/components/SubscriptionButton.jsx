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

  // Charger les plans de catégorie (nouveau système)
  useEffect(() => {
    const loadCategoryPlans = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/category-plans');
        const data = await res.json();
        if (data?.success && Array.isArray(data?.plans)) {
          const adapted = data.plans
            .filter(p => p.active)
            .map(p => ({
              _id: p._id,
              name: p.translations?.fr?.name || 'Plan',
              description: p.translations?.fr?.description || '',
              price: p.price,
              currency: p.currency || 'TND',
              paymentType: p.paymentType,
              category: p.category,
              features: Array.isArray(p.features) ? p.features : []
            }));
          setPlans(adapted);
        }
      } catch (e) {
        console.error('Error loading category plans:', e);
      } finally {
        setLoading(false);
      }
    };
    loadCategoryPlans();
  }, [categoryId]);

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
