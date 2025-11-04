const CategoryPaymentService = require('../../src/services/categoryPaymentService');
const CategoryPlan = require('../../src/models/CategoryPlan');
const CategoryAccess = require('../../src/models/CategoryAccess');
const userFixtures = require('../fixtures/users');
const categoryFixtures = require('../fixtures/categories');

// Mock konnectPaymentService
jest.mock('../../src/services/konnectPaymentService');

describe('CategoryPaymentService', () => {
  let mockUser, mockCategory;

  beforeEach(async () => {
    mockUser = await userFixtures.createTestUser();
    mockCategory = await categoryFixtures.createTestCategory();
  });

  describe('getAllCategoryPlans', () => {
    it('devrait retourner tous les plans de catégories actifs', async () => {
      await CategoryPlan.create({
        category: mockCategory._id,
        price: 2999,
        currency: 'TND',
        paymentType: 'one_time',
        translations: {
          fr: { name: 'Plan Test', description: 'Description' },
          en: { name: 'Test Plan', description: 'Description' }
        },
        active: true
      });

      const plans = await CategoryPaymentService.getAllCategoryPlans();

      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });
  });

  describe('getCategoryPlan', () => {
    it('devrait retourner le plan d\'une catégorie spécifique', async () => {
      const plan = await CategoryPlan.create({
        category: mockCategory._id,
        price: 2999,
        currency: 'TND',
        paymentType: 'one_time',
        translations: {
          fr: { name: 'Plan Test', description: 'Description' },
          en: { name: 'Test Plan', description: 'Description' }
        },
        active: true
      });

      const result = await CategoryPaymentService.getCategoryPlan(mockCategory._id.toString());

      expect(result).toBeDefined();
      expect(result.category).toBe(mockCategory._id.toString());
    });

    it('devrait lancer une erreur si le plan n\'existe pas', async () => {
      await expect(
        CategoryPaymentService.getCategoryPlan('nonexistent-id')
      ).rejects.toThrow('Plan de catégorie non trouvé');
    });
  });

  describe('initCategoryPayment', () => {
    it('devrait retourner un accès gratuit si le prix est 0', async () => {
      const freePlan = await CategoryPlan.create({
        category: mockCategory._id,
        price: 0,
        currency: 'TND',
        paymentType: 'one_time',
        translations: {
          fr: { name: 'Plan Gratuit', description: 'Gratuit' },
          en: { name: 'Free Plan', description: 'Free' }
        },
        active: true
      });

      const result = await CategoryPaymentService.initCategoryPayment(
        mockUser._id.toString(),
        mockCategory._id.toString(),
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      );

      expect(result.success).toBe(true);
      expect(result.freeAccess).toBe(true);
    });

    it('devrait retourner un message si l\'utilisateur a déjà accès', async () => {
      const plan = await CategoryPlan.create({
        category: mockCategory._id,
        price: 2999,
        currency: 'TND',
        paymentType: 'one_time',
        translations: {
          fr: { name: 'Plan Test', description: 'Description' },
          en: { name: 'Test Plan', description: 'Description' }
        },
        active: true
      });

      // Créer un accès existant
      await CategoryAccess.create({
        user: mockUser._id,
        category: mockCategory._id,
        accessType: 'purchased',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      const result = await CategoryPaymentService.initCategoryPayment(
        mockUser._id.toString(),
        mockCategory._id.toString()
      );

      expect(result.success).toBe(true);
      expect(result.alreadyHasAccess).toBe(true);
    });
  });
});

