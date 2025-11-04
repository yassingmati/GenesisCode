const request = require('supertest');
const express = require('express');
const accessRoutes = require('../../src/routes/accessRoutes');
const AccessControlService = require('../../src/services/accessControlService');
const authMiddleware = require('../../src/middlewares/authMiddleware');
const userFixtures = require('../fixtures/users');
const categoryFixtures = require('../fixtures/categories');
const pathFixtures = require('../fixtures/paths');
const authHelper = require('../helpers/authHelper');

// Mock du service
jest.mock('../../src/services/accessControlService');

describe('AccessRoutes', () => {
  let app, mockUser, mockCategory, mockPath, mockLevel;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/access', accessRoutes);

    mockUser = await userFixtures.createTestUser();
    mockCategory = await categoryFixtures.createTestCategory();
    const pathData = await pathFixtures.createPathWithLevels(mockCategory._id, 3);
    mockPath = pathData.path;
    mockLevel = pathData.levels[0];
  });

  describe('GET /api/access/check', () => {
    it('devrait retourner un accès autorisé', async () => {
      const mockAccess = {
        hasAccess: true,
        accessType: 'subscription',
        canView: true,
        canInteract: true,
        source: 'subscription'
      };

      AccessControlService.checkUserAccess.mockResolvedValue(mockAccess);

      const token = authHelper.generateToken(mockUser._id);

      const response = await request(app)
        .get('/api/access/check')
        .query({ pathId: mockPath._id.toString() })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.access.hasAccess).toBe(true);
    });

    it('devrait retourner un accès refusé', async () => {
      const mockAccess = {
        hasAccess: false,
        reason: 'no_access'
      };

      AccessControlService.checkUserAccess.mockResolvedValue(mockAccess);

      const token = authHelper.generateToken(mockUser._id);

      const response = await request(app)
        .get('/api/access/check')
        .query({ pathId: mockPath._id.toString() })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.access.hasAccess).toBe(false);
    });

    it('devrait retourner une erreur si pathId est manquant', async () => {
      const token = authHelper.generateToken(mockUser._id);

      const response = await request(app)
        .get('/api/access/check')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ID du parcours requis');
    });

    it('devrait retourner une erreur si non authentifié', async () => {
      const response = await request(app)
        .get('/api/access/check')
        .query({ pathId: mockPath._id.toString() })
        .expect(401);
    });
  });
});

