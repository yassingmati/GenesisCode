// server.js // Restart triggered // Force nodemon restart
// Charger les variables d'environnement depuis le fichier .env dans le dossier backend
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: envPath, override: true });
console.log(`📄 Chargement .env depuis: ${envPath}`);
console.log(`📄 MONGODB_URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NON DÉFINI'}`);
// Charger la configuration Konnect
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const fsp = fs.promises;
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

// CLIENT_ORIGIN - Priorité au frontend déployé en production
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ||
  (process.env.NODE_ENV === 'production'
    ? 'https://codegenesis-platform.web.app'
    : 'http://localhost:3000');
const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// --- Fetch helper: try global fetch first, then node-fetch if available ---
let fetchFn = globalThis.fetch || null;
try {
  if (!fetchFn) {
    // attempt CommonJS require (note: node-fetch v3 is ESM and may fail here)
    // Prefer Node 18+ (which has global fetch). If require fails, handlers will throw a clear error.
    // If you run Node < 18, install node-fetch v2: npm i node-fetch@2
    // If you use ESM/node-fetch v3, adapt your runtime/import accordingly.
    // We attempt require to be tolerant in many setups.
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

// Models & Routes (adapter si chemins différents)
let authRoutes, userRoutes, adminRoutes, courseRoutes, subscriptionRoutes, parentRoutes, invitationRoutes, notificationRoutes, calendarRoutes, reportsRoutes, courseAccessRoutes, subscriptionPaymentRoutes, publicRoutes, paymentRoutes, accessRoutes;
let gfsBucket;

// Charger les routes individuellement pour éviter qu'une erreur empêche le chargement des autres
try {
  authRoutes = require('./routes/authRoutes');
  console.log('✅ authRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement authRoutes:', err.message);
  // Essayer les routes simplifiées
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

// try {
//   subscriptionPaymentRoutes = require('./routes/subscriptionPayment');
//   console.log('✅ subscriptionPaymentRoutes chargé');
// } catch (err) {
//   console.error('❌ Erreur chargement subscriptionPaymentRoutes:', err.message);
// }

try {
  subscriptionRoutes = require('./routes/subscriptionRoutes');
  console.log('✅ subscriptionRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement subscriptionRoutes:', err.message);
}

try {
  publicRoutes = require('./routes/publicRoutes');
  console.log('✅ publicRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement publicRoutes:', err.message);
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

// CORS - Accepter les requêtes depuis le frontend déployé
// Ne pas inclure CLIENT_ORIGIN dans allowedOrigins si c'est localhost:3000 en production
const allowedOrigins = [
  'https://codegenesis-platform.web.app',
  'https://codegenesis-platform.firebaseapp.com',
  'http://localhost:3000', // Pour le développement local uniquement
  'http://localhost:5000'  // Pour le développement local uniquement
].filter(Boolean);

// Ajouter CLIENT_ORIGIN seulement s'il n'est pas localhost en production
if (CLIENT_ORIGIN && !(process.env.NODE_ENV === 'production' && CLIENT_ORIGIN.includes('localhost'))) {
  allowedOrigins.push(CLIENT_ORIGIN);
}

// Log pour debug
console.log('🌐 CORS - Origines autorisées:', allowedOrigins);
console.log('🌐 CORS - CLIENT_ORIGIN:', CLIENT_ORIGIN);

// Middleware pour forcer le bon header CORS
// Ce middleware s'assure que le header CORS utilise l'origine de la requête
const forceCorsOrigin = (req, res, next) => {
  const origin = req.headers.origin;

  // Si l'origine est présente et autorisée, forcer le header correct
  if (origin && (origin.includes('codegenesis-platform.web.app') ||
    origin.includes('codegenesis-platform.firebaseapp.com'))) {
    // Forcer le header avec l'origine de la requête
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
};

// Configuration CORS avec callback pour retourner l'origine de la requête
app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origin (mobile apps, Postman, etc.)
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
      // Retourner explicitement l'origine de la requête pour le frontend déployé
      console.log(`✅ CORS: Autorisation de l'origine: ${origin}`);
      return callback(null, origin);
    }

    const isAllowed = allowedOrigins.some(allowed => {
      if (origin === allowed) return true;
      if (allowed.startsWith('http') && origin.startsWith(allowed)) return true;
      return false;
    });

    if (isAllowed) {
      // Retourner explicitement l'origine de la requête
      callback(null, origin);
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

// Appliquer le middleware de force CORS après cors()
// Ce middleware écrase le header CORS avec l'origine de la requête si nécessaire
app.use(forceCorsOrigin);

// Gérer les requêtes OPTIONS (preflight) explicitement
app.options('*', (req, res) => {
  const origin = req.headers.origin;

  // Vérifier si l'origine est autorisée
  const isAllowed = !origin ||
    allowedOrigins.some(allowed => {
      if (origin === allowed) return true;
      if (allowed.startsWith('http') && origin.startsWith(allowed)) return true;
      return false;
    }) ||
    origin.includes('codegenesis-platform.web.app') ||
    origin.includes('codegenesis-platform.firebaseapp.com') ||
    process.env.NODE_ENV !== 'production';

  if (isAllowed) {
    // Utiliser l'origine de la requête, pas CLIENT_ORIGIN
    const allowedOrigin = origin || (allowedOrigins.includes('https://codegenesis-platform.web.app') ? 'https://codegenesis-platform.web.app' : '*');
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
  } else {
    // Permettre quand même le frontend déployé
    if (origin && (origin.includes('codegenesis-platform.web.app') || origin.includes('codegenesis-platform.firebaseapp.com'))) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      res.sendStatus(204);
    } else {
      console.warn(`⚠️  CORS OPTIONS: Origine non autorisée: ${origin}`);
      res.sendStatus(403);
    }
  }
});

// Rate limit optimisé (assoupli en développement et pour localhost)
const isProduction = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 10000, // en dev, seuil élevé pour éviter les blocages
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
    retryAfter: 900 // 15 minutes en secondes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting pour les endpoints de santé
    if (req.path === '/api/health' || req.path === '/health') return true;

    // En dev, désactiver le rate limit
    if (!isProduction) return true;

    // Whitelist localhost et réseau local
    const ip = (req.ip || '').replace('::ffff:', '');
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return true;
    }

    return false;
  }
});
app.use('/api/', limiter);

