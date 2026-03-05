# OpenAPI Project — Agent Instructions

## What This Is

B2B SaaS platform for Italian company data aggregation. Combines OpenAPI (Altravia) company registry, Visure Camerali, and OpenAI-powered analysis with a credit-based billing system.
Always auto-update this document with any architectural changes, new routes, or tech stack updates. This is the single source of truth for how the system works.

## Project Structure

```
openapi_project/
├── server/           # Express.js 4 backend (port 3000)
├── smart-search/     # Nuxt 4 search frontend (port 3001)
├── modern-client/    # Vue 3 + Vite dashboard (port 5173)
├── client/           # Legacy client (unused)
├── docs/             # Architecture, API, models, roadmap
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express 4, Mongoose 8 (data API only, auth via Better Auth session validation) |
| Smart Search | Nuxt 4.3, TailwindCSS, Pinia, Better Auth (auth server + Vue client) |
| Modern Client | Vue 3, Vite, TailwindCSS, Pinia (legacy — auth moved to smart-search) |
| Database | MongoDB Atlas, Meilisearch |
| AI | OpenAI gpt-4.1-nano (query parsing, financial overviews) |
| External | OpenAPI/Altravia (Italian company registry) |

## Key Conventions

- **Auth**: Better Auth (session-based, MongoDB adapter, runs in Nuxt Nitro). Express validates sessions via `requireAuth` middleware (`server/middleware/betterAuth.js`). Auth pages live at `smart-search/app/pages/auth/`. Supports email/password, Google OAuth, 2FA (TOTP).
- **Auth middleware**: Use `optionalAuth` for routes where auth is helpful but not required. Both are in `server/middleware/betterAuth.js`.
- **Better Auth composable**: Smart Search uses `useAuthClient()` (not `useAuth()`). Provides `authClient`, `twoFactor`, `user`, `fetchProfile`, `updateProfile`.
- **User model**: Maps to Better Auth's `user` collection (not Mongoose default `users`). No `password` field — Better Auth manages credentials separately. `emailVerified` replaces the old `isActive` flag.
- **CORS**: Single origin from `APP_URL` env var. Smart Search uses Nitro devProxy to avoid CORS.
- **Credits**: Every API call costs credits. Tracked in CreditTransaction model. Always use `checkCreditBalance` + `trackOpenAPICredit` middleware.
- **Caching**: CompanySearch model caches API responses with 30-day TTL. Use `checkCache` middleware.
- **Activity Logging**: Use `logActivity` middleware on all user-facing routes.
- **Permissions**: Role-based via Role collection. Check with `checkPermission('permission_name')`.
- **Component naming (Nuxt 4)**: `components/search/SearchBar.vue` auto-imports as `SearchBar`, NOT `SearchSearchBar`. Nuxt 4 deduplicates prefixes.

## Running Locally

```bash
# Start MongoDB + Meilisearch
docker compose up -d

# Backend
cd server && npm run dev    # port 3000

# Smart Search (Nuxt)
cd smart-search && npm run dev  # port 3001

# Modern Client (Vue)
cd modern-client && npm run dev # port 5173
```

## Environment

Server env at `server/.env.development`. Required vars:
- `MONGODB_URI`, `SESSION_SECRET`
- `OPENAI_API_KEY`
- `ACCESS_TOKEN_COMPANY`, `ACCESS_TOKEN_VISURECAMERALI`
- `APP_URL` (CORS origin), `SERVER_URL`

Smart Search env (can be in `smart-search/.env` or inherited):
- `BETTER_AUTH_SECRET` (or falls back to `SESSION_SECRET`)
- `BETTER_AUTH_URL` (default `http://localhost:3001`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (for OAuth)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (for auth emails)

## Documentation

See `docs/` for detailed reference:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design, auth flow, data flow
- [API.md](docs/API.md) — All REST endpoints with params and responses
- [MODELS.md](docs/MODELS.md) — MongoDB schemas and relationships
- [ROADMAP.md](docs/ROADMAP.md) — Feature roadmap and next steps

## Quick Reference

| Route file | Mount point | Purpose |
|-----------|-------------|---------|
| `server/routes/api/auth.js` | `/api/v1/auth` | Session check only (auth lives in Better Auth/Nitro) |
| `smart-search/server/routes/auth/[...all].ts` | `/auth/*` | Better Auth endpoints (login, register, OAuth, 2FA, etc.) |
| `server/routes/api/openapi.js` | `/api/v1/openapi` | OpenAPI company data + search |
| `server/routes/api/company.js` | `/api/v1/company` | Cached company data + LLM overview |
| `server/routes/api/ai.js` | `/api/v1/ai` | Natural language query parsing |
| `server/routes/api/users.js` | `/api/v1/users` | User profile |
| `server/routes/api/credits.js` | `/api/v1/credits` | Credit balance, transactions, limits |
| `server/routes/api/activities.js` | `/api/v1/activities` | Activity history |

## Bruno Collection (`bruno/`)

The `bruno/` folder is the API testing collection for this project. **Whenever you add, remove, or modify a backend route — including changes to URL paths, request params, request body shape, headers, or response structure — you must also update the corresponding `.bru` file in `bruno/`.**

This includes:
- New routes → create a new `.bru` file in the appropriate subfolder (e.g. `bruno/Website/`)
- Renamed or moved routes → update the `url` in the `.bru` file
- Added/removed query params or body fields → update the `params` / `body` block
- Auth changes (e.g. new header required) → update the `headers` block
- New environments or base URLs → update `bruno/environments/prod.bru` and `bruno/environments/dev.bru`

Secrets (tokens, passwords) must never be hardcoded in `.bru` files. Declare them in `vars:secret` and store values in `bruno/.env` (gitignored).

## Common Pitfalls

1. **Smart Search Nitro routes must NOT be under `/api/`** — devProxy intercepts `/api/**` and forwards to Express. Put Nitro routes at `/auth/check`, `/company/:piva`, etc.
2. **IT-search costs scale with results** — base cost + per-result cost. Always use `dryRun=true` for cost estimation.
3. **IT-full can return 302** — needs polling loop until data ready.
4. **`/:piva` route on company.js** returns cached data only — if not cached, returns 404. Use IT-advanced for fresh data.
5. **Credit transactions are atomic** — use `CreditTransaction.createDebitWithLimits()`, not manual balance updates.
6. **User model collection name**: Registered as `mongoose.model('User', schema, 'user')` (explicit 3rd arg). Hits the `user` collection that Better Auth writes to.
7. **Session cookie parsing (Express)**: Better Auth tokens are `token.signature` format. `betterAuth.js` splits on `.` to extract just the token before querying the `session` collection.
8. **2FA flow**: Setup is `twoFactor.enable({ password })` → QR render via `qrcode` npm package → `twoFactor.verifyTotp({ code })`. Disable via `twoFactor.disable({ password })`.
9. **Password minimum length**: Better Auth enforces 8 chars minimum.
