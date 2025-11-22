// tests/e2e/exerciseFlow.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const User = require('../../src/models/User');
const Exercise = require('../../src/models/Exercise');
const Level = require('../../src/models/Level');
const Path = require('../../src/models/Path');
const Category = require('../../src/models/Category');
const UserProgress = require('../../src/models/UserProgress');

describe('Exercise Flow - E2E Tests', () => {
  let authToken;
  let testUser;
  let testCategory;
  let testPath;
  let testLevel;
  let exercises = [];

  beforeAll(async () => {
    // Créer un utilisateur de test
    testUser = await User.create({
      email: 'e2e-test@test.com',
      password: 'hashedpassword',
      firstName: 'E2E',
      lastName: 'Test',
      isVerified: true
    });

    // Obtenir un token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: testUser._id.toString(), email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    // Créer la structure de test
    testCategory = await Category.create({
      translations: {
        fr: { name: 'E2E Category', description: 'Test' },
        en: { name: 'E2E Category', description: 'Test' },
        ar: { name: 'E2E Category', description: 'Test' }
      }
    });

    testPath = await Path.create({
      category: testCategory._id,
      translations: {
        fr: { name: 'E2E Path', description: 'Test' },
        en: { name: 'E2E Path', description: 'Test' },
        ar: { name: 'E2E Path', description: 'Test' }
      },
      order: 0
    });

    testLevel = await Level.create({
      path: testPath._id,
      translations: {
        fr: { title: 'E2E Level', content: 'Test' },
        en: { title: 'E2E Level', content: 'Test' },
        ar: { title: 'E2E Level', content: 'Test' }
      },
      order: 0
    });

    // Créer plusieurs exercices de différents types
    exercises.push(await Exercise.create({
      level: testLevel._id,
      type: 'QCM',
      points: 10,
      translations: {
        fr: { name: 'QCM Exercise', question: 'Question QCM?', explanation: 'Explication' },
        en: { name: 'QCM Exercise', question: 'QCM Question?', explanation: 'Explanation' },
        ar: { name: 'QCM Exercise', question: 'سؤال QCM؟', explanation: 'شرح' }
      },
      options: [
        { id: 'opt1', text: 'Option 1' },
        { id: 'opt2', text: 'Option 2' }
      ],
      solutions: ['opt1'],
      allowPartial: false
    }));

    exercises.push(await Exercise.create({
      level: testLevel._id,
      type: 'TextInput',
      points: 10,
      translations: {
        fr: { name: 'Text Exercise', question: 'Quelle est la réponse?', explanation: 'Explication' },
        en: { name: 'Text Exercise', question: 'What is the answer?', explanation: 'Explanation' },
        ar: { name: 'Text Exercise', question: 'ما هي الإجابة؟', explanation: 'شرح' }
      },
      solutions: ['réponse']
    }));

    exercises.push(await Exercise.create({
      level: testLevel._id,
      type: 'Code',
      points: 10,
      translations: {
        fr: { name: 'Code Exercise', question: 'Écrivez du code', explanation: 'Explication' },
        en: { name: 'Code Exercise', question: 'Write code', explanation: 'Explanation' },
        ar: { name: 'Code Exercise', question: 'اكتب الكود', explanation: 'شرح' }
      },
      testCases: [
        { input: 'test', expected: 'result', points: 10 }
      ]
    }));

    // Mettre à jour le niveau avec les exercices
    await Level.findByIdAndUpdate(testLevel._id, {
      exercises: exercises.map(e => e._id)
    });
  });

  afterAll(async () => {
    // Nettoyer
    await UserProgress.deleteMany({ user: testUser._id });
    await Exercise.deleteMany({ _id: { $in: exercises.map(e => e._id) } });
    await Level.deleteMany({ _id: testLevel._id });
    await Path.deleteMany({ _id: testPath._id });
    await Category.deleteMany({ _id: testCategory._id });
    await User.deleteMany({ _id: testUser._id });
    await mongoose.connection.close();
  });

  describe('Scénario complet: Chargement niveau → Exercices → Soumission', () => {
    it('devrait charger un niveau avec ses exercices', async () => {
      const response = await request(app)
        .get(`/api/courses/levels/${testLevel._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('exercises');
      expect(Array.isArray(response.body.exercises)).toBe(true);
      expect(response.body.exercises.length).toBeGreaterThan(0);
    });

    it('devrait récupérer un exercice individuel', async () => {
      const exercise = exercises[0];
      const response = await request(app)
        .get(`/api/courses/exercises/${exercise._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', exercise._id.toString());
      expect(response.body).toHaveProperty('type', 'QCM');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('question');
    });

    it('devrait soumettre et évaluer un exercice QCM', async () => {
      const exercise = exercises[0];
      const response = await request(app)
        .post(`/api/courses/exercises/${exercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString(),
          answer: ['opt1']
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('correct', true);
      expect(response.body).toHaveProperty('pointsEarned', 10);
      expect(response.body).toHaveProperty('xpEarned');
      expect(response.body).toHaveProperty('details');
    });

    it('devrait soumettre et évaluer un exercice TextInput', async () => {
      const exercise = exercises[1];
      const response = await request(app)
        .post(`/api/courses/exercises/${exercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString(),
          answer: 'réponse'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('correct', true);
      expect(response.body.pointsEarned).toBe(10);
    });

    it('devrait soumettre et évaluer un exercice Code', async () => {
      const exercise = exercises[2];
      const response = await request(app)
        .post(`/api/courses/exercises/${exercise._id}/submit`)
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

    it('devrait enregistrer le progrès utilisateur après soumission', async () => {
      const exercise = exercises[0];
      const userId = testUser._id.toString();

      // Soumettre l'exercice
      await request(app)
        .post(`/api/courses/exercises/${exercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId,
          answer: ['opt1']
        })
        .expect(200);

      // Vérifier que le progrès est enregistré
      const mongoose = require('mongoose');
      const crypto = require('crypto');
      
      let userObjectId;
      if (mongoose.isValidObjectId(userId)) {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } else {
        const hash = crypto.createHash('md5').update(userId).digest('hex');
        userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
      }

      const progress = await UserProgress.findOne({
        user: userObjectId,
        exercise: exercise._id
      });

      expect(progress).toBeTruthy();
      expect(progress.completed).toBe(true);
      expect(progress.pointsEarned).toBe(10);
    });

    it('devrait gérer les erreurs d\'authentification', async () => {
      const exercise = exercises[0];
      const response = await request(app)
        .post(`/api/courses/exercises/${exercise._id}/submit`)
        .set('Authorization', 'Bearer invalid-token')
        .send({
          userId: testUser._id.toString(),
          answer: ['opt1']
        })
        .expect(401);

      expect(response.body).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('devrait gérer les erreurs de validation', async () => {
      const exercise = exercises[0];
      const response = await request(app)
        .post(`/api/courses/exercises/${exercise._id}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUser._id.toString()
          // answer manquant
        })
        .expect(400);

      expect(response.body).toHaveProperty('code');
    });
  });
});

