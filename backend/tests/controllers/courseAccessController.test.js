const CourseAccessController = require('../../src/controllers/courseAccessController');
const CourseAccessService = require('../../src/services/courseAccessService');
const AccessControlService = require('../../src/services/accessControlService');
const userFixtures = require('../fixtures/users');
const categoryFixtures = require('../fixtures/categories');
const planFixtures = require('../fixtures/plans');
const pathFixtures = require('../fixtures/paths');
const authHelper = require('../helpers/authHelper');

// Mock des services
jest.mock('../../src/services/courseAccessService');
jest.mock('../../src/services/accessControlService');

describe('CourseAccessController', () => {
  let mockUser, mockCategory, mockPath, mockLevel;

  beforeEach(async () => {
    // Créer des données de test
    mockUser = await userFixtures.createTestUser();
    mockCategory = await categoryFixtures.createTestCategory();
    const pathData = await pathFixtures.createPathWithLevels(mockCategory._id, 3);
    mockPath = pathData.path;
    mockLevel = pathData.levels[0];
  });

  describe('checkPathAccess', () => {
    it('devrait retourner un accès autorisé si l\'utilisateur a accès', async () => {
      const mockAccess = {
        hasAccess: true,
        accessType: 'subscription',
        canView: true,
        canInteract: true
      };

      CourseAccessService.checkUserAccess.mockResolvedValue(mockAccess);

      const req = {
        params: { pathId: mockPath._id.toString() },
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CourseAccessController.checkPathAccess(req, res);

      expect(CourseAccessService.checkUserAccess).toHaveBeenCalledWith(
        mockUser._id.toString(),
        mockPath._id.toString()
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        access: mockAccess,
        message: 'Accès autorisé'
      });
    });

    it('devrait retourner un accès refusé avec plans disponibles si l\'utilisateur n\'a pas accès', async () => {
      const mockAccess = {
        hasAccess: false,
        reason: 'no_access'
      };
      const mockPlans = [
        { _id: 'plan1', name: 'Plan Premium' },
        { _id: 'plan2', name: 'Plan Basic' }
      ];

      CourseAccessService.checkUserAccess.mockResolvedValue(mockAccess);
      CourseAccessService.getPlansForPath.mockResolvedValue(mockPlans);

      const req = {
        params: { pathId: mockPath._id.toString() },
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CourseAccessController.checkPathAccess(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        access: mockAccess,
        availablePlans: mockPlans,
        message: 'Abonnement requis'
      });
    });

    it('devrait gérer les erreurs correctement', async () => {
      CourseAccessService.checkUserAccess.mockRejectedValue(new Error('Database error'));

      const req = {
        params: { pathId: mockPath._id.toString() },
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CourseAccessController.checkPathAccess(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur de vérification d\'accès'
      });
    });
  });

  describe('checkLevelAccess', () => {
    it('devrait retourner un accès autorisé si l\'utilisateur a accès au niveau', async () => {
      const mockAccess = {
        hasAccess: true,
        accessType: 'subscription',
        canView: true,
        canInteract: true
      };

      AccessControlService.checkUserAccess.mockResolvedValue(mockAccess);

      const req = {
        params: {
          pathId: mockPath._id.toString(),
          levelId: mockLevel._id.toString()
        },
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CourseAccessController.checkLevelAccess(req, res);

      expect(AccessControlService.checkUserAccess).toHaveBeenCalledWith(
        mockUser._id.toString(),
        mockPath._id.toString(),
        mockLevel._id.toString()
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        access: mockAccess,
        message: 'Accès autorisé'
      });
    });

    it('devrait retourner un accès refusé si l\'utilisateur n\'a pas accès au niveau', async () => {
      const mockAccess = {
        hasAccess: false,
        reason: 'level_not_unlocked'
      };
      const mockPlans = [{ _id: 'plan1', name: 'Plan Premium' }];

      AccessControlService.checkUserAccess.mockResolvedValue(mockAccess);
      CourseAccessService.getPlansForPath.mockResolvedValue(mockPlans);

      const req = {
        params: {
          pathId: mockPath._id.toString(),
          levelId: mockLevel._id.toString()
        },
        user: { id: mockUser._id.toString() }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CourseAccessController.checkLevelAccess(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        access: mockAccess,
        availablePlans: mockPlans,
        message: 'Abonnement requis'
      });
    });
  });

  describe('getAvailablePlans', () => {
    it('devrait retourner les plans disponibles pour un parcours', async () => {
      const mockPlans = [
        { _id: 'plan1', name: 'Plan Premium', priceMonthly: 4999 },
        { _id: 'plan2', name: 'Plan Basic', priceMonthly: 1999 }
      ];

      CourseAccessService.getPlansForPath.mockResolvedValue(mockPlans);

      const req = {
        params: { pathId: mockPath._id.toString() }
      };
      const res = {
        json: jest.fn()
      };

      await CourseAccessController.getAvailablePlans(req, res);

      expect(CourseAccessService.getPlansForPath).toHaveBeenCalledWith(mockPath._id.toString());
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        plans: mockPlans,
        message: 'Plans récupérés avec succès'
      });
    });
  });

  describe('getAllPlans', () => {
    it('devrait retourner tous les plans actifs', async () => {
      const Plan = require('../../src/models/Plan');
      const plan1 = await planFixtures.createPremiumPlan();
      const plan2 = await planFixtures.createBeginnerPlan();

      const req = {};
      const res = {
        json: jest.fn()
      };

      await CourseAccessController.getAllPlans(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          plans: expect.any(Array),
          message: 'Plans récupérés avec succès'
        })
      );
    });
  });

  describe('getUserAccessHistory', () => {
    it('devrait retourner l\'historique d\'accès de l\'utilisateur', async () => {
      const CourseAccess = require('../../src/models/CourseAccess');
      
      // Créer un accès de test
      await CourseAccess.create({
        user: mockUser._id,
        path: mockPath._id,
        accessType: 'subscription',
        isActive: true
      });

      const req = {
        user: { id: mockUser._id.toString() },
        query: { page: 1, limit: 20 }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await CourseAccessController.getUserAccessHistory(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          accesses: expect.any(Array),
          pagination: expect.objectContaining({
            page: 1,
            limit: 20,
            total: expect.any(Number),
            pages: expect.any(Number)
          }),
          message: 'Historique d\'accès récupéré avec succès'
        })
      );
    });
  });
});