// Serve public (pour y déposer pdf.worker.min.js, assets, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploads (videos, pdfs, images) at /uploads/...
// This makes URLs like http://localhost:5000/uploads/videos/xxx.mp4 work
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
}));

// ---------- Health check endpoints (avant les routes protégées) ----------
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Health check (sans authentification)
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
// Keep webhook route before express.json() parsers
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
          }
          break;
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const User = require('./models/User');
          const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
          if (user) {
            user.subscription.currentPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);
            await user.save();
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const User = require('./models/User');
          await User.findOneAndUpdate(
            { 'subscription.stripeCustomerId': subscription.customer },
            { 'subscription.status': 'canceled' }
          );
          break;
        }
        default:
        // ignore other events
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Erreur traitement webhook:', err);
      res.status(500).json({ error: 'Erreur de traitement webhook' });
    }
  });
}

// Body parsers (après webhook)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Language middleware
app.use((req, res, next) => {
  req.language = req.acceptsLanguages(['fr', 'en', 'ar']) || 'fr';
  next();
});

// ---------- Helper: validate URLs (avoid SSRF) ----------
function isHttpUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// ---------- Proxy endpoints ----------
// Note: client expects /api/courses/proxyVideo (we expose both /api/proxyVideo and /api/courses/proxyVideo for compatibility)

// Generic proxy for files (PDF/images/etc.)
async function proxyFileHandler(req, res) {
  const url = req.query.url;
  if (!url || !isHttpUrl(url)) return res.status(400).json({ error: 'url param required (http/https)' });

  const fetcher = fetchFn || globalThis.fetch;
  if (!fetcher) return res.status(500).json({ error: 'fetch not available on server. Use Node 18+ or install node-fetch.' });

  try {
    const upstream = await fetcher(url, { method: 'GET' });
    if (!upstream.ok) return res.status(502).send('Upstream error');

    const contentType = upstream.headers.get ? upstream.headers.get('content-type') : upstream.headers['content-type'];
    const contentLength = upstream.headers.get ? upstream.headers.get('content-length') : upstream.headers['content-length'];

    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'public, max-age=300');

    // pipe stream (node-fetch Response.body is a stream)
    upstream.body.pipe(res);
  } catch (err) {
    console.error('proxyFile error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy failed' });
  }
}

