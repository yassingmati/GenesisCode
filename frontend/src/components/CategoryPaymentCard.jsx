// src/components/CategoryPaymentCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import CategoryPaymentService from '../services/categoryPaymentService';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 2px solid ${props => props.isSelected ? '#007bff' : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.25rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
`;

const Description = styled.p`
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.5;
`;

const Features = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const Feature = styled.li`
  padding: 0.25rem 0;
  color: #555;
  
  &:before {
    content: '✓';
    color: #28a745;
    font-weight: bold;
    margin-right: 0.5rem;
  }
`;

const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#545b62'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CategoryPaymentCard = ({
  categoryPlan,
  isSelected,
  onSelect,
  onPaymentInitiated
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = () => {
    // Rediriger vers la page de sélection de paiement
    // On passe le plan de catégorie comme "plan"
    // Note: CategoryPaymentPage attend un objet plan avec priceMonthly, etc.
    // On adapte l'objet ici pour qu'il soit compatible
    const adaptedPlan = {
      ...categoryPlan,
      priceMonthly: categoryPlan.price * 1000, // Conversion si nécessaire, ou juste passer tel quel
      // Le composant PaymentSelectionPage utilise plan.priceMonthly / 100 pour l'affichage
      // Si categoryPlan.price est déjà en TND (ex: 30), on doit le mettre en millimes (30000)
      // pour que (30000 / 100) donne 300... wait.
      // PaymentSelectionPage fait: (plan.priceMonthly / 100).toFixed(2)
      // Si le prix est 30 TND, on veut afficher 30.00
      // Donc priceMonthly doit être 3000.
      // Vérifions CategoryPaymentCard: {categoryPlan.price} {categoryPlan.currency}
      // Si price est 30, on veut afficher 30.
      // Donc on passe priceMonthly = categoryPlan.price * 100.
      priceMonthly: categoryPlan.price * 100,
      interval: 'lifetime', // C'est souvent un achat unique pour les catégories
      currency: categoryPlan.currency
    };

    navigate('/payment-selection', { state: { plan: adaptedPlan } });
  };

  return (
    <Card isSelected={isSelected} onClick={onSelect}>
      <Header>
        <div>
          <Title>{categoryPlan.name}</Title>
          <Description>{categoryPlan.description}</Description>
        </div>
        <Price>
          {categoryPlan.price === 0 ? 'Gratuit' : `${categoryPlan.price} ${categoryPlan.currency}`}
        </Price>
      </Header>

      <Features>
        {categoryPlan.features && categoryPlan.features.map((feature, index) => (
          <Feature key={index}>{feature}</Feature>
        ))}
      </Features>

      <Button
        primary
        onClick={(e) => {
          e.stopPropagation();
          handlePayment();
        }}
        disabled={loading}
      >
        {loading ? (
          <>
            <LoadingSpinner /> Initialisation...
          </>
        ) : (
          'Acheter'
        )}
      </Button>
    </Card>
  );
};

export default CategoryPaymentCard;
