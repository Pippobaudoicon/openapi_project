# OpenAPI Italian Company Search Platform

## What This Is

A B2B SaaS platform for Italian company data aggregation with a refactored UI strategy: **smart-search (Nuxt 4) becomes the flagship minimal interface**, replacing modern-client's dashboard complexity. Users search companies with natural language, view enriched data with AI-generated financial overviews, and manage their account/credits through smart-search's streamlined panels — not a separate admin dashboard.

## Core Value

**Minimal, intuitive company search experience** — Google-like bar as the hero; secondary functionality (profile, credits, filters) surfaces only when needed, never cluttering the main interface.

## Requirements

### Validated

- ✓ User authentication (session-based with email/password) — existing
- ✓ Company search via Meilisearch + OpenAPI integration — existing
- ✓ Natural language query parsing with OpenAI — existing
- ✓ Credit-based API cost tracking and debit system — existing
- ✓ 30-day caching of API responses (CompanySearch model) — existing
- ✓ User activity logging and audit trail — existing
- ✓ Role-based permissions (user/admin) — existing
- ✓ Smart Search Nuxt 4 frontend with TailwindCSS — existing
- ✓ Modern Client Vue 3 dashboard (legacy, phase out) — existing

### Active

- [ ] User profile display in smart-search (name, email, settings) — minimal header panel
- [ ] Credit balance visibility in smart-search header (remaining credits, usage)
- [ ] Advanced filtering UI in smart-search (industry, location, size) — hidden by default, toggleable
- [ ] Saved searches / favorites in smart-search
- [ ] Activity history view in smart-search (recent searches, accessed companies)
- [ ] Mobile-responsive smart-search interface
- [ ] Migrate user-critical features from modern-client to smart-search

### Out of Scope

- Rebuild modern-client as primary interface — we're consolidating to smart-search (v1)
- OAuth/social login — email/password sufficient for v1
- Real-time notifications — deferred to v2
- Advanced admin features — focus on user-facing search experience
- Dark mode — v1 ships with light theme
- Multi-language support — Italian-focused for v1

## Context

### Existing State

- **Smart Search (Nuxt 4):** Minimal search interface, AI-powered query parsing, currently missing user account features
- **Modern Client (Vue 3):** Feature-rich dashboard with profile, credits, activity, filters — will be phased out
- **Backend (Express 4):** Mature, credit-tracked API with external integrations (OpenAPI, OpenAI, Meilisearch)
- **Tech Stack:** Express 4 + Mongoose + Passport + Nuxt 4 + Vue 3 + TailwindCSS + Meilisearch
- **Database:** MongoDB Atlas for models, Meilisearch for full-text search over 10M Italian companies

### Strategic Shift

Moving from multi-frontend strategy (dashboard + search) to **unified minimal interface in smart-search**. This improves UX by:
1. Simplifying user journey (one place to search, one place to manage account)
2. Keeping interface clean (Google-like simplicity)
3. Reducing maintenance burden (consolidate code, phase out modern-client)

### User Personas

- **B2B Researchers:** Italian business analysts, sales reps, due diligence teams who need quick, minimal-distraction company lookups
- **Admin Users:** Manage user accounts, credits, permissions (can be bare-bones for v1)

## Constraints

- **Tech Stack:** Already committed to Express + Nuxt 4 + Vue 3 + TailwindCSS + MongoDB — no changes
- **OpenAPI Licensing:** Access tokens are rate-limited and cost-sensitive, credit system must remain central
- **Data Freshness:** 30-day cache TTL is established; cannot increase without business impact
- **Migration Timeline:** Modern-client features must port to smart-search without breaking existing workflows
- **Italian Market:** Specific to Italian PIVA company identifiers; no internationalization in scope

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Smart-search as flagship | Minimal UX beats dashboard complexity; aligns with user intent (search first) | — Pending |
| Iterative feature migration | Add modern-client capabilities incrementally, keeping smart-search minimal | — Pending |
| Profile/credits first | Users need account visibility to make confident searches; foundational for trust | — Pending |
| Advanced filters second | Power users need filtering; defer polish to phase 2 once profile/credits land | — Pending |
| Retire modern-client after v1 | Once all features migrate, deprecate dashboard; reduces maintenance | — Pending |

---
*Last updated: 2026-03-04 after initialization*
