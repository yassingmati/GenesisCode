// tests/controllers/exerciseController.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const User = require('../../src/models/User');
const Exercise = require('../../src/models/Exercise');
const Level = require('../../src/models/Level');
const Path = require('../../src/models/Path');
const Category = require('../../src/models/Category');

describe('Exercise Controller - Integration Tests', () => {
  let authToken;
  let testUser;
  let testCategory;
  let testPath;
  let testLevel;
  let testExercise;

  beforeAll(async () => {
    // Créer un utilisateur de test
    testUser = await User.create({
      email: 'test-exercise@test.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      isVerified: true
    });

    // Obtenir un token d'authentification
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-exercise@test.com',
        password: 'password123'
      })
      .catch(async () => {
        // Si la connexion échoue, créer un token manuellement
        const jwt = require('jsonwebtoken');
        return {
          body: {
            token: jwt.sign(
              { id: testUser._id.toString(), email: testUser.email },
              process.env.JWT_SECRET || 'test-secret',
              { expiresIn: '24h' }
            )
          }
        };
      });

    authToken = loginRes.body.token;

    // Créer une structure de test (Category -> Path -> Level -> Exercise)
    testCategory = await Category.create({
      translations: {
        fr: { name: 'Test Category', description: 'Test' },
        en: { name: 'Test Category', description: 'Test' },
        ar: { name: 'Test Category', description: 'Test' }
      }
    });

    testPath = await Path.create({
      category: testCategory._id,
      translations: {
        fr: { name: 'Test Path', description: 'Test' },
        en: { name: 'Test Path', description: 'Test' },
        ar: { name: 'Test Path', description: 'Test' }
      },
      order: 0
    });

    testLevel = await Level.create({
      path: testPath._id,
      translations: {
        fr: { title: 'Test Level', content: 'Test' },
        en: { title: 'Test Level', content: 'Test' },
        ar: { title: 'Test Level', content: 'Test' }
      },
      order: 0
    });

    testExercise = await Exercise.create({
      level: testLevel._id,
      type: 'QCM',
      points: 10,
      translations: {
        fr: { name: 'Test Exercise', question: 'Quelle est la réponse?', explanation: 'Explication' },
        en: { name: 'Test Exercise', question: 'What is the answer?', explanation: 'Explanation' },
        ar: { name: 'Test Exercise', question: 'ما هي الإجابة؟', explanation: 'شرح' }
      },
      options: [
        { id: 'opt1', text: 'Option 1' },
        { id: 'opt2', text: 'Option 2' },
        { id: 'opt3', text: 'Option 3' }
      ],
      solutions: ['opt1', 'opt2'],
      allowPartial: true
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await Exercise.deleteMany({ _id: testExercise._id });
    await Level.deleteMany({ _id: testLevel._id });
    await Path.deleteMany({ _id: testPath._id });
    await Category.deleteMany({ _id: testCategory._id });
    await User.deleteMany({ _id: testUser._id });
    await mongoose.connection.close();
  });

  describe('GET /api/courses/exercises/:id', () => {
    it('devrait récupérer un exercice avec authentification valide', async () => {
      const response = await request(app)
        .get(`/api/courses/exercises/${testExercise._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('type', 'QCM');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('question');
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .get(`/api/courses/exercises/${testExercise._id}`)
        .expect(401);

      expect(response.body).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('devrait retourner 404 pour un exercice inexistant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/courses/exercises/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('code', 'EXERCISE_NOT_FOUND');
    });
  });

  describe('POST /api/courses/exercises/:id/submit', () => {
    it('devrait soumettre une réponse QCM correcte', async () => {
      const response = await request(app)
        .post(`/api/courses/exercises/${testExercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString(),
          answer: ['opt1', 'opt2']
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('pointsEarned', 10);
      expect(response.body).toHaveProperty('xpEarned');
    });

    it('devrait soumettre une réponse QCM partielle', async () => {
      const response = await request(app)
        .post(`/api/courses/exercises/${testExercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString(),
          answer: ['opt1']
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('correct', false);
      expect(response.body.pointsEarned).toBeGreaterThan(0);
      expect(response.body.pointsEarned).toBeLessThan(10);
    });

    it('devrait retourner 400 pour userId manquant', async () => {
      const response = await request(app)
        .post(`/api/courses/exercises/${testExercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answer: ['opt1']
        })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'INVALID_USER_ID');
    });

    it('devrait retourner 400 pour réponse invalide', async () => {
      const response = await request(app)
        .post(`/api/courses/exercises/${testExercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString(),
          answer: null
        })
        .expect(400);

      expect(response.body).toHaveProperty('code', 'INVALID_ANSWER');
    });

    it('devrait retourner 401 sans authentification', async () => {
      const response = await request(app)
        .post(`/api/courses/exercises/${testExercise._id}/submit`)
        .send({
          userId: testUser._id.toString(),
          answer: ['opt1']
        })
        .expect(401);
    });
  });

  describe('POST /api/courses/exercises/:id/submit - Code exercises', () => {
    let codeExercise;

    beforeAll(async () => {
      codeExercise = await Exercise.create({
        level: testLevel._id,
        type: 'Code',
        points: 10,
        translations: {
          fr: { name: 'Code Exercise', question: 'Écrivez une fonction', explanation: 'Explication' },
          en: { name: 'Code Exercise', question: 'Write a function', explanation: 'Explanation' },
          ar: { name: 'Code Exercise', question: 'اكتب دالة', explanation: 'شرح' }
        },
        testCases: [
          { input: 'test1', expected: 'result1', points: 5 },
          { input: 'test2', expected: 'result2', points: 5 }
        ]
      });
    });

    afterAll(async () => {
      await Exercise.deleteMany({ _id: codeExercise._id });
    });

    it('devrait soumettre Code avec passed: true', async () => {
      const response = await request(app)
        .post(`/api/courses/exercises/${codeExercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString(),
          passed: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('correct', true);
      expect(response.body.pointsEarned).toBe(10);
    });

    it('devrait soumettre Code avec passedCount/totalCount', async () => {
      const response = await request(app)
        .post(`/api/courses/exercises/${codeExercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString(),
          passedCount: 1,
          totalCount: 2
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('correct', false);
      expect(response.body.pointsEarned).toBe(5);
    });
  });
});

