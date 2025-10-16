// src/components/LevelAccessGate.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import CategoryPaymentService from '../services/categoryPaymentService';

const GateContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  text-align: center;
  margin: 2rem 0;
`;

const Title = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
`;

const Description = styled.p`
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  line-height: 1.5;
`;

const Button = styled.button`
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #667eea;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LevelAccessGate = ({ 
  categoryId, 
  pathId, 
  levelId, 
  onAccessGranted,
  children 
}) => {
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [categoryId, pathId, levelId]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const response = await CategoryPaymentService.checkLevelAccess(
        categoryId, 
        pathId, 
        levelId
      );
      
      if (response.success) {
        setAccess(response.access);
        if (response.access.hasAccess) {
          onAccessGranted && onAccessGranted(response.access);
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error('Erreur lors de la vérification de l\'accès');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockLevel = async () => {
    try {
      setCheckingAccess(true);
      const response = await CategoryPaymentService.unlockLevel(
        categoryId, 
        pathId, 
        levelId
      );
      
      if (response.success) {
        toast.success('Niveau débloqué avec succès !');
        await checkAccess(); // Re-vérifier l'accès
      }
    } catch (error) {
      console.error('Error unlocking level:', error);
      toast.error('Erreur lors du déblocage du niveau');
    } finally {
      setCheckingAccess(false);
    }
  };

  const handlePurchaseCategory = () => {
    // Rediriger vers la page des plans de catégorie
    window.location.href = '/category-plans';
  };

  if (loading) {
    return (
      <GateContainer>
        <LoadingSpinner />
        <p>Vérification de l'accès...</p>
      </GateContainer>
    );
  }

  if (access && access.hasAccess) {
    return children;
  }

  return (
    <GateContainer>
      <Title>🔒 Niveau Verrouillé</Title>
      <Description>
        {access?.reason === 'no_category_access' && 
          'Vous devez acheter l\'accès à cette catégorie pour débloquer ce niveau.'
        }
        {access?.reason === 'level_not_unlocked' && 
          'Ce niveau n\'est pas encore débloqué. Complétez les niveaux précédents pour continuer.'
        }
        {!access && 
          'Vérification de l\'accès en cours...'
        }
      </Description>
      
      {access?.reason === 'no_category_access' && (
        <Button onClick={handlePurchaseCategory}>
          Acheter l'accès à la catégorie
        </Button>
      )}
      
      {access?.reason === 'level_not_unlocked' && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '1rem', 
          borderRadius: '8px',
          margin: '1rem 0'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
            ⚠️ Ce niveau est verrouillé
          </p>
          <p style={{ margin: '0', fontSize: '0.8rem', opacity: 0.8 }}>
            Complétez les niveaux précédents pour débloquer ce contenu
          </p>
        </div>
      )}
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
        💡 Le premier niveau de chaque parcours est gratuit
      </div>
    </GateContainer>
  );
};

export default LevelAccessGate;
