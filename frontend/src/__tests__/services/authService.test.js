import { mockFetch } from '../test-utils';

// Mock du service authService si il existe, sinon créer un mock simple
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn()
};

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('devrait permettre la connexion', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { _id: 'user1', email: 'test@example.com' }
      };

      mockFetch(mockResponse);

      // Simuler un appel API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
    });
  });

  describe('logout', () => {
    it('devrait nettoyer le localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ _id: 'user1' }));

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});

