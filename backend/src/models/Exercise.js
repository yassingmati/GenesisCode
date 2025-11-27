const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

// Schéma pour les traductions d'exercices
const exerciseTranslationSchema = new Schema({
  name: { type: String, required: true },
  question: { type: String, required: true },
  explanation: { type: String, default: '' }
}, { _id: false });

// Schéma pour les options QCM enrichies
const optionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  media: { type: String, default: null }
}, { _id: false });

// Schéma pour les cas de test (exercices de code)
const testCaseSchema = new Schema({
  input: Schema.Types.Mixed,
  expected: Schema.Types.Mixed,
  points: { type: Number, default: 1 },
  public: { type: Boolean, default: false }
}, { _id: false });

// Schéma pour les blocs de code (OrderBlocks)
const blockSchema = new Schema({
  id: { type: String, required: true },
  code: { type: String, required: true }
}, { _id: false });

// Schéma pour les paires de correspondance (Matching)
const matchingPairSchema = new Schema({
  id: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

// Schéma principal de l'exercice
const exerciseSchema = new Schema({
  // Traductions multilingues
  translations: {
    fr: { type: exerciseTranslationSchema, required: true },
    en: { type: exerciseTranslationSchema, required: true },
    ar: { type: exerciseTranslationSchema, required: true }
  },

  // Type d'exercice
  type: {
    type: String,
    enum: [
      // Types existants
      'QCM',
      'DragDrop',
      'TextInput',
      'Code',
      'OrderBlocks',
      'FillInTheBlank',
      'SpotTheError',
      'Matching',

      // Nouveaux types pour algorithmes et programmation
      'Algorithm',           // Conception d'algorithmes avec pseudo-code
      'FlowChart',          // Création/complétion d'organigrammes
      'Trace',              // Traçage d'exécution de code
      'Debug',              // Débogage de code avec erreurs
      'CodeCompletion',     // Complétion de code manquant
      'PseudoCode',         // Écriture de pseudo-code
      'Complexity',         // Analyse de complexité algorithmique
      'DataStructure',      // Manipulation de structures de données
      'ScratchBlocks',      // Construction avec blocs Scratch
      'VisualProgramming',  // Programmation visuelle générale
      'AlgorithmSteps',     // Ordonnancement d'étapes d'algorithme
      'ConceptMapping',     // Association concepts-définitions
      'CodeOutput',         // Prédiction de sortie de code
      'Optimization',       // Optimisation de code/algorithme
      'Scratch'             // Programmation visuelle avec Blockly
    ],
    required: true
  },

  // Métadonnées générales
  points: { type: Number, default: 10, min: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  timeLimit: { type: Number, default: null, min: 0 },
  attemptsAllowed: { type: Number, default: 0, min: 0 },
  hint: { type: String, default: '' },
  showSolutionAfterAttempts: { type: Number, default: 1, min: 1 },
  shuffle: { type: Boolean, default: false },
  allowPartial: { type: Boolean, default: true },

  // Champs de contenu spécifiques par type
  options: { type: [optionSchema], default: [] },          // QCM
  elements: { type: [Schema.Types.Mixed], default: [] },   // DragDrop elements
  targets: { type: [Schema.Types.Mixed], default: [] },    // DragDrop targets
  testCases: { type: [testCaseSchema], default: [] },      // Code
  blocks: { type: [blockSchema], default: [] },            // OrderBlocks
  codeSnippet: { type: String },                           // FillInTheBlank/SpotTheError/Code
  language: { type: String },                              // Code (js, py, java...)
  prompts: { type: [matchingPairSchema], default: [] },    // Matching prompts
  matches: { type: [matchingPairSchema], default: [] },    // Matching matches

  // Champs pour les nouveaux types d'exercices
  algorithmSteps: { type: [Schema.Types.Mixed], default: [] },     // Algorithm/AlgorithmSteps: étapes d'algorithme
  flowChartNodes: { type: [Schema.Types.Mixed], default: [] },     // FlowChart: nœuds d'organigramme
  flowChartConnections: { type: [Schema.Types.Mixed], default: [] }, // FlowChart: connexions
  traceVariables: { type: [Schema.Types.Mixed], default: [] },     // Trace: variables à tracer
  traceSteps: { type: [Schema.Types.Mixed], default: [] },         // Trace: étapes d'exécution
  debugErrors: { type: [Schema.Types.Mixed], default: [] },        // Debug: erreurs à identifier
  codeTemplate: { type: String },                                  // CodeCompletion: template avec trous
  codeGaps: { type: [Schema.Types.Mixed], default: [] },          // CodeCompletion: emplacements à compléter
  pseudoCodeStructure: { type: Schema.Types.Mixed },              // PseudoCode: structure attendue
  complexityAnalysis: { type: Schema.Types.Mixed },               // Complexity: analyse de complexité
  dataStructureType: { type: String },                            // DataStructure: type (array, list, tree...)
  dataStructureOperations: { type: [Schema.Types.Mixed], default: [] }, // DataStructure: opérations
  scratchBlocks: { type: [Schema.Types.Mixed], default: [] },     // ScratchBlocks: blocs Scratch
  initialXml: { type: String },                                   // Scratch: XML initial pour Blockly
  scratchWorkspace: { type: Schema.Types.Mixed },                 // ScratchBlocks: configuration workspace
  visualElements: { type: [Schema.Types.Mixed], default: [] },    // VisualProgramming: éléments visuels
  concepts: { type: [matchingPairSchema], default: [] },          // ConceptMapping: concepts
  definitions: { type: [matchingPairSchema], default: [] },       // ConceptMapping: définitions
  expectedOutput: { type: Schema.Types.Mixed },                   // CodeOutput: sortie attendue
  optimizationCriteria: { type: [String], default: [] },         // Optimization: critères (temps, espace...)
  performanceMetrics: { type: Schema.Types.Mixed },               // Optimization: métriques de performance

  // Solutions (structure flexible selon le type)
  solutions: { type: [Schema.Types.Mixed], default: [] },

  // Référence vers le niveau
  level: { type: Types.ObjectId, ref: 'Level', required: true }

}, { timestamps: true });

// Index pour améliorer les performances
exerciseSchema.index({ level: 1, type: 1 });
exerciseSchema.index({ level: 1, createdAt: -1 });

// Méthodes d'instance
exerciseSchema.methods.getTranslation = function (lang = 'fr') {
  return this.translations[lang] || this.translations.fr;
};

exerciseSchema.methods.isValidAnswer = function (answer) {
  // Validation basique selon le type
  switch (this.type) {
    case 'QCM':
      return Array.isArray(answer) || typeof answer === 'number';
    case 'TextInput':
    case 'FillInTheBlank':
      return typeof answer === 'string';
    case 'Code':
      return typeof answer === 'object'; // { passed: boolean } ou format détaillé
    case 'DragDrop':
    case 'OrderBlocks':
    case 'Matching':
      return Array.isArray(answer) || typeof answer === 'object';
    default:
      return true;
  }
};

// Méthodes statiques
exerciseSchema.statics.findByLevel = function (levelId) {
  return this.find({ level: levelId }).sort({ createdAt: 1 });
};

exerciseSchema.statics.findByType = function (type) {
  return this.find({ type });
};

module.exports = mongoose.model('Exercise', exerciseSchema);