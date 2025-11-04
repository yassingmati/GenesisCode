import SubscriptionService from '../../services/subscriptionService';
import { mockFetch } from '../test-utils';

describe('SubscriptionService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('getPlans', () => {
    it('devrait récupérer tous les plans', async () => {
      const mockPlans = [
        { _id: 'plan1', name: 'Plan Premium', priceMonthly: 4999 },
        { _id: 'plan2', name: 'Plan Basic', priceMonthly: 1999 }
      ];

      mockFetch({ success: true, plans: mockPlans });

      const plans = await SubscriptionService.getPlans();

      expect(plans).toEqual(mockPlans);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/plans'),
        expect.any(Object)
      );
    });
  });

  describe('getMySubscription', () => {
    it('devrait récupérer l\'abonnement de l\'utilisateur', async () => {
      const mockSubscription = {
        status: 'active',
        planId: 'plan1',
        currentPeriodEnd: new Date()
      };

      mockFetch({ success: true, subscription: mockSubscription });

      const subscription = await SubscriptionService.getMySubscription();

      expect(subscription).toEqual(mockSubscription);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/subscriptions/me'),
        expect.any(Object)
      );
    });
  });

  describe('checkPathAccess', () => {
    it('devrait vérifier l\'accès à un parcours', async () => {
      const mockAccess = {
        hasAccess: true,
        accessType: 'subscription'
      };

      mockFetch({ success: true, access: mockAccess });

      const access = await SubscriptionService.checkPathAccess('test-path-id');

      expect(access).toEqual(mockAccess);
    });
  });
});

