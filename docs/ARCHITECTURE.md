# Architecture

## System Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Smart Search   │     │  Modern Client   │     │   Mobile App    │
│  (Nuxt 4:3001)  │     │  (Vue 3:5173)    │     │   (future)      │
└───────┬─────────┘     └────────┬─────────┘     └────────┬────────┘
        │ Nitro devProxy /api           │ Axios /api/v1         │
        │ SSR routes /auth,/company     │                       │
        ▼                               ▼                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Express.js Backend (:3000)                    │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Auth    │ │  Company  │ │  Search  │ │  AI (parse-query)│  │
│  │  Routes  │ │  Routes   │ │  Routes  │ │  Route           │  │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
│       │             │            │                 │             │
│  ┌────┴─────────────┴────────────┴─────────────────┴──────────┐ │
│  │                    Middleware Layer                         │ │
│  │  roleAuth · creditTracker · cacheCheck · activityLogger    │ │
│  └────┬─────────────┬────────────┬─────────────────┬──────────┘ │
└───────┼─────────────┼────────────┼─────────────────┼────────────┘
        │             │            │                 │
        ▼             ▼            ▼                 ▼
┌──────────┐  ┌──────────┐  ┌──────────┐     ┌──────────┐
│ MongoDB  │  │OpenAPI   │  │Meili     │     │ OpenAI   │
│ Atlas    │  │Altravia  │  │search    │     │ GPT-4.1  │
└──────────┘  └──────────┘  └──────────┘     └──────────┘
```

## Authentication Flow

```
Browser ──cookie──> Express
                     │
                     ├── passport.authenticate('local')
                     │       └── bcrypt.compare(password, hash)
                     │
                     ├── express-session
                     │       └── MongoStore (24h TTL)
                     │
                     └── req.user = { id, email, role, isActive }
```

**Session lifecycle:**
1. `POST /auth/login` → Passport validates → session created in MongoDB
2. Every request sends session cookie → Express deserializes user
3. `checkPermission()` middleware verifies role has required permission
4. `POST /auth/logout` → session destroyed

**Smart Search SSR auth:**
```
Browser ──cookie──> Nuxt SSR
                     │
                     ├── middleware/auth.ts runs
                     │       └── $fetch('/auth/check')
                     │
                     ├── server/routes/auth/check.get.ts
                     │       └── $fetch('http://localhost:3000/api/v1/auth/check')
                     │               └── forwards browser cookie
                     │
                     └── returns { isAuthenticated, user }
```

## Data Flow: Natural Language Search

```
User: "aziende software a Milano con più di 50 dipendenti"
         │
         ▼
┌─────────────────────────────────────┐
│ 1. POST /api/v1/ai/parse-query     │
│    └── openaiService.parseNaturalLanguageQuery()
│        ├── SHA-256 hash query → check cache
│        ├── OpenAI gpt-4.1-nano (JSON schema mode)
│        │   └── { params: { province: "MI",
│        │                    atecoCode: "62",
│        │                    minEmployees: 50 },
│        │         interpretation: "Software companies..." }
│        ├── Whitelist validation (strip unknown params)
│        └── Cache result in CompanySearch
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 2. GET /api/v1/IT-search            │
│    ?dataEnrichment=advanced         │
│    &province=MI&atecoCode=62        │
│    &minEmployees=50                 │
│    └── OpenAPI Altravia API call    │
│        ├── Cache results            │
│        ├── Index in Meilisearch     │
│        └── Track credits            │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 3. Display results with:            │
│    ├── Interpretation chips         │
│    ├── Company cards (clickable)    │
│    └── Result count                 │
└─────────────────────────────────────┘
```

## Data Flow: Company Detail

```
User clicks company card → /company/:piva
         │
         ▼
┌─────────────────────────────────────────┐
│ Phase 1: Structural data (blocking)     │
│ Nitro: GET /company/:piva               │
│   ├── Try: GET /api/v1/company/:piva    │
│   │        (cached in MongoDB)          │
│   └── Fallback: GET /api/v1/openapi/    │
│                 IT-advanced/:piva       │
│                 (fresh from API)         │
└─────────────────────────────────────────┘
         │
         ▼  (page renders immediately)
         │
┌─────────────────────────────────────────┐
│ Phase 2: LLM Overview (async, lazy)     │
│ Nitro: GET /company/:piva/overview      │
│   └── GET /api/v1/company/              │
│       llm-overview/:piva                │
│       ├── Check cached llmOverview      │
│       ├── stripCompanyData() → slim     │
│       └── OpenAI analysis → cache       │
└─────────────────────────────────────────┘
```

## Credit System Architecture

```
Request arrives
    │
    ▼
checkCreditBalance(serviceType, actionType)
    ├── Calculate estimated cost
    ├── Check user.creditBalance >= cost
    ├── Check daily/monthly limits
    └── Block request if insufficient
    │
    ▼
[Route handler executes API call]
    │
    ▼
