# OpenAPI Project

B2B platform for Italian company data aggregation. Combines the OpenAPI (Altravia) company registry with AI-powered natural language search and financial analysis.

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d          # MongoDB + Meilisearch

# 2. Backend
cd server
cp .env.example .env.development  # configure env vars
npm install && npm run dev        # http://localhost:3000

# 3. Smart Search (Nuxt 4)
cd smart-search
npm install && npm run dev        # http://localhost:3001

# 4. Modern Client (Vue 3)
cd modern-client
npm install && npm run dev        # http://localhost:5173
```

## Project Structure

| Directory | Description | Port |
|-----------|-------------|------|
| `server/` | Express.js API backend | 3000 |
| `smart-search/` | Nuxt 4 — natural language search frontend | 3001 |
| `modern-client/` | Vue 3 + Vite — full dashboard | 5173 |
| `docs/` | Architecture, API, models, roadmap | — |

## Services

| Service | Purpose |
|---------|---------|
| MongoDB | Primary database (users, companies, credits, activities) |
| Meilisearch | Full-text company search |
| OpenAPI/Altravia | Italian company registry API |
| OpenAI | Natural language query parsing + financial analysis |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, data flows, auth
- [API Reference](docs/API.md) — All REST endpoints
- [Data Models](docs/MODELS.md) — MongoDB schemas
- [Roadmap](docs/ROADMAP.md) — Feature roadmap and next steps

## Docker Services

```bash
docker compose up -d        # Start MongoDB + Meilisearch
docker compose logs -f      # View logs
docker compose down         # Stop
docker compose down -v      # Stop + remove volumes
```

**Access:**
- MongoDB: `localhost:27017`
- Meilisearch: `localhost:7700`

## Default Login

```
admin@test.com / test
```
