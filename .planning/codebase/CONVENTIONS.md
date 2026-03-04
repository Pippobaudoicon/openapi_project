# Coding Conventions

**Analysis Date:** 2026-03-04

## Naming Patterns

**Files:**
- Kebab-case for filenames: `credit-tracker.js`, `activity-logger.js`
- PascalCase for models: `User.js`, `CompanySearch.js`, `CreditTransaction.js`
- camelCase for route files and service files: `auth.js`, `openaiService.js`, `emailService.js`
- Vue component files: PascalCase with `.vue` extension: `SearchForm.vue`, `CreditCard.vue`, `CompanyStructure.vue`

**Functions:**
- camelCase for all functions: `getLoginDescription()`, `trackOpenAPICredit()`, `calculateOpenAPICost()`, `parseNaturalLanguageQuery()`
- Descriptor prefix pattern for data transformers: `stripCompanyData()`, `getTimestamps()`, `pick()`, `compactArray()`
- Handler/middleware suffix pattern: `trackOpenAPICredit()`, `checkCreditBalance()`, `logActivity()`, `checkCache()`
- Getter/extractor prefix: `getLLMOverview()`, `getSearchDescription()`, `getCompanyMetadata()`, `getUserCreditInfo()`

**Variables:**
- camelCase for all variables: `searchForm`, `companyRecord`, `creditCost`, `userAgent`
- Boolean prefixes: `is*` and `has*` (e.g., `isAuthenticated`, `isLoading`, `isFilterActive`)
- Short prefixes for special purposes: `get*` for accessors, `set*` for setters, `check*` for validation
- Reactive Vue state: `ref()`, `reactive()`, `computed()` with camelCase names matching the exposed value
- Object property keys use snake_case for external API params: `minTurnover`, `maxTurnover`, `atecoCode`, `provincia`

**Types & Schemas:**
- Mongoose model names: PascalCase, singular form: `User`, `Activity`, `CompanySearch`
- Enum values: UPPERCASE_SNAKE_CASE in config, but lowercase in schema: `role: ['user', 'admin']`
- Schema field keys: camelCase: `creditBalance`, `verificationToken`, `resetPasswordToken`
- Zod schema names: camelCase with `Schema` suffix: `userSchema`, `companySchema`

## Code Style

**Formatting:**
- 4 spaces for indentation (observed in all .js files)
- No semicolons at end of statements (ES6 module style)
- Modern ES6+ import syntax: `import express from 'express'` (not CommonJS)
- Max line length varies but trending toward 100-120 characters

**Linting:**
- ESLint configured in `modern-client/` with `@typescript-eslint/eslint-plugin` and `eslint-plugin-vue`
- Run via: `npm run lint` in modern-client (with --fix flag for auto-fix)
- No ESLint in server/ or smart-search/ (considered non-strict environments)
- Prettier configuration: Not explicitly set; rely on ESLint rules

**Vue 3 Composition API:**
- Prefer `<script setup>` for modern simplicity
- Use `defineProps()`, `defineEmits()`, `defineExpose()` at top of script
- Combine `ref()`, `reactive()`, `computed()`, `watch()` for state management
- Return object at end of non-setup functions for explicit exports

**Nuxt 4 Auto-Imports:**
- Component auto-imports deduplicate directory prefixes: `components/search/SearchBar.vue` imports as `SearchBar`, not `SearchSearchBar`
- Composable auto-imports work similarly: `composables/useCredits.js` → `useCredits()`
- Explicit imports needed for utilities and non-standard patterns

## Import Organization

**Order:**
1. External dependencies (npm packages): `import express from 'express'`, `import axios from 'axios'`
2. Node.js built-ins: `import crypto from 'crypto'`, `import path from 'path'`
3. Local models/schemas: `import User from '../../models/User.js'`, `import Activity from '../models/Activity.js'`
4. Local middleware: `import { logActivity } from '../../middleware/activityLogger.js'`
5. Local services/utils: `import { getLLMOverview } from '../../services/openaiService.js'`, `import { searchCompanies } from '../../utils/meilisearch.js'`
6. Local config: `import connectDB from './config/database.js'`

**Path Aliases:**
- No explicit aliases configured; relative paths used throughout
- Recommended pattern: Use `@/` prefix in Vue/Nuxt apps (auto-configured by Vite/Nuxt), `../../` for server traversal
- Sample usage in modern-client: `import api from '@/services/api'`

## Error Handling

