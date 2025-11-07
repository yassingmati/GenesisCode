

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

// Import des middlewares de contrôle d'accès
const { requireFlexibleCourseAccess, requireFlexibleLevelAccess, requireExerciseAccess } = require('../middlewares/flexibleAccessMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { protectUserOrAdmin } = require('../middlewares/flexibleAuthMiddleware');

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
 * Utilise la même logique que la configuration globale pour accepter le frontend déployé
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin
    if (!origin) {
      return callback(null, true);
    }
    
    // En développement, permettre toutes les origines
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Vérifier si l'origine est autorisée (priorité au frontend déployé)
    if (origin.includes('codegenesis-platform.web.app') || 
        origin.includes('codegenesis-platform.firebaseapp.com')) {
      return callback(null, origin);
    }
    
    // Autres origines autorisées
    const allowedOrigins = [
      'https://codegenesis-platform.web.app',
      'https://codegenesis-platform.firebaseapp.com',
      'http://localhost:3000' // Pour le développement local
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(null, true); // Permettre pour l'instant, mais loguer
      console.warn(`⚠️  CORS courseRoutes: Origine non autorisée: ${origin}`);
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'Range', 'X-Requested-With'],
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
router.get('/catalog', catchErrors(CourseController.getCatalog));
router.post('/categories', protectUserOrAdmin, catchErrors(CourseController.createCategory));
router.get('/categories', protectUserOrAdmin, catchErrors(CourseController.getAllCategories));
router.get('/categories/:id', protectUserOrAdmin, validateId('id'), catchErrors(CourseController.getCategory));
router.put('/categories/:id', protectUserOrAdmin, validateId('id'), catchErrors(CourseController.updateCategory));
router.delete('/categories/:id', protectUserOrAdmin, validateId('id'), catchErrors(CourseController.deleteCategory));

/* ===========================
   Paths (Parcours)
   =========================== */
router.post('/paths', protectUserOrAdmin, catchErrors(CourseController.createPath));
router.get('/paths', protectUserOrAdmin, catchErrors(CourseController.getAllPaths));
router.get('/paths/:id', protectUserOrAdmin, validateId('id'), requireFlexibleCourseAccess(), catchErrors(CourseController.getPath));
router.put('/paths/:id', protectUserOrAdmin, validateId('id'), catchErrors(CourseController.updatePath));
router.delete('/paths/:id', protectUserOrAdmin, validateId('id'), catchErrors(CourseController.deletePath));
router.get('/categories/:categoryId/paths',
  protectUserOrAdmin,
  validateId('categoryId'),
  catchErrors(CourseController.getPathsByCategory)
);

/* ===========================
   Levels
   =========================== */
router.post('/levels', protectUserOrAdmin, catchErrors(CourseController.createLevel));
router.get('/paths/:id/levels', validateId('id'), protectUserOrAdmin, catchErrors(CourseController.getLevelsByPath));
router.get('/levels/:id', protectUserOrAdmin, validateId('id'), requireFlexibleLevelAccess(), catchErrors(CourseController.getLevelContent));
router.put('/levels/:id', validateId('id'), protectUserOrAdmin, catchErrors(CourseController.updateLevel));
router.delete('/levels/:id', validateId('id'), protectUserOrAdmin, catchErrors(CourseController.deleteLevel));

/* Exercises for a level (list) */
router.get('/levels/:id/exercises', protectUserOrAdmin, validateId('id'), requireFlexibleLevelAccess(), catchErrors(CourseController.getExercisesByLevel));

/* ===========================
   Exercises (CRUD & submit)
   =========================== */
router.post('/exercises', protectUserOrAdmin, catchErrors(CourseController.createExercise));
router.get('/exercises/:id', protectUserOrAdmin, validateId('id'), requireExerciseAccess(), catchErrors(CourseController.getExercise));
router.put('/exercises/:id', validateId('id'), protectUserOrAdmin, catchErrors(CourseController.updateExercise));

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
router.post('/exercises/:id/submit', protectUserOrAdmin, validateId('id'), requireExerciseAccess(), catchErrors(CourseController.submitExercise));
router.delete('/exercises/:id', validateId('id'), protectUserOrAdmin, catchErrors(CourseController.deleteExercise));

/* ===========================
   Progress & Statistics Routes
   =========================== */
// Progrès d'un utilisateur pour un exercice spécifique
router.get('/users/:userId/exercises/:exerciseId/progress', 
  validateUserId('userId'), 
  validateId('exerciseId'), 
  protectUserOrAdmin,
  catchErrors(CourseController.getUserExerciseProgress)
);

// Statistiques globales d'un utilisateur
router.get('/users/:userId/stats', 
  validateUserId('userId'), 
  protectUserOrAdmin,
  catchErrors(CourseController.getUserStats)
);

// Progrès d'un utilisateur pour un niveau complet
router.get('/users/:userId/levels/:levelId/progress', 
  validateUserId('userId'), 
  validateId('levelId'), 
  protectUserOrAdmin,
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
  protectUserOrAdmin,
  CourseController.uploadVideoMiddleware,
  catchErrors(CourseController.saveVideoPath)
);

router.get(
  '/levels/:levelId/video',
  protectUserOrAdmin,
  validateId('levelId'),
  requireFlexibleLevelAccess(),
  catchErrors(CourseController.streamVideo)
);

router.delete(
  '/levels/:levelId/video',
  validateId('levelId'),
  protectUserOrAdmin,
  catchErrors(CourseController.deleteLevelVideo)
);

/* ===========================
   PDFs (multilingues)
*/
router.post(
  '/levels/:levelId/pdf',
  validateId('levelId'),
  protectUserOrAdmin,
  CourseController.uploadPDFMiddleware,
  catchErrors(CourseController.savePDFPath)
);

router.get(
  '/levels/:levelId/pdf',
  protectUserOrAdmin,
  validateId('levelId'),
  requireFlexibleLevelAccess(),
  catchErrors(CourseController.streamPDF)
);

router.delete(
  '/levels/:levelId/pdf',
  validateId('levelId'),
  protectUserOrAdmin,
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
