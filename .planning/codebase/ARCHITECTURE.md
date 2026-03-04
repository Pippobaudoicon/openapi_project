# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Layered N-tier architecture with middleware-driven request processing pipeline

**Key Characteristics:**
- Middleware-based cross-cutting concerns (logging, credit tracking, caching, permissions)
- Multi-frontend strategy (legacy client, modern Vue dashboard, Nuxt search interface)
- External API integration with OpenAPI (Altravia company data) and OpenAI
- Session-based authentication with role/permission-based authorization
- Credit-debit system tracking API consumption
- Smart caching layer (Meilisearch + MongoDB CompanySearch model)

## Layers

**Presentation Layer:**
- Purpose: User-facing interfaces for different workflows
- Location: `smart-search/`, `modern-client/` (Express also serves as API backend, not pure API-only)
- Contains: Vue/Nuxt components, pages, layouts, composables, stores
- Depends on: Backend REST API at `/api/v1/*`
- Used by: End users accessing company search and dashboard

**API Layer (Express Backend):**
- Purpose: RESTful HTTP endpoints, request validation, middleware orchestration
- Location: `server/routes/api/`
- Contains: Route definitions mounting middleware chains and handler logic
- Depends on: Models, Services, Middleware, External APIs
- Used by: Frontend applications via fetch/axios

**Middleware Layer:**
- Purpose: Cross-cutting concerns applied to routes
- Location: `server/middleware/`
- Contains:
  - `creditTracker.js` - Credit balance checking + cost calculation + transaction logging
  - `activityLogger.js` - User activity tracking to Activity model
  - `cacheCheck.js` - CompanySearch cache lookup before API calls
  - `roleAuth.js` - Permission/role-based access control
- Applied: Conditionally per-route to implement payment model, audit trail, permissions

**Data Access Layer:**
- Purpose: MongoDB interaction and in-memory caching
- Location: `server/models/`
- Contains:
  - `User.js` - User account, credits, settings
  - `CreditTransaction.js` - Audit log of all credit debits/credits
  - `CompanySearch.js` - Cached API responses with 30-day TTL
  - `Activity.js` - User action history
  - `SearchHistory.js` - Saved search queries for reuse
  - `VisureSearch.js` - Visure Camerali response cache
  - `Role.js` - Permission definitions
- Depends on: Mongoose, MongoDB
- Used by: Services and Routes

**Service Layer:**
- Purpose: Business logic for external integrations and complex operations
- Location: `server/services/`
- Contains:
  - `openaiService.js` - GPT-4-turbo LLM for query parsing and financial summaries
  - `fileService.js` - ZIP file handling and validation
  - One-time scripts for data migration (separate subdirectory)
- Depends on: Models, External APIs

**Integration Layer:**
- Purpose: Configured HTTP clients for external services
- Location: `server/utils/axiosOpenapi.js`
- Contains: Axios instances with pre-configured auth headers for:
  - OpenAPI Company registry (bearer token)
  - OpenAPI Visure Camerali (bearer token)
  - OpenAPI OAuth service (basic auth)
- Depends on: Environment variables
- Used by: Routes directly, Services

**Utility Layer:**
- Purpose: Reusable helpers
- Location: `server/utils/`
- Contains:
  - `meilisearch.js` - Full-text search wrapper for company indexes
  - `paths.js` - Absolute path resolution for logs, data, uploads
  - `emailService.js` - Email sending (verification, password reset)
  - `searchHelpers.js` - Query parsing utilities

**Frontend Service Layer (Nuxt/Vue):**
- Purpose: Smart Search Nitro routes and Modern Client composables
- Smart Search location: `smart-search/server/routes/`
- Modern Client location: `modern-client/src/services/`
- Contains: HTTP clients, auth helpers, API wrappers
- Depends on: Backend API, local stores
- Used by: Frontend components

## Data Flow

**Search Flow (Nuxt Smart Search):**

1. User enters natural language query in `smart-search/app/pages/index.vue`
2. `search/parse.post.ts` (Nitro route) forwards to `/api/v1/ai/parse-query` on backend
3. Backend `openaiService.js` parses query with GPT-4-turbo → returns filtered params + interpretation
4. If cache hit (parsed params match saved search), returns cached full results → UI renders
5. If no cache, Nuxt store triggers `/search/results` → backend `company.js` `/company/search` with parsed params
6. Backend calls `meilisearch.searchCompanies()` → Meilisearch query → response
7. Response intercepted by `trackOpenAPICredit` middleware, costs calculated, `CreditTransaction` logged
8. Response intercepted by `logActivity` middleware → `Activity` model updated
9. Results cached in `CompanySearch` model with 30-day TTL
10. `/search/save` endpoint (fire-and-forget) stores search params to `SearchHistory`
11. Results rendered in Nuxt components

**Company Detail Flow:**

1. User clicks company result → navigates to `/company/[piva]`
2. Page calls backend:
   - `/api/v1/company/:piva` (cached simple lookup from CompanySearch)
   - `/api/v1/openapi/IT-advanced/:piva` (if uncached, calls OpenAPI with credit debit)
   - `/api/v1/company/:piva/overview` (calls OpenAI for financial summary)
3. Each endpoint:
   - Checks `checkCreditBalance` middleware
   - Checks `checkCache` middleware
   - Executes handler
   - Intercepted by `trackOpenAPICredit` (cost + transaction)
   - Intercepted by `logActivity` (audit trail)
