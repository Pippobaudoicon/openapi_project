# Roadmap

## Completed

### Smart Search — Phases 1-3 (Foundation + LLM Search + UI)
- [x] Fix hanging `/:piva` route (company.js)
- [x] Remove debug endpoint with hardcoded credentials
- [x] LLM query parsing endpoint (`POST /api/v1/ai/parse-query`)
- [x] Nuxt 4 scaffold with TailwindCSS + Pinia
- [x] Auth integration (Nitro proxy + SSR cookie forwarding)
- [x] Search store with two-step flow (parse → search)
- [x] Search UI: SearchBar, CompanyCard, skeletons, empty/error states
- [x] URL state sync (`?q=...`) with back/forward navigation

### Smart Search — Phase 4 (Company Detail)
- [x] Nitro proxy routes for company data + LLM overview
- [x] Two-phase loading (structural data first, LLM overview lazy)
- [x] Company detail page with metrics, info sections, status badges
- [x] ATECO code → human-readable Italian labels
- [x] Raw API data toggle
- [x] Clickable company cards in search results

### Smart Search — Phase 5 (Search Polish)
- [x] AI interpretation chips (shows what LLM parsed)
- [x] Session search history (localStorage, dropdown on focus)
- [x] Store tracks parsedParams for chip display

---

## Next Up

### Auth Finalization
- [ ] Re-enable auth middleware on Smart Search (currently disabled for development)
- [ ] Test SSR cookie forwarding end-to-end
- [ ] Handle auth redirect properly (currently points to localhost:5173)
- [ ] Consider shared auth between modern-client and smart-search

### Smart Search — Dark Mode
- [ ] TailwindCSS dark mode support
- [ ] Theme toggle component
- [ ] Persist preference in localStorage
- [ ] Update all components for dark variant

### Smart Search — Design Polish
- [ ] Improve overall UI design quality
- [ ] Better responsive layout for mobile
- [ ] Loading transitions and animations
- [ ] Proper typography scale

### Production Deployment
- [ ] Nginx/Caddy reverse proxy configuration
- [ ] CORS settings for production domains
- [ ] Session cookie domain configuration
- [ ] SSL termination
- [ ] Environment variable management
- [ ] Health check endpoints

---

## Future Considerations

### Integration: Smart Search + Modern Client
- Shared auth session between both frontends
- Deep links from Smart Search results to Modern Client detail views
- Unified navigation or redirect strategy
- Single sign-on or shared cookie domain

### Search Enhancements
- Pagination for search results (currently returns all)
- Sort options (by revenue, employees, relevance)
- Saved searches (server-side, per user)
- Export results to CSV/Excel
- Map view for location-based results

### Company Detail Enhancements
- Side-by-side company comparison
- Historical data tracking (revenue over time)
- Related companies (same sector, location)
- PDF export of company profile + LLM analysis

### Platform
- Admin dashboard for user management
- Credit purchase / top-up flow
- Usage analytics dashboard
- API rate limiting
- Webhook notifications for async operations (bilancio-ottico)
- Multi-language support (currently Italian UI, English/Italian queries)

### Technical Debt
- Remove legacy `client/` directory
- Consolidate CORS origins (currently only `APP_URL`)
- Add request validation middleware (Zod/Joi)
- Add comprehensive error types and codes
- Structured logging (replace console.error)
- Test suite (unit + integration)
