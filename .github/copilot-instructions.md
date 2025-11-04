<!-- Short, actionable instructions for AI coding agents working on the GenesisCode repo -->
# Copilot instructions — GenesisCode

Purpose: help an AI agent be productive immediately by summarizing the architecture, common workflows, conventions, and concrete examples from this repository.

1) Big picture
- Monorepo-like layout: two main apps live at `frontend/` (React) and `backend/` (Node/Express + Mongoose). The frontend talks to backend under `/api` and some client code expects API base like `/api/courses`.
- Backend responsibilities: auth, course content, access control (level locking), payments (Stripe optional), file proxies and streaming. See `backend/src/index.js` for server wiring and `backend/src/services/accessControlService.js` (referenced in docs) for access logic.
- Frontend responsibilities: React UI, routes in `frontend/src/AppRouter.jsx`, authentication via Firebase + backend, media viewer (PDF/video). `frontend/package.json` copies `pdf.worker.min.js` into `public/` before start/build.

2) Quick start & dev commands (Windows PowerShell-friendly)
- Install deps at repo root if needed, then separately for apps:
  - Backend: `cd backend; npm install` then `npm run dev` or `npm start` to run server (uses `NODE_ENV` to toggle rate limit behavior).
  - Frontend: `cd frontend; npm install` then `npm start` (script runs `copy-pdf-worker` first).
- Useful backend scripts (see `backend/package.json`):
  - `npm run dev` — nodemon dev server
  - `npm start` — production start (node)
  - `npm run migrate`, `migrate:unlock`, `migrate:step` — data migration helpers under `backend/src/scripts`
  - `npm run test` — runs Jest tests (some scripts under `backend/src/scripts` provide smoke tests like `test:api`, `test:all`)
- Health checks: GET `/health` and `/api/health` (no auth). Media streaming: `/media/videos/:filename`.

3) Important environment variables (referenced in `backend/src/index.js`)
- MONGODB_URI or MONGO_URI — required to start backend
- PORT (default 5000), CLIENT_ORIGIN (default `http://localhost:3000`)
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET — optional; Stripe features disabled if absent
- NODE_ENV — affects rate limiting and other environment-specific behavior

4) Patterns & conventions you must follow (concrete, repo-specific)
- Defensive route loading: `backend/src/index.js` individually requires routes inside try/catch and logs fallbacks. When adding routes, follow the same pattern to avoid breaking server boot.
- Webhook raw body: Stripe webhook is mounted before `express.json()` and uses `express.raw({ type: 'application/json' })`. Keep webhook handlers before body parsers.
- File proxies & range headers: video proxy forwards `Range` headers. If implementing streaming or proxy features, forward relevant headers (Range, Accept-Ranges, Content-Range).
- Uploads folder: server ensures `backend/src/uploads/{videos,pdfs}` exist on start; use `path.join(__dirname, 'uploads', ...)` for filesystem paths.
- Error handling: a generic error handler returns French messages (most logs are in French). Preserve existing error message shape for clients expecting them (e.g. `{ error: '...' }`).

5) Key files to inspect when working on a feature
- `backend/src/index.js` — server bootstrap, CORS, security, routes, proxy endpoints
- `backend/src/services/accessControlService.js` — unified access decision logic referenced by scripts like `backend/scripts/access-smoke-test.js`
- `backend/src/routes/*` — route handlers; add new routes using the try/catch pattern used in `index.js`
- `backend/src/scripts/` — many helper scripts for migrations, seeding, smoke tests; prefer these for data/state setup in dev
- `frontend/src/AppRouter.jsx`, `frontend/src/index.js`, `frontend/src/App.jsx` — client entry and routing; `frontend/package.json` shows `copy-pdf-worker` step

6) Tests, lint, and CI expectations
- Backend: `npm test` runs Jest. There are also many small script-based smoke tests (`backend/scripts/*`) used by maintainers — prefer them when reproducing domain behavior (level unlocking, access control).
- Lint: `npm run lint` / `npm run lint:fix` available in backend. Frontend relies on CRA lint config.

7) Integration points & external services
- MongoDB — required for backend
- Stripe — optional; if env vars missing the Stripe routes may log and be disabled. Webhook SECRET is needed for signature verification.
- Firebase — frontend uses Firebase for auth (see `frontend/src/firebaseConfig.js`) and backend may use `firebase-admin`.

8) Language & message conventions
- Many logs and error messages are in French (e.g., "Erreur interne du serveur"). Keep this localization when touching user-facing messages unless a change includes i18n updates across frontend and backend.

9) Concrete examples to copy/paste
- Mounting a new route in `backend/src/index.js` (follow try/catch pattern):

  try {
    const exampleRoutes = require('./routes/exampleRoutes');
    app.use('/api/example', exampleRoutes);
    console.log('✅ exampleRoutes loaded');
  } catch (err) {
    console.error('❌ Error loading exampleRoutes:', err.message);
  }

- Adding a Stripe-like webhook before body parsers:

  app.post('/webhook/example', express.raw({ type: 'application/json' }), (req, res) => {
    // raw body available at req.body
  });

10) What NOT to change without cross-checking
- Don't move webhook endpoints that rely on raw body after `express.json()`.
- Don't change route loading to a single require that throws on first error; maintainers rely on partial loading when some modules fail.
- Don't assume global fetch exists on Node <18 — the server code tries require('node-fetch') as a fallback and logs guidance.

11) Where to run domain-specific smoke tests
- `node backend/scripts/access-smoke-test.js --user <userId> --path <pathId> [--level <levelId>]` — uses `accessControlService.js` to show access decisions.

12) Quick troubleshooting tips
- If startup fails with `URI MongoDB non définie`, ensure `MONGODB_URI` is set.
- If Stripe code errors about signature, ensure `STRIPE_WEBHOOK_SECRET` is configured; check webhook endpoint ordering (raw body required).
- If frontend PDF fails to load, ensure `node_modules/pdfjs-dist/build/pdf.worker.min.js` was copied to `frontend/public/` (scripts `copy-pdf-worker`).

If anything here is unclear or you'd like more examples (route skeletons, common refactors, or tests to add), tell me which area to expand and I will update this file.
