

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
  const types = ['QCM', 'DragDrop', 'TextInput', 'Code', 'OrderBlocks', 'FillInTheBlank', 'SpotTheError', 'Matching'];

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
          if (!testCase.input || !testCase.expected) {
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
        select: '-solutions -testCases'
      })
      .lean();

    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    const translation = getTranslation(level, lang) || getTranslation(level, 'fr') || {};
    const exercises = (level.exercises || []).map(ex => {
      const exTrans = getTranslation(ex, lang) || getTranslation(ex, 'fr') || {};
      return {
        _id: ex._id,
        name: exTrans?.name || null,
        type: ex.type,
        question: exTrans?.question || null
      };
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
      select: '-solutions -testCases'
    });

    if (!level) return res.status(404).json({ error: 'Niveau non trouvé' });

    const exercises = (level.exercises || []).map(ex => {
      const exTrans = getTranslation(ex, lang) || getTranslation(ex, 'fr') || {};
      return {
        _id: ex._id,
        name: exTrans?.name || null,
        type: ex.type,
        question: exTrans?.question || null
      };
    });

    res.json(exercises);
  });

  static getExercise = catchErrors(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'ID invalide' });

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercice non trouvé' });

    const result = exercise.toObject();
    delete result.solutions;
    delete result.testCases;

    const translation = getTranslation(exercise, getLang(req)) || getTranslation(exercise, 'fr') || {};
    result.name = translation?.name || null;
    result.question = translation?.question || null;

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

    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercice non trouvé' });

    let isCorrect = false;
    const { answer, userId } = req.body;
    const type = exercise.type;

    if (!userId) return res.status(400).json({ error: 'userId requis' });
    if (!answer && type !== 'Code') return res.status(400).json({ error: 'Réponse requise' });

    // Validation des solutions selon le type d'exercice
    const solutions = exercise.solutions || [];
    if (!Array.isArray(solutions) || solutions.length === 0) {
      return res.status(400).json({ error: 'Exercice mal configuré: pas de solutions' });
    }

    switch (type) {
      case 'QCM':
        // Pour QCM, vérifier que la réponse est un tableau d'indices valides
        if (!Array.isArray(answer)) {
          isCorrect = false;
        } else {
          // Vérifier que tous les indices de réponse sont valides et correspondent aux solutions
          const validIndices = answer.every(idx => 
            Number.isInteger(idx) && idx >= 0 && idx < (exercise.options?.length || 0)
          );
          if (validIndices) {
            // Comparer avec les solutions (indices des bonnes réponses)
            const sortedUserAnswer = [...answer].sort((a, b) => a - b);
            const sortedSolutions = [...solutions].sort((a, b) => a - b);
            isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedSolutions);
          }
        }
        break;

      case 'TextInput':
      case 'FillInTheBlank':
        // Comparaison insensible à la casse et aux espaces
        const normalizedAnswer = String(answer || '').trim().toLowerCase();
        isCorrect = solutions.some(solution => 
          String(solution).trim().toLowerCase() === normalizedAnswer
        );
        break;

      case 'SpotTheError':
        // Comparaison exacte pour les erreurs de code
        isCorrect = solutions.some(solution => 
          JSON.stringify(solution) === JSON.stringify(answer)
        );
        break;

      case 'DragDrop':
      case 'OrderBlocks':
      case 'Matching':
        // Comparaison exacte des structures de données
        try {
          const normalizedAnswer = Array.isArray(answer) ? answer : [answer];
          const normalizedSolutions = solutions.map(sol => 
            Array.isArray(sol) ? sol : [sol]
          );
          isCorrect = normalizedSolutions.some(solution => 
            JSON.stringify(solution) === JSON.stringify(normalizedAnswer)
          );
        } catch (e) {
          console.error('Error comparing structured answers:', e);
          isCorrect = false;
        }
        break;

      case 'Code':
        // Pour les exercices de code, on s'appuie sur le flag 'passed' du frontend
        if (typeof req.body.passed === 'boolean') {
          isCorrect = req.body.passed;
        } else {
          return res.status(400).json({ error: 'Pour Code, fournissez "passed": true/false' });
        }
        break;

      default:
        return res.status(400).json({ error: 'Type d\'exercice non supporté' });
    }

    const xp = isCorrect ? 10 : 2;

    // Enregistrer ou mettre à jour UserProgress
    try {
      const updateObj = {
        $inc: { xp },
        $set: { lastAttempt: new Date() }
      };
      if (isCorrect) {
        updateObj.$set.completed = true;
        updateObj.$set.completedAt = new Date();
      }

      await UserProgress.findOneAndUpdate(
        { user: userId, exercise: exercise._id },
        updateObj,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
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

          const completedExercisesCount = await UserProgress.countDocuments({
            user: userId,
            exercise: { $in: exerciseIds },
            completed: true
          });

          // Marquer le niveau comme complété si tous les exercices sont terminés
          if (exerciseIds.length > 0 && completedExercisesCount === exerciseIds.length) {
            await UserLevelProgress.findOneAndUpdate(
              { user: userId, level: level._id },
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
      xpEarned: xp,
      explanation,
      ...( !isCorrect && { solutions: exercise.solutions } )
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
