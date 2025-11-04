const CourseAccessService = require('../../src/services/courseAccessService');
const CourseAccess = require('../../src/models/CourseAccess');
const Plan = require('../../src/models/Plan');
const userFixtures = require('../fixtures/users');
const planFixtures = require('../fixtures/plans');
const categoryFixtures = require('../fixtures/categories');
const pathFixtures = require('../fixtures/paths');

describe('CourseAccessService', () => {
  let mockUser, mockCategory, mockPath, mockLevel;

  beforeEach(async () => {
    mockUser = await userFixtures.createTestUser();
    mockCategory = await categoryFixtures.createTestCategory();
    const pathData = await pathFixtures.createPathWithLevels(mockCategory._id, 3);
    mockPath = pathData.path;
    mockLevel = pathData.levels[0];
  });

  describe('checkUserAccess', () => {
    it('devrait retourner un accès si l\'utilisateur a un abonnement actif', async () => {
      const plan = await planFixtures.createPremiumPlan();
      const userWithSub = await userFixtures.createUserWithSubscription(plan._id);

      const access = await CourseAccessService.checkUserAccess(
        userWithSub._id.toString(),
        mockPath._id.toString()
      );

      expect(access.hasAccess).toBe(true);
      expect(access.source).toBe('subscription');
    });

    it('devrait retourner un accès gratuit pour le premier niveau', async () => {
      const access = await CourseAccessService.checkUserAccess(
        mockUser._id.toString(),
        mockPath._id.toString(),
        mockLevel._id.toString()
      );

      expect(access.hasAccess).toBe(true);
      expect(access.source).toBe('free');
    });

    it('devrait retourner false si l\'utilisateur n\'existe pas', async () => {
      const access = await CourseAccessService.checkUserAccess(
        'nonexistent-user-id',
        mockPath._id.toString()
      );

      expect(access.hasAccess).toBe(false);
      expect(access.reason).toBe('user_not_found');
    });
  });

  describe('getPlansForPath', () => {
    it('devrait retourner les plans disponibles pour un parcours', async () => {
      await planFixtures.createPremiumPlan();
      await planFixtures.createBeginnerPlan();

      const plans = await CourseAccessService.getPlansForPath(mockPath._id.toString());

      expect(Array.isArray(plans)).toBe(true);
    });
  });
});