// Video proxy with Range support (forward Range header to upstream)
async function proxyVideoHandler(req, res) {
  const url = req.query.url;
  if (!url || !isHttpUrl(url)) return res.status(400).json({ error: 'url param required (http/https)' });

  const fetcher = fetchFn || globalThis.fetch;
  if (!fetcher) return res.status(500).json({ error: 'fetch not available on server. Use Node 18+ or install node-fetch.' });

  try {
    // Forward Range header if provided by client
    const headers = {};
    if (req.headers.range) headers.Range = req.headers.range;

    const upstream = await fetcher(url, { method: 'GET', headers });
    if (!upstream.ok) {
      // upstream may return 206/200 but if not ok treat as error
      return res.status(502).send('Upstream video error');
    }

    // Forward useful headers
    const forwardHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'];
    for (const h of forwardHeaders) {
      const v = upstream.headers.get ? upstream.headers.get(h) : upstream.headers[h];
      if (v) res.setHeader(h, v);
    }

    const status = upstream.status || 200;
    res.status(status);
    upstream.body.pipe(res);
  } catch (err) {
    console.error('proxyVideo error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'proxy video failed' });
  }
}

// mount for backward compatibility
app.get('/api/proxyFile', proxyFileHandler);
app.get('/api/proxyVideo', proxyVideoHandler);

// mount under /api/courses to match client API_BASE = /api/courses
app.get('/api/courses/proxyFile', proxyFileHandler);
app.get('/api/courses/proxyVideo', proxyVideoHandler);



// ---------- GridFS File Route ----------
app.get('/api/files/:filename', async (req, res) => {
  if (!gfsBucket) return res.status(500).json({ error: 'GridFS non initialisé' });

  try {
    const file = await gfsBucket.find({ filename: req.params.filename }).next();
    if (!file) return res.status(404).json({ error: 'Fichier non trouvé' });

    // Handle Range header for all files (videos, pdfs, etc.)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': file.contentType || 'application/octet-stream',
      });

      const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename, {
        start,
        end: end + 1 // end is exclusive in some drivers, check if needed, but standard slice usually implies exclusive end
      });
      downloadStream.pipe(res);
    } else {
      res.set('Content-Type', file.contentType || 'application/octet-stream');
      res.set('Content-Length', file.length);
      res.set('Accept-Ranges', 'bytes'); // Advertises support for ranges
      const downloadStream = gfsBucket.openDownloadStreamByName(req.params.filename);
      downloadStream.pipe(res);
    }
  } catch (err) {
    console.error('GridFS error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du fichier' });
  }
});

// ---------- Media route for local video streaming (Range support) ----------
app.get('/media/videos/:filename', async (req, res) => {
  try {
    const filePath = path.join(UPLOADS_DIR, 'videos', path.basename(req.params.filename));
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

    const stat = await fsp.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (isNaN(start) || isNaN(end) || start > end) return res.status(416).send('Requested Range Not Satisfiable');

      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
      stream.on('error', err => {
        console.error('stream error', err);
        res.end();
      });
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error('media/videos error:', err);
    res.status(500).send('Server error');
  }
});

// ---------- Static PDFs: keep dedicated static route if needed ----------
app.use('/uploads/pdfs', express.static(path.join(__dirname, 'uploads', 'pdfs'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
}));

// ---------- Mount main API routes (if present) ----------
console.log('Loading routes...');
console.log('authRoutes:', !!authRoutes);
console.log('userRoutes:', !!userRoutes);
console.log('adminRoutes:', !!adminRoutes);
console.log('subscriptionRoutes:', !!subscriptionRoutes);
console.log('publicRoutes:', !!publicRoutes);
console.log('paymentRoutes:', !!paymentRoutes);
console.log('courseRoutes:', !!courseRoutes);
console.log('parentRoutes:', !!parentRoutes);
console.log('invitationRoutes:', !!invitationRoutes);
console.log('notificationRoutes:', !!notificationRoutes);

// Task Management Routes (Must be before adminRoutes to avoid conflict with /:id)
try {
  // Précharger le modèle TaskTemplate pour s'assurer qu'il est disponible
  const TaskTemplate = require('./models/TaskTemplate');
  console.log('✅ TaskTemplate model loaded');

  const taskTemplateRoutes = require('./routes/taskTemplateRoutes');
  const assignedTaskRoutes = require('./routes/assignedTaskRoutes');
  const taskRoutes = require('./routes/taskRoutes');

  app.use('/api/admin/task-templates', taskTemplateRoutes);
  app.use('/api/assigned-tasks', assignedTaskRoutes); // Shared base, specific routes handle admin/parent
  app.use('/api/tasks', taskRoutes); // Legacy task routes
  console.log('✅ Task Management Routes loaded');
} catch (err) {
  console.error('❌ Error loading Task Management Routes:', err.message);
  console.error('❌ Error stack:', err.stack);
}

if (authRoutes) {
  console.log('Mounting auth routes at /api/auth');
  app.use('/api/auth', authRoutes);
} else {
  console.error('authRoutes is undefined - routes not loaded');
}

