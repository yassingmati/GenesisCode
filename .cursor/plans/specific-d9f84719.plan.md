<!-- d9f84719-8648-4a67-9155-75ccd3b170c5 ac6e9782-7521-4869-bed4-8be9bdd15d1c -->
# Category Plan–Based Access Control

## What we’ll build

- Add plan-based access control per `Category` using `CategoryPlan` and `CategoryAccess`.
- Admin can create/update plans (price, currency, paymentType, accessDuration, features, active).
- Frontend guards will check access and unlock levels; free first level logic preserved.
- Payment flow via Konnect remains; webhook activates access.

## Current state (observed)

- Models exist: `CategoryPlan`, `CategoryAccess` with helpers and indexes.
- Service/controller/routes exist: `CategoryPaymentService`, `categoryPaymentController`, `categoryPaymentRoutes` (init payment, webhook, access checks, unlock, history, cleanup).
- Frontend had access checks; recently removed for specific flow; we will reintroduce behind a feature flag/config.

## Backend changes

1. Plans API (CRUD + validate)

- Add admin endpoints:
- POST `/api/category-payments/plans` create
- PUT `/api/category-payments/plans/:planId` update
- DELETE `/api/category-payments/plans/:planId` archive/soft-delete (set `active=false`)
- GET `/api/category-payments/plans?active=true` list
- Validation: one active plan per category; price ≥ 0; translations required.
- Controller additions: `createPlan`, `updatePlan`, `deletePlan`, `listPlans`.
- Service helpers: `createOrUpdatePlan`, `archivePlan`, `listPlans`.

2. Access rules

- Keep: first level of each path is free (no plan required) when no active access.
- Add: if `CategoryPlan.price === 0`, grant free access automatically on init.
- Add: configurable grace window for webhook confirmation (e.g., 15 min) to avoid race conditions.
- Add: scheduled cleanup (already provided) to expire access.

3. Webhook hardening

- Verify Konnect signature (if available) and merchantOrderId metadata.
- Idempotency: store processed payment ids to avoid double activation.

4. Analytics/logging

- Add info logs around plan lookups, grants, unlocks. Optionally add a simple `PaymentEvent` collection for auditing (optional).

## Frontend changes

1. Admin Dashboard (split by domain)

- Subscription Management (`/admin/Subscription`): full CRUD UI for `CategoryPlan`
- Select a `Category` → create/edit plan fields: translations (name/desc), price, currency, paymentType (one_time/monthly/yearly), accessDuration (days), features, active, order.
- List/search/sort plans; enforce one active plan per category; archive/reactivate plans.
- Files: `frontend/src/pages/admin/SubscriptionManagement.jsx`, service `frontend/src/services/adminCategoryPlansService.js`.
- Payment Management (`/admin/payments`): payments, accesses, refunds, cleanup
- List payments/events, filter by status/category/user, view `CategoryAccess` records.
- Admin actions: mark refund (if supported), force-expire access, run cleanup.
- Files: `frontend/src/pages/admin/PaymentManagement.jsx`, service `frontend/src/services/adminPaymentsService.js`.
- Router: add routes in `frontend/src/AppRouter.jsx` for both pages with `AuthGuard` and admin role check.

2. Learner flows (/courses and /learning)

- Reinstate level access control using `categoryPaymentService`:
- For specific-language pages, show lock state for levels beyond first when no access.
- CTA: “Débloquer la catégorie” (if no access) → calls init payment → redirect to paymentUrl.
- After return, show pending state until webhook confirms; poll `/history` briefly or check on page open.
- Keep mobile optimization: PDF fullscreen, video modal. Show a small lock badge on cards.
- Centralize access guard component `CategoryAccessGate` used across both flows (prop: `categoryId`, `pathId`, `levelId`).

3. Payment UI

- Minimal payment status pages:
- `/payment/success` → reads query, shows success, deep-links back to last visited category/levels.
- `/payment/cancel` → shows cancel and retry.

## Data & migration

- Ensure index uniqueness: one active `CategoryPlan` per `category` (enforce in service).
- Backfill: if no plan for category, auto-create free plan (price 0) for classic categories if desired, or leave null (then only first levels are accessible).

## Security

- Protect admin CRUD with existing `authMiddleware` + role check.
- Validate that `initCategoryPayment` requires authenticated user.
- Sanitize features list and translations.

## Files to change (essentials)

- backend
- `backend/src/routes/categoryPaymentRoutes.js`: add admin CRUD routes
- `backend/src/controllers/categoryPaymentController.js`: add plan CRUD handlers
- `backend/src/services/categoryPaymentService.js`: add CRUD helpers, idempotency for webhook
- (optional) `backend/src/models/PaymentEvent.js`: audit trail
- frontend
- `frontend/src/pages/admin/CourseManagement.jsx`: add plans section/component
- `frontend/src/services/categoryPaymentService.js`: expose `getPlan`, `initPayment`, `checkLevelAccess`, `unlockLevel`, `getHistory`, `listPlans`, `createPlan`, `updatePlan`, `archivePlan`
- `frontend/src/components/CategoryAccessGate.jsx`: shared guard
- `frontend/src/components/LevelCard.jsx`: restore lock/CTA logic under guard; keep UI modern
- `frontend/src/pages/payment/Success.jsx`, `Cancel.jsx`: simple status pages

## Acceptance criteria

- Admin can create/update/archive one active plan per category.
- Learners without access: see only first levels active; others locked with CTA to purchase.
- Successful Konnect payment activates access and unlocks first levels; subsequent locked levels can be unlocked as user progresses.
- Works in both `/courses/...` and `/learning/...` flows, desktop and mobile.

## Rollout plan

- Phase 1: backend CRUD + tests
- Phase 2: admin UI
- Phase 3: reintroduce guards in learning pages
- Phase 4: payment success/cancel pages
- Phase 5: QA across flows (guest, paid, free plan)

### To-dos

- [ ] Add admin CRUD routes/handlers for CategoryPlan
- [ ] Implement CategoryPaymentService helpers for plans CRUD & idempotency
- [ ] Add CategoryPlans management UI in CourseManagement.jsx
- [ ] Create CategoryAccessGate and rewire LevelCard to use it
- [ ] Add /payment/success and /payment/cancel pages
- [ ] QA: verify access rules across /courses and /learning on mobile/desktop