# Codebase Concerns

**Analysis Date:** 2026-03-04

## Tech Debt

**Response Payload Optimization (TODO):**
- Issue: `/api/v1/company/stored` endpoint returns 100KB of full company data when only 2KB is needed. Clients must filter locally.
- Files: `server/routes/api/company.js:57`
- Impact: Excessive network transfer, poor performance for users with large datasets or slow connections
- Fix approach: Implement server-side field projection in the base query. Add optional `fields` query parameter to specify which fields to return (name, province, status only by default). Add stricter format parameter support to reduce response early.

**Search Cache Key Mapping (TODO):**
- Issue: IT-search results are cached by searchKey but cache validation is not implemented for this search type
- Files: `server/routes/api/openapi.js:167`, `server/middleware/cacheCheck.js`
- Impact: Duplicate searches from same user with same parameters will trigger fresh API calls instead of using cache, wasting credits
- Fix approach: Implement cache key matching in `checkCache` middleware for 'search' searchType. Add validation logic to ensure cached search results are fresh (consider TTL boundaries).

**CompanySearch Data Mapping Inconsistency (TODO):**
- Issue: Different API response formats (full, advanced, closed, impresa) have inconsistent field structures. Meilisearch indexing uses brittle fallback mappings.
- Files: `server/models/CompanySearch.js:52`, `server/services/openaiService.js:192-206`
- Impact: Missing or incorrect field mapping when indexing new data types. Meilisearch index may not be searchable for certain fields depending on source.
- Fix approach: Create a unified data normalization layer that maps all API response formats to a canonical schema before storage. Add integration tests for each API source format.

**Bilancio Search Type Missing from CompanySearch Model:**
- Issue: `VisureSearch` model handles bilancio differently from other searches. CompanySearch enum doesn't include 'bilancio' or 'impresa' types.
- Files: `server/models/CompanySearch.js:12`, `server/models/VisureSearch.js:11`
- Impact: Searches are split across two models with inconsistent schemas. Code that tries to query all company data must check both models. Index operations only apply to CompanySearch.
- Fix approach: Consolidate both models into a unified schema, or create a factory method that routes queries to the correct model based on searchType.

## Known Bugs

**Polling Loop Without Timeout (IT-full endpoint):**
- Symptoms: Client request to `/api/v1/openapi/IT-full/:piva` with 302 response initiates infinite polling every 3 seconds with no maximum retry count
- Files: `server/routes/api/openapi.js:88-99`
- Trigger: OpenAPI returns 302 status (request pending) for IT-full data retrieval
- Workaround: Manually timeout client request after ~30 seconds. Backend will eventually complete but client may disconnect.
- Fix approach: Add `maxRetries` limit (suggest 10-20 attempts = 30-60 seconds). Add exponential backoff (start at 3s, increase to 10s after 5 retries). Return 408 Request Timeout if max retries exceeded.

**Callback Handler Missing Type Variable:**
- Symptoms: Callback response at `/api/v1/callback/visure` attempts to return `type` field but variable is never defined
- Files: `server/routes/api/callbacks/visure.js:38`
- Trigger: Any POST to `/api/v1/callback/visure` endpoint
- Workaround: None - will send `"type": undefined` in response
- Fix approach: Extract searchType from result data (result.searchType already available). Replace `type` with `searchType`.

**Variable Reference Error in Callback:**
- Symptoms: Callback endpoint uses undefined `type` variable on line 38, and `searchType` parameter is not being parsed from the callback data structure
- Files: `server/routes/api/callbacks/visure.js:16-38`
- Trigger: Visure bilancio-ottico callback from external service
- Impact: Callback response is invalid JSON (includes `undefined`), external service logging may fail
- Fix approach: Use `result.searchType` directly in response, or extract from the callback metadata passed in the request.

## Security Considerations

**Session Secret Hardcoded as Fallback:**
- Risk: Default session secret `'scemo-chi-legge'` will be used if SESSION_SECRET env var is missing, making sessions predictable
- Files: `server/app.js:69`
- Current mitigation: Relies on `.env.development` being set in development, but no validation that env var exists
- Recommendations: Add startup check to throw error if SESSION_SECRET is not set. Never include fallback secrets in code.

