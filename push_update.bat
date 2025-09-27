const mongoose = require('mongoose');

const categoryTranslationSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  translations: {
    fr: categoryTranslationSchema,
    en: categoryTranslationSchema,
    ar: categoryTranslationSchema
  },
  order: { type: Number, default: 0 }
}, {
  timestamps: true,
  autoIndex: false
});

// Index composé unique pour éviter les doublons
categorySchema.index({ 
  'translations.fr.name': 1,
  'translations.en.name': 1,
  'translations.ar.name': 1
}, { unique: true });

module.exports = mongoose.model('Category', categorySchema);// models/Exercise.js
const { Schema, model, Types } = require('mongoose');

const exerciseTranslationSchema = new Schema({
  question: { type: String, required: true },
  explanation: { type: String }
}, { _id: false });

const testCaseSchema = new Schema({
  input: Schema.Types.Mixed,
  expected: Schema.Types.Mixed
}, { _id: false });

const exerciseSchema = new Schema({
  translations: {
    fr: exerciseTranslationSchema,
    en: exerciseTranslationSchema,
    ar: exerciseTranslationSchema
  },
  type: {
    type: String,
    enum: ['QCM', 'DragDrop', 'TextInput', 'Code'],
    required: true
  },
  options: [String],         // pour QCM
  elements: [Schema.Types.Mixed], // pour DragDrop
  targets: [Schema.Types.Mixed],  // pour DragDrop
  testCases: [testCaseSchema],    // pour Code
  solutions: [Schema.Types.Mixed],
  level: { type: Types.ObjectId, ref: 'Level', required: true }
}, {
  timestamps: true
});

module.exports = model('Exercise', exerciseSchema);
// models/Level.js
const { Schema, model, Types } = require('mongoose');

const levelTranslationSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const levelSchema = new Schema({
  translations: {
    fr: levelTranslationSchema,
    en: levelTranslationSchema,
    ar: levelTranslationSchema
  },
  path: { type: Types.ObjectId, ref: 'Path', required: true },
  order: { type: Number, default: 0 },
  exercises: [{ type: Types.ObjectId, ref: 'Exercise' }],
  videoPath: { type: String }
}, {
  timestamps: true
});

module.exports = model('Level', levelSchema);
const { Schema, model, Types } = require('mongoose');

const pathTranslationSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const pathSchema = new Schema({
  translations: {
    fr: pathTranslationSchema,
    en: pathTranslationSchema,
    ar: pathTranslationSchema
  },
  category: { type: Types.ObjectId, ref: 'Category', required: true },
  order: { type: Number, default: 0 },
  levels: [{ type: Types.ObjectId, ref: 'Level' }]
}, {
  timestamps: true
});

module.exports = model('Path', pathSchema);// src/models/Progress.js
const { Schema, model, Types } = require('mongoose');

const progressSchema = new Schema({
  user:      { type: Types.ObjectId, ref: 'User',     required: true },
  exercise:  { type: Types.ObjectId, ref: 'Exercise', required: true },
  xp:        { type: Number,         required: true },
  date:      { type: Date,           default: Date.now }
}, {
  timestamps: true
});

module.exports = model('Progress', progressSchema);
  const mongoose = require('mongoose');

  const translationSchema = new mongoose.Schema({
    fr: { type: String, required: true },
    en: { type: String, required: true },
    ar: { type: String, required: true }
  }, { _id: false });

  module.exports = translationSchema;const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  exercise: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exercise', 
    required: true,
    index: true
  },
  xp: { 
    type: Number, 
    default: 0,
    min: 0
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  lastAttempt: Date
}, { 
  timestamps: true,
  // Clé composée unique
  unique: 'user_exercise_unique' 
});

// Méthode atomique sans transaction
userProgressSchema.statics.addXp = async function(userId, exerciseId, xp) {
  const filter = { user: userId, exercise: exerciseId };
  const update = { 
    $inc: { xp },
    $set: { lastAttempt: new Date(), completed: true }
  };
  const options = { 
    upsert: true, 
    new: true, 
    setDefaultsOnInsert: true 
  };
  
  return this.findOneAndUpdate(filter, update, options);
};

module.exports = mongoose.model('UserProgress', userProgressSchema);// models/VerificationToken.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const verificationTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  token:   { type: String, required: true },
  expires: { type: Date, default: () => Date.now() + 3600 * 1000 } // 1h
});

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
const express = require('express');
const router = express.Router();
const { 
  CourseController, 
  languageMiddleware
} = require('../controllers/CourseController');

// Middleware global
router.use(languageMiddleware);

// Validation des ID
const validateId = (param, location = 'params') => (req, res, next) => {
  const id = req[location][param];
  if (!id || !require('mongoose').isValidObjectId(id)) {
    return res.status(400).json({ 
      error: `Format d'ID invalide pour ${param}` 
    });
  }
  next();
};

// Middleware pour gérer les erreurs asynchrones
const catchErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes pour les catégories
router.post('/categories', CourseController.createCategory);
router.get('/categories', CourseController.getAllCategories);
router.get('/categories/:id', validateId('id'), CourseController.getCategory);
router.put('/categories/:id', validateId('id'), CourseController.updateCategory);
router.delete('/categories/:id', validateId('id'), CourseController.deleteCategory);

// Routes pour les parcours
router.post('/paths', CourseController.createPath);
router.get('/paths', CourseController.getAllPaths);
router.get('/paths/:id', validateId('id'), CourseController.getPath);
router.put('/paths/:id', validateId('id'), CourseController.updatePath);
router.delete('/paths/:id', validateId('id'), CourseController.deletePath);
router.get('/categories/:categoryId/paths', 
  validateId('categoryId'), 
  CourseController.getPathsByCategory
);

