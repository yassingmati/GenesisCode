const request = require('supertest');
const express = require('express');
const subscriptionRoutes = require('../../src/routes/subscriptionRoutes');
const userFixtures = require('../fixtures/users');
const planFixtures = require('../fixtures/plans');
const authHelper = require('../helpers/authHelper');

describe('SubscriptionRoutes', () => {
  let app, mockUser, mockPlan;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/subscriptions', subscriptionRoutes);

    mockUser = await userFixtures.createTestUser();
    mockPlan = await planFixtures.createPremiumPlan();
  });

  describe('GET /api/subscriptions/plans', () => {
    it('devrait retourner tous les plans actifs', async () => {
      await planFixtures.createPremiumPlan();
      await planFixtures.createBeginnerPlan();

      const response = await request(app)
        .get('/api/subscriptions/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.plans)).toBe(true);
    });
  });

  describe('GET /api/subscriptions/me', () => {
    it('devrait retourner l\'abonnement de l\'utilisateur', async () => {
      const userWithSub = await userFixtures.createUserWithSubscription(mockPlan._id);
      const token = authHelper.generateToken(userWithSub._id);

      const response = await request(app)
        .get('/api/subscriptions/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.subscription).toBeDefined();
    });

    it('devrait retourner null si l\'utilisateur n\'a pas d\'abonnement', async () => {
      const token = authHelper.generateToken(mockUser._id);

      const response = await request(app)
        .get('/api/subscriptions/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.subscription).toBeNull();
    });
  });
});

