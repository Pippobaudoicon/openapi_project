# Roadmap: OpenAPI Italian Company Search Platform

## Overview

Smart-search (Nuxt 4) becomes the sole interface for Italian company data. The backend and core search are already production-ready; this roadmap delivers the user-facing layer that was previously fragmented across modern-client. Three phases: first give users account visibility and credit awareness directly in smart-search, then add power-user features (advanced filters and search history), then harden the experience for mobile. When Phase 3 completes, modern-client can be retired.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Account & Credits** - Bring user identity and credit visibility into the smart-search interface
- [ ] **Phase 2: Power Features** - Add advanced filtering and activity/history to smart-search
- [ ] **Phase 3: Mobile Polish** - Make every smart-search surface responsive on phones and tablets

## Phase Details

### Phase 1: Account & Credits
**Goal**: Users can see who they are and manage their credits without leaving smart-search
**Depends on**: Nothing (first phase)
**Requirements**: PROF-01, PROF-02, PROF-03, CRED-01, CRED-02, CRED-03, CRED-04
**Success Criteria** (what must be TRUE):
  1. User can see their display name and email in the smart-search header without navigating away from the search bar
  2. User can open an account settings panel and change their password from within smart-search
  3. User can log out from any page in smart-search and be redirected to the login screen
  4. User can see their current credit balance in the header at all times during a session
  5. User who attempts a search that would exceed their credit limit sees a clear error message before the search executes
**Plans**: TBD

### Phase 2: Power Features
**Goal**: Users can narrow searches with advanced filters and revisit past activity without friction
**Depends on**: Phase 1
**Requirements**: FILT-01, FILT-02, FILT-03, FILT-04, FILT-05, ACTV-01, ACTV-02, ACTV-03
**Success Criteria** (what must be TRUE):
  1. User can toggle an advanced filters panel and apply industry, region, and company size filters without the panel persisting after application
  2. User can see their 10 most recent searches in a quick-access panel without performing a new search
  3. User can favorite a search query and reuse it from the activity panel in a single click
  4. User can view a full activity log (last 20 searches, companies viewed, credits used per action)
**Plans**: TBD

### Phase 3: Mobile Polish
**Goal**: Every smart-search surface works correctly on mobile screens
**Depends on**: Phase 2
**Requirements**: MOBIL-01, MOBIL-02, MOBIL-03, MOBIL-04
**Success Criteria** (what must be TRUE):
  1. User on a phone sees the search bar, profile badge, and credit balance stacked vertically without overflow or truncation
  2. User on a phone sees search results in a readable single-column layout
  3. User on a phone opens the advanced filters panel as a modal that overlays content rather than pushing it
  4. User on a phone views a company detail page with sections stacked vertically and text readable without zooming
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Account & Credits | 0/TBD | Not started | - |
| 2. Power Features | 0/TBD | Not started | - |
| 3. Mobile Polish | 0/TBD | Not started | - |
