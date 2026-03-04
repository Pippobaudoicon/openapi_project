# Codebase Structure

**Analysis Date:** 2026-03-04

## Directory Layout

```
openapi_project/
├── server/                    # Express.js backend (port 3000)
│   ├── app.js                 # Express app initialization, middleware setup
│   ├── package.json           # Backend dependencies
│   ├── routes/
│   │   └── api/
│   │       ├── index.js       # Route mounting (v1 prefix)
│   │       ├── auth.js        # Login, register, password reset
│   │       ├── openapi.js     # Company registry searches (IT-advanced, IT-full, etc)
│   │       ├── company.js     # Cached company data, Meilisearch, LLM overview
│   │       ├── ai.js          # Query parsing, GPT-4 integration
│   │       ├── credits.js     # Credit balance, transactions, limits
│   │       ├── users.js       # User profile endpoints
│   │       ├── activities.js  # Activity history
│   │       ├── one-time-script/  # Data migration endpoints
│   │       └── callbacks/     # Webhook endpoints (if applicable)
│   ├── middleware/
│   │   ├── creditTracker.js   # Credit cost calculation, debit, transaction logging
│   │   ├── activityLogger.js  # User action audit trail
│   │   ├── cacheCheck.js      # CompanySearch model cache lookup
│   │   └── roleAuth.js        # Permission checking, role-based access
│   ├── models/
│   │   ├── User.js            # User, creditBalance, creditSettings
│   │   ├── CreditTransaction.js # Audit log of debits/credits
│   │   ├── CompanySearch.js   # Cached API responses, 30-day TTL
│   │   ├── Activity.js        # User action history
│   │   ├── SearchHistory.js   # Saved search queries
│   │   ├── VisureSearch.js    # Visure Camerali cache
│   │   └── Role.js            # Permission roles
│   ├── services/
│   │   ├── openaiService.js   # GPT-4 query parsing, financial summaries
│   │   ├── fileService.js     # ZIP file validation
│   │   └── one-time-scripts/  # Data migration scripts
│   ├── config/
│   │   ├── env.js             # Load .env variables
│   │   ├── database.js        # MongoDB connection, session store
│   │   └── creditConfig.js    # Cost definitions per action
│   ├── auth/
│   │   └── passport-config.js # Passport local strategy setup
│   ├── utils/
│   │   ├── axiosOpenapi.js    # Configured axios clients (company, visure, oauth)
│   │   ├── meilisearch.js     # Full-text search wrapper
│   │   ├── paths.js           # Absolute path resolution (logs, data, dist)
│   │   ├── emailService.js    # Email sending (verification, password reset)
│   │   └── searchHelpers.js   # Query parsing helpers
│   ├── logs/
│   │   ├── access.log         # Morgan HTTP request logs
│   │   └── errors/            # Error log files
│   ├── docs/                  # API documentation
│   ├── .env                   # Runtime config (secrets, API keys)
│   ├── .env.development       # Dev-specific overrides
│   ├── Dockerfile             # Docker image for backend
│   └── README.md              # Backend setup notes
│
├── smart-search/              # Nuxt 4 search-focused frontend (port 3001)
│   ├── app/
│   │   ├── app.vue            # Root component (theme toggle)
│   │   ├── pages/
│   │   │   ├── index.vue      # Search page (natural language input)
│   │   │   └── company/
│   │   │       └── [piva].vue # Company detail page (company-specific data)
│   │   ├── components/
│   │   │   ├── search/
│   │   │   │   └── SearchBar.vue  # Search input + interpret button
│   │   │   └── company/       # Company data display components
│   │   ├── stores/
│   │   │   └── search.ts      # Pinia search state (query, results, interpretation)
│   │   ├── composables/
│   │   │   └── useTheme.ts    # Dark/light theme toggle
│   │   ├── middleware/        # Nuxt middleware (auth checks, redirects)
│   │   ├── assets/
│   │   │   └── css/main.css   # Tailwind globals
│   │   └── utils/             # Helper functions
│   ├── server/
│   │   └── routes/
│   │       ├── auth/
│   │       │   └── check.get.ts    # Check if user is authenticated
│   │       ├── search/
│   │       │   ├── parse.post.ts   # Forward to /api/v1/ai/parse-query
│   │       │   ├── results.get.ts  # Forward to /api/v1/company/search
│   │       │   ├── save.post.ts    # Save search to SearchHistory
│   │       │   └── history.get.ts  # Fetch user's saved searches
│   │       └── _api/
│   │           └── company/
│   │               ├── [piva].get.ts        # Company detail (forward to backend)
│   │               └── [piva]/overview.get.ts # LLM summary
│   ├── nuxt.config.ts         # Nuxt 4 config (devProxy for /api, Pinia, Tailwind)
│   ├── tailwind.config.ts     # Tailwind CSS
│   ├── package.json           # Smart Search dependencies
│   ├── Dockerfile             # Docker image for Nuxt app
│   └── README.md              # Smart Search setup notes
│
├── modern-client/             # Vue 3 + Vite dashboard (port 5173)
│   ├── src/
│   │   ├── main.js            # Vue app entry, Router + Pinia
│   │   ├── App.vue            # Root component
│   │   ├── router/
│   │   │   └── index.js       # Vue Router (auth guard, route definitions)
│   │   ├── views/
│   │   │   ├── auth/
│   │   │   │   ├── LoginView.vue
│   │   │   │   ├── RegisterView.vue
│   │   │   │   ├── ForgotPasswordView.vue
│   │   │   │   └── ResetPasswordView.vue
│   │   │   ├── DashboardView.vue      # Stats, quick actions
│   │   │   ├── SearchView.vue         # Company search interface
│   │   │   ├── CompanyDetailView.vue  # Single company full details
│   │   │   ├── CompanyUnifiedView.vue # Multi-company comparison
│   │   │   ├── StoredView.vue         # Saved/cached searches
│   │   │   ├── VisureView.vue         # Visure Camerali queries
│   │   │   ├── ProfileView.vue        # User account settings
│   │   │   ├── FilesView.vue          # Uploaded files management
│   │   │   ├── CreditHistoryView.vue  # Credit transactions
│   │   │   ├── ActivityHistoryView.vue # User action log
│   │   │   └── NotFoundView.vue
│   │   ├── layouts/
│   │   │   ├── AuthLayout.vue    # Auth page layout (no sidebar)
│   │   │   └── AppLayout.vue     # Main app layout (sidebar + header)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.vue
│   │   │   │   ├── Sidebar.vue
│   │   │   │   └── SidebarItem.vue
│   │   │   ├── search/
│   │   │   │   ├── SearchForm.vue
│   │   │   │   ├── CompanyCard.vue
│   │   │   │   └── SearchFilters.vue
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.vue
│   │   │   │   ├── CreditCard.vue
│   │   │   │   └── QuickActionCard.vue
│   │   │   └── company/       # Company detail components
│   │   ├── stores/
│   │   │   ├── auth.js        # Auth state (user, token, login/logout)
│   │   │   ├── company.js     # Company search results state
│   │   │   ├── user.js        # User profile state
│   │   │   └── activity.js    # Activity history state
│   │   ├── composables/
│   │   │   └── useCredits.js  # Credit balance tracking
│   │   ├── services/          # HTTP clients (API wrappers)
│   │   └── style.css          # Global styles
│   ├── dist/                  # Built SPA (served by Express)
│   ├── vite.config.js         # Vite config (proxy to localhost:3000/api)
│   ├── tailwind.config.js     # Tailwind CSS
│   ├── package.json           # Modern Client dependencies
│   ├── Dockerfile             # Docker image for Vue app
│   └── README.md              # Modern Client setup notes
│
├── client/                    # Legacy client (UNUSED - kept for reference)
│
├── docs/                      # Project documentation
│   ├── ARCHITECTURE.md        # System design overview
│   ├── API.md                 # REST endpoint reference
│   ├── MODELS.md              # MongoDB schema definitions
│   └── ROADMAP.md             # Feature roadmap
│
├── bruno/                     # API testing collection
│   ├── environments/
│   │   ├── dev.bru            # Dev environment vars
│   │   └── prod.bru           # Prod environment vars
│   ├── Website/               # Request collections by feature
│   ├── Auth/
│   ├── Company/
│   ├── Credits/
│   └── .env                   # Secrets (gitignored)
│
├── docker-compose.yml         # Dev services (MongoDB, Meilisearch)
├── docker-compose.prod.yml    # Prod deployment stack
├── CLAUDE.md                  # Agent instructions (single source of truth)
├── .env.example               # Template for required env vars
└── README.md                  # Project overview
```

