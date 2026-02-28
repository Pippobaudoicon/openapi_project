# OpenAPI Project — Agent Instructions

## What This Is

B2B SaaS platform for Italian company data aggregation. Combines OpenAPI (Altravia) company registry, Visure Camerali, and OpenAI-powered analysis with a credit-based billing system.

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
| Backend | Express 4, Mongoose 8, Passport.js (local strategy + sessions) |
| Smart Search | Nuxt 4.3, TailwindCSS, Pinia |
| Modern Client | Vue 3, Vite, TailwindCSS, Pinia |
| Database | MongoDB Atlas, Meilisearch |
| AI | OpenAI gpt-4.1-nano (query parsing, financial overviews) |
| External | OpenAPI/Altravia (Italian company registry) |

## Key Conventions

- **Auth**: Session-based (express-session + MongoStore), NOT JWT. Cookies are httpOnly.
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

## Documentation

See `docs/` for detailed reference:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System design, auth flow, data flow
- [API.md](docs/API.md) — All REST endpoints with params and responses
- [MODELS.md](docs/MODELS.md) — MongoDB schemas and relationships
- [ROADMAP.md](docs/ROADMAP.md) — Feature roadmap and next steps

## Quick Reference

| Route file | Mount point | Purpose |
|-----------|-------------|---------|
| `server/routes/api/auth.js` | `/api/v1/auth` | Login, register, password reset |
| `server/routes/api/openapi.js` | `/api/v1/openapi` | OpenAPI company data + search |
| `server/routes/api/company.js` | `/api/v1/company` | Cached company data + LLM overview |
| `server/routes/api/ai.js` | `/api/v1/ai` | Natural language query parsing |
| `server/routes/api/users.js` | `/api/v1/users` | User profile |
| `server/routes/api/credits.js` | `/api/v1/credits` | Credit balance, transactions, limits |
| `server/routes/api/activities.js` | `/api/v1/activities` | Activity history |

## Common Pitfalls

1. **Smart Search Nitro routes must NOT be under `/api/`** — devProxy intercepts `/api/**` and forwards to Express. Put Nitro routes at `/auth/check`, `/company/:piva`, etc.
2. **IT-search costs scale with results** — base cost + per-result cost. Always use `dryRun=true` for cost estimation.
3. **IT-full can return 302** — needs polling loop until data ready.
4. **`/:piva` route on company.js** returns cached data only — if not cached, returns 404. Use IT-advanced for fresh data.
5. **Credit transactions are atomic** — use `CreditTransaction.createDebitWithLimits()`, not manual balance updates.