trackOpenAPICredit(actionType)  ← response interceptor
    ├── Calculate actual cost (may differ for IT-search)
    ├── CreditTransaction.createDebitWithLimits()
    │       ├── Atomic: debit balance + create transaction
    │       └── Enforces daily/monthly limits
    └── Attach cost info to response
```

**Credit costs:**

| Action | Cost | Notes |
|--------|------|-------|
| IT-advanced | 0.389 | Per company |
| IT-full | 0.800 | Per company, may queue |
| IT-closed | 0.085 | Status check only |
| IT-search | 0.344 + 0.008/result | Up to 100 results billed |
| LLM overview | 0.05 + tokens | OpenAI token pricing |
| Parse query | tokens only | Cached after first parse |

## Middleware Pipeline

Every protected route passes through:

```
request
  → passport.session()           # deserialize user from session
  → checkPermission('perm')      # verify role has permission
  → checkCreditBalance()         # pre-check credits (if applicable)
  → checkCache()                 # return cached data if fresh
  → logActivity()                # log to Activity model
  → [route handler]              # business logic
  → trackCredit()                # debit credits post-response
```

## Caching Strategy

| Cache Layer | Store | TTL | Invalidation |
|-------------|-------|-----|-------------|
| API responses | CompanySearch (MongoDB) | 30 days | Auto-expire via TTL index |
| Full-text search | Meilisearch | On write | Indexed on CompanySearch post-save |
| LLM query parse | CompanySearch (searchKey: parse:hash) | 30 days | Same query = same result |
| LLM overview | CompanySearch.llmOverview | 30 days | Attached to company record |
| Sessions | MongoStore | 24 hours | Logout destroys |

## Folder Structure Deep Dive

### Backend (`server/`)

```
server/
├── app.js                    # Express setup, middleware, session
├── routes/api/
│   ├── index.js              # Route mounting hub
│   ├── auth.js               # Login, register, verify, reset
│   ├── openapi.js            # IT-advanced, IT-full, IT-search
│   ├── company.js            # Cached data, LLM overview
│   ├── ai.js                 # Natural language parse-query
│   ├── users.js              # Profile CRUD
│   ├── credits.js            # Balance, transactions, limits
│   └── activities.js         # Activity history
├── middleware/
│   ├── roleAuth.js           # checkRole, checkPermission
│   ├── creditTracker.js      # checkCreditBalance, track*Credit
│   ├── cacheCheck.js         # checkCache
│   └── activityLogger.js     # logActivity
├── models/
│   ├── User.js               # Users + credit settings
│   ├── Role.js               # Roles + permissions
│   ├── CompanySearch.js       # Cached API data
│   ├── CreditTransaction.js  # Credit ledger
│   ├── Activity.js           # Audit log
│   └── VisureSearch.js       # Visure Camerali cache
├── services/
│   ├── openaiService.js      # LLM overview + query parsing
│   └── fileService.js        # File validation
├── config/
│   ├── database.js           # MongoDB connection
│   ├── creditConfig.js       # Credit pricing
│   ├── cacheStrategies.js    # Cache lookup rules
│   └── env.js                # Environment loading
├── utils/
│   ├── axiosOpenapi.js       # OpenAPI HTTP clients
│   ├── meilisearch.js        # Search engine client
│   └── emailService.js       # Nodemailer transactional email
└── auth/
    └── passport-config.js    # Passport local strategy
```

### Smart Search (`smart-search/`)

```
smart-search/
├── nuxt.config.ts             # Port 3001, devProxy, modules
├── app/
│   ├── app.vue                # Root: <NuxtPage />
│   ├── pages/
│   │   ├── index.vue          # Search page (two states)
│   │   └── company/
│   │       └── [piva].vue     # Company detail
│   ├── components/
│   │   ├── search/
│   │   │   ├── SearchBar.vue
│   │   │   ├── CompanyCard.vue
│   │   │   ├── CompanyCardSkeleton.vue
│   │   │   ├── InterpretationChips.vue
│   │   │   ├── SearchHistory.vue
│   │   │   ├── ResultCount.vue
│   │   │   ├── EmptyState.vue
│   │   │   └── ErrorState.vue
│   │   └── company/
│   │       ├── StatusBadge.vue
│   │       ├── InfoSection.vue
│   │       ├── DataField.vue
│   │       ├── LLMOverview.vue
│   │       └── RawDataViewer.vue
│   ├── composables/
│   │   ├── useAuth.ts         # Auth state + SSR cookie forwarding
│   │   └── useCompany.ts      # Two-phase company data loading
│   ├── stores/
│   │   └── search.ts          # Search state + two-step flow
│   ├── middleware/
│   │   └── auth.ts            # Auth guard (currently disabled)
│   └── utils/
│       ├── ateco.ts           # ATECO code → Italian labels
│       └── format.ts          # Currency, number, date formatting
└── server/routes/
    ├── auth/
    │   └── check.get.ts       # Proxy to Express auth check
    └── company/
        ├── [piva].get.ts      # Proxy: cache → IT-advanced
        └── [piva]/
            └── overview.get.ts # Proxy: LLM overview
```
