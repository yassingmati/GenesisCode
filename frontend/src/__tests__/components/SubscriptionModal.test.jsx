import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import SubscriptionModal from '../../components/SubscriptionModal';
import { mockFetch } from '../test-utils';

describe('SubscriptionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubscribe = jest.fn();

  beforeEach(() => {
    const mockPlans = {
      success: true,
      plans: [
        {
          _id: 'free',
          name: 'Plan Gratuit',
          description: 'Accès limité',
          priceMonthly: null,
          features: ['Première leçon gratuite']
        },
        {
          _id: 'premium',
          name: 'Plan Premium',
          description: 'Accès complet',
          priceMonthly: 4999,
          features: ['Tous les parcours', 'Exercices illimités']
        }
      ]
    };

    mockFetch(mockPlans);
  });

  it('devrait afficher les plans disponibles', async () => {
    render(
      <SubscriptionModal
        isOpen={true}
        onClose={mockOnClose}
        pathId="test-path"
        pathName="Test Path"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Plan Gratuit')).toBeInTheDocument();
      expect(screen.getByText('Plan Premium')).toBeInTheDocument();
    });
  });

  it('devrait fermer le modal quand on clique sur le bouton de fermeture', async () => {
    render(
      <SubscriptionModal
        isOpen={true}
        onClose={mockOnClose}
        pathId="test-path"
        pathName="Test Path"
      />
    );

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /✕/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('devrait afficher un message de chargement', () => {
    mockFetch({}, 500); // Simuler une erreur

    render(
      <SubscriptionModal
        isOpen={true}
        onClose={mockOnClose}
        pathId="test-path"
        pathName="Test Path"
      />
    );

    expect(screen.getByText(/Chargement des plans/i)).toBeInTheDocument();
  });
});