**Patterns:**
- Try-catch blocks for async operations in route handlers and service functions
- HTTP status codes align with semantic meaning:
  - `200`: Success
  - `400`: Bad request (invalid data, missing params)
  - `401`: Unauthorized (not logged in)
  - `402`: Payment Required (insufficient credits)
  - `404`: Not found (resource doesn't exist)
  - `429`: Too Many Requests (rate limit/daily limits exceeded)
  - `500`: Internal server error (unhandled exception)
- Error response shape: `{ error: 'string message', message: 'additional context', details?: {...} }`
- Credit-related errors include additional metadata: `{ error, message, ...creditError.details }`
- Sample from `creditTracker.js`:
  ```javascript
  if (!spendingCheck.canSpend) {
    const statusCode = spendingCheck.reason === 'insufficient_balance' ? 402 : 429;
    return res.status(statusCode).json({
      error: errorMessages[spendingCheck.reason],
      message: `...`,
      action: actionType,
      estimate
    });
  }
  ```
- Console.error for logging exceptions: `console.error('Error in X:', error)` always logs error object
- Non-blocking errors: Catch and log without throwing to prevent response interruption

**Async/Await:**
- Preferred over `.then()` chains
- All middleware using async returns a function that calls `next()`
- Sample middleware pattern from `activityLogger.js`:
  ```javascript
  export function logActivity({ type, action, getDescription, getMetadata = () => ({}) }) {
    return async (req, res, next) => {
      // intercept res.json
      const originalJson = res.json;
      res.json = function (data) {
        // async work
        return originalJson.call(this, data);
      };
      next();
    };
  }
  ```

## Logging

**Framework:** `console` (Node.js built-in)

**Patterns:**
- `console.log()` for startup info: `console.log(\`Server is running on...\`)`
- `console.error()` for exceptions and errors: `console.error('Error message:', error)`
- `console.warn()` for validation failures and edge cases: `console.warn('Credit tracking skipped: No user ID')`
- Structured logging with context: Include operation name, user ID when available, and relevant IDs
- Sample: `console.log(\`Credit tracked: ${creditCost} credits for ${resolvedActionType} (User: ${userId})\`)`
- No third-party logger configured (Sentry, Pino, Winston not used)
- Activity logging via middleware: Uses `Activity.log()` model method instead of console

**Activity Logger Middleware:**
- Automatic logging on successful responses (statusCode < 400) via `logActivity()` middleware
- Captures user ID, request metadata, action type, description, and custom metadata
- Used on all user-facing routes: auth, search, company details, credit operations
- Sample usage: `router.post('/login', logActivity({type:'login', action:'login', ...}), handler)`

## Comments

**When to Comment:**
- Explain WHY, not WHAT (code is self-explanatory)
- Document non-obvious business logic and API contract details
- Mark temporary workarounds with `//TODO` or `//FIXME`
- Mark intentional security decisions: "For security reasons, always return success even if email not found"
- Document complex prompts and schema definitions (OpenAI prompt engineering)

**JSDoc/TSDoc:**
- Selective use on utility functions and public APIs
- Sample from `creditTracker.js`:
  ```javascript
  /**
   * Middleware to track credit usage for OpenAPI calls
   * This should be added AFTER the actual API call to capture response data
   */
  export const trackOpenAPICredit = (actionType = null) => { ... }
  ```
- Sample from `searchHelpers.js`:
  ```javascript
  /**
   * Checks if the provided data was created in the current year
   * @param {Object} data - The data object to check
   * @param {Date} data.createdAt - The creation date of the data
   * @returns {boolean} - True if data was created in current year, false otherwise
   */
  export const isDataCurrentYear = (data) => { ... }
  ```

## Function Design

**Size:**
- Prefer functions under 50 lines; long functions (100+ lines) used for complex middleware interceptors
- Route handlers typically 20-40 lines (setup, validation, execution, response)

**Parameters:**
- Prefer named parameters via object destructuring for clarity
- Sample: `router.post('/api/action', logActivity({type, action, getDescription, getMetadata}))`
- HTTP query params extracted at top: `const { q = '', provincia, ... } = req.query`
- Required params checked inline; optional params have defaults
- Middleware factories accept config object: `checkCreditBalance(serviceType, actionType, params = {})`

**Return Values:**
- Route handlers: `res.json()` or `res.status(code).json()`; always return to prevent multiple responses
- Service functions: Return structured data or throw error: `{ data, cached: true }` or throw
- Middleware: Return via `next()` call, not direct return
- Async functions: Always return Promise (implicit via async)
- Sample from `openaiService.js`:
  ```javascript
  return {
    success: true,
    creditCost,
    tokensUsed: totalTokens
  };
  ```

## Module Design

**Exports:**
- Default export for main module: `export default router` for route files, `export default api` for services
- Named exports for utilities and helpers: `export const trackOpenAPICredit = ...`, `export function logActivity(...) {}`
- Mix pattern: Service functions as named exports, singleton instances as default
- Sample structure: `export default { trackOpenAPICredit, trackOpenAICredit, ... }` combined with named exports

**Barrel Files:**
- Route aggregation in `routes/api/index.js`: Imports all subroutes and mounts on Express app
- No component barrel files in modern-client (Nuxt auto-imports handle this)
- Model aggregation: Not used; models imported individually

**Singleton Patterns:**
- OpenAI client instantiated once at module load: `const client = new OpenAI({ apiKey: ... })`
- Axios instances created once: `const api = axios.create({ baseURL, ... })`
- Mongoose connection once via `connectDB()` in app.js

## Special Patterns

**Middleware Interceptor Pattern:**
- Override `res.json()` to intercept responses and add side effects (logging, credit tracking)
- Store original method: `const originalJson = res.json`
- Wrap and call original: `return originalJson.call(this, data)`
- Used in: `activityLogger.js`, `creditTracker.js`, `cacheCheck.js`

**Configuration Objects:**
- Route-level config passed as structured objects: `{ type: 'login', action: 'login', getDescription, getMetadata }`
- Middleware config passed to factory functions: `checkCreditBalance('openapi', 'search', {})`
- Service config via env variables checked at module load: `const apiKey = process.env.OPENAI_API_KEY`

**Error Recovery:**
- Non-critical failures don't block response: Credit tracking catches and logs but doesn't throw
- Fallback values provided when services fail: `creditBalance || 0`, `creditSettings || {}`
- Security-conscious responses: Always return same response even if user doesn't exist (prevents user enumeration)

---

*Convention analysis: 2026-03-04*