**Base64 Credentials in Axios Config:**
- Risk: OAuth credentials are Base64-encoded in HTTP headers (not encrypted), vulnerable if HTTPS is misconfigured
- Files: `server/utils/axiosOpenapi.js:22`
- Current mitigation: All external APIs should be HTTPS, but no verification of certificate pinning
- Recommendations: Add https.Agent with certificate verification. Consider using Axios interceptors to validate connection security. Rotate OAUTH_USERNAME/ACCESS_TOKEN_APIKEY regularly.

**Insufficient Input Validation on PIVA:**
- Risk: PIVA parameter used directly in queries without format validation (should be 11 digits)
- Files: `server/routes/api/openapi.js:41`, `server/routes/api/company.js:143`
- Current mitigation: Database queries are parameterized (not SQL injection risk), but allows invalid searches
- Recommendations: Add regex validation for PIVA format before API calls. Return 400 Bad Request for invalid format instead of propagating API errors.

**Unvalidated Callback Data:**
- Risk: Visure callback endpoint accepts arbitrary JSON in `result` field without schema validation
- Files: `server/routes/api/callbacks/visure.js:11`
- Current mitigation: Basic null check on result field
- Recommendations: Validate callback payload against expected schema. Verify callback comes from expected IP/signature if possible. Add rate limiting to callback endpoint.

**Meilisearch Unencrypted Communication:**
- Risk: Meilisearch connection uses unencrypted HTTP (check env config)
- Files: `server/utils/meilisearch.js`
- Current mitigation: Not found in code review, depends on env configuration
- Recommendations: Verify MEILISEARCH_URL uses HTTPS in production. Add authentication token if exposed to network.

## Performance Bottlenecks

**Unbounded Polling Loop on IT-full:**
- Problem: 302 polling can wait indefinitely for API response with fixed 3-second intervals, no timeout
- Files: `server/routes/api/openapi.js:86-99`
- Cause: OpenAPI's async model for IT-full retrieval. No jitter in polling intervals (thundering herd risk at scale).
- Improvement path: Implement exponential backoff + max retries. Consider using request IDs to avoid duplicate polling from multiple clients.

**Meilisearch Post-Save Indexing on Every Update:**
- Problem: `CompanySearch.post('save')` hook re-indexes into Meilisearch on every save, even if data hasn't changed
- Files: `server/models/CompanySearch.js:42-108`, `server/models/CompanySearch.js:112-127`
- Cause: No change detection - always pushes to Meilisearch regardless of whether data field actually changed
- Improvement path: Compare old vs new data before indexing. Add batch indexing for bulk operations. Consider async queue instead of direct calls.

**N+1 Query on LLM Overview Generation:**
- Problem: `getLLMOverview` calls `trackOpenAICredit` which loads User document, then CompanySearch.save() which triggers Meilisearch indexing
- Files: `server/routes/api/company.js:122-126`, `server/services/openaiService.js:231-249`
- Cause: Sequential middleware instead of batching. Each API route may hit User model multiple times across middleware chain.
- Improvement path: Load User once at auth time, attach to req. Batch credit tracking at end of response. Defer Meilisearch indexing to async job.

**Activity Logging on Every Response:**
- Problem: `logActivity` middleware overrides `res.json()` and calls `Activity.log()` on every successful response, potentially blocking response
- Files: `server/middleware/activityLogger.js:8-18`
- Cause: Activity log is fire-and-forget but database write is synchronous
- Improvement path: Use async queue (Bull/RabbitMQ) for activity logging. Or make Activity.log() truly async (background job). Add sampling for high-volume endpoints.

**Large Financial Data Shipped to LLM:**
- Problem: `stripCompanyData` still includes full `balanceSheets` array (deep copy), which gets stringified and sent to OpenAI
- Files: `server/services/openaiService.js:77`, `server/routes/api/company.js:119`
- Cause: No filtering of historical balance sheet data. Only last few years needed.
- Improvement path: Limit balanceSheets to last 3-5 years. Add field count check before API call to warn if payload > 50KB.

## Fragile Areas

