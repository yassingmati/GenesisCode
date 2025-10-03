

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
const resolveAbsFromRel = rel => path.resolve(__dirname, '..', rel.replace(/^\//, ''));

// only unlink files inside our uploads directory to avoid path traversal mistakes
const safeUnlink = async (relPath) => {
  if (!relPath) return;
  try {
    const abs = resolveAbsFromRel(relPath);
    if (!abs.startsWith(uploadsBaseDir)) {
      // do not delete paths outside uploads folder
      return;
    }
    await fsp.unlink(abs).catch(() => {});
  } catch (e) {
    // swallow errors, deletion is best-effort
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
    'CodeOutput', 'Optimization'
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
  const subdir = opts.subdir || 'videos';
  const storageDir = path.join(uploadsBaseDir, subdir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fsp.mkdir(storageDir, { recursive: true }).then(() => cb(null, storageDir)).catch(cb);
    },
    filename: (req, file, cb) => {
      const safeName = `${subdir}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
      cb(null, safeName);
    }
  });

  return multer({
    storage,
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

/* ============================
   Controller class
   ============================ */
class CourseController {
  /* -----------------------
      Categories
      ----------------------- */
  static createCategory = catchErrors(async (req, res) => {
    validateTranslations(req.body.translations);
    const category = await Category.create(req.body);
    res.status(201).json(category);
  });

  static getAllCategories = catchErrors(async (req, res) => {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });
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
    await Path.findByIdAndUpdate(req.body.path, { $push: { levels: level._id } }).catch(() => {});
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

    const level = await Level.findById(req.params.id)
      .populate({
        path: 'exercises',
        select: '-solutions' // Garder testCases mais cacher solutions
      })
      .lean();

    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

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

    res.json({
      _id: level._id,
      translations: level.translations,
      title: translation?.title,
      content: translation?.content,
      pdf: level.pdfs?.[lang] || null,
      exercises,
      videos: level.videos || {},
      pdfs: level.pdfs || {}
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

    await Path.updateOne({ levels: req.params.id }, { $pull: { levels: req.params.id } }).catch(() => {});
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

    const exercise = await Exercise.create(req.body);
    await Level.findByIdAndUpdate(req.body.level, { $push: { exercises: exercise._id } }).catch(() => {});
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
      level: exercise.level
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
    await Level.findByIdAndUpdate(exercise.level, { $pull: { exercises: exercise._id } }).catch(() => {});
    await Exercise.findByIdAndDelete(exercise._id);

    res.status(204).end();
  });

  // important: here we mark user progress + when level completed mark UserLevelProgress
  static submitExercise = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });

    // Pour submitExercise, nous avons besoin des solutions, donc pas de select pour les exclure
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercice non trouvé' });

    let isCorrect = false;
    let pointsEarned = 0;
    let xp = 0;
    let details = {};
    const { answer, userId } = req.body;
    const type = exercise.type;

    if (!userId) return res.status(400).json({ error: 'userId requis' });
    if (!answer && type !== 'Code') return res.status(400).json({ error: 'Réponse requise' });
    
    // Valider que userId est un ObjectId valide ou au moins une chaîne
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({ error: 'userId doit être une chaîne non vide' });
    }

    // Validation des solutions selon le type d'exercice
    const solutions = exercise.solutions || [];
    if (!Array.isArray(solutions) || solutions.length === 0) {
      return res.status(400).json({ error: 'Exercice mal configuré: pas de solutions' });
    }

    switch (type) {
      case 'QCM': {
        // solutions stockées comme array d'option ids (ou indices) -> supporter les deux
        const user = Array.isArray(answer) ? answer : [answer];
        const correctAnswers = exercise.solutions || [];
        // normaliser (si indices fournis, convertir en ids si options sont objets)
        const normalize = (arr) => {
          if (exercise.options && exercise.options.length && typeof exercise.options[0] === 'object') {
            // solutions can be option ids or indice numbers
            return arr.map(a => {
              if (typeof a === 'number') return exercise.options[a]?.id;
              return a;
            }).filter(Boolean);
          }
          return arr;
        };
        const userNorm = normalize(user);
        const correctNorm = normalize(correctAnswers);

        // calcul points partiels si allowPartial
        const pointsMax = exercise.points || 10;
        if (exercise.allowPartial) {
          const perOption = pointsMax / Math.max(correctNorm.length, 1);
          // each correctly selected option gives perOption, but penalize wrong extra selections optional
          const matched = userNorm.filter(u => correctNorm.includes(u)).length;
          pointsEarned = perOption * matched;
          // optional: subtract for wrong picks -> here we don't subtract but you can:
          // const wrong = userNorm.filter(u => !correctNorm.includes(u)).length;
          // pointsEarned = Math.max(0, pointsEarned - wrong * (perOption/2));
        } else {
          const sortedU = [...userNorm].sort();
          const sortedC = [...correctNorm].sort();
          pointsEarned = (JSON.stringify(sortedU) === JSON.stringify(sortedC)) ? pointsMax : 0;
        }
        isCorrect = pointsEarned >= pointsMax;
        xp = Math.round(pointsEarned); // ou autre conversion
        details = { type: 'QCM', user: userNorm, correct: correctNorm, pointsEarned, pointsMax };
        break;
      }

      case 'Matching':
      case 'DragDrop':
      case 'OrderBlocks': {
        // comparer structure et attribuer points par paire/bloc correct
        const pointsMax = exercise.points || 10;
        let earned = 0;
        if (type === 'Matching') {
          const pairs = exercise.solutions || []; // ex: [{promptId: 'p1', matchId: 'm2'}]
          const totalPairs = pairs.length || 1;
          const perPair = pointsMax / totalPairs;
          for (const pair of pairs) {
            // answer should be array of {promptId, matchId} or map
            const found = (Array.isArray(answer) ? answer : []).some(a => a.promptId === pair.promptId && a.matchId === pair.matchId);
            if (found) earned += perPair;
          }
        } else if (type === 'OrderBlocks') {
          // solution is array of block ids in correct order
          const solution = exercise.solutions?.[0] || []; // assume one solution
          const userOrder = Array.isArray(answer) ? answer : [];
          const minLen = Math.min(solution.length, userOrder.length);
          const per = pointsMax / solution.length;
          for (let i=0;i<minLen;i++) if (solution[i] === userOrder[i]) earned += per;
        } else if (type === 'DragDrop') {
          // similar logic basique
          const solution = exercise.solutions?.[0] || {}; // map elementId->targetId
          const userMap = answer || {};
          const keys = Object.keys(solution || {});
          const per = pointsMax / Math.max(keys.length,1);
          for (const k of keys) if (userMap[k] === solution[k]) earned += per;
        }
        pointsEarned = Math.round(earned * 100) / 100;
        isCorrect = pointsEarned >= (exercise.points || 10);
        xp = Math.round(pointsEarned);
        details = { pointsEarned, pointsMax: exercise.points || 10 };
        break;
      }

      case 'TextInput':
      case 'FillInTheBlank': {
        // support regex solutions, arrays of synonyms, case-insensitive match, numeric ranges etc.
        const normalized = String(answer || '').trim();
        const solutions = exercise.solutions || [];
        let matched = false;
        for (const sol of solutions) {
          if (typeof sol === 'string') {
            if (normalized.toLowerCase() === sol.trim().toLowerCase()) { matched = true; break; }
          } else if (sol && sol.regex) {
            const re = new RegExp(sol.regex, sol.flags || 'i');
            if (re.test(normalized)) { matched = true; break; }
          } else if (sol && sol.range) {
            const val = Number(normalized);
            if (!Number.isNaN(val) && val >= sol.range.min && val <= sol.range.max) { matched = true; break; }
          }
        }
        pointsEarned = matched ? (exercise.points || 10) : 0;
        isCorrect = matched;
        xp = pointsEarned;
        details = { matched };
        break;
      }

      case 'SpotTheError': {
        // Comparaison exacte pour les erreurs de code
        const matched = solutions.some(solution => 
          JSON.stringify(solution) === JSON.stringify(answer)
        );
        pointsEarned = matched ? (exercise.points || 10) : 0;
        isCorrect = matched;
        xp = pointsEarned;
        details = { matched };
        break;
      }

      case 'Code': {
        // Accept either { passed: boolean } OR { passedCount, totalCount, tests: [{name,passed,message,points}] }
        const pointsMax = exercise.points || exercise.testCases?.reduce((s,tc)=>s+ (tc.points||0), 0) || 10;
        if (typeof req.body.passed === 'boolean') {
          pointsEarned = req.body.passed ? pointsMax : 0;
          isCorrect = req.body.passed;
          details = { passed: req.body.passed };
        } else if (typeof req.body.passedCount === 'number' && typeof req.body.totalCount === 'number') {
          const ratio = req.body.totalCount === 0 ? 0 : (req.body.passedCount / req.body.totalCount);
          pointsEarned = Math.round(ratio * pointsMax * 100) / 100;
          isCorrect = pointsEarned >= pointsMax;
          details = { passedCount: req.body.passedCount, totalCount: req.body.totalCount, tests: req.body.tests || [] };
        } else if (Array.isArray(req.body.tests)) {
          // tests array with points per test -> sum
          const tests = req.body.tests;
          let earned = 0;
          for (const t of tests) {
            if (t.passed) earned += (t.points || 1);
          }
          pointsEarned = Math.min(pointsMax, earned);
          isCorrect = pointsEarned >= pointsMax;
          details = { tests };
        } else {
          return res.status(400).json({ error: 'Pour Code, fournissez passed:true/false ou passedCount/totalCount ou tests[]' });
        }
        xp = Math.round(pointsEarned); // conversion simple
        break;
      }

      // Nouveaux types d'exercices pour algorithmes et programmation
      case 'Algorithm':
      case 'AlgorithmSteps': {
        // Vérifier l'ordre des étapes d'algorithme
        const userOrder = Array.isArray(answer) ? answer : [];
        const correctOrder = exercise.solutions?.[0] || [];
        const pointsMax = exercise.points || 10;
        
        if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
          pointsEarned = pointsMax;
          isCorrect = true;
        } else if (exercise.allowPartial) {
          // Points partiels basés sur les étapes correctes dans l'ordre
          let correct = 0;
          const minLen = Math.min(userOrder.length, correctOrder.length);
          for (let i = 0; i < minLen; i++) {
            if (userOrder[i] === correctOrder[i]) correct++;
          }
          pointsEarned = Math.round((correct / correctOrder.length) * pointsMax);
          isCorrect = pointsEarned >= pointsMax;
        }
        xp = pointsEarned;
        details = { userOrder, correctOrder, pointsEarned, pointsMax };
        break;
      }

      case 'FlowChart': {
        // Vérifier la structure de l'organigramme
        const userNodes = answer?.nodes || [];
        const userConnections = answer?.connections || [];
        const correctStructure = exercise.solutions?.[0] || {};
        const pointsMax = exercise.points || 10;
        
        // Logique simple de comparaison (peut être complexifiée)
        const structureMatch = JSON.stringify(userNodes) === JSON.stringify(correctStructure.nodes) &&
                              JSON.stringify(userConnections) === JSON.stringify(correctStructure.connections);
        
        pointsEarned = structureMatch ? pointsMax : 0;
        isCorrect = structureMatch;
        xp = pointsEarned;
        details = { structureMatch, pointsEarned, pointsMax };
        break;
      }

      case 'Trace': {
        // Vérifier le traçage d'exécution
        const userTrace = answer?.trace || [];
        const correctTrace = exercise.solutions?.[0] || [];
        const pointsMax = exercise.points || 10;
        
        if (exercise.allowPartial) {
          // Points partiels pour chaque étape correcte
          let correctSteps = 0;
          userTrace.forEach((step, i) => {
            if (correctTrace[i] && JSON.stringify(step) === JSON.stringify(correctTrace[i])) {
              correctSteps++;
            }
          });
          pointsEarned = Math.round((correctSteps / correctTrace.length) * pointsMax);
        } else {
          pointsEarned = JSON.stringify(userTrace) === JSON.stringify(correctTrace) ? pointsMax : 0;
        }
        isCorrect = pointsEarned >= pointsMax;
        xp = pointsEarned;
        details = { userTrace, correctTrace, pointsEarned, pointsMax };
        break;
      }

      case 'Debug': {
        // Vérifier l'identification des erreurs
        const userErrors = Array.isArray(answer) ? answer : [];
        const correctErrors = exercise.solutions || [];
        const pointsMax = exercise.points || 10;
        
        if (exercise.allowPartial) {
          const foundErrors = userErrors.filter(err => correctErrors.some(correctErr => 
            correctErr.line === err.line && correctErr.type === err.type));
          pointsEarned = Math.round((foundErrors.length / correctErrors.length) * pointsMax);
        } else {
          const allFound = correctErrors.every(correctErr => 
            userErrors.some(err => correctErr.line === err.line && correctErr.type === err.type));
          pointsEarned = allFound ? pointsMax : 0;
        }
        isCorrect = pointsEarned >= pointsMax;
        xp = pointsEarned;
        details = { userErrors, correctErrors, pointsEarned, pointsMax };
        break;
      }

      case 'CodeCompletion': {
        // Vérifier la complétion de code
        const userCode = answer?.completions || {};
        const correctCode = exercise.solutions?.[0] || {};
        const pointsMax = exercise.points || 10;
        
        if (exercise.allowPartial) {
          const gaps = Object.keys(correctCode);
          let correctCompletions = 0;
          gaps.forEach(gap => {
            if (userCode[gap] && userCode[gap].trim() === correctCode[gap].trim()) {
              correctCompletions++;
            }
          });
          pointsEarned = Math.round((correctCompletions / gaps.length) * pointsMax);
        } else {
          const allCorrect = Object.keys(correctCode).every(gap => 
            userCode[gap] && userCode[gap].trim() === correctCode[gap].trim());
          pointsEarned = allCorrect ? pointsMax : 0;
        }
        isCorrect = pointsEarned >= pointsMax;
        xp = pointsEarned;
        details = { userCode, correctCode, pointsEarned, pointsMax };
        break;
      }

      case 'PseudoCode': {
        // Vérifier la structure du pseudo-code
        const userPseudo = String(answer || '').trim();
        const correctStructure = exercise.solutions?.[0] || '';
        const pointsMax = exercise.points || 10;
        
        // Comparaison simple ou utilisation de mots-clés
        const matched = userPseudo.toLowerCase() === correctStructure.toLowerCase();
        pointsEarned = matched ? pointsMax : 0;
        isCorrect = matched;
        xp = pointsEarned;
        details = { userPseudo, matched, pointsEarned, pointsMax };
        break;
      }

      case 'Complexity': {
        // Vérifier l'analyse de complexité
        const userComplexity = answer?.complexity || '';
        const correctComplexity = exercise.solutions?.[0] || '';
        const pointsMax = exercise.points || 10;
        
        const matched = userComplexity.toLowerCase() === correctComplexity.toLowerCase();
        pointsEarned = matched ? pointsMax : 0;
        isCorrect = matched;
        xp = pointsEarned;
        details = { userComplexity, correctComplexity, matched, pointsEarned, pointsMax };
        break;
      }

      case 'DataStructure': {
        // Vérifier les opérations sur les structures de données
        const userOperations = answer?.operations || [];
        const correctOperations = exercise.solutions || [];
        const pointsMax = exercise.points || 10;
        
        if (exercise.allowPartial) {
          let correctOps = 0;
          userOperations.forEach((op, i) => {
            if (correctOperations[i] && JSON.stringify(op) === JSON.stringify(correctOperations[i])) {
              correctOps++;
            }
          });
          pointsEarned = Math.round((correctOps / correctOperations.length) * pointsMax);
        } else {
          pointsEarned = JSON.stringify(userOperations) === JSON.stringify(correctOperations) ? pointsMax : 0;
        }
        isCorrect = pointsEarned >= pointsMax;
        xp = pointsEarned;
        details = { userOperations, correctOperations, pointsEarned, pointsMax };
        break;
      }

      case 'ScratchBlocks': {
        // Vérifier l'assemblage des blocs Scratch
        const userBlocks = Array.isArray(answer) ? answer : (answer?.blocks || []);
        const correctBlocks = exercise.solutions?.[0] || [];
        const pointsMax = exercise.points || 10;
        
        // Comparaison plus flexible pour les blocs Scratch
        let blocksMatch = false;
        if (exercise.allowPartial) {
          // Points partiels basés sur le nombre de blocs corrects
          let correctCount = 0;
          const minLength = Math.min(userBlocks.length, correctBlocks.length);
          for (let i = 0; i < minLength; i++) {
            if (userBlocks[i] === correctBlocks[i]) {
              correctCount++;
            }
          }
          pointsEarned = Math.round((correctCount / correctBlocks.length) * pointsMax);
          isCorrect = pointsEarned >= pointsMax;
        } else {
          // Comparaison exacte
          blocksMatch = JSON.stringify(userBlocks) === JSON.stringify(correctBlocks);
          pointsEarned = blocksMatch ? pointsMax : 0;
          isCorrect = blocksMatch;
        }
        
        xp = pointsEarned;
        details = { userBlocks, correctBlocks, blocksMatch, pointsEarned, pointsMax };
        break;
      }

      case 'VisualProgramming': {
        // Vérifier la programmation visuelle
        const userElements = answer?.elements || [];
        const correctElements = exercise.solutions?.[0] || [];
        const pointsMax = exercise.points || 10;
        
        const elementsMatch = JSON.stringify(userElements) === JSON.stringify(correctElements);
        pointsEarned = elementsMatch ? pointsMax : 0;
        isCorrect = elementsMatch;
        xp = pointsEarned;
        details = { userElements, correctElements, elementsMatch, pointsEarned, pointsMax };
        break;
      }

      case 'ConceptMapping': {
        // Vérifier l'association concepts-définitions
        const userMappings = answer?.mappings || [];
        const correctMappings = exercise.solutions || [];
        const pointsMax = exercise.points || 10;
        
        if (exercise.allowPartial) {
          const correctMatches = userMappings.filter(mapping => 
            correctMappings.some(correct => 
              correct.conceptId === mapping.conceptId && correct.definitionId === mapping.definitionId));
          pointsEarned = Math.round((correctMatches.length / correctMappings.length) * pointsMax);
        } else {
          const allCorrect = correctMappings.every(correct => 
            userMappings.some(mapping => 
              correct.conceptId === mapping.conceptId && correct.definitionId === mapping.definitionId));
          pointsEarned = allCorrect ? pointsMax : 0;
        }
        isCorrect = pointsEarned >= pointsMax;
        xp = pointsEarned;
        details = { userMappings, correctMappings, pointsEarned, pointsMax };
        break;
      }

      case 'CodeOutput': {
        // Vérifier la prédiction de sortie de code
        const userOutput = String(answer || '').trim();
        const correctOutput = String(exercise.solutions?.[0] || '').trim();
        const pointsMax = exercise.points || 10;
        
        const matched = userOutput === correctOutput;
        pointsEarned = matched ? pointsMax : 0;
        isCorrect = matched;
        xp = pointsEarned;
        details = { userOutput, correctOutput, matched, pointsEarned, pointsMax };
        break;
      }

      case 'Optimization': {
        // Vérifier l'optimisation de code
        const userOptimization = answer?.optimization || '';
        const correctOptimization = exercise.solutions?.[0] || '';
        const pointsMax = exercise.points || 10;
        
        // Évaluation basée sur les critères d'optimisation
        let score = 0;
        const criteria = exercise.optimizationCriteria || [];
        criteria.forEach(criterion => {
          if (answer?.improvements?.[criterion]) {
            score += pointsMax / criteria.length;
          }
        });
        
        pointsEarned = Math.round(score);
        isCorrect = pointsEarned >= pointsMax;
        xp = pointsEarned;
        details = { userOptimization, correctOptimization, criteria, pointsEarned, pointsMax };
        break;
      }

      default:
        return res.status(400).json({ error: 'Type d\'exercice non supporté' });
    }

    // Enregistrer ou mettre à jour UserProgress avec la nouvelle méthode
    try {
      await UserProgress.updateProgress(userId, exercise._id, {
        xp,
        pointsEarned,
        pointsMax: exercise.points || 10,
        completed: isCorrect,
        details
      });
    } catch (e) {
      console.error('UserProgress update error:', e);
      return res.status(500).json({ error: 'Erreur lors de la sauvegarde du progrès' });
    }

    // Si l'utilisateur a complété cet exercice, vérifier si tous les exercices du niveau sont complétés
    if (isCorrect) {
      try {
        const level = await Level.findById(exercise.level).populate('exercises', '_id');
        if (level && level.exercises) {
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

          const completedExercisesCount = await UserProgress.countDocuments({
            user: userObjectId,
            exercise: { $in: exerciseIds },
            completed: true
          });

          // Marquer le niveau comme complété si tous les exercices sont terminés
          if (exerciseIds.length > 0 && completedExercisesCount === exerciseIds.length) {
            await UserLevelProgress.findOneAndUpdate(
              { user: userObjectId, level: level._id },
              { 
                completed: true, 
                completedAt: new Date(),
                $inc: { xp: 50 } // Bonus XP pour compléter un niveau
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          }
        }
      } catch (e) {
        console.error('UserLevelProgress update error:', e);
      }
    }

    const explanation = (getTranslation(exercise, getLang(req)) || getTranslation(exercise, 'fr'))?.explanation || null;

    res.json({
      correct: isCorrect,
      pointsEarned,
      pointsMax: exercise.points || 10,
      xpEarned: xp,
      explanation,
      details,
      ...( !isCorrect && { revealSolutions: false } ) // contrôlable selon policy
    });
  });

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
    if (!isAllowedLang(lang)) {
      await safeUnlink(resolveRelPath(path.join('videos', req.file.filename)));
      return res.status(400).json({ error: 'Langue invalide (fr,en,ar)' });
    }
    const levelId = req.params.levelId;
    if (!isValidObjectId(levelId)) {
      await safeUnlink(resolveRelPath(path.join('videos', req.file.filename)));
      return res.status(400).json({ error: 'ID de niveau invalide' });
    }

    const level = await Level.findById(levelId);
    if (!level) {
      await safeUnlink(resolveRelPath(path.join('videos', req.file.filename)));
      return res.status(404).json({ error: 'Niveau non trouvé' });
    }

    const rel = resolveRelPath(path.join('videos', req.file.filename));

    if (level.videos && level.videos[lang]) {
      await safeUnlink(level.videos[lang]);
    }

    level.videos = level.videos || {};
    level.videos[lang] = rel;
    await level.save();

    res.json({
      message: `Vidéo (${lang}) enregistrée`,
      path: rel,
      videos: level.videos
    });
  });

  // Save PDF
  static savePDFPath = catchErrors(async (req, res) => {
    const lang = (req.body?.lang || req.query?.lang || '').toLowerCase();
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
    if (!isAllowedLang(lang)) {
      await safeUnlink(resolveRelPath(path.join('pdfs', req.file.filename)));
      return res.status(400).json({ error: 'Langue invalide (fr,en,ar)' });
    }
    const levelId = req.params.levelId;
    if (!isValidObjectId(levelId)) {
      await safeUnlink(resolveRelPath(path.join('pdfs', req.file.filename)));
      return res.status(400).json({ error: 'ID de niveau invalide' });
    }

    const level = await Level.findById(levelId);
    if (!level) {
      await safeUnlink(resolveRelPath(path.join('pdfs', req.file.filename)));
      return res.status(404).json({ error: 'Niveau non trouvé' });
    }

    const rel = resolveRelPath(path.join('pdfs', req.file.filename));

    if (level.pdfs && level.pdfs[lang]) {
      await safeUnlink(level.pdfs[lang]);
    }

    level.pdfs = level.pdfs || {};
    level.pdfs[lang] = rel;
    await level.save();

    res.json({
      message: `PDF (${lang}) enregistré`,
      path: rel,
      pdfs: level.pdfs
    });
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

    await safeUnlink(level.videos[lang]);
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

    await safeUnlink(level.pdfs[lang]);
    delete level.pdfs[lang];
    await level.save();

    res.json({ message: `PDF ${lang} supprimé`, pdfs: level.pdfs || {} });
  });

  // stream video (range)
  static streamVideo = catchErrors(async (req, res) => {
    const { lang } = req.query;
    if (!isValidObjectId(req.params.levelId)) return res.status(400).json({ error: 'ID invalide' });
    if (!isAllowedLang(lang)) return res.status(400).json({ error: 'Langue invalide' });

    const level = await Level.findById(req.params.levelId).select('videos').lean();
    const videoRel = level?.videos?.[lang];
    if (!videoRel) return res.status(404).json({ error: 'Vidéo introuvable pour cette langue' });

    const videoPath = resolveAbsFromRel(videoRel);
    try {
      await fsp.access(videoPath);
    } catch {
      return res.status(404).json({ error: 'Fichier vidéo manquant' });
    }

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

    const level = await Level.findById(req.params.levelId).select('pdfs').lean();
    const pdfRel = level?.pdfs?.[lang];
    if (!pdfRel) return res.status(404).json({ error: 'PDF introuvable pour cette langue' });

    const pdfPath = resolveAbsFromRel(pdfRel);
    try {
      await fsp.access(pdfPath);
    } catch {
      return res.status(404).json({ error: 'Fichier PDF manquant' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(pdfPath)}"`);

    const stream = fs.createReadStream(pdfPath);
    stream.on('error', error => {
      console.error('PDF stream error:', error);
      if (!res.headersSent) res.status(500).end('Erreur de lecture PDF');
    });
    stream.pipe(res);
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
  uploadPDFMiddleware: CourseController.uploadPDFMiddleware
};
