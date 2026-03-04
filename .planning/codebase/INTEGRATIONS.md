# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**Altravia/OpenAPI (Italian Company Registry):**
- Service: Italian company data aggregation via Altravia OpenAPI
- What it's used for: Company searches, advanced/full company data retrieval, company closure status checks
- SDK/Client: @altravia/openapi 1.4.2 via Axios instances
- Auth: Bearer token authentication
  - `ACCESS_TOKEN_COMPANY` - Company registry endpoint token
  - `ACCESS_TOKEN_VISURECAMERALI` - Visure Camerali registry token
  - `OAUTH_USERNAME` + `ACCESS_TOKEN_APIKEY` - OAuth Basic auth (Base64 encoded)
- Endpoints: `server/utils/axiosOpenapi.js` creates three service instances:
  - `axiosCompanyService` - Company data at `process.env.OPENAPI_COMPANY_URL`
  - `axiosVisureCameraliService` - Registry data at `process.env.OPENAPI_VISURECAMERALI_URL`
  - `axiosOauthService` - Credit/token management at `process.env.OPENAPI_OAUTH_URL`
- Routes: `server/routes/api/openapi.js`
  - GET `/IT-advanced/:piva` - Advanced company data (cost: 0.388888 credits)
  - GET `/IT-full/:piva` - Full data with financials (cost: 0.799999 credits, supports 302 polling)
  - GET `/IT-closed/:piva` - Closure status check (cost: 0.085 credits)
  - GET `/IT-search` - Company search by parameters (cost: 0.344447 base + 0.008333 per result)
  - GET `/credit` - Check credit balance
- Caching: Results cached 30 days via `CompanySearch` MongoDB model
- Cost tracking: All calls debit credits via `CreditTransaction` model

**OpenAI (AI-Powered Analysis):**
- Service: GPT-4.1-nano language model for query parsing and financial overviews
- SDK/Client: openai 5.9.2 Node.js client
- Auth: API key via `OPENAI_API_KEY`
- Implementation: `server/services/openaiService.js`
- Models:
  - GPT-4.1-nano (default) - Primary model for query parsing and analysis
  - GPT-4o-mini (alternative) - Backup model for token cost optimization
- Key Features:
  - Natural language query parsing for company searches
  - Financial overview generation in Italian markdown format
  - Token-based billing integrated with credit system
- Routes: `server/routes/api/ai.js`
  - POST `/parse-query` - Parse natural language search queries
  - POST `/save-search` - Cache parsed search results
- Cost Model: Per 1K tokens at specified rates in `server/config/creditConfig.js`
  - Input: $0.003/1K tokens
  - Output: $0.006/1K tokens
- Cost Tracking: Integrated with credit tracking system

**Visure Camerali (Italian Business Registry):**
- Service: Company registry data for Italian firms (Camere di Commercio)
- What it's used for: Official business registry lookups, financial statement retrieval
- Endpoint: `process.env.OPENAPI_VISURECAMERALI_URL`
- Auth: Bearer token `ACCESS_TOKEN_VISURECAMERALI`
- Client: axiosVisureCameraliService at `server/utils/axiosOpenapi.js`
- Features:
  - Company registry search and retrieval
  - Financial statement ("bilancio") optical scanning and download
- Cost tracking:
  - `impresa-get` - 1 credit per retrieval
  - `impresa-search` - 2 base credits + 0.2 per result
  - `bilancio-ottico-request` - 8 credits
  - `bilancio-ottico-check` - 0.5 credits
  - `bilancio-ottico-download` - 1 credit

## Data Storage