**Credit Tracking Middleware Chain:**
- Files: `server/middleware/creditTracker.js`, `server/routes/api/openapi.js:35-38`
- Why fragile: Credit checks and tracking are separate middleware. If order is wrong (`trackOpenAPICredit` before `checkCreditBalance`), credits are deducted before limits are validated. res.json() override is used (fragile pattern - doesn't work with streaming).
- Safe modification: Extract middleware order to a constant. Add assertion in tests that checkCreditBalance always runs before trackOpenAPICredit. Consider using res.on('finish') instead of overriding res.json().
- Test coverage: No tests found. Need tests for: insufficient balance, daily limit, monthly limit, cost calculation accuracy.

**CompanySearch Data Fetching:**
- Files: `server/models/CompanySearch.js:130-138`, `server/routes/api/company.js:137-168`
- Why fragile: `./:piva` route returns 404 if data not cached, with confusing message suggesting user must call IT-advanced first. But data might be cached under wrong searchType or in wrong model (VisureSearch). No fallback to fresh fetch.
- Safe modification: Add helper method to search across multiple models. Return 202 Accepted instead of 404 with link to async endpoint. Add search history suggestions.
- Test coverage: No tests for cache miss scenarios.

**Axios Service Configuration:**
- Files: `server/utils/axiosOpenapi.js:4-24`
- Why fragile: Three separate axios instances with hardcoded baseURLs and headers. No retry logic, no timeout configuration, no error transformation. If external API changes format, all routes fail silently.
- Safe modification: Add axios interceptors for error handling, retry logic, and request/response transformation. Create wrapper functions instead of exporting raw instances. Add circuit breaker pattern for API failures.
- Test coverage: No mocking of axios in route tests.

**Data Type Coercion in Cache Query:**
- Files: `server/middleware/cacheCheck.js:14-20`
- Why fragile: buildQuery() assumes req.params and req.query contain search parameters directly, but `piva` comes in params while search filters come in query. No type coercion for numeric fields (dipendenti_min, fatturato_max should be numbers).
- Safe modification: Add explicit type coercion. Separate logic for entity lookups (piva) vs filters (ranges). Add validation against schema before querying.
- Test coverage: No tests for edge cases like string "100" vs number 100.

**Meilisearch Index Schema Mismatch:**
- Files: `server/models/CompanySearch.js:53-102`
- Why fragile: Hard-coded field mapping with fallback chains (companyName || denominazione || ragione_sociale). If API adds new field at different path, index document is incomplete. No schema validation before indexing.
- Safe modification: Use JSON schema to validate incoming data before mapping. Create data transformation pipeline. Add index migration script if schema changes.
- Test coverage: None - no tests for index document generation.

## Scaling Limits

**Session Store in MongoDB:**
- Current capacity: 100K+ concurrent sessions (depends on MongoDB cluster), but each session write is a database operation
- Limit: At 1000 concurrent users with frequent API calls, session writes become bottleneck. Memory usage grows unbounded (30-day TTL).
- Scaling path: Switch to Redis session store (100x faster). Add session pooling. Set TTL to 12 hours instead of 24 hours.

**Activity Log Collection:**
- Current capacity: 1M activity records per month = 12M per year
- Limit: Unindexed filtering becomes slow. Aggregation queries for user stats are O(n). 30-day TTL helps but doesn't reduce live query load.
- Scaling path: Add index on (userId, createdAt). Archive old activities to separate collection. Pre-compute stats via nightly batch jobs.

**Meilisearch Index Size:**
- Current capacity: Depends on configuration, but typically handles 100K documents easily
- Limit: Each CompanySearch.post('updateOne') re-indexes full document. At 10K updates/day, performance degrades. No batching.
- Scaling path: Implement bulk indexing via batched jobs. Add cache invalidation instead of re-indexing unchanged documents.

**Credit Transaction Aggregation:**
- Current capacity: getUserStats() uses $group on 100K+ transactions
- Limit: Monthly aggregation becomes slow after 1M transactions. No pagination.
- Scaling path: Pre-compute daily/monthly stats in background job. Store summaries in separate collection. Add indexes on (userId, transactionType, createdAt).

**LLM API Rate Limits:**
- Current capacity: OpenAI allows 3,500 requests/minute (gpt-4.1-nano). At 50 users, ~10 requests/day per user = 500 requests/day total
- Limit: 500 users = 5,000 requests/day. If users request overviews in bulk, could hit rate limits.
- Scaling path: Implement request queue with exponential backoff. Cache results per PIVA (prevent duplicate requests). Add cost estimation before accepting request.

## Dependencies at Risk

**express-error-handler (dev dependency only):**
- Risk: Package is barely maintained, last update 2016. Not used effectively in code (only in dev mode).
- Impact: No production error formatting. Global error handler on line 102 is unused.
- Migration plan: Replace with custom middleware. Use `express-async-errors` for proper async/await error handling.

**Meilisearch Client Library:**
- Risk: Version not pinned in provided config. API changes between versions are breaking.
- Impact: Indexing may fail silently if version incompatible with deployment.
- Migration plan: Pin exact version in package.json. Add health check on startup. Test against target Meilisearch server version.

**passport-local (Authentication):**
- Risk: No 2FA support. Session-based auth vulnerable to CSRF without additional headers. No rate limiting on login attempts.
- Impact: Account takeover possible via brute force. Compromised session cookie = full account access.
- Migration plan: Add rate limiting to POST /auth/login (max 5 attempts/minute). Add CSRF tokens to session. Consider 2FA for admin accounts.

## Missing Critical Features

**Rate Limiting:**
- Problem: No rate limiting on any endpoint. Malicious user can abuse /api/v1/openapi/IT-search with dryRun=true to probe APIs for free.
- Blocks: Can't deploy to production safely. Denial of service risk. Credit fraud risk.

**Input Validation Framework:**
- Problem: No centralized validation. Each route manually validates fields. PIVA format, email format, numeric ranges not validated.
- Blocks: API accepts garbage input, passes to external APIs, gets cryptic errors back.

**API Response Versioning:**
- Problem: No /api/v1/ vs /api/v2/ strategy. Breaking changes to response format will break all clients.
- Blocks: Can't safely modify data model. Must maintain backward compatibility forever.

**Audit Logging for Admin Actions:**
- Problem: Activity table logs user searches, but not admin credit adjustments, role changes, or access control modifications.
- Blocks: No accountability for admin actions. Can't detect unauthorized access changes.

**Bulk Operations:**
- Problem: No bulk indexing, bulk credit adjustment, bulk user import. Operations are one-at-a-time.
- Blocks: Setting up test data takes hours. Large customer migrations are painful.

## Test Coverage Gaps

**Credit System Logic (CRITICAL):**
- What's not tested:
  - Cost calculation accuracy for different result counts
  - Daily/monthly limit enforcement
  - Insufficient balance scenarios
  - Concurrent credit deductions
  - Refund/reversal flows
- Files: `server/middleware/creditTracker.js`, `server/models/CreditTransaction.js`
- Risk: Money-related code breaking undetected. Users charged wrong amounts. Double-debits possible under race conditions.
- Priority: HIGH - Add tests for all cost calculation functions. Mock User model and test limit checks. Test concurrent requests.

**API Response Format Consistency:**
- What's not tested:
  - Different searchType responses have correct shape
  - Optional fields present/absent as documented
  - Error responses have consistent error format
  - Pagination works end-to-end
- Files: `server/routes/api/openapi.js`, `server/routes/api/company.js`
- Risk: Frontend breaks when response shape changes. Consumers can't depend on API contract.
- Priority: HIGH - Add contract tests. Use Swagger/OpenAPI spec as source of truth.

**Data Transformation Pipeline:**
- What's not tested:
  - CompanySearch data normalization for different API sources
  - stripCompanyData() handles missing fields gracefully
  - Meilisearch document generation produces valid documents
- Files: `server/services/openaiService.js`, `server/models/CompanySearch.js`
- Risk: Index corruption. LLM receives malformed data and produces bad overviews.
- Priority: MEDIUM - Add unit tests for stripCompanyData(). Add fixtures for each API format. Test Meilisearch indexing.

**Authentication and Session Management:**
- What's not tested:
  - Login with invalid credentials
  - Session expiration
  - Concurrent logins from different IPs
  - Password reset token expiration
  - Email verification flow
- Files: `server/routes/api/auth.js`, `server/auth/passport-config.js`
- Risk: Authentication bypass. Unauthorized access.
- Priority: HIGH - Add integration tests for full auth flow.

**Error Handling Edge Cases:**
- What's not tested:
  - External API timeout behavior
  - Meilisearch unavailability
  - MongoDB connection failure
  - Invalid JSON in request body
  - Missing required headers
- Files: `server/routes/api/openapi.js`, `server/app.js`
- Risk: Unhandled errors crash server. Users see 500 errors instead of helpful messages.
- Priority: MEDIUM - Add error scenario tests. Mock external dependencies.

**Polling Logic (IT-full):**
- What's not tested:
  - 302 response triggers polling
  - Polling timeout after N retries
  - Exponential backoff timing
  - Race conditions if multiple clients poll same PIVA
- Files: `server/routes/api/openapi.js:86-99`
- Risk: Infinite loops. Resource exhaustion. Timeout bugs undetected.
- Priority: CRITICAL - Add unit tests for polling logic with mock timers.

---

*Concerns audit: 2026-03-04*