// Routes pour les niveaux
router.post('/levels', CourseController.createLevel);
router.get('/paths/:id/levels', validateId('id'), CourseController.getLevelsByPath);
router.get('/levels/:id', validateId('id'), CourseController.getLevelContent);
router.put('/levels/:id', validateId('id'), CourseController.updateLevel);
router.delete('/levels/:id', validateId('id'), CourseController.deleteLevel);

// Routes pour les exercices
router.post('/exercises', CourseController.createExercise);
router.get('/exercises/:id', validateId('id'), CourseController.getExercise);
router.put('/exercises/:id', validateId('id'), CourseController.updateExercise);
router.post('/exercises/:id/submit', validateId('id'), CourseController.submitExercise);

// Routes pour les médias
router.post('/levels/:levelId/video',
  validateId('levelId'),
  (req, res, next) => {
    const upload = CourseController.uploadVideo;
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  catchErrors(CourseController.saveVideoPath)
);

router.get('/videos/:levelId', 
  validateId('levelId'), 
  catchErrors(CourseController.streamVideo)
);

// Gestion centralisée des erreurs
router.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ 
    error: err.message || 'Erreur interne du serveur' 
  });
});
// routes/courseRoutes.js
const cors = require('cors');

// Configuration CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
  optionsSuccessStatus: 204
};

// Appliquer avant les routes
router.use(cors(corsOptions));
module.exports = router;require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Firebase Singleton
const FirebaseAdmin = require('./utils/firebaseSingleton');
const admin = FirebaseAdmin.getInstance();

const app = express();

// Middleware
app.use(cors({
 origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'x-requested-with','Pragma', 'Expires'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Connexion MongoDB avec reconnexion
const connectToMongoDB = async () => {
  const MAX_ATTEMPTS = 5;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const mongoUri = process.env.MONGO_URI.replace('localhost', '127.0.0.1');
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected successfully');
      return true;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error.message);
      
      if (attempt < MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  
  return false;
};

// Middleware de diagnostic
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialisation du serveur
const startServer = async () => {
  try {
    // Connexion MongoDB
    if (!await connectToMongoDB()) {
      throw new Error('Failed to connect to MongoDB');
    }

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/courses', courseRoutes);
    
    // Service statique des vidéos
    app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads', 'videos'), {
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.mp4': 'video/mp4',
          '.mov': 'video/quicktime',
          '.avi': 'video/x-msvideo',
          '.mkv': 'video/x-matroska'
        };
        if (mimeTypes[ext]) res.setHeader('Content-Type', mimeTypes[ext]);
      }
    }));

    // Route de santé
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        services: {
          database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          firebase: admin.apps.length > 0 ? 'connected' : 'disabled',
        },
        uptime: process.uptime().toFixed(2) + 's'
      });
    });

    // Gestion des erreurs centralisée
    app.use((err, req, res, next) => {
      console.error(`🔥 [${new Date().toISOString()}] Error: ${err.message}`);
      
      if (res.headersSent) {
        return next(err);
      }

      const status = err.status || 500;
      res.status(status).json({
        status: 'error',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });

    // Démarrer le serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
        🚀 Server running on port ${PORT}
        📚 Environment: ${process.env.NODE_ENV || 'development'}
        🔗 Health Check: http://localhost:${PORT}/health
      `);
    });
    
  } catch (error) {
    console.error('⛔ Failed to start server:', error);
    process.exit(1);
  }
};

// Démarrer l'application
startServer();const logger = require('../config/logger');

exports.languageMiddleware = (req, res, next) => {
  const acceptedLangs = ['fr', 'en', 'ar'];
  req.language = 
    req.query.lang || 
    req.headers['accept-language']?.split(',')[0]?.substring(0, 2) || 
    'fr';
  
  if (!acceptedLangs.includes(req.language)) {
    req.language = 'fr';
  }
  
  logger.debug(`Language detected: ${req.language}`);
  next();
};

// Middleware de validation des ObjectId
exports.validateObjectId = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

// Middleware de validation des traductions
exports.validateTranslations = (field) => (req, res, next) => {
  const translations = req.body[field];
  
  if (!translations || 
      typeof translations.fr !== 'string' || 
      typeof translations.en !== 'string' || 
      typeof translations.ar !== 'string') {
    return res.status(400).json({ 
      error: 'Translations must include fr, en and ar as strings' 
    });
  }
  
  next();
};const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Créer le dossier s'il n'existe pas
const uploadDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `video-${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = ['.mp4', '.mov', '.avi', '.webm'];
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté'), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
}).single('video');const supportedLanguages = ['fr', 'en', 'ar'];

module.exports = (req, res, next) => {
  // 1. Vérifier le paramètre de requête
  if (req.query.lang && supportedLanguages.includes(req.query.lang)) {
    req.language = req.query.lang;
    return next();
  }

  // 2. Vérifier le header Accept-Language
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',')
      .map(lang => lang.split(';')[0].trim().substring(0, 2));
    
    for (const lang of languages) {
      if (supportedLanguages.includes(lang)) {
        req.language = lang;
        return next();
      }
    }
  }

  // 3. Vérifier les cookies
  if (req.cookies?.language && supportedLanguages.includes(req.cookies.language)) {
    req.language = req.cookies.language;
    return next();
  }

  // 4. Défaut : français
  req.language = 'fr';
  next();
};