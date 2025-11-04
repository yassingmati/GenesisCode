const request = require('supertest');
const express = require('express');
const categoryPaymentRoutes = require('../../src/routes/categoryPaymentRoutes');
const CategoryPaymentService = require('../../src/services/categoryPaymentService');
const userFixtures = require('../fixtures/users');
const categoryFixtures = require('../fixtures/categories');
const authHelper = require('../helpers/authHelper');

// Mock du service
jest.mock('../../src/services/categoryPaymentService');

describe('CategoryPaymentRoutes', () => {
  let app, mockUser, mockCategory;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/category-payments', categoryPaymentRoutes);

    mockUser = await userFixtures.createTestUser();
    mockCategory = await categoryFixtures.createTestCategory();
  });

  describe('GET /api/category-payments/plans', () => {
    it('devrait retourner tous les plans de catégories', async () => {
      const mockPlans = [
        { _id: 'plan1', category: mockCategory._id, price: 2999 }
      ];

      CategoryPaymentService.getAllCategoryPlans.mockResolvedValue(mockPlans);

      const response = await request(app)
        .get('/api/category-payments/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.plans)).toBe(true);
    });
  });

  describe('GET /api/category-payments/plans/:categoryId', () => {
    it('devrait retourner le plan d\'une catégorie', async () => {
      const mockPlan = {
        _id: 'plan1',
        category: mockCategory._id,
        price: 2999
      };

      CategoryPaymentService.getCategoryPlan.mockResolvedValue(mockPlan);

      const response = await request(app)
        .get(`/api/category-payments/plans/${mockCategory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.plan).toBeDefined();
    });
  });

  describe('POST /api/category-payments/init-payment', () => {
    it('devrait initialiser un paiement pour une catégorie', async () => {
      const mockResult = {
        paymentUrl: 'https://gateway.konnect.network/payment/123',
        paymentId: 'payment_123'
      };

      CategoryPaymentService.initCategoryPayment.mockResolvedValue(mockResult);

      const token = authHelper.generateToken(mockUser._id);

      const response = await request(app)
        .post('/api/category-payments/init-payment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          categoryId: mockCategory._id.toString(),
          returnUrl: 'http://localhost:3000/success'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentUrl).toBeDefined();
    });

    it('devrait retourner une erreur si non authentifié', async () => {
      const response = await request(app)
        .post('/api/category-payments/init-payment')
        .send({
          categoryId: mockCategory._id.toString()
        })
        .expect(401);
    });
  });
});

