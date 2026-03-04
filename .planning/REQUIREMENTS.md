# Requirements: OpenAPI Italian Company Search Platform

**Defined:** 2026-03-04
**Core Value:** Minimal, intuitive company search experience

## v1 Requirements

Requirements for smart-search as flagship interface, with user account features integrated minimally.

### Profile & Account

- [ ] **PROF-01**: User can view their display name and email in smart-search header
- [ ] **PROF-02**: User can access account settings (password change, preferences) via smart-search menu
- [ ] **PROF-03**: User can log out from any page in smart-search

### Credit Management

- [ ] **CRED-01**: User can see current credit balance in smart-search header
- [ ] **CRED-02**: User can see credit usage (total used, reset date) in a minimal credit panel
- [ ] **CRED-03**: User receives clear error message when searches would exceed credit limit
- [ ] **CRED-04**: User can view credit transaction history (last 10 transactions in activity)

### Search Interface

- [ ] **SRCH-01**: User can enter natural language query in Google-like search bar
- [ ] **SRCH-02**: User can see AI-interpreted search filters (parsed intent) before executing
- [ ] **SRCH-03**: User can view company search results with key details (name, PIVA, industry, location)
- [ ] **SRCH-04**: User can click company result to view enriched details with AI financial overview

### Advanced Filtering (Minimal)

- [ ] **FILT-01**: User can toggle "advanced filters" panel to show industry/location/size filters
- [ ] **FILT-02**: User can filter by industry (sector codes from Italian PIVA data)
- [ ] **FILT-03**: User can filter by region/location (Italian provinces)
- [ ] **FILT-04**: User can filter by company size (small/medium/large by employee count)
- [ ] **FILT-05**: Advanced filter panel auto-closes after applying filters (stays minimal)

### Activity & History

- [ ] **ACTV-01**: User can view recent searches (last 10) in a quick-access panel
- [ ] **ACTV-02**: User can favorite/save a search query for quick reuse
- [ ] **ACTV-03**: User can view activity history (last 20 searches, companies viewed, credits used)

### Mobile Responsiveness

- [ ] **MOBIL-01**: Smart-search header (search bar, profile, credits) is responsive on mobile (stacks vertically)
- [ ] **MOBIL-02**: Search results display properly on phones (single column, readable text)
- [ ] **MOBIL-03**: Filters panel is modal-based on mobile (doesn't push content)
- [ ] **MOBIL-04**: Company detail view is mobile-optimized (stacked sections, readable on small screens)

## v2 Requirements

Deferred to future release after v1 smart-search consolidation.

### Notifications

- **NOTF-01**: User receives in-app notification when credits are low (below threshold)
- **NOTF-02**: User receives email alert when credits expire

### Advanced Admin

- **ADMIN-01**: Admin can view user activity dashboard
- **ADMIN-02**: Admin can manage user credits (adjust balance, set limits)
- **ADMIN-03**: Admin can view system usage analytics

### Customization

- **CUSTOM-01**: User can configure credit spending limits (daily/monthly)
- **CUSTOM-02**: User can set search result preferences (sort order, display fields)

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth / Social Login | Email/password sufficient for B2B users; adds complexity without user demand |
| Modern-client dashboard as primary | Smart-search consolidation makes separate dashboard redundant |
| Real-time search suggestions | Not essential for v1; OpenAI query parsing sufficient |
| Dark mode | Light theme sufficient for v1; easy to add later |
| Multi-language support | Italian-focused market; internationalization deferred |
| Advanced charting / analytics | Beyond scope of search/profile consolidation |
| API token management | Admin-only feature; defer to v2 |

## Traceability

Mapped during roadmap creation. Maps every v1 requirement to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROF-01 | Phase 1 | Pending |
| PROF-02 | Phase 1 | Pending |
| PROF-03 | Phase 1 | Pending |
| CRED-01 | Phase 1 | Pending |
| CRED-02 | Phase 1 | Pending |
| CRED-03 | Phase 1 | Pending |
| CRED-04 | Phase 1 | Pending |
| SRCH-01 | Existing | Validated ✓ |
| SRCH-02 | Existing | Validated ✓ |
| SRCH-03 | Existing | Validated ✓ |
| SRCH-04 | Existing | Validated ✓ |
| FILT-01 | Phase 2 | Pending |
| FILT-02 | Phase 2 | Pending |
| FILT-03 | Phase 2 | Pending |
| FILT-04 | Phase 2 | Pending |
| FILT-05 | Phase 2 | Pending |
| ACTV-01 | Phase 2 | Pending |
| ACTV-02 | Phase 2 | Pending |
| ACTV-03 | Phase 2 | Pending |
| MOBIL-01 | Phase 3 | Pending |
| MOBIL-02 | Phase 3 | Pending |
| MOBIL-03 | Phase 3 | Pending |
| MOBIL-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after initial definition*
