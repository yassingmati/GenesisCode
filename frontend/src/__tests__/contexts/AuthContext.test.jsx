import React from 'react';
import { render, screen, waitFor } from '../test-utils';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

const TestComponent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (currentUser) return <div>User: {currentUser.email}</div>;
  return <div>No user</div>;
};

describe('AuthContext', () => {
  it('devrait fournir le contexte d\'authentification', async () => {
    localStorage.setItem('user', JSON.stringify({ _id: 'test-id', email: 'test@example.com' }));
    localStorage.setItem('token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });
});

