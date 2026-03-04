# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- JavaScript (ES2020+) - Backend and frontend modules
- TypeScript (latest) - Smart Search frontend configuration, type definitions in modern-client
- HTML/CSS - Component templates and styling

**Secondary:**
- Markdown - Documentation and email templates
- YAML - Docker and configuration files
- JSON - Build and package configuration

## Runtime

**Environment:**
- Node.js (version unspecified in `.nvmrc` or `.node-version`)
- Express.js serves on port 3000
- Nuxt 4 dev server on port 3001
- Vite dev server on port 5173

**Package Manager:**
- npm (version from `package.json` files)
- Lockfiles: `package-lock.json` present in all three services (`server/`, `smart-search/`, `modern-client/`)

## Frameworks

**Backend:**
- Express.js 4.21.1 - Core HTTP server framework at `server/app.js`
- Mongoose 8.9.5 - MongoDB ODM and schema management at `server/config/database.js`
- Passport.js 0.7.0 with local strategy - Session-based authentication at `server/auth/passport-config.js`
- Nodemailer 6.10.0 - Email sending at `server/utils/emailService.js`

**Smart Search Frontend:**
- Nuxt 4.3.1 - Full-stack Vue framework at `smart-search/`
- Nuxt config: `smart-search/nuxt.config.ts`
- Runs on port 3001
- Uses Nitro devProxy to forward `/api/**` requests to Express backend
- @nuxtjs/tailwindcss 6.14.0 - Tailwind CSS module
- @pinia/nuxt 0.11.3 - State management

**Modern Client Frontend:**
- Vue 3.4.21 - UI framework
- Vite 5.2.8 - Build tool and dev server at `modern-client/vite.config.js`
- Runs on port 5173
- Configured with `/api` proxy to Express backend

**Styling:**
- TailwindCSS 3.4.3 - Utility-first CSS framework
  - Smart Search config: `smart-search/tailwind.config.ts` (dark mode enabled)
  - Modern Client config: `modern-client/tailwind.config.js`
- PostCSS 8.4.38 - CSS transformation (modern-client)
- Autoprefixer 10.4.19 - CSS vendor prefixing (modern-client)

**UI Components & Icons:**
- Headless UI Vue 1.7.19 - Unstyled components (modern-client)
- Heroicons Vue 2.1.1 - SVG icons (modern-client)
- Lucide Vue Next 0.365.0 - Icon library (modern-client)
- VueUse Core 10.9.0 - Composable utilities (modern-client)
- VueUse Motion 2.0.0 - Animation utilities (modern-client)
- Framer Motion 11.0.25 - Animation library (modern-client)

**Routing:**
- Vue Router 4.3.0 (modern-client) / 4.6.4 (smart-search) - Client-side routing

**Data & State:**
- Pinia 2.1.7 (modern-client) / 3.0.4 (smart-search) - State management store

**Testing & Linting:**
- ESLint 8.57.0 - Code linting (modern-client)
- @typescript-eslint/eslint-plugin 7.6.0 - TypeScript linting (modern-client)
- eslint-plugin-vue 9.24.0 - Vue linting (modern-client)

**Build & Dev Tools:**
- Nodemon 3.1.7 - Development auto-reload (server)
- Concurrently 9.0.1 - Run multiple npm scripts (server)
- Cross-env 7.0.3 - Cross-platform environment variables

## Key Dependencies

**Critical:**
- @altravia/openapi 1.4.2 - Italian company registry API integration at `server/utils/axiosOpenapi.js`
- Meilisearch 0.49.0 - Full-text search engine at `server/utils/meilisearch.js`
- OpenAI 5.9.2 - GPT-4.1-nano for query parsing and financial analysis at `server/services/openaiService.js`
- Axios 1.7.8 - HTTP client for API calls

**Infrastructure:**
- Mongoose 8.9.5 - MongoDB abstraction layer
- Connect-mongo 5.1.0 - MongoDB session store
- express-session 1.18.1 - Session management with 24-hour TTL
- Passport.js 0.7.0 - Authentication framework

**Data Processing:**
- csv-parser 3.0.0 - CSV parsing for company data imports
- csv-stringify 6.5.2 - CSV generation for exports
- Zod 3.25.76 - Runtime schema validation and type safety

**Utilities:**
- bcrypt 5.1.1 - Password hashing at `server/routes/api/auth.js`
- Dotenv 16.4.5 - Environment variable loading
- Morgan 1.10.0 - HTTP request logging
- Rotating-file-stream 3.2.5 - Log file rotation
- p-limit 6.1.0 - Concurrency control
- Marked 17.0.3 (smart-search) / 16.1.1 (modern-client) - Markdown rendering
- Chart.js 4.4.2 - Charting library (modern-client)
- Vue-chartjs 5.3.0 - Vue Chart.js integration (modern-client)
- date-fns 3.6.0 - Date utility library (modern-client)

## Configuration

**Environment:**
- Development: `server/.env.development` (local path)
- Production: `server/.env` (root level, not committed)
- Example: `.env.example` at root with template variables

**Required Environment Variables (from `.env.example`):**
```
MONGODB_URI=mongodb+srv://...         # MongoDB Atlas connection
SESSION_SECRET=...                     # Express-session encryption key
OPENAI_API_KEY=sk-...                 # OpenAI API key
ACCESS_TOKEN_COMPANY=...               # Altravia company registry token
ACCESS_TOKEN_VISURECAMERALI=...        # Visure Camerali registry token
OPENAPI_COMPANY_URL=...                # Altravia company endpoint
OPENAPI_VISURECAMERALI_URL=...         # Visure Camerali endpoint
OPENAPI_OAUTH_URL=...                  # OAuth service endpoint
OAUTH_USERNAME=...                     # OAuth credentials
ACCESS_TOKEN_APIKEY=...                # OAuth API key
APP_URL=http://localhost:5173          # Frontend URL (CORS origin)
SERVER_URL=http://localhost:3000       # Backend URL
CLIENT_URL=http://localhost:5173       # Client URL
SMTP_HOST=...                          # Email server (optional)
SMTP_PORT=465                          # Email port (optional)
MEILISEARCH_URL=http://localhost:7700  # Meilisearch instance
MEILI_MASTER_KEY=...                   # Meilisearch master key
```

**Build:**
- `server/package.json` - Main backend entry at `app.js`
- `smart-search/package.json` - Nuxt frontend
- `modern-client/package.json` - Vue frontend
- `docker-compose.yml` - Local development stack (MongoDB, Meilisearch)
- `docker-compose.prod.yml` - Production deployment stack

## Platform Requirements

**Development:**
- Node.js LTS recommended (no specific version pinned)
- MongoDB Atlas account or local MongoDB instance (Docker)
- Meilisearch instance (Docker)
- OpenAI API key
- Altravia and Visure Camerali API tokens
- SMTP server for email functionality (optional)

**Production:**
- Docker-compatible host (Linux/cloud container service)
- Docker Compose v2+
- MongoDB Atlas (managed)
- Meilisearch instance (self-hosted or managed)
- All API tokens and secrets via environment variables

**Port Mapping:**
- Backend Express: 3000
- Smart Search Nuxt: 3001
- Modern Client Vite: 5173
- Meilisearch: 7700
- MongoDB: 27017 (Docker only)

---

*Stack analysis: 2026-03-04*
