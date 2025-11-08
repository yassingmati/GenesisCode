// Firebase-compatible Express app entry point
// This exports the Express app without starting a server
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Load Firebase Functions config if available (for Firebase Functions environment)
let functionsConfig = null;
try {
  const functions = require('firebase-functions');
  functionsConfig = functions.config();
  console.log('✅ Firebase Functions config chargé');
} catch (err) {
  // Not in Firebase Functions environment, use process.env
  console.log('ℹ️  Mode local - utilisation de process.env');
}

// Load environment variables from Firebase Functions config or process.env
const getEnvVar = (key, defaultValue = '') => {
  // Try Firebase Functions config first (for production)
  if (functionsConfig) {
    const keys = key.split('.');
    let value = functionsConfig;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    if (value !== undefined) {
      console.log(`✅ ${key} chargé depuis functions.config()`);
      return value;
    }
  }
  // Fallback to process.env
  const envValue = process.env[key] || process.env[key.replace('.', '_').toUpperCase()];
  if (envValue) {
    console.log(`✅ ${key} chargé depuis process.env`);
    return envValue;
  }
  return defaultValue;
};

// Set environment variables for the app
process.env.MONGODB_URI = getEnvVar('mongodb.uri') || getEnvVar('MONGODB_URI') || process.env.MONGODB_URI;
process.env.JWT_SECRET = getEnvVar('jwt.secret') || getEnvVar('JWT_SECRET') || process.env.JWT_SECRET;
process.env.JWT_ADMIN_SECRET = getEnvVar('jwt.admin_secret') || getEnvVar('JWT_ADMIN_SECRET') || process.env.JWT_ADMIN_SECRET;
process.env.CLIENT_ORIGIN = getEnvVar('client.origin') || getEnvVar('CLIENT_ORIGIN') || process.env.CLIENT_ORIGIN;

const app = express();

// Firebase Functions provides the base URL via req.baseUrl
// For local dev, use CLIENT_ORIGIN, for Firebase use the hosting URL
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

console.log('🔧 Configuration chargée:');
console.log(`   CLIENT_ORIGIN: ${CLIENT_ORIGIN}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configuré' : '❌ Non configuré'}`);
console.log(`   JWT_ADMIN_SECRET: ${process.env.JWT_ADMIN_SECRET ? '✅ Configuré' : '❌ Non configuré'}`);

// --- Fetch helper: try global fetch first, then node-fetch if available ---
let fetchFn = globalThis.fetch || null;
try {
  if (!fetchFn) {
    fetchFn = require('node-fetch');
  }
} catch (err) {
  fetchFn = fetchFn || null;
}

// Optional Stripe init
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const StripeLib = require('stripe');
    stripe = StripeLib(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe initialisé');
  } catch (err) {
    console.warn('Impossible d\'initialiser Stripe:', err.message);
  }
} else {
  console.warn('STRIPE_SECRET_KEY non définie — Stripe désactivé');
}

// Load routes
let authRoutes, userRoutes, adminRoutes, courseRoutes, subscriptionRoutes, 
    parentRoutes, invitationRoutes, notificationRoutes, calendarRoutes, 
    reportsRoutes, courseAccessRoutes, subscriptionPaymentRoutes, 
    publicRoutes, paymentRoutes, accessRoutes, categoryPaymentRoutes;

try {
  authRoutes = require('./routes/authRoutes');
  console.log('✅ authRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement authRoutes:', err.message);
  try {
    authRoutes = require('./routes/authRoutesSimple');
    console.log('✅ authRoutesSimple chargé comme fallback');
  } catch (err2) {
    console.error('❌ Erreur chargement authRoutesSimple:', err2.message);
  }
}

try {
  userRoutes = require('./routes/userRoutes');
  console.log('✅ userRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement userRoutes:', err.message);
}

try {
  adminRoutes = require('./routes/adminRoutes');
  console.log('✅ adminRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement adminRoutes:', err.message);
}

try {
  courseRoutes = require('./routes/courseRoutes');
  console.log('✅ courseRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement courseRoutes:', err.message);
}

try {
  courseAccessRoutes = require('./routes/courseAccess');
  console.log('✅ courseAccessRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement courseAccessRoutes:', err.message);
}

try {
  accessRoutes = require('./routes/accessRoutes');
  console.log('✅ accessRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement accessRoutes:', err.message);
}

try {
  subscriptionRoutes = require('./routes/subscriptionRoutes');
  console.log('✅ subscriptionRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement subscriptionRoutes:', err.message);
}

try {
  subscriptionPaymentRoutes = require('./routes/subscriptionPayment');
  console.log('✅ subscriptionPaymentRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement subscriptionPaymentRoutes:', err.message);
}

try {
  categoryPaymentRoutes = require('./routes/categoryPaymentRoutes');
  console.log('✅ categoryPaymentRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement categoryPaymentRoutes:', err.message);
}

try {
  paymentRoutes = require('./routes/paymentRoutes');
  console.log('✅ paymentRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement paymentRoutes:', err.message);
}

try {
  parentRoutes = require('./routes/parentRoutes');
  console.log('✅ parentRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement parentRoutes:', err.message);
}

try {
  invitationRoutes = require('./routes/invitationRoutes');
  console.log('✅ invitationRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement invitationRoutes:', err.message);
}

