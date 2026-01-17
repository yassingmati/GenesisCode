

// =========================
// FILE: controllers/CourseController.js
// =========================

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');

const { Types: { ObjectId } } = mongoose;
const isValidObjectId = mongoose.isValidObjectId;

// Models
const Category = require('../models/Category');
const Path = require('../models/Path');
const Level = require('../models/Level');
const Exercise = require('../models/Exercise');
const UserProgress = require('../models/UserProgress');
const UserLevelProgress = require('../models/UserLevelProgress');

// Services
const ExerciseService = require('../services/exerciseService');

// GridFS
const gridfsStorage = require('../config/gridfs');

/* ============================
   Helpers / utilities
   ============================ */

const catchErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const languageMiddleware = (req, res, next) => {
  req.language = req.acceptsLanguages(['fr', 'en', 'ar']) || 'fr';
  next();
};

const getLang = req => req.language || 'fr';

const getTranslation = (doc, lang) => {
  if (!doc) return null;
  const translations = doc.translations || (doc.toObject && doc.toObject().translations) || null;
  if (!translations) return null;
  return translations[lang] || translations.fr || null;
};

const validateTranslations = translations => {
  const required = ['fr', 'en', 'ar'];
  const missing = required.filter(lang => !translations || !translations[lang]);
  if (missing.length) {
    const err = new Error(`Traductions manquantes: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
};

const allowedLangs = new Set(['fr', 'en', 'ar']);
const isAllowedLang = l => allowedLangs.has(String(l));

/* Uploads paths */
const uploadsBaseDir = path.resolve(__dirname, '..', 'uploads'); // /.../uploads
const relUploadsPrefix = '/uploads/'; // utilisé pour construire chemins accessibles

const resolveRelPath = (subPath) => `${relUploadsPrefix}${subPath.replace(/^\/+/, '')}`; // ex: /uploads/videos/...
const resolveAbsFromRel = rel => {
  // Normaliser les backslashes Windows en slashes
  const normalized = rel.replace(/\\/g, '/');
  // Enlever le slash initial si présent
  const clean = normalized.replace(/^\//, '');
  return path.resolve(__dirname, '..', clean);
};

// only unlink files inside our uploads directory to avoid path traversal mistakes
const safeUnlink = async (relPath) => {
  if (!relPath) return;
  try {
    const abs = resolveAbsFromRel(relPath);
    if (!abs.startsWith(uploadsBaseDir)) {
      // do not delete paths outside uploads folder
      return;
    }
    await fsp.unlink(abs).catch(() => { });
  } catch (e) {
    // swallow errors, deletion is best-effort
  }
};

const deleteGridFSFile = async (filename) => {
  if (!filename) return;
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const file = await bucket.find({ filename }).next();
    if (file) {
      await bucket.delete(file._id);
    }
  } catch (err) {
    console.error('Error deleting GridFS file:', err);
  }
};

/* Validate Exercise (logique mise à jour) */
const validateExercise = (ex, partial = false) => {
  const types = [
    // Types existants
    'QCM', 'DragDrop', 'TextInput', 'Code', 'OrderBlocks', 'FillInTheBlank', 'SpotTheError', 'Matching',
    // Nouveaux types pour algorithmes et programmation
    'Algorithm', 'FlowChart', 'Trace', 'Debug', 'CodeCompletion', 'PseudoCode', 'Complexity',
    'DataStructure', 'ScratchBlocks', 'VisualProgramming', 'AlgorithmSteps', 'ConceptMapping',
    'CodeOutput', 'Optimization', 'Scratch', 'WebProject'
  ];

  if (!partial || ('type' in ex)) {
    if (!ex.type || !types.includes(ex.type)) {
      const err = new Error(`Type invalide: ${ex.type}`);
      err.status = 400;
      throw err;
    }
  }

  const type = ex.type;

  if (!partial) {
    if (!ex.translations) {
      const err = new Error('translations requis pour l\'exercice');
      err.status = 400;
      throw err;
    }
    if (!ex.level || !isValidObjectId(ex.level)) {
      const err = new Error('level invalide ou manquant');
      err.status = 400;
      throw err;
    }
  }

  // Validation des traductions
  if (!partial && ex.translations) {
    const requiredLangs = ['fr', 'en', 'ar'];
    for (const lang of requiredLangs) {
      if (!ex.translations[lang] || !ex.translations[lang].question) {
        const err = new Error(`Question manquante pour la langue ${lang}`);
        err.status = 400;
        throw err;
      }
    }
  }

  // If type is not provided (partial update), skip type-specific validation
  if (!type) return;

  switch (type) {
    case 'QCM':
      if ((!partial || 'options' in ex) && (!Array.isArray(ex.options) || ex.options.length < 2)) {
        const err = new Error('QCM nécessite au moins 2 options');
        err.status = 400;
        throw err;
      }
      if (!partial && (!Array.isArray(ex.solutions) || ex.solutions.length === 0)) {
        const err = new Error('QCM nécessite au moins une solution');
        err.status = 400;
        throw err;
      }
      // Validation des solutions QCM
      if (!partial && ex.solutions) {
        const maxIndex = (ex.options?.length || 0) - 1;
        for (const solution of ex.solutions) {
          if (!Number.isInteger(solution) || solution < 0 || solution > maxIndex) {
            const err = new Error(`Solution QCM invalide: ${solution}. Doit être un indice valide (0-${maxIndex})`);
            err.status = 400;
            throw err;
          }
        }
      }
      break;
    case 'DragDrop':
      if ((!partial || 'elements' in ex || 'targets' in ex) && (!Array.isArray(ex.elements) || !Array.isArray(ex.targets))) {
        const err = new Error('DragDrop nécessite des éléments et cibles sous forme de tableaux');
        err.status = 400;
        throw err;
      }
      if (!partial && (!Array.isArray(ex.solutions) || ex.solutions.length === 0)) {
        const err = new Error('DragDrop nécessite des solutions');
        err.status = 400;
        throw err;
      }
      break;
    case 'Code':
      if ((!partial || 'testCases' in ex) && (!Array.isArray(ex.testCases) || ex.testCases.length === 0)) {
        const err = new Error('Code nécessite au moins un test case');
        err.status = 400;
        throw err;
      }
      // Validation des test cases
      if (!partial && ex.testCases) {
        for (const testCase of ex.testCases) {
          if (testCase.input === undefined || testCase.input === null ||
            testCase.expected === undefined || testCase.expected === null) {
            const err = new Error('Chaque test case doit avoir un input et un expected');
            err.status = 400;
            throw err;
          }
        }
      }
      break;
    case 'OrderBlocks':
      if ((!partial || 'blocks' in ex) && (!Array.isArray(ex.blocks) || ex.blocks.length < 2)) {
        const err = new Error('OrderBlocks nécessite au moins 2 blocs de code');
        err.status = 400;
        throw err;
      }
      if (!partial && (!Array.isArray(ex.solutions) || ex.solutions.length === 0)) {
        const err = new Error('OrderBlocks nécessite des solutions');
        err.status = 400;
        throw err;
      }
      // Validation des blocs
      if (!partial && ex.blocks) {
        for (const block of ex.blocks) {
          if (!block.id || !block.code) {
            const err = new Error('Chaque bloc doit avoir un id et du code');
            err.status = 400;
            throw err;
          }
        }
      }
      break;
    case 'FillInTheBlank':
    case 'SpotTheError':
      if ((!partial || 'codeSnippet' in ex) && typeof ex.codeSnippet !== 'string') {
        const err = new Error(`${type} nécessite un codeSnippet (chaîne de caractères)`);
        err.status = 400;
        throw err;
      }
      if (!partial && (!Array.isArray(ex.solutions) || ex.solutions.length === 0)) {
        const err = new Error(`${type} nécessite des solutions`);
        err.status = 400;
        throw err;
      }
      break;
    case 'TextInput':
      if (!partial && (!Array.isArray(ex.solutions) || ex.solutions.length === 0)) {
        const err = new Error('TextInput nécessite des solutions');
        err.status = 400;
        throw err;
      }
      break;
    case 'Matching':
      if ((!partial || 'prompts' in ex || 'matches' in ex) && (!Array.isArray(ex.prompts) || !Array.isArray(ex.matches) || ex.prompts.length === 0 || ex.matches.length === 0)) {
        const err = new Error('Matching nécessite des tableaux non vides pour prompts et matches');
        err.status = 400;
        throw err;
      }
      if (!partial && (!Array.isArray(ex.solutions) || ex.solutions.length === 0)) {
        const err = new Error('Matching nécessite des solutions');
        err.status = 400;
        throw err;
      }
      // Validation des prompts et matches
      if (!partial && ex.prompts) {
        for (const prompt of ex.prompts) {
          if (!prompt.id || !prompt.content) {
            const err = new Error('Chaque prompt doit avoir un id et un contenu');
            err.status = 400;
            throw err;
          }
        }
      }
      if (!partial && ex.matches) {
        for (const match of ex.matches) {
          if (!match.id || !match.content) {
            const err = new Error('Chaque match doit avoir un id et un contenu');
            err.status = 400;
            throw err;
          }
        }
      }
      break;

    // Nouveaux types d'exercices
    case 'Algorithm':
    case 'AlgorithmSteps':
      if ((!partial || 'algorithmSteps' in ex) && (!Array.isArray(ex.algorithmSteps) || ex.algorithmSteps.length === 0)) {
        const err = new Error('Algorithm/AlgorithmSteps nécessite des étapes d\'algorithme');
        err.status = 400;
        throw err;
      }
      break;

    case 'FlowChart':
      if ((!partial || 'flowChartNodes' in ex) && (!Array.isArray(ex.flowChartNodes) || ex.flowChartNodes.length === 0)) {
        const err = new Error('FlowChart nécessite des nœuds d\'organigramme');
        err.status = 400;
        throw err;
      }
      break;
    case 'WebProject':
      if ((!partial || 'files' in ex) && (!Array.isArray(ex.files))) {
        const err = new Error('WebProject nécessite des fichiers (files) sous forme de tableau');
        err.status = 400;
        throw err;
      }
      // Optional: Check solutionImage format if present
      if ((!partial || 'solutionImage' in ex) && ex.solutionImage && typeof ex.solutionImage !== 'string') {
        const err = new Error('WebProject solutionImage doit être une URL (chaîne)');
        err.status = 400;
        throw err;
      }
      break;

    case 'Trace':
      if ((!partial || 'traceVariables' in ex) && (!Array.isArray(ex.traceVariables) || ex.traceVariables.length === 0)) {
        const err = new Error('Trace nécessite des variables à tracer');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'codeSnippet' in ex) && typeof ex.codeSnippet !== 'string') {
        const err = new Error('Trace nécessite un code à tracer');
        err.status = 400;
        throw err;
      }
      break;

    case 'Debug':
      if ((!partial || 'debugErrors' in ex) && (!Array.isArray(ex.debugErrors) || ex.debugErrors.length === 0)) {
        const err = new Error('Debug nécessite des erreurs à identifier');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'codeSnippet' in ex) && typeof ex.codeSnippet !== 'string') {
        const err = new Error('Debug nécessite un code avec erreurs');
        err.status = 400;
        throw err;
      }
      break;

    case 'CodeCompletion':
      if ((!partial || 'codeTemplate' in ex) && typeof ex.codeTemplate !== 'string') {
        const err = new Error('CodeCompletion nécessite un template de code');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'codeGaps' in ex) && (!Array.isArray(ex.codeGaps) || ex.codeGaps.length === 0)) {
        const err = new Error('CodeCompletion nécessite des emplacements à compléter');
        err.status = 400;
        throw err;
      }
      break;

    case 'PseudoCode':
      if ((!partial || 'pseudoCodeStructure' in ex) && !ex.pseudoCodeStructure) {
        const err = new Error('PseudoCode nécessite une structure attendue');
        err.status = 400;
        throw err;
      }
      break;

    case 'Complexity':
      if ((!partial || 'complexityAnalysis' in ex) && !ex.complexityAnalysis) {
        const err = new Error('Complexity nécessite une analyse de complexité');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'codeSnippet' in ex) && typeof ex.codeSnippet !== 'string') {
        const err = new Error('Complexity nécessite un code à analyser');
        err.status = 400;
        throw err;
      }
      break;

    case 'DataStructure':
      if ((!partial || 'dataStructureType' in ex) && typeof ex.dataStructureType !== 'string') {
        const err = new Error('DataStructure nécessite un type de structure');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'dataStructureOperations' in ex) && (!Array.isArray(ex.dataStructureOperations) || ex.dataStructureOperations.length === 0)) {
        const err = new Error('DataStructure nécessite des opérations');
        err.status = 400;
        throw err;
      }
      break;

    case 'ScratchBlocks':
      if ((!partial || 'scratchBlocks' in ex) && (!Array.isArray(ex.scratchBlocks) || ex.scratchBlocks.length === 0)) {
        const err = new Error('ScratchBlocks nécessite des blocs Scratch');
        err.status = 400;
        throw err;
      }
      break;

    case 'VisualProgramming':
      if ((!partial || 'visualElements' in ex) && (!Array.isArray(ex.visualElements) || ex.visualElements.length === 0)) {
        const err = new Error('VisualProgramming nécessite des éléments visuels');
        err.status = 400;
        throw err;
      }
      break;

    case 'ConceptMapping':
      if ((!partial || 'concepts' in ex) && (!Array.isArray(ex.concepts) || ex.concepts.length === 0)) {
        const err = new Error('ConceptMapping nécessite des concepts');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'definitions' in ex) && (!Array.isArray(ex.definitions) || ex.definitions.length === 0)) {
        const err = new Error('ConceptMapping nécessite des définitions');
        err.status = 400;
        throw err;
      }
      break;

    case 'CodeOutput':
      if ((!partial || 'codeSnippet' in ex) && typeof ex.codeSnippet !== 'string') {
        const err = new Error('CodeOutput nécessite un code');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'expectedOutput' in ex) && !ex.expectedOutput) {
        const err = new Error('CodeOutput nécessite une sortie attendue');
        err.status = 400;
        throw err;
      }
      break;

    case 'Optimization':
      if ((!partial || 'codeSnippet' in ex) && typeof ex.codeSnippet !== 'string') {
        const err = new Error('Optimization nécessite un code à optimiser');
        err.status = 400;
        throw err;
      }
      if ((!partial || 'optimizationCriteria' in ex) && (!Array.isArray(ex.optimizationCriteria) || ex.optimizationCriteria.length === 0)) {
        const err = new Error('Optimization nécessite des critères d\'optimisation');
        err.status = 400;
        throw err;
      }
      break;
  }
};

/* ============================
   Multer (configurable pour subdir)
   ============================ */
const defaultVideoExt = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
const pdfExt = ['.pdf'];

const configureMulter = (opts = {}) => {
  const allowedExt = opts.allowedExt || defaultVideoExt;
  const maxSize = opts.maxSize || (500 * 1024 * 1024);

  return multer({
    storage: gridfsStorage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExt.includes(ext)) {
        return cb(new Error(`Formats autorisés: ${allowedExt.join(', ')}`));
      }
      cb(null, true);
    }
  });
};

/* middlewares multer */
const uploadVideoMiddleware = (req, res, next) => {
  const upload = configureMulter({ allowedExt: defaultVideoExt, maxSize: 500 * 1024 * 1024, subdir: 'videos' }).single('video');
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

const uploadPDFMiddleware = (req, res, next) => {
  const upload = configureMulter({ allowedExt: pdfExt, maxSize: 50 * 1024 * 1024, subdir: 'pdfs' }).single('pdf');
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

const uploadImageMiddleware = (req, res, next) => {
  const imageExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const upload = configureMulter({ allowedExt: imageExt, maxSize: 10 * 1024 * 1024, subdir: 'images' }).single('image');
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
};

/* ============================
   Controller class
   ============================ */
class CourseController {
  static uploadVideoMiddleware = uploadVideoMiddleware;
  static uploadPDFMiddleware = uploadPDFMiddleware;
  static uploadImageMiddleware = uploadImageMiddleware;
  /* -----------------------
      Catalog (Categories -> Paths -> Levels -> Exercises)
      ----------------------- */
  static getCatalog = catchErrors(async (req, res) => {
    const lang = getLang(req);

    // Fetch all categories (both classic and specific)
    const categories = await Category.find({}).sort({ type: 1, order: 1, createdAt: -1 }).lean();

    const categoryIds = categories.map(c => c._id);
    const paths = await Path.find({ category: { $in: categoryIds } })
      .sort({ order: 1 })
      .lean();

    const pathIds = paths.map(p => p._id);
    const levels = await Level.find({ path: { $in: pathIds } })
      .sort({ order: 1 })
      .lean();

    const levelIds = levels.map(l => l._id);
    const exercises = await Exercise.find({ level: { $in: levelIds } })
      .select('_id level translations type points difficulty')
      .lean();

    // Group exercises by level
    const exByLevel = exercises.reduce((acc, ex) => {
      const key = String(ex.level);
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        _id: ex._id,
        name: (ex.translations?.[lang]?.name) || (ex.translations?.fr?.name) || null,
        type: ex.type,
        points: ex.points || 10,
        difficulty: ex.difficulty || 'medium'
      });
      return acc;
    }, {});

    // Group levels by path
    const levelsByPath = levels.reduce((acc, lvl) => {
      const key = String(lvl.path);
      if (!acc[key]) acc[key] = [];
      const tr = (lvl.translations && (lvl.translations[lang] || lvl.translations.fr)) || {};
      acc[key].push({
        _id: lvl._id,
        title: tr.title || null,
        content: tr.content || null,
        order: lvl.order || 0,
        videos: lvl.videos || {},
        pdfs: lvl.pdfs || {},
        exercises: exByLevel[String(lvl._id)] || []
      });
      return acc;
    }, {});

    // Group paths by category
    const pathsByCategory = paths.reduce((acc, p) => {
      const key = String(p.category);
      if (!acc[key]) acc[key] = [];
      const tr = (p.translations && (p.translations[lang] || p.translations.fr)) || {};
      acc[key].push({
        _id: p._id,
        name: tr.name || null,
        description: tr.description || '',
        order: p.order || 0,
        levels: (levelsByPath[String(p._id)] || []).sort((a, b) => (a.order || 0) - (b.order || 0))
      });
      return acc;
    }, {});

    // Build response
    const result = categories.map(c => {
      const ctr = (c.translations && (c.translations[lang] || c.translations.fr)) || {};
      return {
        _id: c._id,
        type: c.type,
        name: ctr.name || null,
        order: c.order || 0,
        paths: (pathsByCategory[String(c._id)] || []).sort((a, b) => (a.order || 0) - (b.order || 0))
      };
    });

    res.json(result);
  });
  /* -----------------------
      Categories
      ----------------------- */
  static createCategory = catchErrors(async (req, res) => {
    validateTranslations(req.body.translations);
    // Forcer une valeur par défaut si non fournie
    if (!req.body.type) req.body.type = 'classic';
    if (!['classic', 'specific'].includes(req.body.type)) {
      return res.status(400).json({ error: 'Type de catégorie invalide (classic|specific)' });
    }
    const category = await Category.create(req.body);
    res.status(201).json(category);
  });

  static getAllCategories = catchErrors(async (req, res) => {
    const { type } = req.query || {};
    // Si type n'est pas spécifié, retourner toutes les catégories (classic et specific)
    const query = type ? { type } : {};
    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });
    res.json(categories);
  });

  static getCategory = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(category);
  });

  static updateCategory = catchErrors(async (req, res) => {
    if (req.body.translations) validateTranslations(req.body.translations);
    if (req.body.type && !['classic', 'specific'].includes(req.body.type)) {
      return res.status(400).json({ error: 'Type de catégorie invalide (classic|specific)' });
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(category);
  });

  static deleteCategory = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });

    const paths = await Path.find({ category: category._id }).select('_id').lean();
    const pathIds = paths.map(p => p._id);

    const levels = await Level.find({ path: { $in: pathIds } }).select('videos pdfs').lean();
    const levelIds = levels.map(l => l._id);

    for (const lvl of levels) {
      if (lvl.videos) await Promise.all(Object.values(lvl.videos || {}).map(v => safeUnlink(v)));
      if (lvl.pdfs) await Promise.all(Object.values(lvl.pdfs || {}).map(pf => safeUnlink(pf)));
    }

    if (levelIds.length) await Exercise.deleteMany({ level: { $in: levelIds } });
    if (pathIds.length) {
      await Level.deleteMany({ path: { $in: pathIds } });
      await Path.deleteMany({ _id: { $in: pathIds } });
    }
    await Category.findByIdAndDelete(category._id);

    res.json({ message: 'Catégorie et contenu associé supprimés' });
  });

  /* -----------------------
      Paths
      ----------------------- */
  static createPath = catchErrors(async (req, res) => {
    validateTranslations(req.body.translations);
    if (!isValidObjectId(req.body.category)) return res.status(400).json({ error: 'ID de catégorie invalide' });
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });
    const newPath = await Path.create(req.body);
    res.status(201).json(newPath);
  });

  static getAllPaths = catchErrors(async (req, res) => {
    const lang = getLang(req);
    const paths = await Path.find().populate('category', 'translations').sort({ order: 1 });
    const result = paths.map(p => ({
      _id: p._id,
      translations: p.translations,
      name: getTranslation(p, lang)?.name || getTranslation(p, 'fr')?.name || null,
      category: {
        _id: p.category?._id,
        name: getTranslation(p.category, lang)?.name || getTranslation(p.category, 'fr')?.name || null
      },
      order: p.order
    }));
    res.json(result);
  });

  static getPath = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const lang = getLang(req);
    const p = await Path.findById(req.params.id).populate('category', 'translations');
    if (!p) return res.status(404).json({ error: 'Parcours non trouvé' });
    res.json({
      _id: p._id,
      translations: p.translations,
      name: getTranslation(p, lang)?.name || getTranslation(p, 'fr')?.name,
      category: {
        _id: p.category._id,
        name: getTranslation(p.category, lang)?.name || getTranslation(p.category, 'fr')?.name
      },
      order: p.order
    });
  });

  static updatePath = catchErrors(async (req, res) => {
    if (req.body.translations) validateTranslations(req.body.translations);
    const updatedPath = await Path.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPath) return res.status(404).json({ error: 'Parcours non trouvé' });
    res.json(updatedPath);
  });

  static deletePath = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const p = await Path.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Parcours non trouvé' });

    const levels = await Level.find({ path: p._id }).select('videos pdfs').lean();
    const levelIds = levels.map(l => l._id);

    for (const lvl of levels) {
      if (lvl.videos) await Promise.all(Object.values(lvl.videos).map(v => safeUnlink(v)));
      if (lvl.pdfs) await Promise.all(Object.values(lvl.pdfs).map(pf => safeUnlink(pf)));
    }

    if (levelIds.length) await Exercise.deleteMany({ level: { $in: levelIds } });
    await Level.deleteMany({ path: p._id });
    await Path.findByIdAndDelete(p._id);

    res.json({ message: 'Parcours supprimé' });
  });

  static getPathsByCategory = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.categoryId)) return res.status(400).json({ error: 'ID de catégorie invalide' });
    const lang = getLang(req);
    const paths = await Path.find({ category: req.params.categoryId }).sort('order');
    const result = paths.map(p => ({
      _id: p._id,
      translations: p.translations,
      name: getTranslation(p, lang)?.name || getTranslation(p, 'fr')?.name || null,
      order: p.order
    }));
    res.json(result);
  });

  /* -----------------------
      Levels
      ----------------------- */
  static createLevel = catchErrors(async (req, res) => {
    validateTranslations(req.body.translations);
    if (!isValidObjectId(req.body.path)) return res.status(400).json({ error: 'ID de parcours invalide' });
    const pathDoc = await Path.findById(req.body.path);
    if (!pathDoc) return res.status(404).json({ error: 'Parcours non trouvé' });

    const payload = {
      ...req.body,
      videos: req.body.videos || {},
      pdfs: req.body.pdfs || {}
    };

    const level = await Level.create(payload);
    await Path.findByIdAndUpdate(req.body.path, { $push: { levels: level._id } }).catch(() => { });
    res.status(201).json(level);
  });

  static getLevelsByPath = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const lang = getLang(req);
    const levels = await Level.find({ path: req.params.id }).sort('order').lean();
    const result = levels.map(lvl => ({
      _id: lvl._id,
      translations: lvl.translations,
      title: getTranslation(lvl, lang)?.title || getTranslation(lvl, 'fr')?.title,
      order: lvl.order,
      videos: lvl.videos || {},
      pdfs: lvl.pdfs || {}
    }));
    res.json(result);
  });

  static getLevelContent = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const lang = getLang(req);

    console.log(`[getLevelContent] Récupération du niveau ${req.params.id} avec exercices depuis MongoDB Atlas...`);

    const level = await Level.findById(req.params.id)
      .populate({
        path: 'exercises',
        select: '-solutions' // Garder testCases mais cacher solutions
      })
      .lean();

    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    console.log(`[getLevelContent] Niveau trouvé: ${level.translations?.fr?.title || 'Sans titre'}, ${level.exercises?.length || 0} exercice(s) chargé(s) depuis MongoDB Atlas`);

    const translation = getTranslation(level, lang) || getTranslation(level, 'fr') || {};
    const exercises = (level.exercises || []).map(ex => {
      const exTrans = getTranslation(ex, lang) || getTranslation(ex, 'fr') || {};

      // Créer l'objet exercice avec toutes les informations nécessaires
      const exerciseData = {
        _id: ex._id,
        translations: ex.translations,
        name: exTrans?.name || null,
        question: exTrans?.question || null,
        explanation: exTrans?.explanation || null,
        type: ex.type,
        points: ex.points || 10,
        difficulty: ex.difficulty || 'medium',
        timeLimit: ex.timeLimit,
        attemptsAllowed: ex.attemptsAllowed,
        hint: ex.hint,
        showSolutionAfterAttempts: ex.showSolutionAfterAttempts,
        shuffle: ex.shuffle,
        allowPartial: ex.allowPartial,
        options: ex.options || [],
        elements: ex.elements || [],
        targets: ex.targets || [],
        blocks: ex.blocks || [],
        codeSnippet: ex.codeSnippet,
        language: ex.language,
        prompts: ex.prompts || [],
        matches: ex.matches || [],
        // New fields for advanced exercises
        scratchBlocks: ex.scratchBlocks || [],
        initialXml: ex.initialXml,
        algorithmSteps: ex.algorithmSteps || [],
        codeGaps: ex.codeGaps || [],
        codeTemplate: ex.codeTemplate,
        pseudoCodeStructure: ex.pseudoCodeStructure,
        complexityAnalysis: ex.complexityAnalysis,
        expectedOutput: ex.expectedOutput,
        optimizationCriteria: ex.optimizationCriteria || [],
        traceVariables: ex.traceVariables || [],
        debugErrors: ex.debugErrors || [],
        flowChartNodes: ex.flowChartNodes || [],
        dataStructureType: ex.dataStructureType,
        dataStructureOperations: ex.dataStructureOperations || [],
        visualElements: ex.visualElements || [],
        concepts: ex.concepts || [],

        definitions: ex.definitions || [],
        // WebProject specific
        files: ex.files || [],
        validationRules: ex.validationRules || []
      };

      // Ajouter testCases mais filtrer les informations sensibles
      if (ex.testCases && ex.testCases.length > 0) {
        exerciseData.testCases = ex.testCases.map(tc => ({
          input: tc.input,
          expected: tc.expected,
          points: tc.points,
          public: tc.public || false
        }));
      }

      return exerciseData;
    });

    res.json({
      _id: level._id,
      translations: level.translations,
      title: translation?.title,
      content: translation?.content,
      pdf: level.pdfs?.[lang] || null,
      exercises,
      videos: level.videos || {},
      pdfs: level.pdfs || {},
      path: level.path
    });
  });

  static updateLevel = catchErrors(async (req, res) => {
    if (req.body.translations) validateTranslations(req.body.translations);
    const updatedLevel = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedLevel) return res.status(404).json({ error: 'Niveau non trouvé' });
    res.json(updatedLevel);
  });

  static deleteLevel = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });

    const level = await Level.findById(req.params.id).select('videos pdfs path').lean();
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    await Exercise.deleteMany({ level: req.params.id });

    if (level.videos) await Promise.all(Object.values(level.videos).map(v => safeUnlink(v)));
    if (level.pdfs) await Promise.all(Object.values(level.pdfs).map(pf => safeUnlink(pf)));

    await Path.updateOne({ levels: req.params.id }, { $pull: { levels: req.params.id } }).catch(() => { });
    await Level.findByIdAndDelete(req.params.id);

    res.json({ message: 'Niveau supprimé' });
  });

  /* -----------------------
      Exercises
      ----------------------- */
  static createExercise = catchErrors(async (req, res) => {
    validateExercise(req.body, false);
    if (!isValidObjectId(req.body.level)) return res.status(400).json({ error: 'ID de niveau invalide' });
    const level = await Level.findById(req.body.level);
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    console.log(`[createExercise] Création d'un exercice pour le niveau ${req.body.level} dans MongoDB Atlas...`);
    const exercise = await Exercise.create(req.body);

    // S'assurer que l'exercice est ajouté au niveau dans MongoDB Atlas
    await Level.findByIdAndUpdate(req.body.level, {
      $addToSet: { exercises: exercise._id } // Utiliser $addToSet pour éviter les doublons
    });

    console.log(`[createExercise] Exercice ${exercise._id} créé et ajouté au niveau ${req.body.level} dans MongoDB Atlas`);
    res.status(201).json(exercise);
  });

  static getExercisesByLevel = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const lang = getLang(req);

    const level = await Level.findById(req.params.id).populate({
      path: 'exercises',
      select: '-solutions' // Garder testCases mais cacher solutions
    });

    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    const exercises = (level.exercises || []).map(ex => {
      const exTrans = getTranslation(ex, lang) || getTranslation(ex, 'fr') || {};

      // Créer l'objet exercice avec toutes les informations nécessaires
      const exerciseData = {
        _id: ex._id,
        translations: ex.translations,
        name: exTrans?.name || null,
        question: exTrans?.question || null,
        explanation: exTrans?.explanation || null,
        type: ex.type,
        points: ex.points || 10,
        difficulty: ex.difficulty || 'medium',
        timeLimit: ex.timeLimit,
        attemptsAllowed: ex.attemptsAllowed,
        hint: ex.hint,
        showSolutionAfterAttempts: ex.showSolutionAfterAttempts,
        shuffle: ex.shuffle,
        allowPartial: ex.allowPartial,
        options: ex.options || [],
        elements: ex.elements || [],
        targets: ex.targets || [],
        blocks: ex.blocks || [],
        codeSnippet: ex.codeSnippet,
        language: ex.language,
        prompts: ex.prompts || [],
        matches: ex.matches || []
      };

      // Ajouter testCases mais filtrer les informations sensibles
      if (ex.testCases && ex.testCases.length > 0) {
        exerciseData.testCases = ex.testCases.map(tc => ({
          input: tc.input,
          expected: tc.expected,
          points: tc.points,
          public: tc.public || false
        }));
      }

      return exerciseData;
    });

    res.json(exercises);
  });

  static getExercise = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercice non trouvé' });

    const lang = getLang(req);
    const translation = getTranslation(exercise, lang) || getTranslation(exercise, 'fr') || {};

    const result = {
      _id: exercise._id,
      translations: exercise.translations,
      name: translation?.name || null,
      question: translation?.question || null,
      explanation: translation?.explanation || null,
      type: exercise.type,
      points: exercise.points || 10,
      difficulty: exercise.difficulty || 'medium',
      timeLimit: exercise.timeLimit,
      attemptsAllowed: exercise.attemptsAllowed,
      hint: exercise.hint,
      showSolutionAfterAttempts: exercise.showSolutionAfterAttempts,
      shuffle: exercise.shuffle,
      allowPartial: exercise.allowPartial,
      options: exercise.options || [],
      elements: exercise.elements || [],
      targets: exercise.targets || [],
      blocks: exercise.blocks || [],
      codeSnippet: exercise.codeSnippet,
      language: exercise.language,
      prompts: exercise.prompts || [],
      matches: exercise.matches || [],
      level: exercise.level,
      // Added fields for WebProject and Scratch
      files: exercise.files || [],
      validationRules: exercise.validationRules || [],
      solutionImage: exercise.solutionImage,
      solutions: exercise.solutions || [],
      // Scratch / Code fields
      scratchBlocks: exercise.scratchBlocks || [],
      initialXml: exercise.initialXml,
      solutionXml: exercise.solutionXml, // If exists
      codeSnippet: exercise.codeSnippet,
      testCases: exercise.testCases || []
    };

    // Ajouter testCases mais filtrer les informations sensibles
    if (exercise.testCases && exercise.testCases.length > 0) {
      result.testCases = exercise.testCases.map(tc => ({
        input: tc.input,
        expected: tc.expected,
        points: tc.points,
        public: tc.public || false
      }));
    }

    res.json(result);
  });

  static updateExercise = catchErrors(async (req, res) => {
    validateExercise(req.body, true);
    const updatedExercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedExercise) return res.status(404).json({ error: 'Exercice non trouvé' });
    res.json(updatedExercise);
  });

  static deleteExercise = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercice non trouvé' });

    // remove from level.exercises
    await Level.findByIdAndUpdate(exercise.level, { $pull: { exercises: exercise._id } }).catch(() => { });
    await Exercise.findByIdAndDelete(exercise._id);

    res.status(204).end();
  });

  static validateExerciseDryRun = catchErrors(async (req, res) => {
    // Valider le corps de la requête comme un nouvel exercice
    validateExercise(req.body, false);
    res.json({ valid: true, message: 'Exercice valide' });
  });

  static duplicateExercise = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });

    const original = await Exercise.findById(req.params.id);
    if (!original) return res.status(404).json({ error: 'Exercice non trouvé' });

    const newExData = original.toObject();
    delete newExData._id;
    delete newExData.createdAt;
    delete newExData.updatedAt;
    delete newExData.__v;

    // Ajouter suffixe "(Copie)" au nom
    if (newExData.translations && newExData.translations.fr) {
      newExData.translations.fr.name = `${newExData.translations.fr.name} (Copie)`;
    }

    // Créer le nouvel exercice
    const newEx = await Exercise.create(newExData);

    // Lier au niveau
    await Level.findByIdAndUpdate(newEx.level, {
      $addToSet: { exercises: newEx._id }
    });

    res.status(201).json(newEx);
  });

  // important: here we mark user progress + when level completed mark UserLevelProgress
  static submitExercise = catchErrors(async (req, res) => {
    const exerciseId = req.params.id;

    // Validation de l'ID de l'exercice
    if (!isValidObjectId(exerciseId)) {
      console.warn('submitExercise: ID invalide', { exerciseId });
      return res.status(400).json({
        success: false,
        error: 'ID d\'exercice invalide',
        code: 'INVALID_EXERCISE_ID'
      });
    }

    // Récupérer l'exercice avec solutions
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      console.warn('submitExercise: Exercice non trouvé', { exerciseId });
      return res.status(404).json({
        success: false,
        error: 'Exercice non trouvé',
        code: 'EXERCISE_NOT_FOUND'
      });
    }

    const { answer, userId, passed, passedCount, totalCount, tests } = req.body;
    const type = exercise.type;

    // Validation de userId
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      console.warn('submitExercise: userId manquant ou invalide', { exerciseId, type, userId });
      return res.status(400).json({
        success: false,
        error: 'userId requis et doit être une chaîne non vide',
        code: 'INVALID_USER_ID'
      });
    }

    // Validation de la réponse avec le service
    const validation = ExerciseService.validateAnswer(exercise, answer, { passed, passedCount, totalCount, tests });
    if (!validation.valid) {
      console.warn('submitExercise: Validation échouée', { exerciseId, type, error: validation.error });
      return res.status(400).json({
        success: false,
        error: validation.error,
        code: 'INVALID_ANSWER'
      });
    }

    console.log('submitExercise: Soumission d\'exercice', {
      exerciseId,
      type,
      userId,
      hasAnswer: !!answer,
      hasSolutions: (exercise.solutions || []).length > 0
    });

    // Évaluer la réponse avec le service
    let evaluationResult;
    try {
      evaluationResult = await ExerciseService.evaluateAnswer(exercise, answer, {
        passed,
        passedCount,
        totalCount,
        tests
      });
    } catch (error) {
      console.error('submitExercise: Erreur d\'évaluation', {
        exerciseId,
        type,
        error: error.message,
        stack: error.stack
      });
      return res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de l\'évaluation de la réponse',
        code: 'EVALUATION_ERROR'
      });
    }

    const { isCorrect, pointsEarned, xp, details, feedback } = evaluationResult;

    // Enregistrer ou mettre à jour UserProgress avec la nouvelle méthode
    let updatedProgress = null;
    try {
      updatedProgress = await UserProgress.updateProgress(userId, exercise._id, {
        xp,
        pointsEarned,
        pointsMax: exercise.points || 10,
        completed: isCorrect,
        details
      });
      console.log('submitExercise: Progrès enregistré', {
        exerciseId,
        userId,
        pointsEarned,
        isCorrect
      });
    } catch (e) {
      console.error('submitExercise: Erreur sauvegarde progrès', {
        error: e.message,
        stack: e.stack,
        exerciseId,
        userId
      });
      // Ne pas retourner d'erreur ici, on continue quand même pour retourner le résultat
      // mais on log l'erreur pour debugging
    }


    // Initialise le debug des tâches
    let taskUpdateDebug = { executed: false, activeTasksFound: 0, tasksUpdated: 0, errors: [] };

    // Envoyer la réponse MAINTENANT pour une UX "Snappy"
    const explanation = (getTranslation(exercise, getLang(req)) || getTranslation(exercise, 'fr'))?.explanation || null;

    res.json({
      success: true,
      correct: isCorrect,
      pointsEarned,
      pointsMax: exercise.points || 10,
      xpEarned: xp,
      explanation,
      details,
      feedback: (() => {
        let finalFeedback = feedback || '';
        // Progressive Hint: Après 2 essais ratés, on montre l'indice si disponible
        if (!isCorrect && exercise.hint && updatedProgress && updatedProgress.attempts >= 2) {
          finalFeedback += `\n\n💡 Indice: ${exercise.hint}`;
        }
        return finalFeedback;
      })(),
      message: isCorrect ? 'Exercice complété avec succès!' : 'Exercice soumis, mais la réponse n\'est pas correcte.',
      ...(!isCorrect && { revealSolutions: false })
    });

    // Exécuter les mises à jour lourdes en arrière-plan (Fire-and-Forget)
    // Utiliser setImmediate pour laisser le temps à Express de flusher la réponse
    setImmediate(async () => {
      try {
        await CourseController.processBackgroundUpdates(userId, exercise, isCorrect, taskUpdateDebug);
      } catch (bgError) {
        console.error('Background Update Error:', bgError);
      }
    });
  });

  // Fonction helpers pour les mises à jour en arrière-plan (gamification, tâches, niveaux)
  static processBackgroundUpdates = async (userId, exercise, isCorrect, taskUpdateDebug) => {
    try {
      const AssignedTask = require('../models/AssignedTask');
      const Level = require('../models/Level');
      const UserProgress = require('../models/UserProgress');
      const UserLevelProgress = require('../models/UserLevelProgress');
      const mongoose = require('mongoose');
      const crypto = require('crypto');

      // Résolution de l'ID utilisateur
      let userObjectId;
      if (mongoose.isValidObjectId(userId)) {
        userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      } else {
        const User = require('../models/User');
        const user = await User.findOne({ firebaseUid: userId });
        if (user) {
          userObjectId = user._id;
        } else {
          const hash = crypto.createHash('md5').update(userId).digest('hex');
          userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
        }
      }

      /* ----------------------------------------------------
         1. Mise à jour des Tâches Assignées (Gamification)
         ---------------------------------------------------- */
      const now = new Date();
      const activeTasks = await AssignedTask.find({
        childId: userObjectId,
        status: { $in: ['active', 'pending'] },
        periodStart: { $lte: now },
        periodEnd: { $gte: now }
      });

      console.log(`[Background] Found ${activeTasks.length} active tasks for user ${userId}`);

      taskUpdateDebug.executed = true;
      taskUpdateDebug.activeTasksFound = activeTasks.length;

      for (const task of activeTasks) {
        try {
          // Optimisation: Utiliser countDocuments est lourd, mais nécessaire pour la précision.
          // TODO (Phase 2): Utiliser des compteurs incrémentaux ou Redis

          const exercisesSubmitted = await UserProgress.countDocuments({
            user: userObjectId,
            completed: true,
            completedAt: { $gte: task.periodStart, $lte: task.periodEnd }
          });

          const levelsCompleted = await UserLevelProgress.countDocuments({
            user: userObjectId,
            completed: true,
            completedAt: { $gte: task.periodStart, $lte: task.periodEnd }
          });

          // Calcul approximatif du temps (peut être optimisé)
          let hoursSpent = task.metricsCurrent?.hours_spent || 0;
          // ... (logique de calcul d'heures simplifiée ou à optimiser plus tard)

          task.metricsCurrent = {
            exercises_submitted: exercisesSubmitted,
            levels_completed: levelsCompleted,
            hours_spent: hoursSpent
          };

          // Vérification completion
          let isCompleted = true;
          if (task.metricsTarget.exercises_submitted > 0 && exercisesSubmitted < task.metricsTarget.exercises_submitted) isCompleted = false;
          if (task.metricsTarget.levels_completed > 0 && levelsCompleted < task.metricsTarget.levels_completed) isCompleted = false;

          if (isCompleted && task.status !== 'completed') {
            task.status = 'completed';
            task.completedAt = now;
          }

          await task.save();
          taskUpdateDebug.tasksUpdated++;
        } catch (taskError) {
          console.error(`[Background] Error updating task ${task._id}:`, taskError.message);
        }
      }

      /* ----------------------------------------------------
         2. Mise à jour Progression Niveau (Si exercice correct)
         ---------------------------------------------------- */
      if (isCorrect) {
        try {
          const level = await Level.findById(exercise.level).populate('exercises', '_id');
          if (level && level.exercises) {
            const exerciseIds = level.exercises.map(e => e._id);

            const completedExercisesCount = await UserProgress.countDocuments({
              user: userObjectId,
              exercise: { $in: exerciseIds },
              completed: true
            });

            if (exerciseIds.length > 0 && completedExercisesCount === exerciseIds.length) {
              await UserLevelProgress.findOneAndUpdate(
                { user: userObjectId, level: level._id },
                {
                  completed: true,
                  completedAt: new Date(),
                  $inc: { xp: 50 }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );

              // Service de déblocage
              const LevelUnlockService = require('../services/levelUnlockService');
              await LevelUnlockService.onLevelCompleted(userId, level._id);
              console.log(`[Background] Level ${level._id} completed and next level unlocked.`);
            }
          }
        } catch (levelError) {
          console.error('[Background] Level progress update error:', levelError);
        }
      }

    } catch (globalError) {
      console.error('[Background] Critical error in background updates:', globalError);
    }
  };

  /* -----------------------
      Fin de submitExercise et helper
     ----------------------- */

  /* -----------------------
      Progress & Statistics
      ----------------------- */

  // Obtenir le progrès détaillé d'un utilisateur pour un exercice
  static getUserExerciseProgress = catchErrors(async (req, res) => {
    const { exerciseId, userId } = req.params;

    if (!isValidObjectId(exerciseId)) return res.status(400).json({ error: 'ID exercice invalide' });
    if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'userId requis' });

    // Utiliser la même logique de conversion d'ObjectId que dans updateProgress
    const mongoose = require('mongoose');
    const crypto = require('crypto');

    let userObjectId;
    if (mongoose.isValidObjectId(userId)) {
      userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    } else {
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    }

    const progress = await UserProgress.findOne({
      user: userObjectId,
      exercise: exerciseId
    }).populate('exercise', 'type points');

    if (!progress) {
      return res.json({
        completed: false,
        xp: 0,
        pointsEarned: 0,
        pointsMax: 10,
        attempts: 0,
        bestScore: 0,
        lastAttempt: null
      });
    }

    res.json({
      completed: progress.completed,
      xp: progress.xp,
      pointsEarned: progress.pointsEarned,
      pointsMax: progress.pointsMax,
      attempts: progress.attempts,
      bestScore: progress.bestScore,
      lastAttempt: progress.lastAttempt,
      completedAt: progress.completedAt,
      details: progress.details,
      exerciseType: progress.exercise?.type
    });
  });

  // Obtenir les statistiques globales d'un utilisateur
  static getUserStats = catchErrors(async (req, res) => {
    const { userId } = req.params;

    if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'userId requis' });

    const stats = await UserProgress.getUserStats(userId);
    res.json(stats);
  });

  // Obtenir le progrès d'un utilisateur pour un niveau complet
  static getUserLevelProgress = catchErrors(async (req, res) => {
    const { levelId, userId } = req.params;

    if (!isValidObjectId(levelId)) return res.status(400).json({ error: 'ID niveau invalide' });
    if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'userId requis' });

    const level = await Level.findById(levelId).populate('exercises', '_id type points');
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    const exerciseIds = level.exercises.map(e => e._id);

    // Utiliser la même logique de conversion d'ObjectId
    const mongoose = require('mongoose');
    const crypto = require('crypto');

    let userObjectId;
    if (mongoose.isValidObjectId(userId)) {
      userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    } else {
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      userObjectId = new mongoose.Types.ObjectId(hash.substring(0, 24));
    }

    const progresses = await UserProgress.find({
      user: userObjectId,
      exercise: { $in: exerciseIds }
    }).populate('exercise', 'type points');

    // Organiser les progrès par exercice
    const progressMap = {};
    progresses.forEach(p => {
      progressMap[p.exercise._id.toString()] = {
        completed: p.completed,
        xp: p.xp,
        pointsEarned: p.pointsEarned,
        pointsMax: p.pointsMax,
        attempts: p.attempts,
        bestScore: p.bestScore,
        lastAttempt: p.lastAttempt
      };
    });

    // Calculer les statistiques du niveau
    const totalExercises = level.exercises.length;
    const completedExercises = progresses.filter(p => p.completed).length;
    const totalXp = progresses.reduce((sum, p) => sum + p.xp, 0);
    const totalPointsEarned = progresses.reduce((sum, p) => sum + p.pointsEarned, 0);
    const totalPointsMax = level.exercises.reduce((sum, e) => sum + (e.points || 10), 0);

    res.json({
      levelId,
      totalExercises,
      completedExercises,
      completionRate: totalExercises > 0 ? (completedExercises / totalExercises) : 0,
      totalXp,
      totalPointsEarned,
      totalPointsMax,
      scorePercentage: totalPointsMax > 0 ? (totalPointsEarned / totalPointsMax) * 100 : 0,
      exerciseProgresses: progressMap
    });
  });

  /* -----------------------
      Media handling (videos & PDFs)
      ----------------------- */

  static uploadVideoMiddleware = uploadVideoMiddleware;
  static uploadPDFMiddleware = uploadPDFMiddleware;

  // Save video
  static saveVideoPath = catchErrors(async (req, res) => {
    const lang = (req.body?.lang || req.query?.lang || '').toLowerCase();
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const filename = req.file.filename;

    if (!isAllowedLang(lang)) {
      await deleteGridFSFile(filename);
      return res.status(400).json({ error: 'Langue invalide (fr,en,ar)' });
    }
    const levelId = req.params.levelId;
    if (!isValidObjectId(levelId)) {
      await deleteGridFSFile(filename);
      return res.status(400).json({ error: 'ID de niveau invalide' });
    }

    const level = await Level.findById(levelId);
    if (!level) {
      await deleteGridFSFile(filename);
      return res.status(404).json({ error: 'Niveau non trouvé' });
    }

    try {
      // Construct URL
      const protocol = req.protocol;
      const host = req.get('host');
      const fileUrl = `${protocol}://${host}/api/files/${filename}`;

      // Delete old video if exists
      if (level.videos && level.videos[lang]) {
        const oldUrl = level.videos[lang];
        if (oldUrl.includes('/api/files/')) {
          const oldFilename = oldUrl.split('/').pop();
          await deleteGridFSFile(oldFilename);
        }
      }

      // Update level
      const updates = {};
      updates[`videos.${lang}`] = fileUrl;
      if (lang === 'fr') updates.video = fileUrl;

      const updatedLevel = await Level.findByIdAndUpdate(
        levelId,
        { $set: updates },
        { new: true }
      );

      res.json({
        message: `Vidéo (${lang}) enregistrée sur GridFS`,
        url: fileUrl,
        videos: updatedLevel.videos
      });
    } catch (error) {
      console.error('GridFS save error:', error);
      await deleteGridFSFile(filename);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement vidéo' });
    }
  });

  // Save PDF
  static savePDFPath = catchErrors(async (req, res) => {
    const lang = (req.body?.lang || req.query?.lang || '').toLowerCase();
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const filename = req.file.filename;

    if (!isAllowedLang(lang)) {
      await deleteGridFSFile(filename);
      return res.status(400).json({ error: 'Langue invalide (fr,en,ar)' });
    }
    const levelId = req.params.levelId;
    if (!isValidObjectId(levelId)) {
      await deleteGridFSFile(filename);
      return res.status(400).json({ error: 'ID de niveau invalide' });
    }

    const level = await Level.findById(levelId);
    if (!level) {
      await deleteGridFSFile(filename);
      return res.status(404).json({ error: 'Niveau non trouvé' });
    }

    try {
      // Construct URL
      const protocol = req.protocol;
      const host = req.get('host');
      const fileUrl = `${protocol}://${host}/api/files/${filename}`;

      // Delete old PDF if exists
      if (level.pdfs && level.pdfs[lang]) {
        const oldUrl = level.pdfs[lang];
        if (oldUrl.includes('/api/files/')) {
          const oldFilename = oldUrl.split('/').pop();
          await deleteGridFSFile(oldFilename);
        }
      }

      // Update level
      const updates = {};
      updates[`pdfs.${lang}`] = fileUrl;
      if (lang === 'fr') updates.pdf = fileUrl;

      const updatedLevel = await Level.findByIdAndUpdate(
        levelId,
        { $set: updates },
        { new: true }
      );

      res.json({
        message: `PDF (${lang}) enregistré sur GridFS`,
        url: fileUrl,
        pdfs: updatedLevel.pdfs
      });
    } catch (error) {
      console.error('GridFS save error:', error);
      await deleteGridFSFile(filename);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement PDF' });
    }
  });

  // Save Image (Generic)
  static saveImage = catchErrors(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    const filename = req.file.filename;

    try {
      // Construct URL
      const protocol = req.protocol;
      const host = req.get('host');
      // Use proxyFile for unified access or direct gridfs route
      const fileUrl = `${protocol}://${host}/api/files/${filename}`;

      res.json({
        message: 'Image enregistrée sur GridFS',
        url: fileUrl,
        filename: filename
      });
    } catch (error) {
      console.error('GridFS save image error:', error);
      await deleteGridFSFile(filename);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement image' });
    }
  });

  // delete single language video
  static deleteLevelVideo = catchErrors(async (req, res) => {
    const lang = (req.body?.lang || req.query?.lang || '').toLowerCase();
    const levelId = req.params.levelId;
    if (!isValidObjectId(levelId)) return res.status(400).json({ error: 'ID de niveau invalide' });
    if (!isAllowedLang(lang)) return res.status(400).json({ error: 'Langue invalide' });

    const level = await Level.findById(levelId);
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    if (!level.videos || !level.videos[lang]) return res.status(404).json({ error: 'Aucune vidéo pour cette langue' });

    const videoUrl = level.videos[lang];
    if (videoUrl && videoUrl.includes('/api/files/')) {
      const filename = videoUrl.split('/').pop();
      await deleteGridFSFile(filename);
    } else {
      await safeUnlink(videoUrl);
    }

    delete level.videos[lang];
    await level.save();

    res.json({ message: `Vidéo ${lang} supprimée`, videos: level.videos || {} });
  });

  // delete single language pdf
  static deleteLevelPDF = catchErrors(async (req, res) => {
    const lang = (req.body?.lang || req.query?.lang || '').toLowerCase();
    const levelId = req.params.levelId;
    if (!isValidObjectId(levelId)) return res.status(400).json({ error: 'ID de niveau invalide' });
    if (!isAllowedLang(lang)) return res.status(400).json({ error: 'Langue invalide' });

    const level = await Level.findById(levelId);
    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    if (!level.pdfs || !level.pdfs[lang]) return res.status(404).json({ error: 'Aucun PDF pour cette langue' });

    const pdfUrl = level.pdfs[lang];
    if (pdfUrl && pdfUrl.includes('/api/files/')) {
      const filename = pdfUrl.split('/').pop();
      await deleteGridFSFile(filename);
    } else {
      await safeUnlink(pdfUrl);
    }

    delete level.pdfs[lang];
    await level.save();

    res.json({ message: `PDF ${lang} supprimé`, pdfs: level.pdfs || {} });
  });

  // stream video (range)
  static streamVideo = catchErrors(async (req, res) => {
    const { lang } = req.query;
    if (!isValidObjectId(req.params.levelId)) return res.status(400).json({ error: 'ID invalide' });
    if (!isAllowedLang(lang)) return res.status(400).json({ error: 'Langue invalide' });

    const level = await Level.findById(req.params.levelId).select('videos video').lean();

    // Try new format (videos by language)
    let videoUrl = level?.videos?.[lang];
    // If not found, try old format (singular video) for French
    if (!videoUrl && lang === 'fr' && level?.video) {
      videoUrl = level.video;
    }

    if (!videoUrl) {
      return res.status(404).json({ error: 'Vidéo introuvable pour cette langue' });
    }

    // If it's a Cloudinary URL (starts with http), redirect to it
    if (videoUrl.startsWith('http')) {
      return res.redirect(videoUrl);
    }

    // Otherwise, it's a legacy local file path - try to stream it
    const videoRel = videoUrl.replace(/\\/g, '/');
    const videoPath = resolveAbsFromRel(videoRel);

    try {
      await fsp.access(videoPath);
    } catch (err) {
      console.error('[streamVideo] Legacy file not found:', err.message);
      return res.status(404).json({
        error: 'Fichier vidéo manquant. Veuillez re-uploader la vidéo.',
        path: videoPath
      });
    }

    // Stream legacy local file
    const stat = await fsp.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const ext = path.extname(videoPath).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      let start = parseInt(parts[0], 10);
      let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (Number.isNaN(start) || start < 0) start = 0;
      if (Number.isNaN(end) || end < start || end >= fileSize) end = fileSize - 1;

      if (start >= fileSize) {
        res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
        return res.end();
      }

      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType
      });

      const stream = fs.createReadStream(videoPath, { start, end });
      stream.on('error', error => {
        console.error('Stream error:', error);
        if (!res.headersSent) res.status(500).end('Erreur de lecture vidéo');
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType
      });
      const stream = fs.createReadStream(videoPath);
      stream.on('error', error => {
        console.error('Stream error:', error);
        if (!res.headersSent) res.status(500).end('Erreur de lecture vidéo');
      });
      stream.pipe(res);
    }
  });

  // stream PDF inline
  static streamPDF = catchErrors(async (req, res) => {
    const { lang } = req.query;
    if (!isValidObjectId(req.params.levelId)) return res.status(400).json({ error: 'ID invalide' });
    if (!isAllowedLang(lang)) return res.status(400).json({ error: 'Langue invalide' });

    const level = await Level.findById(req.params.levelId).select('pdfs pdf').lean();

    // Try new format (pdfs by language)
    let pdfUrl = level?.pdfs?.[lang];
    // If not found, try old format (singular pdf) for French
    if (!pdfUrl && lang === 'fr' && level?.pdf) {
      pdfUrl = level.pdf;
    }

    if (!pdfUrl) {
      return res.status(404).json({ error: 'PDF introuvable pour cette langue' });
    }

    // If it's a Cloudinary URL (starts with http), redirect to it
    if (pdfUrl.startsWith('http')) {
      return res.redirect(pdfUrl);
    }

    // Otherwise, it's a legacy local file path - try to stream it
    const pdfRel = pdfUrl.replace(/\\/g, '/');
    const pdfPath = resolveAbsFromRel(pdfRel);

    try {
      await fsp.access(pdfPath);
    } catch (err) {
      console.error('[streamPDF] Legacy file not found:', err.message);
      return res.status(404).json({
        error: 'Fichier PDF manquant. Veuillez re-uploader le PDF.',
        path: pdfPath
      });
    }

    // Stream legacy local file
    const stat = await fsp.stat(pdfPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      let start = parseInt(parts[0], 10);
      let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (Number.isNaN(start) || start < 0) start = 0;
      if (Number.isNaN(end) || end < start || end >= fileSize) end = fileSize - 1;

      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "application/pdf"
      });

      const stream = fs.createReadStream(pdfPath, { start, end });
      stream.on('error', error => {
        console.error('PDF stream error:', error);
        if (!res.headersSent) res.status(500).end('Erreur de lecture PDF');
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Accept-Ranges": "bytes"
      });

      const stream = fs.createReadStream(pdfPath);
      stream.on('error', error => {
        console.error('PDF stream error:', error);
        if (!res.headersSent) res.status(500).end('Erreur de lecture PDF');
      });
      stream.pipe(res);
    }
  });
}

/* ============================
   Exports
   ============================ */
module.exports = {
  CourseController,
  languageMiddleware,
  catchErrors,
  configureMulter,
  uploadVideoMiddleware: CourseController.uploadVideoMiddleware,
  uploadPDFMiddleware: CourseController.uploadPDFMiddleware,
  uploadImageMiddleware,
  defaultVideoExt
};