## Directory Purposes

**server/** - Express backend REST API, authentication, data models

**smart-search/** - Nuxt 4 optimized for natural language company search (lightweight, single-purpose)

**modern-client/** - Vue 3 comprehensive dashboard (all features: search, profile, credits, activity, files)

**docs/** - Architecture docs, API reference, models, roadmap (human-readable design docs)

**bruno/** - REST API testing/documentation (Bruno client collection, alternative to Postman)

## Key File Locations

**Entry Points:**

- Backend: `server/app.js` (Express app initialization, middleware setup)
- Smart Search: `smart-search/app/app.vue` (Nuxt root, theme toggle)
- Smart Search Pages: `smart-search/app/pages/index.vue` (search), `[piva].vue` (detail)
- Modern Client: `modern-client/src/main.js` (Vue app, router, stores)
- Modern Client Pages: `modern-client/src/views/` (all dashboard screens)

**Configuration:**

- Backend config: `server/config/env.js`, `database.js`, `creditConfig.js`
- Smart Search config: `smart-search/nuxt.config.ts`, `tailwind.config.ts`
- Modern Client config: `modern-client/vite.config.js`, `tailwind.config.js`, `src/router/index.js`
- Environment vars: `.env`, `.env.development`, `.env.example`
- Docker: `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod)

**Core Logic:**

**Backend:**
- Models: `server/models/*.js` (User, CreditTransaction, CompanySearch, Activity, etc.)
- Routes: `server/routes/api/*.js` (auth, openapi, company, ai, credits, activities, users)
- Middleware: `server/middleware/*.js` (creditTracker, activityLogger, cacheCheck, roleAuth)
- Services: `server/services/openaiService.js` (LLM integration), `fileService.js`
- Utils: `server/utils/axiosOpenapi.js` (OpenAPI clients), `meilisearch.js` (search)

**Frontend:**
- Smart Search:
  - State: `smart-search/app/stores/search.ts` (Pinia - query, results, interpretation)
  - Routes: `smart-search/server/routes/` (Nitro handlers - parse, results, save, history)
  - Components: `smart-search/app/components/search/` (SearchBar, etc.)
- Modern Client:
  - State: `modern-client/src/stores/` (auth, company, user, activity stores)
  - Router: `modern-client/src/router/index.js` (route definitions, auth guards)
  - Components: `modern-client/src/components/` (layout, search, dashboard, company)
  - Views: `modern-client/src/views/` (page screens, lazy-loaded)

**Testing:**
- Bruno API collection: `bruno/` (request definitions per endpoint)
- Test environments: `bruno/environments/dev.bru`, `prod.bru`
- Secrets: `bruno/.env` (gitignored, not committed)

## Naming Conventions

**Files:**

- Routes: kebab-case (`auth.js`, `openapi.js`, `company.js`)
- Models: PascalCase (`User.js`, `CreditTransaction.js`, `CompanySearch.js`)
- Middleware: camelCase descriptive (`creditTracker.js`, `activityLogger.js`, `cacheCheck.js`, `roleAuth.js`)
- Services: camelCase descriptive (`openaiService.js`, `fileService.js`)
- Utils: camelCase descriptive (`axiosOpenapi.js`, `meilisearch.js`, `emailService.js`, `searchHelpers.js`)
- Vue/Nuxt components: PascalCase (`SearchBar.vue`, `CompanyCard.vue`, `CreditCard.vue`)
- Nuxt pages: kebab-case or dynamic slots (`index.vue`, `[piva].vue`, `check.get.ts`)
- Vue stores (Pinia): lowercase (`auth.js`, `company.js`, `search.ts`)
- Vue views: PascalCase + View suffix (`LoginView.vue`, `DashboardView.vue`, `CompanyDetailView.vue`)

**Directories:**

- Backend logical sections: lowercase plural (`routes/`, `models/`, `services/`, `middleware/`, `utils/`, `config/`)
- Frontend feature directories: lowercase plural (`components/`, `stores/`, `views/`, `layouts/`, `composables/`)
- Frontend feature subdirs: lowercase by feature (`components/search/`, `components/dashboard/`, `views/auth/`)
- Nuxt special dirs: lowercase (`pages/`, `server/`, `middleware/`, `assets/`, `composables/`)

**Code Naming:**

- Functions: camelCase (`logActivity`, `checkCreditBalance`, `searchCompanies`, `getCompanyDescription`)
- Variables: camelCase (`creditBalance`, `userId`, `searchResults`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (if any - none observed in codebase)
- React/Vue store actions: camelCase (`search()`, `reset()`, `setQuery()`)
- TypeScript interfaces: PascalCase (`CompanySearchResult`, `ParseResult`, `SearchResponse`)

## Where to Add New Code

**New Backend Endpoint:**

1. Create route handler in `server/routes/api/[feature].js` (or add to existing file)
2. Define model schema in `server/models/[Entity].js` if needed
3. Add middleware chain to route: `checkPermission()`, `checkCreditBalance()`, `checkCache()`, `logActivity()`, `trackOpenAPICredit()`
4. Create async handler → call services/utils → return res.json()
5. Add service logic in `server/services/[service].js` if complex
6. Register route in `server/routes/api/index.js` with appropriate mount point
7. Update bruno collection: add `.bru` file in `bruno/[Category]/[RequestName].bru`
8. Document in `docs/API.md`

**Example: Add new endpoint `/api/v1/company/export` (export saved companies as CSV)**

```javascript
// server/routes/api/company.js (add to existing file)
router.get('/export',
    checkPermission('export'),
    logActivity({...}),
    async (req, res) => {
        try {
            const companies = await CompanySearch.find({...});
            const csv = formatAsCSV(companies);
            res.setHeader('Content-Type', 'text/csv');
            res.send(csv);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
);
```

Then register in `server/routes/api/index.js`:
```javascript
router.use('/v1/company', companyRoutes);
```

**New Frontend Component:**

1. Create component in appropriate subdirectory:
   - `modern-client/src/components/[feature]/[ComponentName].vue` (for reuse)
   - `modern-client/src/views/[Feature]View.vue` (for page-level screens)
2. Use existing Pinia stores for state: `import { useAuthStore } from '@/stores/auth'`
3. Call backend via `fetch()` or API service
4. Style with Tailwind classes (dark mode supported via `dark:` prefix)

**New Nuxt Page:**

1. Create file in `smart-search/app/pages/[path].vue` (auto-routes)
2. Use `useRouter()`, `useRoute()`, `useSearchStore()` composables
3. Fetch from Nitro routes via `$fetch('/route-path')`
4. Example: `smart-search/app/pages/index.vue` has search form, calls `$fetch('/search/parse')` then `$fetch('/search/results')`

**New Nitro Route (Smart Search server-side):**

1. Create file in `smart-search/server/routes/[path].get.ts` or `.post.ts` (auto-routes)
2. Export default handler: `export default defineEventHandler(async (event) => {...})`
3. Read request: `await readBody(event)`, `getRequestHeader(event, 'cookie')`
4. Forward to backend API via `$fetch()` with request context
5. Return data or throw `createError()`
6. Example: `smart-search/server/routes/search/parse.post.ts` forwards to `/api/v1/ai/parse-query`

**New Model (MongoDB schema):**

1. Create file `server/models/[Entity].js` with mongoose schema
2. Define fields with types, validation, defaults
3. Add indexes if needed (e.g., `index: { userId: 1, createdAt: -1 }`)
4. Add static methods for common queries (e.g., `CreditTransaction.createDebit()`)
5. Export: `export default mongoose.model('[Entity]', schema)`
6. Import in route handlers to query/create documents

**New Utility/Helper:**

1. Create file in `server/utils/[utility].js` or `server/services/[service].js`
2. Export as default or named exports
3. Import in routes/services as needed
4. Keep focused (single responsibility): one file = one concern
5. Example: `server/utils/meilisearch.js` → only search-related functions

## Special Directories

**server/logs/:**

- Purpose: Rotating log files for HTTP requests and errors
- Generated: Yes (created by morgan + error handler)
- Committed: No (gitignored, development only)
- Pattern: `access.log.YYYY.MM.DD.gz`, `errors/` subdirectory

**smart-search/.nuxt/:**

- Purpose: Nuxt build cache and generated code
- Generated: Yes (by `nuxt build`)
- Committed: No (gitignored)

**modern-client/dist/:**

- Purpose: Built Vue SPA (served by Express backend)
- Generated: Yes (by `npm run build`)
- Committed: No (gitignored)
- Served from: `server/app.js` line 88 → `express.static(distDir)`

**bruno/.env:**

- Purpose: API testing secrets (tokens, passwords)
- Generated: No (manually created)
- Committed: No (gitignored)
- Used by: Bruno client to substitute `vars:secret` placeholders

**server/.env, server/.env.development:**

- Purpose: Runtime configuration (API keys, database URL, secrets)
- Generated: No (manually created per environment)
- Committed: No (.gitignored)
- Loaded: `server/config/env.js` at app startup
- Required vars: MONGODB_URI, SESSION_SECRET, OPENAI_API_KEY, ACCESS_TOKEN_COMPANY, ACCESS_TOKEN_VISURECAMERALI, APP_URL, SERVER_URL, etc.