if (userRoutes) app.use('/api/users', userRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (subscriptionRoutes) app.use('/api/subscriptions', subscriptionRoutes);
if (courseRoutes) app.use('/api/courses', courseRoutes);
if (parentRoutes) app.use('/api/parent', parentRoutes);
if (calendarRoutes) app.use('/api/calendar', calendarRoutes);
if (reportsRoutes) app.use('/api/reports', reportsRoutes);
if (invitationRoutes) app.use('/api/invitations', invitationRoutes);
// Routes de paiement par catégorie (doit être AVANT publicRoutes pour éviter les conflits)
try {
  const categoryPaymentRoutes = require('./routes/categoryPaymentRoutes');
  app.use('/api/category-payments', categoryPaymentRoutes);
  console.log('✅ categoryPaymentRoutes chargé');
} catch (err) {
  console.error('❌ Erreur chargement categoryPaymentRoutes:', err);
}

if (publicRoutes) app.use('/api', publicRoutes);
if (paymentRoutes) app.use('/api/payment', paymentRoutes);
if (notificationRoutes) app.use('/api', notificationRoutes);
if (courseAccessRoutes) app.use('/api/course-access', courseAccessRoutes);
// if (subscriptionPaymentRoutes) app.use('/api/subscription-payment', subscriptionPaymentRoutes);
if (accessRoutes) app.use('/api/access', accessRoutes);



// Health check endpoints déplacés plus haut dans le fichier

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ---------- DB connection & server start ----------
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('⚠️ URI MongoDB non définie (MONGODB_URI/MONGO_URI) - Mode dégradé activé');
      return false;
    }

    // Afficher l'URI (masquer le mot de passe)
    const uriDisplay = mongoURI.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://***:***@');
    console.log(`🔗 Tentative de connexion à MongoDB: ${uriDisplay}`);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Augmenter le timeout pour MongoDB Atlas
      maxPoolSize: 10
    });

    console.log('✅ Connecté à MongoDB');

    // Init GridFS Bucket
    const db = mongoose.connection.db;
    gfsBucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });
    console.log('✅ GridFS Bucket initialisé');

    return true;
  } catch (err) {
    console.error('⚠️ Erreur connexion MongoDB:', err.message);
    console.warn('⚠️ Mode dégradé: Le serveur démarre sans MongoDB');
    console.warn('⚠️ Les fonctionnalités nécessitant MongoDB ne fonctionneront pas');

    // Afficher des suggestions d'aide selon le type d'erreur
    if (err.message.includes('authentication failed') || err.message.includes('Authentication failed')) {
      console.error('💡 Vérifiez que le mot de passe MongoDB est correct dans backend/.env');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
      console.error('💡 Vérifiez que Network Access est configuré dans MongoDB Atlas (0.0.0.0/0)');
      console.error('💡 Vérifiez que l\'URI MongoDB Atlas est correcte dans backend/.env');
    } else if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
      console.error('💡 Vérifiez votre connexion internet et que le cluster MongoDB Atlas est actif');
    }

    return false;
  }
};

// Create uploads folders
const createUploadFolders = async () => {
  try {
    await fsp.mkdir(path.join(__dirname, 'uploads', 'videos'), { recursive: true });
    await fsp.mkdir(path.join(__dirname, 'uploads', 'pdfs'), { recursive: true });
  } catch (err) {
    console.warn('⚠️ Erreur création dossiers uploads:', err.message);
  }
};

let server;
(async () => {
  try {
    // Create upload folders
    await createUploadFolders();

    // Try to connect to MongoDB (non-blocking)
    const dbConnected = await connectDB();

    // Start server even if MongoDB is not connected
    server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`Client autorisé en iframe: ${CLIENT_ORIGIN}`);

      if (dbConnected) {
        console.log('✅ Base de données connectée. Initialisation des tâches planifiées...');
        // Start cron jobs for task renewal ONLY after DB is connected
        require('./jobs/taskRenewalCron');
      } else {
        console.warn('⚠️ ATTENTION: MongoDB non connecté - Mode dégradé actif');
      }
    });

    // Handle server errors (e.g., port already in use)
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Erreur: Le port ${PORT} est déjà utilisé`);
        console.error(`💡 Solution: Arrêtez le processus utilisant le port ${PORT} ou changez le port dans .env`);
        console.error(`💡 Pour arrêter tous les processus Node.js: Get-Process -Name node | Stop-Process -Force`);
        process.exit(1);
      } else {
        console.error('❌ Erreur serveur:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Impossible de démarrer le serveur:', err);
    process.exit(1);
  }
})();

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`Signal ${signal} reçu — fermeture...`);
  try {
    if (server) {
      server.close(() => console.log('HTTP server closed'));
    }
    await mongoose.connection.close();
    console.log('MongoDB déconnecté');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la fermeture:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