4. Data stored in CompanySearch model
5. Response returned to frontend

**Credit Debit Flow:**

1. Route handler decorated with `checkCreditBalance(service, action)`
2. Middleware checks User.creditBalance >= cost for action
3. Returns 402 Payment Required if insufficient
4. Handler executes
5. Response intercepted by `trackOpenAPICredit` middleware:
   - Calculates actual cost based on result count
   - Calls `CreditTransaction.createDebit()` which:
     - Deducts from User.creditBalance
     - Creates atomic transaction record
     - Logs relatedActivityId, metadata, endpoint info
6. Transaction persists to MongoDB

**Authentication Flow:**

1. `/api/v1/auth/login` receives email + password
2. Passport local strategy validates (bcrypt comparison)
3. Session created via express-session + MongoStore
4. Session cookie set (httpOnly, secure in prod)
5. Middleware `checkPermission` on routes verifies req.user exists
6. Access control checked against Role collection

## Key Abstractions

**Request Pipeline:**

Every route using this pattern:
```
Route Handler
├── checkPermission('action') - throw 403 if user lacks role
├── checkCreditBalance(service, action) - throw 402 if insufficient credits
├── checkCache(type, subtype) - intercept if cached, skip handler
├── logActivity({...}) - wrap response to log activity post-response
├── trackOpenAPICredit(action) - wrap response to debit credits
└── Handler Logic (async)
```

Pattern: `server/routes/api/openapi.js` lines 33-68 (IT-advanced route)

**Credit Model:**

- Every API call costs credits (base cost + per-result multiplier)
- Costs configured in `server/config/creditConfig.js` (not shown in read, but referenced)
- Transactions atomic via `CreditTransaction.createDebitWithLimits()` static method
- Supports daily/monthly spending limits from `User.creditSettings`
- Tracks OpenAI token usage separately from OpenAPI calls

**Caching Strategy:**

- Layer 1: Meilisearch index for full-text search (10M companies, real-time)
- Layer 2: CompanySearch MongoDB model (stores API responses, 30-day TTL)
- Cache keys: `{searchType, piva}` for advanced/full/closed company searches
- Bypass: Query params can force fresh API calls (dryRun=true estimated cost without debit)

**Activity Logging:**

- Every significant user action creates Activity record
- Middleware wraps res.json to capture response + request context
- Metadata includes: query params, search results count, company PIVA, endpoints called
- Used for: Audit trail, feature analytics, activity history view in UI

## Entry Points

**Backend Express App:**

- Location: `server/app.js`
- Triggers: `npm run dev` (development) or Docker container
- Responsibilities:
  - Mount Express middleware (CORS, JSON parsing, session, passport)
  - Connect MongoDB
  - Mount route handlers at `/api/v1/*`
  - Serve static files for modern-client dist
  - 404 → serve index.html (SPA fallback)

**Smart Search Nuxt App:**

- Location: `smart-search/server/routes/` (Nitro) + `smart-search/app/app.vue`
- Triggers: `npm run dev` (port 3001)
- Responsibilities:
  - Auto-import components (Nuxt 4 deduplication: `SearchBar` not `SearchSearchBar`)
  - Mount Nitro routes for auth/check, search/parse, search/results
  - devProxy `/api/**` → Express backend (no CORS needed in dev)
  - Render pages with Pinia stores

**Modern Client Vue App:**

- Location: `modern-client/src/main.js` + `src/router/index.js`
- Triggers: `npm run dev` (port 5173)
- Responsibilities:
  - Mount Vue Router with auth guard (requiresAuth meta)
  - Define routes: /auth/*, /dashboard, /search, /company/:piva, /credits, /activity
  - Vite proxy `/api/**` → Express backend
  - Render SPA with Pinia stores

## Error Handling

**Strategy:** Express error handler middleware + try-catch in routes + client-side error boundaries

**Patterns:**

- Async route handlers wrapped in try-catch, error → `res.status(500).json(error.message)`
- Credit checks return `402 Payment Required` with message
- Permission checks return `403 Forbidden`
- JSON parse errors handled in app.js middleware (lines 38-110)
- OpenAI/OpenAPI failures logged, error message returned to client
- Middleware errors: if middleware throws, Express catches and returns 500

## Cross-Cutting Concerns

**Logging:**

- Console in dev (morgan 'dev')
- Rotating file stream in prod (`server/logs/` daily rotation, 10M size)
- Activity model for user action audit trail
- Error logs to separate `logs/errors/` directory

**Validation:**

- Route param parsing (piva from URL)
- Query param parsing + defaults (from, size, filters)
- Request body validation (Passport validates email/password format)
- No dedicated validation middleware (Joi/zod); inline checks per route

**Authentication:**

- Session-based via Passport local strategy
- Password hashed with bcrypt (10 rounds)
- Session store: MongoDB via connect-mongo
- Cookie secure flag enabled in production
- Frontend stores session via httpOnly cookie (not exposed to JS)

**Authorization:**

- Role column in User model (enum: 'user', 'admin')
- `checkPermission(action)` middleware maps role → allowed actions
- Permissions stored in Role collection (seed data not shown)
- Routes protect endpoints: `checkPermission('search')`, `checkPermission('advanced_search')`