**Databases:**
- MongoDB Atlas (Cloud)
  - Connection: `MONGODB_URI` env var (mongodb+srv://...)
  - Client: Mongoose 8.9.5 ODM
  - Config: `server/config/database.js`
  - Collections:
    - `users` - User accounts with hashed passwords (model at `server/models/User.js`)
    - `roles` - Role definitions and permissions (model at `server/models/Role.js`)
    - `companysearches` - Cached company data with 30-day TTL (model at `server/models/CompanySearch.js`)
    - `visuresearches` - Cached Visure Camerali results (model at `server/models/VisureSearch.js`)
    - `searchhistories` - User search history with query hashes (model at `server/models/SearchHistory.js`)
    - `activities` - User activity audit logs (model at `server/models/Activity.js`)
    - `credittransactions` - Credit debit/credit ledger (model at `server/models/CreditTransaction.js`)
    - `sessions` - Express session store via connect-mongo
  - Pool: Max 50 connections (prod), 10 (dev); idle timeout 10 minutes

**Search/Indexing:**
- Meilisearch 0.49.0
  - Connection: `MEILISEARCH_URL` (default: http://localhost:7700)
  - Auth: `MEILI_MASTER_KEY`
  - Index: `companies` - Full-text search for company data
  - Config: `server/utils/meilisearch.js`
  - Searchable fields: denominazione, indirizzo, comune, provincia, piva, codice_ateco
  - Filterable fields: provincia, codice_ateco, fatturato, dipendenti, createdAt, searchType, taxCode
  - Sortable fields: fatturato, dipendenti, createdAt, searchType, taxCode
  - Population: Via batch script `server/scripts/indexAllCompanies.js`
  - Used by: Smart Search frontend (devProxy routes to Meilisearch)

**File Storage:**
- Local filesystem only (no cloud storage detected)
  - Logs: `server/logs/` directory with rotating file streams (daily rotation, 10MB size)
  - Log format: Combined format in production, dev format in development
  - Retention: Via rotating-file-stream 3.2.5 with gzip compression

**Caching:**
- MongoDB TTL indexes for temporary data (30-day expiry on company searches)
- In-memory parsing cache via SearchHistory model with query hashing
- Meilisearch primary index for company full-text search

## Authentication & Identity

**Auth Provider:**
- Custom implementation (no third-party provider)
  - Session-based authentication via express-session 1.18.1
  - MongoDB session store via connect-mongo 5.1.0
  - 24-hour session TTL with touch-after 24h
  - Secure cookies (httpOnly, secure flag in production)

**Password Management:**
- Bcrypt 5.1.1 for password hashing at `server/routes/api/auth.js`
- Salt rounds: Default bcrypt configuration

**Passport.js Strategy:**
- Local strategy (username/email + password) at `server/auth/passport-config.js`
- No JWT - purely session-based
- Role-based access control via `Role` collection checked at `server/middleware/roleAuth.js`

**Email Verification (Optional):**
- Nodemailer 6.10.0 SMTP integration at `server/utils/emailService.js`
- Endpoints: `sendVerificationEmail()` and `sendPasswordResetEmail()`
- SMTP Config via env vars:
  - `SMTP_HOST` - SMTP server hostname
  - `SMTP_PORT` - SMTP port (e.g., 465)
  - `SMTP_SECURE` - TLS enabled flag
  - `SMTP_USER` - Sender email address
  - `SMTP_PASSWORD` - SMTP credentials (not committed)
- Reset tokens: Generated via crypto, not stored (check app.js for implementation)

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or similar integration

**Logs:**
- Morgan 1.10.0 - HTTP request logging
  - Dev mode: `morgan('dev')` - Colorized console output
  - Prod mode: `morgan('combined')` to rotating file streams at `server/logs/`
  - Rotation: Daily, 10MB file size, gzip compressed
- Custom console.log/console.error in services and middleware
- No structured logging framework (JSON logs not detected)

**Application Metrics:**
- Not detected - No Prometheus, DataDog, or similar

## CI/CD & Deployment

**Hosting:**
- Docker containers (local and production)
- Three Docker images:
  - `server/Dockerfile` - Express backend
  - `smart-search/Dockerfile` - Nuxt 4 frontend
  - `modern-client/Dockerfile` - Vite/Vue frontend
- Docker Compose orchestration via `docker-compose.yml` (dev) and `docker-compose.prod.yml` (prod)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or Jenkins workflows

**Deployment:**
- Docker Compose stack deployment (`docker-compose.prod.yml`)
- Three services with dependencies:
  - Server (port 3000) - Depends on Meilisearch
  - Smart Search (port 3001) - Depends on Server
  - Modern Client (port 5173 → 80 internal) - Depends on Server
  - Meilisearch (port 7700) - Standalone
- Restart policy: `unless-stopped` for all containers
- Volume mounts:
  - `meilisearch_data:/meili_data` - Persistent search index
  - MongoDB via Atlas (no local volume in prod)
- Environment: Loaded from `.env` file (secrets not committed)

**Build Process:**
- Backend: Node.js multi-stage (if using Dockerfile)
- Smart Search: Nuxt build → production-ready SPA
- Modern Client: Vite build → static assets, served on port 80 (nginx or similar in container)

## Environment Configuration

**Required env vars:**
- **API & Auth:** `OPENAI_API_KEY`, `ACCESS_TOKEN_COMPANY`, `ACCESS_TOKEN_VISURECAMERALI`, `SESSION_SECRET`
- **Database:** `MONGODB_URI`
- **Search:** `MEILISEARCH_URL`, `MEILI_MASTER_KEY`
- **URLs:** `APP_URL`, `SERVER_URL`, `CLIENT_URL`, `API_BASE_URL`
- **OpenAPI Endpoints:** `OPENAPI_COMPANY_URL`, `OPENAPI_VISURECAMERALI_URL`, `OPENAPI_OAUTH_URL`
- **OAuth:** `OAUTH_USERNAME`, `ACCESS_TOKEN_APIKEY`
- **Email (optional):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`
- **Node:** `NODE_ENV` (development/production)

**Secrets location:**
- Development: `.env.development` (local, not committed)
- Production: `.env` in root (not committed)
- CI/CD: Passed as environment variables via Docker Compose
- No secrets manager detected (HashiCorp Vault, AWS Secrets Manager, etc.)

**Build Configuration:**
- `.env` → Dotenv loads for Express
- Smart Search: runtimeConfig and public config in `nuxt.config.ts`
- Modern Client: Vite server proxy configuration

## Webhooks & Callbacks

**Incoming:**
- Visure Camerali callbacks: `server/routes/api/callbacks/visure.js` (endpoint exists but implementation not reviewed)
- Purpose: Likely for financial statement processing status updates

**Outgoing:**
- None detected - Application consumes external APIs only

## Credit System Integration

**Core Model:** `server/models/CreditTransaction.js`
- Tracks all API usage as debit transactions
- User credit balance maintained per query

**Middleware:** `server/middleware/creditTracker.js`
- `checkCreditBalance(serviceType, actionType)` - Validates user has sufficient credits before API call
- `trackOpenAPICredit(actionType)` - Records credit debit after successful call
- Prevents over-drafting via `CreditTransaction.createDebitWithLimits()`

**Pricing:** `server/config/creditConfig.js`
- OpenAPI costs defined per endpoint (advanced: 0.38, full: 0.80, search: base + per-result)
- OpenAI costs per 1K tokens
- USD-to-credits conversion: 1 USD = 1 credit
- DryRun support for cost estimation before execution

---

*Integration audit: 2026-03-04*