try {
  notificationRoutes = require('./routes/notificationRoutes');
  console.log('✅ notificationRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement notificationRoutes:', err.message);
}

try {
  calendarRoutes = require('./routes/calendarRoutes');
  console.log('✅ calendarRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement calendarRoutes:', err.message);
}

try {
  reportsRoutes = require('./routes/reportsRoutes');
  console.log('✅ reportsRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement reportsRoutes:', err.message);
}

try {
  publicRoutes = require('./routes/publicRoutes');
  console.log('✅ publicRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement publicRoutes:', err.message);
}

// ---------- Security & headers ----------
app.set('trust proxy', 1);
app.use(morgan('combined'));
app.use(cookieParser());

// ---------- Compression ----------
const compression = require('compression');
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return true;
  }
}));

// Retirer X-Frame-Options (nous gérons CSP manually)
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  const frameAncestors = [`'self'`, CLIENT_ORIGIN];
  res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors.join(' ')};`);
  next();
});

// Helmet (disable built-in CSP because we set custom above)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Accepter les requêtes depuis le frontend et l'URL directe de la fonction
const allowedOrigins = [
  CLIENT_ORIGIN,
  'https://codegenesis-platform.web.app',
  'https://codegenesis-platform.firebaseapp.com',
  'https://us-central1-codegenesis-platform.cloudfunctions.net'
].filter(Boolean);

// Fonction pour vérifier si une origine est autorisée
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Permettre les requêtes sans origin
  
  // Vérifier si l'origine correspond exactement ou commence par une origine autorisée
  return allowedOrigins.some(allowed => {
    return origin === allowed || origin.startsWith(allowed);
  });
};

app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // En développement, permettre toutes les origines
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En production, vérifier si l'origine est autorisée
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS: Origine non autorisée: ${origin}`);
      console.warn(`   Origines autorisées: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type'],
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Gérer les requêtes OPTIONS (preflight) explicitement
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  if (!origin || isOriginAllowed(origin) || process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
  } else {
    res.sendStatus(403);
  }
});

// Rate limit
const isProduction = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 10000,
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.path === '/api/health' || req.path === '/health') return true;
    if (!isProduction) return true;
    const ip = (req.ip || '').replace('::ffff:', '');
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return true;
    }
    return false;
  }
});
app.use('/api/', limiter);

// Serve public
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
}));

// ---------- Health check endpoints ----------
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ---------- Stripe webhook (raw body) ----------
if (true) {
  app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe non configuré' });

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET non défini');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (session?.metadata?.userId) {
            const User = require('./models/User');
            await User.findByIdAndUpdate(session.metadata.userId, {
              'subscription.status': 'active',
              'subscription.stripeCustomerId': session.customer
            });
            console.log(`Subscription activated for user ${session.metadata.userId}`);
          }
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook handler error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });
}

// ---------- Body parsers (after webhook) ----------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ---------- Routes ----------
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (courseRoutes) app.use('/api/courses', courseRoutes);
if (courseAccessRoutes) app.use('/api/course-access', courseAccessRoutes);
if (accessRoutes) app.use('/api/access', accessRoutes);
if (subscriptionRoutes) app.use('/api/subscriptions', subscriptionRoutes);
if (subscriptionPaymentRoutes) app.use('/api/subscription-payments', subscriptionPaymentRoutes);
if (paymentRoutes) app.use('/api/payments', paymentRoutes);
if (parentRoutes) app.use('/api/parents', parentRoutes);
if (invitationRoutes) app.use('/api/invitations', invitationRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);
if (calendarRoutes) app.use('/api/calendar', calendarRoutes);
if (reportsRoutes) app.use('/api/reports', reportsRoutes);
if (categoryPaymentRoutes) app.use('/api/category-payments', categoryPaymentRoutes);
if (publicRoutes) app.use('/api/public', publicRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ---------- DB connection (for Firebase Functions) ----------
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('❌ URI MongoDB non définie (MONGODB_URI/MONGO_URI)');
      console.error('   Vérifiez la configuration Firebase Functions: firebase functions:config:get');
      return false;
    }
    
    console.log('🔗 Tentative de connexion à MongoDB...');
    console.log(`   URI: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Augmenter le timeout pour Firebase Functions
      maxPoolSize: 10
    });
    console.log('✅ Connecté à MongoDB avec succès');

    // Create uploads folders if missing
    try {
      await fsp.mkdir(path.join(__dirname, 'uploads', 'videos'), { recursive: true });
      await fsp.mkdir(path.join(__dirname, 'uploads', 'pdfs'), { recursive: true });
    } catch (mkdirErr) {
      console.warn('⚠️ Impossible de créer les dossiers uploads:', mkdirErr.message);
    }
    
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB:', err.message);
    console.error('   Stack:', err.stack);
    // Don't throw in Firebase Functions - let it retry on next request
    return false;
  }
};

// Connect to DB (Firebase Functions will handle this)
// Use a promise to track connection status
let dbConnectionPromise = null;
const getDBConnection = async () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB();
  }
  return dbConnectionPromise;
};

// Start connection immediately
getDBConnection().catch(err => {
  console.error('❌ Erreur lors de la connexion initiale MongoDB:', err.message);
});

// Export the Express app (not starting a server)
module.exports = app;

