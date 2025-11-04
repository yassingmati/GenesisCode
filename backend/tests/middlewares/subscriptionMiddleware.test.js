const subscriptionMiddleware = require('../../src/middlewares/subscriptionMiddleware');
const userFixtures = require('../fixtures/users');
const planFixtures = require('../fixtures/plans');

describe('subscriptionMiddleware', () => {
  let mockUser, mockPlan;

  beforeEach(async () => {
    mockUser = await userFixtures.createTestUser();
    mockPlan = await planFixtures.createPremiumPlan();
  });

  describe('requireActiveSubscription', () => {
    it('devrait permettre l\'accès avec un abonnement actif', async () => {
      const userWithSub = await userFixtures.createUserWithSubscription(mockPlan._id);

      const req = {
        user: {
          id: userWithSub._id.toString(),
          subscription: {
            status: 'active',
            planId: mockPlan._id.toString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await subscriptionMiddleware.requireActiveSubscription(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('devrait refuser l\'accès sans abonnement', async () => {
      const req = {
        user: {
          id: mockUser._id.toString(),
          subscription: null
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await subscriptionMiddleware.requireActiveSubscription(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Abonnement')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait refuser l\'accès avec un abonnement non actif', async () => {
      const userWithExpiredSub = await userFixtures.createUserWithExpiredSubscription(mockPlan._id);

      const req = {
        user: {
          id: userWithExpiredSub._id.toString(),
          subscription: {
            status: 'canceled',
            planId: mockPlan._id.toString()
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await subscriptionMiddleware.requireActiveSubscription(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('actif')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait refuser l\'accès si l\'utilisateur n\'est pas authentifié', async () => {
      const req = {
        user: null
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await subscriptionMiddleware.requireActiveSubscription(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalSubscription', () => {
    it('devrait permettre l\'accès même sans abonnement', async () => {
      const req = {
        user: {
          id: mockUser._id.toString(),
          subscription: null
        }
      };
      const res = {};
      const next = jest.fn();

      await subscriptionMiddleware.optionalSubscription(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('devrait permettre l\'accès avec un abonnement actif', async () => {
      const userWithSub = await userFixtures.createUserWithSubscription(mockPlan._id);

      const req = {
        user: {
          id: userWithSub._id.toString(),
          subscription: {
            status: 'active',
            planId: mockPlan._id.toString()
          }
        }
      };
      const res = {};
      const next = jest.fn();

      await subscriptionMiddleware.optionalSubscription(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

