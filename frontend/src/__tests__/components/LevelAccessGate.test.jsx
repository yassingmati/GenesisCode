import React from 'react';
import { render, screen, waitFor } from '../test-utils';
import LevelAccessGate from '../../components/LevelAccessGate';
import { mockFetch, mockAccessResponse, mockNoAccessResponse } from '../test-utils';

jest.mock('../../services/categoryPaymentService');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('LevelAccessGate', () => {
  beforeEach(() => {
    mockFetch(mockAccessResponse);
    localStorage.setItem('token', 'test-token');
  });

  it('devrait afficher le contenu si l\'utilisateur a accès', async () => {
    render(
      <LevelAccessGate categoryId="cat-1" pathId="path-1" levelId="level-1">
        <div>Contenu du niveau</div>
      </LevelAccessGate>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenu du niveau')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message de verrouillage si pas d\'accès', async () => {
    mockFetch(mockNoAccessResponse, 403);

    render(
      <LevelAccessGate categoryId="cat-1" pathId="path-1" levelId="level-1">
        <div>Contenu du niveau</div>
      </LevelAccessGate>
    );

    await waitFor(() => {
      expect(screen.getByText(/Niveau Verrouillé/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher un loader pendant la vérification', () => {
    render(
      <LevelAccessGate categoryId="cat-1" pathId="path-1" levelId="level-1">
        <div>Contenu du niveau</div>
      </LevelAccessGate>
    );

    expect(screen.getByText(/Vérification de l'accès/i)).toBeInTheDocument();
  });
});

