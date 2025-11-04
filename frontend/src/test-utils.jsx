import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

/**
 * Mock de l'API config pour les tests
 */
jest.mock('./config/api', () => ({
  BASE_URL: 'http://localhost:5000',
  getFullUrl: (endpoint) => `http://localhost:5000${endpoint}`,
  getDefaultHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
  }),
  getPublicHeaders: () => ({
    'Content-Type': 'application/json'
  }),
  ENDPOINTS: {
    ACCESS_CHECK: ({ pathId, levelId, exerciseId }) => {
      const params = new URLSearchParams();
      if (pathId) params.set('pathId', pathId);
      if (levelId) params.set('levelId', levelId);
      if (exerciseId) params.set('exerciseId', exerciseId);
      return `/api/access/check?${params.toString()}`;
    },
    CHECK_ACCESS: (pathId) => `/api/course-access/check/path/${pathId}`,
    CHECK_LEVEL_ACCESS: (pathId, levelId) => `/api/course-access/check/path/${pathId}/level/${levelId}`,
    SUBSCRIPTION_ME: '/api/subscriptions/me',
    SUBSCRIPTION_SUBSCRIBE: '/api/subscriptions/subscribe',
    CATEGORY_PLANS: '/api/admin/category-plans'
  }
}));

/**
 * Helper pour créer un wrapper de providers
 */
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

/**
 * Render personnalisé avec tous les providers
 */
const customRender = (ui, options = {}) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

/**
 * Mock de l'utilisateur authentifié
 */
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
};

/**
 * Mock de la réponse d'accès
 */
export const mockAccessResponse = {
  hasAccess: true,
  canView: true,
  canInteract: true,
  accessType: 'subscription',
  source: 'subscription'
};

/**
 * Mock de la réponse sans accès
 */
export const mockNoAccessResponse = {
  hasAccess: false,
  canView: false,
  canInteract: false,
  reason: 'no_access'
};

/**
 * Helper pour mock fetch
 */
export const mockFetch = (response, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response))
    })
  );
};

/**
 * Helper pour nettoyer les mocks
 */
export const cleanupMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
};

export * from '@testing-library/react';
export { customRender as render };

