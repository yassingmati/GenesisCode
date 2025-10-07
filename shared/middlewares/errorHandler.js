/**
 * Middleware de gestion des erreurs partagé entre le backend et le frontend
 * Centralise la gestion des erreurs pour une meilleure cohérence
 */

// Types d'erreurs personnalisées
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreurs spécifiques à l'application
const ERROR_CODES = {
  // Erreurs d'authentification
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  
  // Erreurs de validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  
  // Erreurs de base de données
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  DATABASE_DUPLICATE_KEY: 'DATABASE_DUPLICATE_KEY',
  
  // Erreurs de fichiers
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_INVALID_FORMAT: 'FILE_INVALID_FORMAT',
  
  // Erreurs de permissions
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ROLE_INSUFFICIENT: 'ROLE_INSUFFICIENT',
  
  // Erreurs de rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Erreurs de service externe
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  PAYMENT_SERVICE_ERROR: 'PAYMENT_SERVICE_ERROR',
  
  // Erreurs génériques
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY'
};

// Messages d'erreur par défaut
const DEFAULT_ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Identifiants invalides',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Token expiré',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Token invalide',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'Utilisateur non trouvé',
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Email non vérifié',
  [ERROR_CODES.VALIDATION_ERROR]: 'Erreur de validation',
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Champ requis manquant',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Format invalide',
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 'Erreur de connexion à la base de données',
  [ERROR_CODES.DATABASE_QUERY_ERROR]: 'Erreur de requête à la base de données',
  [ERROR_CODES.DATABASE_DUPLICATE_KEY]: 'Clé dupliquée',
  [ERROR_CODES.FILE_UPLOAD_ERROR]: 'Erreur de téléchargement de fichier',
  [ERROR_CODES.FILE_NOT_FOUND]: 'Fichier non trouvé',
  [ERROR_CODES.FILE_INVALID_FORMAT]: 'Format de fichier invalide',
  [ERROR_CODES.PERMISSION_DENIED]: 'Permission refusée',
  [ERROR_CODES.ROLE_INSUFFICIENT]: 'Rôle insuffisant',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Limite de taux dépassée',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Erreur de service externe',
  [ERROR_CODES.EMAIL_SERVICE_ERROR]: 'Erreur de service email',
  [ERROR_CODES.PAYMENT_SERVICE_ERROR]: 'Erreur de service de paiement',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Erreur interne du serveur',
  [ERROR_CODES.NOT_FOUND]: 'Ressource non trouvée',
  [ERROR_CODES.BAD_REQUEST]: 'Requête invalide',
  [ERROR_CODES.UNAUTHORIZED]: 'Non autorisé',
  [ERROR_CODES.FORBIDDEN]: 'Accès interdit',
  [ERROR_CODES.CONFLICT]: 'Conflit',
  [ERROR_CODES.UNPROCESSABLE_ENTITY]: 'Entité non traitable'
};

// Fonction pour créer une erreur personnalisée
const createError = (message, statusCode, code = null) => {
  return new AppError(message, statusCode, code);
};

// Fonction pour créer une erreur avec code prédéfini
const createErrorWithCode = (code, customMessage = null) => {
  const message = customMessage || DEFAULT_ERROR_MESSAGES[code];
  const statusCode = getStatusCodeFromCode(code);
  return new AppError(message, statusCode, code);
};

// Fonction pour obtenir le code de statut HTTP à partir du code d'erreur
const getStatusCodeFromCode = (code) => {
  const statusCodeMap = {
    [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 401,
    [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 401,
    [ERROR_CODES.AUTH_TOKEN_INVALID]: 401,
    [ERROR_CODES.AUTH_USER_NOT_FOUND]: 404,
    [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 403,
    [ERROR_CODES.VALIDATION_ERROR]: 400,
    [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 400,
    [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 400,
    [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 500,
    [ERROR_CODES.DATABASE_QUERY_ERROR]: 500,
    [ERROR_CODES.DATABASE_DUPLICATE_KEY]: 409,
    [ERROR_CODES.FILE_UPLOAD_ERROR]: 500,
    [ERROR_CODES.FILE_NOT_FOUND]: 404,
    [ERROR_CODES.FILE_INVALID_FORMAT]: 400,
    [ERROR_CODES.PERMISSION_DENIED]: 403,
    [ERROR_CODES.ROLE_INSUFFICIENT]: 403,
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
    [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,
    [ERROR_CODES.EMAIL_SERVICE_ERROR]: 502,
    [ERROR_CODES.PAYMENT_SERVICE_ERROR]: 502,
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
    [ERROR_CODES.NOT_FOUND]: 404,
    [ERROR_CODES.BAD_REQUEST]: 400,
    [ERROR_CODES.UNAUTHORIZED]: 401,
    [ERROR_CODES.FORBIDDEN]: 403,
    [ERROR_CODES.CONFLICT]: 409,
    [ERROR_CODES.UNPROCESSABLE_ENTITY]: 422
  };
  
  return statusCodeMap[code] || 500;
};

// Fonction pour formater une erreur pour l'API
const formatErrorForAPI = (error) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Erreur non opérationnelle (erreur système)
  return {
    success: false,
    error: {
      message: 'Une erreur interne s\'est produite',
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      statusCode: 500,
      timestamp: new Date().toISOString()
    }
  };
};

// Fonction pour formater une erreur pour le frontend
const formatErrorForFrontend = (error) => {
  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }
  
  return {
    success: false,
    message: 'Une erreur interne s\'est produite',
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    statusCode: 500
  };
};

// Fonction pour logger une erreur
const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };
  
  console.error('Error logged:', errorInfo);
  return errorInfo;
};

// Fonction pour valider une erreur
const isValidError = (error) => {
  return error instanceof AppError || 
         (error && typeof error === 'object' && error.message && error.statusCode);
};

// Fonction pour convertir une erreur en AppError
const convertToAppError = (error) => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error && typeof error === 'object') {
    return new AppError(
      error.message || 'Erreur inconnue',
      error.statusCode || 500,
      error.code || null
    );
  }
  
  return new AppError(
    error?.toString() || 'Erreur inconnue',
    500,
    ERROR_CODES.INTERNAL_SERVER_ERROR
  );
};

// Export des fonctions et constantes
module.exports = {
  AppError,
  ERROR_CODES,
  DEFAULT_ERROR_MESSAGES,
  createError,
  createErrorWithCode,
  getStatusCodeFromCode,
  formatErrorForAPI,
  formatErrorForFrontend,
  logError,
  isValidError,
  convertToAppError
};


