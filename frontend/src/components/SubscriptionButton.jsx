// src/components/SubscriptionButton.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IconDiamond, IconRocket, IconBook } from '@tabler/icons-react';
import SubscriptionModal from './SubscriptionModal';
import { getApiUrl } from '../utils/apiConfig';
import './SubscriptionButton.css';

const SubscriptionButton = ({
  categoryId = null,
  categoryName = null,
  className = '',
  variant = 'default' // 'default', 'premium', 'outline'
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les plans depuis MongoDB Atlas
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        // Utiliser l'endpoint /api/subscriptions/plans qui récupère les plans depuis MongoDB Atlas
        const res = await fetch(getApiUrl('/api/subscriptions/plans'));
        const data = await res.json();

        if (data?.success && Array.isArray(data?.plans)) {
          console.log('📋 Plans récupérés depuis MongoDB Atlas:', data.plans.length);
          const adapted = data.plans
            .filter(p => p.active !== false) // Filtrer les plans actifs
            .map(p => ({
              _id: p._id || p.id,
              id: p.id || p._id,
              name: p.name || 'Plan',
              description: p.description || '',
              priceMonthly: p.priceMonthly || null,
              currency: p.currency || 'TND',
              interval: p.interval || null,
              features: Array.isArray(p.features) ? p.features : [],
              active: p.active !== false
            }));
          setPlans(adapted);
          console.log('✅ Plans normalisés:', adapted.length);
        } else if (Array.isArray(data)) {
          // Gérer le cas où la réponse est directement un tableau
          const adapted = data
            .filter(p => p.active !== false)
            .map(p => ({
              _id: p._id || p.id,
              id: p.id || p._id,
              name: p.name || 'Plan',
              description: p.description || '',
              priceMonthly: p.priceMonthly || null,
              currency: p.currency || 'TND',
              interval: p.interval || null,
              features: Array.isArray(p.features) ? p.features : []
            }));
          setPlans(adapted);
        }
      } catch (e) {
        console.error('❌ Erreur chargement plans:', e);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [categoryId]);

  const handleSubscribe = () => {
    if (categoryId) {
      setShowModal(true);
    } else {
      navigate('/category-plans');
    }
  };

  const getButtonText = () => {
    if (loading) return 'Chargement...';
    if (categoryId && categoryName) return `Abonnement ${categoryName}`;
    return 'Voir les abonnements';
  };

  const getButtonIcon = () => {
    if (variant === 'premium') return <IconDiamond size={18} />;
    if (variant === 'outline') return <IconRocket size={18} />;
    return <IconBook size={18} />;
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
