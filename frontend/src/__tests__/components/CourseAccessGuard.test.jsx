import React from 'react';
import { render, screen, waitFor } from '../test-utils';
import CourseAccessGuard from '../../components/CourseAccessGuard';
import { mockUser, mockAccessResponse, mockNoAccessResponse, mockFetch } from '../test-utils';

describe('CourseAccessGuard', () => {
  beforeEach(() => {
    mockFetch(mockAccessResponse);
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ _id: 'test-user-id', email: 'test@example.com' }));
  });

  it('devrait afficher le contenu si l\'utilisateur a accès', async () => {
    render(
      <CourseAccessGuard pathId="test-path-id" pathName="Test Path">
        <div>Contenu protégé</div>
      </CourseAccessGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    });
  });

  it('devrait afficher un message de verrouillage si l\'utilisateur n\'a pas accès', async () => {
    mockFetch(mockNoAccessResponse, 403);

    render(
      <CourseAccessGuard pathId="test-path-id" pathName="Test Path">
        <div>Contenu protégé</div>
      </CourseAccessGuard>
    );

    await waitFor(() => {
      expect(screen.getByText(/Contenu Verrouillé/i)).toBeInTheDocument();
    });
  });

  it('devrait afficher un loader pendant la vérification', () => {
    mockFetch(mockAccessResponse);

    render(
      <CourseAccessGuard pathId="test-path-id" pathName="Test Path">
        <div>Contenu protégé</div>
      </CourseAccessGuard>
    );

    expect(screen.getByText(/Vérification de l'accès/i)).toBeInTheDocument();
  });
});

