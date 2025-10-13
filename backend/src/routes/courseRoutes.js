

// =========================
// FILE: routes/courseRoutes.js
// =========================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const router = express.Router();

const {
  CourseController,
  languageMiddleware
} = require('../controllers/CourseController');

// Import des middlewares de contrôle parental
const { 
  checkParentalControls, 
  trackActivity, 
  checkContentRestrictions,
  startSession,
  endSession,
  updateSessionStats
} = require('../middlewares/parentalControls');

/**
 * CORS configuration (apply before routes)
 */
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  optionsSuccessStatus: 204
};
router.use(cors(corsOptions));

/**
 * language middleware (global)
 */
router.use(languageMiddleware);

/**
 * Middlewares de contrôle parental (appliqués à toutes les routes)
 */
router.use(startSession);
router.use(trackActivity);
router.use(checkParentalControls);
router.use(checkContentRestrictions);

/**
 * ID validator middleware
 */
const validateId = (param, location = 'params') => (req, res, next) => {
  const id = req[location][param];
  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      error: `Format d'ID invalide pour ${param}`
    });
  }
  next();
};

/**
 * User ID validator middleware - accepts any non-empty string
 */
const validateUserId = (param = 'userId', location = 'params') => (req, res, next) => {
  const id = req[location][param];
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({
      error: `UserId requis pour ${param}`
    });
  }
  next();
};

// local catchErrors helper for async route handlers (convenience)
const catchErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ===========================
   Categories
   =========================== */
router.post('/categories', catchErrors(CourseController.createCategory));
router.get('/categories', catchErrors(CourseController.getAllCategories));
router.get('/categories/:id', validateId('id'), catchErrors(CourseController.getCategory));
router.put('/categories/:id', validateId('id'), catchErrors(CourseController.updateCategory));
router.delete('/categories/:id', validateId('id'), catchErrors(CourseController.deleteCategory));

/* ===========================
   Paths (Parcours)
   =========================== */
router.post('/paths', catchErrors(CourseController.createPath));
router.get('/paths', catchErrors(CourseController.getAllPaths));
router.get('/paths/:id', validateId('id'), catchErrors(CourseController.getPath));
router.put('/paths/:id', validateId('id'), catchErrors(CourseController.updatePath));
router.delete('/paths/:id', validateId('id'), catchErrors(CourseController.deletePath));
router.get('/categories/:categoryId/paths',
  validateId('categoryId'),
  catchErrors(CourseController.getPathsByCategory)
);

/* ===========================
   Levels
   =========================== */
router.post('/levels', catchErrors(CourseController.createLevel));
router.get('/paths/:id/levels', validateId('id'), catchErrors(CourseController.getLevelsByPath));
router.get('/levels/:id', validateId('id'), catchErrors(CourseController.getLevelContent));
router.put('/levels/:id', validateId('id'), catchErrors(CourseController.updateLevel));
router.delete('/levels/:id', validateId('id'), catchErrors(CourseController.deleteLevel));

/* Exercises for a level (list) */
router.get('/levels/:id/exercises', validateId('id'), catchErrors(CourseController.getExercisesByLevel));

/* ===========================
   Exercises (CRUD & submit)
   =========================== */
router.post('/exercises', catchErrors(CourseController.createExercise));
router.get('/exercises/:id', validateId('id'), catchErrors(CourseController.getExercise));
router.put('/exercises/:id', validateId('id'), catchErrors(CourseController.updateExercise));

/**
 * POST /exercises/:id/submit
 * Submit an exercise answer with enhanced scoring system
 * 
 * Body formats by exercise type:
 * - QCM: { userId, answer: [indices] }
 * - TextInput/FillInTheBlank: { userId, answer: "text" }
 * - Code: { userId, passed: boolean } OR { userId, passedCount, totalCount, tests: [...] }
 * - DragDrop/OrderBlocks/Matching: { userId, answer: [...] }
 * 
 * Response: {
 *   correct: boolean,
 *   pointsEarned: number,
 *   pointsMax: number,
 *   xpEarned: number,
 *   explanation?: string,
 *   details: object,
 *   revealSolutions?: boolean
 * }
 */
router.post('/exercises/:id/submit', validateId('id'), catchErrors(CourseController.submitExercise));
router.delete('/exercises/:id', validateId('id'), catchErrors(CourseController.deleteExercise));

/* ===========================
   Progress & Statistics Routes
   =========================== */
// Progrès d'un utilisateur pour un exercice spécifique
router.get('/users/:userId/exercises/:exerciseId/progress', 
  validateUserId('userId'), 
  validateId('exerciseId'), 
  catchErrors(CourseController.getUserExerciseProgress)
);

// Statistiques globales d'un utilisateur
router.get('/users/:userId/stats', 
  validateUserId('userId'), 
  catchErrors(CourseController.getUserStats)
);

// Progrès d'un utilisateur pour un niveau complet
router.get('/users/:userId/levels/:levelId/progress', 
  validateUserId('userId'), 
  validateId('levelId'), 
  catchErrors(CourseController.getUserLevelProgress)
);

/* ===========================
   Media (videos)
   POST /levels/:levelId/video  -> upload video (form-data: video file + lang)
   GET  /levels/:levelId/video?lang=fr -> stream
   DELETE /levels/:levelId/video?lang=fr -> delete
*/
router.post(
  '/levels/:levelId/video',
  validateId('levelId'),
  CourseController.uploadVideoMiddleware,
  catchErrors(CourseController.saveVideoPath)
);

router.get(
  '/levels/:levelId/video',
  validateId('levelId'),
  catchErrors(CourseController.streamVideo)
);

router.delete(
  '/levels/:levelId/video',
  validateId('levelId'),
  catchErrors(CourseController.deleteLevelVideo)
);

/* ===========================
   PDFs (multilingues)
*/
router.post(
  '/levels/:levelId/pdf',
  validateId('levelId'),
  CourseController.uploadPDFMiddleware,
  catchErrors(CourseController.savePDFPath)
);

router.get(
  '/levels/:levelId/pdf',
  validateId('levelId'),
  catchErrors(CourseController.streamPDF)
);

router.delete(
  '/levels/:levelId/pdf',
  validateId('levelId'),
  catchErrors(CourseController.deleteLevelPDF)
);

/* ===========================
   Centralized error handler for this router
   =========================== */
router.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({
    error: err && err.message ? err.message : 'Erreur interne du serveur'
  });
});

module.exports = router;
