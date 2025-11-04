const authMiddleware = require('../../src/middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const userFixtures = require('../fixtures/users');

describe('authMiddleware', () => {
  let mockUser;

  beforeEach(async () => {
    mockUser = await userFixtures.createTestUser();
  });

  afterEach(async () => {
    if (mockUser) {
      await User.findByIdAndDelete(mockUser._id).catch(() => {});
    }
  });

  describe('protect', () => {
    it('devrait permettre l\'accès avec un token valide dans le header', async () => {
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

      await authMiddleware.protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(String(req.user.id)).toBe(String(mockUser._id));
      expect(req.user.email).toBe(mockUser.email);
    });

    it('devrait permettre l\'accès avec un token valide dans les cookies', async () => {
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

      await authMiddleware.protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(String(req.user.id)).toBe(String(mockUser._id));
    });

    it('devrait définir req.admin si l\'utilisateur a le rôle admin', async () => {
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

      await authMiddleware.protect(req, res, next);

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

      await authMiddleware.protect(req, res, next);

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

      await authMiddleware.protect(req, res, next);

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

      await authMiddleware.protect(req, res, next);

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

      await authMiddleware.protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait refuser l\'accès si le token n\'a pas d\'ID', async () => {
      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ email: 'test@test.com' }, userSecret); // Pas d'ID

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

      await authMiddleware.protect(req, res, next);

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

      await authMiddleware.protect(req, res, next);

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

  describe('roleMiddleware', () => {
    it('devrait permettre l\'accès si l\'utilisateur a le rôle requis', async () => {
      mockUser.roles = ['admin'];
      await mockUser.save();

      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: mockUser._id.toString() }, userSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        },
        user: null
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // D'abord protéger
      await authMiddleware.protect(req, res, next);
      expect(next).toHaveBeenCalled();

      // Ensuite vérifier le rôle
      const roleCheck = authMiddleware.roleMiddleware('admin');
      await roleCheck(req, res, next);

      expect(next).toHaveBeenCalledTimes(2);
    });

    it('devrait refuser l\'accès si l\'utilisateur n\'a pas le rôle requis', async () => {
      mockUser.roles = ['student'];
      await mockUser.save();

      const userSecret = process.env.JWT_SECRET || 'devsecret';
      const token = jwt.sign({ id: mockUser._id.toString() }, userSecret);

      const req = {
        headers: {
          authorization: `Bearer ${token}`
        },
        user: null
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // D'abord protéger
      await authMiddleware.protect(req, res, next);
      expect(next).toHaveBeenCalled();

      // Ensuite vérifier le rôle
      const roleCheck = authMiddleware.roleMiddleware('admin');
      await roleCheck(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).toHaveBeenCalledTimes(1); // Seulement une fois (protect)
    });
  });
});

