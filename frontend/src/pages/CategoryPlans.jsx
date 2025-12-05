// src/pages/CategoryPlans.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import CategoryPaymentService from '../services/categoryPaymentService';
import CategoryPaymentCard from '../components/CategoryPaymentCard';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: #dc3545;
`;

const InfoBox = styled.div`
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: #004085;
`;

const CategoryPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchCategoryPlans();
  }, []);

  const fetchCategoryPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await CategoryPaymentService.getCategoryPlans();

      // Normaliser les plans pour gérer les différents formats
      const plansData = response?.plans || response || [];
      const normalizedPlans = plansData.map(plan => ({
        ...plan,
        id: plan.id || plan._id,
        _id: plan._id || plan.id,
        // S'assurer que les traductions sont disponibles
        translations: plan.translations || {
          fr: { name: plan.name || 'Plan', description: plan.description || '' },
          en: { name: plan.name || 'Plan', description: plan.description || '' },
          ar: { name: plan.name || 'Plan', description: plan.description || '' }
        }
      }));

      setPlans(normalizedPlans);

    } catch (error) {
      console.error('Error fetching category plans:', error);
      const errorMessage = error?.message || 'Impossible de charger les plans de catégories';
      setError(errorMessage);
      toast.error(errorMessage);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentInitiated = async (result) => {
    if (result.success) {
      if (result.freeAccess || result.alreadyHasAccess) {
        toast.success(result.alreadyHasAccess ? 'Vous avez déjà accès à ce plan !' : 'Accès gratuit accordé !');
        // Actualiser la page pour refléter l'accès
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (result.paymentUrl) {
        toast.success('Redirection vers le paiement...');
        // Rediriger vers Konnect
        window.location.href = result.paymentUrl;
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          Chargement des plans de catégories...
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={fetchCategoryPlans}>
            Réessayer
          </button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Plans par Catégorie</Title>
      <Subtitle>
        Choisissez la catégorie qui vous intéresse et débloquez tous ses contenus
      </Subtitle>

      <InfoBox>
        <strong>💡 Comment ça marche :</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Chaque catégorie a son propre plan de paiement</li>
          <li>Le paiement débloque tous les parcours de la catégorie</li>
          <li>Les niveaux se débloquent progressivement (ordre 1, puis 2, etc.)</li>
          <li>Accès immédiat au premier niveau de chaque parcours</li>
        </ul>
      </InfoBox>

      <Grid>
        {plans.map((plan) => (
          <CategoryPaymentCard
            key={plan.id}
            categoryPlan={plan}
            isSelected={selectedPlan && selectedPlan.id === plan.id}
            onSelect={() => handlePlanSelect(plan)}
            onPaymentInitiated={handlePaymentInitiated}
          />
        ))}
      </Grid>

      {plans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Aucun plan de catégorie disponible pour le moment.</p>
        </div>
      )}
    </Container>
  );
};

export default CategoryPlans;
