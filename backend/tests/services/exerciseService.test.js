// tests/services/exerciseService.test.js
const ExerciseService = require('../../src/services/exerciseService');

// Mock console pour éviter les logs pendant les tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('ExerciseService', () => {
  describe('validateAnswer', () => {
    it('devrait valider une réponse QCM valide', () => {
      const exercise = {
        type: 'QCM',
        solutions: ['opt1', 'opt2'],
        options: [{ id: 'opt1', text: 'Option 1' }]
      };
      const result = ExerciseService.validateAnswer(exercise, ['opt1']);
      expect(result.valid).toBe(true);
    });

    it('devrait rejeter une réponse QCM invalide', () => {
      const exercise = {
        type: 'QCM',
        solutions: ['opt1']
      };
      const result = ExerciseService.validateAnswer(exercise, null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('tableau');
    });

    it('devrait valider une réponse TextInput valide', () => {
      const exercise = {
        type: 'TextInput',
        solutions: ['réponse']
      };
      const result = ExerciseService.validateAnswer(exercise, 'réponse');
      expect(result.valid).toBe(true);
    });

    it('devrait rejeter une réponse TextInput invalide', () => {
      const exercise = {
        type: 'TextInput',
        solutions: ['réponse']
      };
      const result = ExerciseService.validateAnswer(exercise, 123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('chaîne');
    });

    it('devrait valider une réponse Code avec passed', () => {
      const exercise = {
        type: 'Code',
        testCases: [{ input: 'test', expected: 'result' }]
      };
      const result = ExerciseService.validateAnswer(exercise, null, { passed: true });
      expect(result.valid).toBe(true);
    });

    it('devrait valider une réponse Code avec passedCount/totalCount', () => {
      const exercise = {
        type: 'Code',
        testCases: []
      };
      const result = ExerciseService.validateAnswer(exercise, null, {
        passedCount: 5,
        totalCount: 10
      });
      expect(result.valid).toBe(true);
    });

    it('devrait rejeter un exercice mal configuré', () => {
      const exercise = {
        type: 'QCM',
        solutions: []
      };
      const result = ExerciseService.validateAnswer(exercise, ['opt1']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('mal configuré');
    });
  });

  describe('evaluateAnswer - QCM', () => {
    it('devrait évaluer correctement une réponse QCM complète', () => {
      const exercise = {
        type: 'QCM',
        points: 10,
        solutions: ['opt1', 'opt2'],
        options: [
          { id: 'opt1', text: 'Option 1' },
          { id: 'opt2', text: 'Option 2' }
        ],
        allowPartial: false
      };
      const result = ExerciseService.evaluateAnswer(exercise, ['opt1', 'opt2']);
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
      expect(result.xp).toBe(10);
    });

    it('devrait donner des points partiels pour QCM avec allowPartial', () => {
      const exercise = {
        type: 'QCM',
        points: 10,
        solutions: ['opt1', 'opt2'],
        options: [
          { id: 'opt1', text: 'Option 1' },
          { id: 'opt2', text: 'Option 2' }
        ],
        allowPartial: true
      };
      const result = ExerciseService.evaluateAnswer(exercise, ['opt1']);
      
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(5);
      expect(result.xp).toBe(5);
    });

    it('devrait supporter les indices numériques pour QCM', () => {
      const exercise = {
        type: 'QCM',
        points: 10,
        solutions: [0, 1],
        options: [
          { id: 'opt1', text: 'Option 1' },
          { id: 'opt2', text: 'Option 2' }
        ],
        allowPartial: false
      };
      const result = ExerciseService.evaluateAnswer(exercise, [0, 1]);
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });
  });

  describe('evaluateAnswer - TextInput', () => {
    it('devrait accepter une réponse exacte (case-insensitive)', () => {
      const exercise = {
        type: 'TextInput',
        points: 10,
        solutions: ['Réponse']
      };
      const result = ExerciseService.evaluateAnswer(exercise, 'réponse');
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('devrait accepter une réponse avec regex', () => {
      const exercise = {
        type: 'TextInput',
        points: 10,
        solutions: [{ regex: '^\\d+$', flags: 'i' }]
      };
      const result = ExerciseService.evaluateAnswer(exercise, '123');
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('devrait accepter une réponse dans une plage numérique', () => {
      const exercise = {
        type: 'TextInput',
        points: 10,
        solutions: [{ range: { min: 1, max: 10 } }]
      };
      const result = ExerciseService.evaluateAnswer(exercise, '5');
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });
  });

  describe('evaluateAnswer - Code', () => {
    it('devrait évaluer Code avec passed: true', () => {
      const exercise = {
        type: 'Code',
        points: 10,
        testCases: []
      };
      const result = ExerciseService.evaluateAnswer(exercise, null, { passed: true });
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('devrait évaluer Code avec passedCount/totalCount', () => {
      const exercise = {
        type: 'Code',
        points: 10,
        testCases: []
      };
      const result = ExerciseService.evaluateAnswer(exercise, null, {
        passedCount: 7,
        totalCount: 10
      });
      
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(7);
    });

    it('devrait évaluer Code avec tests array', () => {
      const exercise = {
        type: 'Code',
        points: 10,
        testCases: []
      };
      const result = ExerciseService.evaluateAnswer(exercise, null, {
        tests: [
          { passed: true, points: 3 },
          { passed: true, points: 3 },
          { passed: false, points: 4 }
        ]
      });
      
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(6);
    });
  });

  describe('evaluateAnswer - OrderBlocks', () => {
    it('devrait évaluer OrderBlocks correctement', () => {
      const exercise = {
        type: 'OrderBlocks',
        points: 10,
        solutions: [['block1', 'block2', 'block3']],
        allowPartial: false
      };
      const result = ExerciseService.evaluateAnswer(exercise, ['block1', 'block2', 'block3']);
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });

    it('devrait donner des points partiels pour OrderBlocks', () => {
      const exercise = {
        type: 'OrderBlocks',
        points: 10,
        solutions: [['block1', 'block2', 'block3']],
        allowPartial: true
      };
      const result = ExerciseService.evaluateAnswer(exercise, ['block1', 'block3', 'block2']);
      
      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBeGreaterThan(0);
      expect(result.pointsEarned).toBeLessThan(10);
    });
  });

  describe('evaluateAnswer - Matching', () => {
    it('devrait évaluer Matching correctement', () => {
      const exercise = {
        type: 'Matching',
        points: 10,
        solutions: [
          { promptId: 'p1', matchId: 'm1' },
          { promptId: 'p2', matchId: 'm2' }
        ]
      };
      const result = ExerciseService.evaluateAnswer(exercise, [
        { promptId: 'p1', matchId: 'm1' },
        { promptId: 'p2', matchId: 'm2' }
      ]);
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });
  });

  describe('evaluateAnswer - DragDrop', () => {
    it('devrait évaluer DragDrop correctement', () => {
      const exercise = {
        type: 'DragDrop',
        points: 10,
        solutions: [{ el1: 'target1', el2: 'target2' }]
      };
      const result = ExerciseService.evaluateAnswer(exercise, {
        el1: 'target1',
        el2: 'target2'
      });
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });
  });

  describe('evaluateAnswer - Algorithm', () => {
    it('devrait évaluer Algorithm correctement', () => {
      const exercise = {
        type: 'Algorithm',
        points: 10,
        solutions: [['step1', 'step2', 'step3']],
        allowPartial: false
      };
      const result = ExerciseService.evaluateAnswer(exercise, ['step1', 'step2', 'step3']);
      
      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
    });
  });

  describe('evaluateAnswer - erreurs', () => {
    it('devrait lancer une erreur pour un type non supporté', () => {
      const exercise = {
        type: 'UnknownType',
        points: 10
      };
      
      expect(() => {
        ExerciseService.evaluateAnswer(exercise, 'answer');
      }).toThrow('Type d\'exercice non supporté');
    });
  });
});

