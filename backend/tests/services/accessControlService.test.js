const AccessControlService = require('../../src/services/accessControlService');
const User = require('../../src/models/User');
const Path = require('../../src/models/Path');
const Level = require('../../src/models/Level');
const CourseAccess = require('../../src/models/CourseAccess');
const CategoryAccess = require('../../src/models/CategoryAccess');
const userFixtures = require('../fixtures/users');
const categoryFixtures = require('../fixtures/categories');
const planFixtures = require('../fixtures/plans');
const pathFixtures = require('../fixtures/paths');

describe('AccessControlService', () => {
  let mockUser, mockCategory, mockPath, mockLevels;

  beforeEach(async () => {
    mockUser = await userFixtures.createTestUser();
    mockCategory = await categoryFixtures.createTestCategory();
    const pathData = await pathFixtures.createPathWithLevels(mockCategory._id, 3);
    mockPath = pathData.path;
    mockLevels = pathData.levels;
  });

  describe('checkPathAccess', () => {
    it('devrait retourner un accès si l\'utilisateur a un abonnement actif', async () => {
      const plan = await planFixtures.createPremiumPlan();
      const userWithSub = await userFixtures.createUserWithSubscription(plan._id);

      const access = await AccessControlService.checkPathAccess(
        userWithSub._id.toString(),
        mockPath._id.toString()
      );

      expect(access.hasAccess).toBe(true);
      expect(access.source).toBe('subscription');
    });

    it('devrait retourner un accès gratuit pour la première leçon', async () => {
      const access = await AccessControlService.checkPathAccess(
        mockUser._id.toString(),
        mockPath._id.toString()
      );

      expect(access.hasAccess).toBe(true);
      expect(access.source).toBe('free');
    });
  });

  describe('checkLevelAccess', () => {
    it('devrait retourner un accès si l\'utilisateur a un abonnement actif', async () => {
      const plan = await planFixtures.createPremiumPlan();
      const userWithSub = await userFixtures.createUserWithSubscription(plan._id);
      const firstLevel = mockLevels[0];

      const access = await AccessControlService.checkLevelAccess(
        userWithSub._id.toString(),
        mockPath._id.toString(),
        firstLevel._id.toString()
      );

      expect(access.hasAccess).toBe(true);
    });

    it('devrait retourner un accès pour le premier niveau gratuit', async () => {
      const firstLevel = mockLevels[0];

      const access = await AccessControlService.checkLevelAccess(
        mockUser._id.toString(),
        mockPath._id.toString(),
        firstLevel._id.toString()
      );

      expect(access.hasAccess).toBe(true);
      expect(access.source).toBe('free');
    });

    it('devrait refuser l\'accès si ce n\'est pas le premier niveau', async () => {
      const secondLevel = mockLevels[1];

      const access = await AccessControlService.checkLevelAccess(
        mockUser._id.toString(),
        mockPath._id.toString(),
        secondLevel._id.toString()
      );

      expect(access.hasAccess).toBe(false);
      expect(access.reason).toBe('not_first_lesson');
    });
  });

  describe('checkSequentialLevelAccess', () => {
    it('devrait retourner un accès si l\'utilisateur a accès à la catégorie et le niveau précédent est complété', async () => {
      // Créer un accès à la catégorie
      await CategoryAccess.create({
        user: mockUser._id,
        category: mockCategory._id,
        accessType: 'purchased',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      const firstLevel = mockLevels[0];
      const secondLevel = mockLevels[1];

      // Marquer le premier niveau comme complété
      const UserLevelProgress = require('../../src/models/UserLevelProgress');
      await UserLevelProgress.create({
        user: mockUser._id,
        level: firstLevel._id,
        completed: true
      });

      const access = await AccessControlService.checkSequentialLevelAccess(
        mockUser._id.toString(),
        mockPath._id.toString(),
        secondLevel._id.toString()
      );

      expect(access.hasAccess).toBe(true);
      expect(access.source).toBe('sequential_unlock');
    });
  });
});

