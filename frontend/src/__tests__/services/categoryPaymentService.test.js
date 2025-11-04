import CategoryPaymentService from '../../services/categoryPaymentService';
import { mockFetch } from '../test-utils';

describe('CategoryPaymentService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('getCategoryPlans', () => {
    it('devrait récupérer tous les plans de catégories', async () => {
      const mockPlans = {
        success: true,
        plans: [
          { _id: 'plan1', category: 'cat1', price: 2999 },
          { _id: 'plan2', category: 'cat2', price: 4999 }
        ]
      };

      mockFetch(mockPlans);

      const result = await CategoryPaymentService.getCategoryPlans();

      expect(result).toEqual(mockPlans);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/category-payments/plans'),
        expect.any(Object)
      );
    });
  });

  describe('getCategoryPlan', () => {
    it('devrait récupérer le plan d\'une catégorie spécifique', async () => {
      const mockPlan = {
        success: true,
        plan: { _id: 'plan1', category: 'cat1', price: 2999 }
      };

      mockFetch(mockPlan);

      const result = await CategoryPaymentService.getCategoryPlan('cat1');

      expect(result).toEqual(mockPlan);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/category-payments/plans/cat1'),
        expect.any(Object)
      );
    });
  });

  describe('initCategoryPayment', () => {
    it('devrait initialiser un paiement pour une catégorie', async () => {
      const mockPayment = {
        success: true,
        paymentUrl: 'https://gateway.konnect.network/payment/123',
        paymentId: 'payment_123'
      };

      mockFetch(mockPayment);

      const result = await CategoryPaymentService.initCategoryPayment(
        'cat1',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      );

      expect(result).toEqual(mockPayment);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/category-payments/init-payment'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('cat1')
        })
      );
    });
  });

  describe('checkLevelAccess', () => {
    it('devrait vérifier l\'accès à un niveau', async () => {
      const mockAccess = {
        success: true,
        access: {
          hasAccess: true,
          canView: true,
          canInteract: true
        }
      };

      mockFetch(mockAccess);

      const result = await CategoryPaymentService.checkLevelAccess('cat1', 'path1', 'level1');

      expect(result).toEqual(mockAccess);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/category-payments/access/cat1/path1/level1'),
        expect.any(Object)
      );
    });
  });

  describe('unlockLevel', () => {
    it('devrait débloquer un niveau', async () => {
      const mockResult = {
        success: true,
        message: 'Niveau débloqué avec succès'
      };

      mockFetch(mockResult);

      const result = await CategoryPaymentService.unlockLevel('cat1', 'path1', 'level1');

      expect(result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/category-payments/unlock-level'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('cat1')
        })
      );
    });
  });
});

