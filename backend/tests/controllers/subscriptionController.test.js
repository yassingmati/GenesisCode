const subscriptionController = require('../../src/controllers/subscriptionController');
const konnectService = require('../../src/services/konnectService');
const Plan = require('../../src/models/Plan');
const User = require('../../src/models/User');
const userFixtures = require('../fixtures/users');
const planFixtures = require('../fixtures/plans');

// Mock du service Konnect
jest.mock('../../src/services/konnectService');

describe('SubscriptionController', () => {
  let mockUser, mockPlan;

  beforeEach(async () => {
    mockUser = await userFixtures.createTestUser();
    mockPlan = await planFixtures.createPremiumPlan();
  });

  describe('subscribe', () => {
    it('devrait activer un plan gratuit localement', async () => {
      const freePlan = await planFixtures.createFreePlan();

      const req = {
        user: { id: mockUser._id.toString() },
        body: { planId: freePlan._id }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.subscribe(req, res);

      const updatedUser = await User.findById(mockUser._id);
      expect(updatedUser.subscription.status).toBe('active');
      expect(updatedUser.subscription.planId).toBe(freePlan._id);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Abonnement activé (local)',
          subscription: expect.any(Object)
        })
      );
    });

    it('devrait initialiser un paiement pour un plan payant', async () => {
      const mockPaymentResult = {
        paymentUrl: 'https://gateway.konnect.network/payment/123',
        konnectPaymentId: 'payment_123',
        raw: {}
      };

      konnectService.initPayment.mockResolvedValue(mockPaymentResult);

      const req = {
        user: { id: mockUser._id.toString() },
        body: {
          planId: mockPlan._id,
          returnUrl: 'http://localhost:3000/payment/success'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.subscribe(req, res);

      expect(konnectService.initPayment).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Paiement créé'),
          paymentUrl: mockPaymentResult.paymentUrl
        })
      );

      const updatedUser = await User.findById(mockUser._id);
      expect(updatedUser.subscription.status).toBe('incomplete');
      expect(updatedUser.subscription.planId).toBe(mockPlan._id);
    });

    it('devrait retourner une erreur si l\'utilisateur n\'est pas authentifié', async () => {
      const req = {
        user: null,
        body: { planId: mockPlan._id }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.subscribe(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Non authentifié' });
    });

    it('devrait retourner une erreur si planId est manquant', async () => {
      const req = {
        user: { id: mockUser._id.toString() },
        body: {}
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.subscribe(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'planId requis' });
    });

    it('devrait retourner une erreur si le plan n\'existe pas', async () => {
      const req = {
        user: { id: mockUser._id.toString() },
        body: { planId: 'nonexistent-plan-id' }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.subscribe(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Plan inconnu' });
    });
  });

  describe('listPublicPlans', () => {
    it('devrait retourner tous les plans actifs', async () => {
      await planFixtures.createPremiumPlan();
      await planFixtures.createBeginnerPlan();

      const req = {};
      const res = {
        json: jest.fn()
      };

      await subscriptionController.listPublicPlans(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          plans: expect.any(Array)
        })
      );
    });
  });

  describe('getMySubscription', () => {
    it('devrait retourner l\'abonnement de l\'utilisateur', async () => {
      const userWithSub = await userFixtures.createUserWithSubscription(mockPlan._id);

      const req = {
        user: { id: userWithSub._id.toString() }
      };
      const res = {
        json: jest.fn()
      };

      await subscriptionController.getMySubscription(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          subscription: expect.objectContaining({
            status: 'active',
            planId: mockPlan._id.toString()
          })
        })
      );
    });

    it('devrait retourner null si l\'utilisateur n\'a pas d\'abonnement', async () => {
      const req = {
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn()
      };

      await subscriptionController.getMySubscription(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        subscription: null
      });
    });
  });

  describe('cancel', () => {
    it('devrait annuler l\'abonnement de l\'utilisateur', async () => {
      const userWithSub = await userFixtures.createUserWithSubscription(mockPlan._id);

      const req = {
        user: { id: userWithSub._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.cancel(req, res);

      const updatedUser = await User.findById(userWithSub._id);
      expect(updatedUser.subscription.cancelAtPeriodEnd).toBe(true);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Annulation programmée'
      });
    });

    it('devrait retourner une erreur si l\'utilisateur n\'a pas d\'abonnement actif', async () => {
      const req = {
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.cancel(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Aucun abonnement actif' });
    });
  });

  describe('resume', () => {
    it('devrait reprendre l\'abonnement annulé', async () => {
      const userWithSub = await userFixtures.createUserWithSubscription(mockPlan._id);
      
      // Annuler d'abord
      userWithSub.subscription.cancelAtPeriodEnd = true;
      await userWithSub.save();

      const req = {
        user: { id: userWithSub._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await subscriptionController.resume(req, res);

      const updatedUser = await User.findById(userWithSub._id);
      expect(updatedUser.subscription.cancelAtPeriodEnd).toBe(false);
      expect(updatedUser.subscription.status).toBe('active');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Abonnement repris'
      });
    });
  });
});

