const CategoryPaymentController = require('../../src/controllers/categoryPaymentController');
const CategoryPaymentService = require('../../src/services/categoryPaymentService');
const konnectPaymentService = require('../../src/services/konnectPaymentService');
const userFixtures = require('../fixtures/users');
const categoryFixtures = require('../fixtures/categories');
const pathFixtures = require('../fixtures/paths');
const CategoryPlan = require('../../src/models/CategoryPlan');

// Mock des services
jest.mock('../../src/services/categoryPaymentService');
jest.mock('../../src/services/konnectPaymentService');

describe('CategoryPaymentController', () => {
  let mockUser, mockCategory, mockPath, mockLevel;

  beforeEach(async () => {
    mockUser = await userFixtures.createTestUser();
    mockCategory = await categoryFixtures.createTestCategory();
    const pathData = await pathFixtures.createPathWithLevels(mockCategory._id, 3);
    mockPath = pathData.path;
    mockLevel = pathData.levels[0];
  });

  describe('getCategoryPlans', () => {
    it('devrait retourner tous les plans de catégories', async () => {
      const mockPlans = [
        { _id: 'plan1', category: mockCategory._id, price: 2999 },
        { _id: 'plan2', category: mockCategory._id, price: 4999 }
      ];

      CategoryPaymentService.getAllCategoryPlans.mockResolvedValue(mockPlans);

      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.getCategoryPlans(req, res);

      expect(CategoryPaymentService.getAllCategoryPlans).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        plans: mockPlans
      });
    });

    it('devrait gérer les erreurs correctement', async () => {
      CategoryPaymentService.getAllCategoryPlans.mockRejectedValue(new Error('Database error'));

      const req = {};
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.getCategoryPlans(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Erreur lors de la récupération des plans'
        })
      );
    });
  });

  describe('getCategoryPlan', () => {
    it('devrait retourner le plan d\'une catégorie spécifique', async () => {
      const mockPlan = {
        _id: 'plan1',
        category: mockCategory._id,
        price: 2999,
        currency: 'TND'
      };

      CategoryPaymentService.getCategoryPlan.mockResolvedValue(mockPlan);

      const req = {
        params: { categoryId: mockCategory._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.getCategoryPlan(req, res);

      expect(CategoryPaymentService.getCategoryPlan).toHaveBeenCalledWith(
        mockCategory._id.toString()
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        plan: mockPlan
      });
    });

    it('devrait retourner une erreur si categoryId est manquant', async () => {
      const req = {
        params: {}
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.getCategoryPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'ID de catégorie requis'
      });
    });
  });

  describe('initCategoryPayment', () => {
    it('devrait initialiser un paiement pour une catégorie', async () => {
      const mockResult = {
        paymentUrl: 'https://gateway.konnect.network/payment/123',
        paymentId: 'payment_123'
      };

      CategoryPaymentService.initCategoryPayment.mockResolvedValue(mockResult);

      const req = {
        user: { id: mockUser._id.toString() },
        body: {
          categoryId: mockCategory._id.toString(),
          returnUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.initCategoryPayment(req, res);

      expect(CategoryPaymentService.initCategoryPayment).toHaveBeenCalledWith(
        mockUser._id.toString(),
        mockCategory._id.toString(),
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult
      });
    });

    it('devrait retourner une erreur si l\'utilisateur n\'est pas authentifié', async () => {
      const req = {
        user: null,
        body: { categoryId: mockCategory._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.initCategoryPayment(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentification requise'
      });
    });
  });

  describe('checkLevelAccess', () => {
    it('devrait vérifier l\'accès à un niveau', async () => {
      const LevelUnlockService = require('../../src/services/levelUnlockService');
      const mockAccess = {
        hasAccess: true,
        canView: true,
        canInteract: true
      };

      jest.spyOn(LevelUnlockService, 'checkLevelAccess').mockResolvedValue(mockAccess);

      const req = {
        user: { id: mockUser._id.toString() },
        params: {
          categoryId: mockCategory._id.toString(),
          pathId: mockPath._id.toString(),
          levelId: mockLevel._id.toString()
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.checkLevelAccess(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        access: mockAccess
      });
    });

    it('devrait retourner une erreur si les IDs sont manquants', async () => {
      const req = {
        user: { id: mockUser._id.toString() },
        params: {
          categoryId: mockCategory._id.toString()
          // pathId et levelId manquants
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.checkLevelAccess(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'IDs de catégorie, parcours et niveau requis'
      });
    });
  });

  describe('unlockLevel', () => {
    it('devrait débloquer un niveau', async () => {
      const mockAccess = {
        hasAccess: true,
        unlocked: true
      };

      CategoryPaymentService.unlockLevel.mockResolvedValue(mockAccess);

      const req = {
        user: { id: mockUser._id.toString() },
        body: {
          categoryId: mockCategory._id.toString(),
          pathId: mockPath._id.toString(),
          levelId: mockLevel._id.toString()
        }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.unlockLevel(req, res);

      expect(CategoryPaymentService.unlockLevel).toHaveBeenCalledWith(
        mockUser._id.toString(),
        mockCategory._id.toString(),
        mockPath._id.toString(),
        mockLevel._id.toString()
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Niveau débloqué avec succès',
        access: mockAccess
      });
    });
  });

  describe('getUserAccessHistory', () => {
    it('devrait retourner l\'historique d\'accès de l\'utilisateur', async () => {
      const mockHistory = [
        { categoryId: mockCategory._id, accessType: 'purchased', expiresAt: new Date() }
      ];

      CategoryPaymentService.getUserAccessHistory.mockResolvedValue(mockHistory);

      const req = {
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CategoryPaymentController.getUserAccessHistory(req, res);

      expect(CategoryPaymentService.getUserAccessHistory).toHaveBeenCalledWith(
        mockUser._id.toString()
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        history: mockHistory
      });
    });
  });
});

