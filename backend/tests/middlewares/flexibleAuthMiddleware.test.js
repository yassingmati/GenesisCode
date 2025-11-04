const flexibleAuthMiddleware = require('../../src/middlewares/flexibleAuthMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const Admin = require('../../src/models/Admin');
const userFixtures = require('../fixtures/users');

describe('flexibleAuthMiddleware', () => {
  let mockUser;
  let mockAdmin;

  beforeEach(async () => {
    // Créer un utilisateur de test
    mockUser = await userFixtures.createTestUser();
    
    // Créer un admin de test
    mockAdmin = new Admin({
      email: `admin-${Date.now()}@test.com`,
      password: 'testpassword123'
    });
    await mockAdmin.save();
  });

  afterEach(async () => {
    // Nettoyer les données de test
    if (mockUser) {
      await User.findByIdAndDelete(mockUser._id).catch(() => {});
    }
    if (mockAdmin) {
      await Admin.findByIdAndDelete(mockAdmin._id).catch(() => {});
    }
  });

  describe('protectUserOrAdmin', () => {
    it('devrait permettre l\'accès avec un token utilisateur valide dans le header', async () => {
      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: mockUser._id.toString() }, userSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(String(req.user.id)).toBe(String(mockUser._id));
      expect(req.user.email).toBe(mockUser.email);
    });

    it('devrait permettre l\'accès avec un token utilisateur valide dans les cookies', async () => {
      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: mockUser._id.toString() }, userSecret);

      const req = {
        cookies: {
          token: token
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(String(req.user.id)).toBe(String(mockUser._id));
    });

    it('devrait permettre l\'accès avec un token admin valide dans adminToken cookie', async () => {
      const adminSecret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: mockAdmin._id.toString() }, adminSecret);

      const req = {
        cookies: {
          adminToken: token
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.admin).toBeDefined();
      expect(String(req.admin.id)).toBe(String(mockAdmin._id));
      expect(req.admin.email).toBe(mockAdmin.email);
      expect(req.user).toBeDefined();
      expect(req.user.roles).toContain('admin');
    });

    it('devrait permettre l\'accès avec un token admin valide dans le header', async () => {
      const adminSecret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
      const userSecret = process.env.JWT_SECRET || 'devsecret';
      
      // Si les secrets sont différents, utiliser adminSecret (le token sera vérifié comme admin)
      // Sinon, le token sera vérifié comme user mais l'admin n'existe pas dans User
      // Dans ce cas, on doit créer un User avec le même ID pour que le test fonctionne
      if (adminSecret === userSecret) {
        // Créer un User avec le même ID que l'admin pour que le token fonctionne
        const userWithAdminId = await userFixtures.createTestUser({
          _id: mockAdmin._id,
          email: mockAdmin.email,
          roles: ['admin']
        });
        // Supprimer l'admin et utiliser le user à la place
        await Admin.findByIdAndDelete(mockAdmin._id).catch(() => {});
      }
      
      const secretToUse = (adminSecret !== userSecret) ? adminSecret : userSecret;
      const token = jwt.sign({ id: mockAdmin._id.toString() }, secretToUse);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      // Le token devrait être accepté
      expect(next).toHaveBeenCalled();
      // Si les secrets sont différents, ça sera traité comme admin, sinon comme user avec rôle admin
      if (adminSecret !== userSecret) {
        expect(req.admin).toBeDefined();
      } else {
        expect(req.user).toBeDefined();
        expect(req.user.roles).toContain('admin');
      }
    });

    it('devrait permettre l\'accès pour un utilisateur avec rôle admin', async () => {
      // Ajouter le rôle admin à l'utilisateur
      mockUser.roles = ['admin'];
      await mockUser.save();

      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: mockUser._id.toString() }, userSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.roles).toContain('admin');
      expect(req.admin).toBeDefined();
      expect(req.admin.roles).toContain('admin');
    });

    it('devrait refuser l\'accès sans token', async () => {
      const req = {
        headers: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('connecter')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait refuser l\'accès avec un token invalide', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait refuser l\'accès avec un token expiré', async () => {
      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign(
        { id: mockUser._id.toString() },
        userSecret,
        { expiresIn: '-1h' } // Token déjà expiré
      );

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Session expirée'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait refuser l\'accès si l\'utilisateur n\'existe plus', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: fakeUserId }, userSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait refuser l\'accès si l\'admin n\'existe plus', async () => {
      const fakeAdminId = '507f1f77bcf86cd799439012';
      const adminSecret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: fakeAdminId }, adminSecret);

      const req = {
        cookies: {
          adminToken: token
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs serveur correctement', async () => {
      // Mock User.findById pour lever une erreur après la vérification JWT
      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: mockUser._id.toString() }, userSecret);

      // Mock findById pour retourner une query qui échoue lors de select
      const originalFindById = User.findById;
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await flexibleAuthMiddleware.protectUserOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Erreur serveur'
        })
      );
      expect(next).not.toHaveBeenCalled();

      // Restaurer la méthode originale
      User.findById = originalFindById;
    });
  });
});

