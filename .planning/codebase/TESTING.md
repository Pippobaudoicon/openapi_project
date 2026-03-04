# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework

**Status:** No formal testing framework configured

**Observation:** The codebase has no test files (`.test.js`, `.spec.js`) and no testing dependencies (Jest, Vitest, Mocha, Chai) configured in any package.json.

**Run Commands:**
- None currently configured
- No test scripts in `package.json` for any service (server, modern-client, smart-search)

**Testing Approach:**
- Manual testing via Bruno API collection for backend endpoints (`bruno/` directory)
- Client-side manual testing during development
- No automated testing pipeline in place

## Manual Testing via Bruno

**Location:** `/Users/lopiparo/Documents/Work/openapi_project/bruno/`

**Organization:**
```
bruno/
├── environments/
│   ├── dev.bru         # Development environment variables
│   └── prod.bru        # Production environment variables
├── Website/
│   ├── Auth/           # Authentication endpoints
│   ├── Company Searches/
│   ├── AI Search/
│   ├── LLM Overview/
│   └── one-time/
├── Company/            # Company data endpoints
├── OAuth/              # OAuth-related tests
└── Visure Camerali/    # Visure service tests
    ├── Bilancio Ottico/
    ├── Ordinaria Societa Capitale/
    ├── Soci Attivi/
    └── Storica Societa Capitale/
```

**Bruno Files (.bru format):**
- Each endpoint has a corresponding `.bru` file with request/response examples
- Request structure: `url`, `method`, `body`, `params`, `headers`
- Environment variables stored in `.env` (gitignored, not in repo)
- Variables referenced as `{{variableName}}`
- Sample pattern: Bruno tests must be updated whenever routes change (see CLAUDE.md requirement)

**Secrets Management:**
- Secrets declared in `vars:secret` section of `.bru` files
- Values stored in `bruno/.env` (gitignored)
- Never hardcode API keys or tokens in `.bru` files

## Testing Patterns

**Integration Testing via Route Handlers:**

Routes have minimal error handling, relying on try-catch at handler level. Sample from `company.js`:

```javascript
router.get('/search',
    checkPermission('search'),
    logActivity({type:'search', action:'company_search', ...}),
    async (req, res) => {
        try {
            const results = await searchCompanies(searchParams);
            res.json(results);
        } catch (error) {
            res.status(500).json(error.message);
        }
    }
);
```

**Pattern:** Middleware chain validates auth → logs activity → handler executes → catches errors → responds

**Middleware Testing:**

Middleware can be tested by:
1. Creating a mock `req`, `res`, `next`
2. Calling middleware function with mocks
3. Verifying `next()` called or `res.status().json()` invoked

Sample middleware from `creditTracker.js`:

```javascript
export const checkCreditBalance = (serviceType, actionType, params = {}) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id || req.user?._id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const spendingCheck = await CreditTransaction.canUserSpend(userId, estimate.cost);
            if (!spendingCheck.canSpend) {
                return res.status(statusCode).json({...});
            }

            req.creditEstimate = estimate;
            next();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};
```

Testing pattern: Mock `req.user`, mock `CreditTransaction.canUserSpend()`, assert `next()` called or status code returned.

**Service Function Testing:**

Services like `openaiService.js` and `emailService.js` can be tested by:
1. Mocking external API clients (OpenAI, Nodemailer)
2. Calling service function with test data
3. Asserting return value or thrown error

Sample from `openaiService.js`:

```javascript
export async function parseNaturalLanguageQuery(query) {
    const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

    // Check cache first
    const cached = await CompanySearch.findOne({
        searchKey: `parse:${queryHash}`,
        searchType: 'search'
    });
    if (cached?.data) {
        return { ...cached.data, cached: true };
    }

    // Call OpenAI
    const response = await client.chat.completions.create({...});

    // Cache result
    await CompanySearch.updateOne({...}, { $set: { data: result, ... } }, { upsert: true });

    return result;
}
```

Testing pattern: Mock `CompanySearch.findOne()` and `client.chat.completions.create()`, assert caching behavior and param validation.

**Validator Pattern (Zod):**

Codebase uses Zod for runtime schema validation. Sample from route handlers:

```javascript
const { email, password } = req.body;
// Implicit validation: handlers assume body is valid or validate manually
// No explicit Zod schema usage visible in routes (but dependency installed)
```

Recommended pattern:
```javascript
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

try {
    const validated = loginSchema.parse(req.body);
    // proceed with validated data
} catch (error) {
    res.status(400).json({ error: 'Validation failed', details: error.issues });
}
```

## What's NOT Tested

**Untested Areas (High Risk):**
- Middleware chain interactions (auth → permission → cache → credit → activity logging)
- Credit system atomicity and transaction ordering
- Cache invalidation and TTL behavior (30-day cache in CompanySearch)
- OpenAI prompt injection and response parsing edge cases
- Email delivery (sendVerificationEmail, sendPasswordResetEmail)
- Meilisearch index synchronization
- Passport.js session persistence across requests
- MongoDB transaction rollback scenarios
- CORS policy enforcement
- Rate limiting and daily/monthly credit limits

**Untested Components:**
- All Vue components in `modern-client/` (no Vitest/Vue Test Utils)
- All Nuxt pages in `smart-search/` (no Nuxt testing)
- Error recovery paths (graceful degradation when APIs fail)
- Concurrent request handling and race conditions
- Database connection failures and reconnection logic

## Recommended Testing Setup

**For Backend (server/):**

1. **Install Jest:**
   ```bash
   npm install --save-dev jest @types/jest supertest
   ```

2. **Create jest.config.js:**
   ```javascript
   export default {
     testEnvironment: 'node',
     collectCoverageFrom: ['routes/**/*.js', 'middleware/**/*.js', 'services/**/*.js', 'utils/**/*.js'],
     coverageThreshold: {
       global: {
         branches: 50,
         functions: 50,
         lines: 50,
         statements: 50
       }
     }
   };
   ```

3. **Test File Structure:**
   ```
   server/
   ├── __tests__/
   │   ├── middleware/
   │   │   ├── creditTracker.test.js
   │   │   └── activityLogger.test.js
   │   ├── routes/
   │   │   └── api/
   │   │       ├── auth.test.js
   │   │       └── company.test.js
   │   └── services/
   │       └── openaiService.test.js
   └── ...
   ```

**For Frontend (modern-client/):**

1. **Install Vitest + Vue Test Utils:**
   ```bash
   npm install --save-dev vitest @vue/test-utils happy-dom
   ```

2. **Vitest Config:** Update vite.config.js with test configuration
   ```javascript
   export default {
     test: {
       environment: 'happy-dom',
       globals: true,
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html']
       }
     }
   }
   ```

3. **Component Test Pattern:**
   ```javascript
   import { describe, it, expect } from 'vitest'
   import { mount } from '@vue/test-utils'
   import SearchForm from '@/components/search/SearchForm.vue'

   describe('SearchForm.vue', () => {
     it('emits search event with form data', async () => {
       const wrapper = mount(SearchForm)
       await wrapper.find('input').setValue('test company')
       await wrapper.find('form').trigger('submit')
       expect(wrapper.emitted('search')).toBeTruthy()
     })
   })
   ```

## Mocking Patterns

**No Current Mocking Library:** Codebase doesn't use Jest, Sinon, or Vitest mocking yet.

**Recommended Mocking Strategy:**

1. **Mongoose Models:**
   ```javascript
   // Mock CompanySearch
   jest.mock('../models/CompanySearch.js', () => ({
     findOne: jest.fn(),
     create: jest.fn(),
     updateOne: jest.fn().mockResolvedValue({ ok: 1 })
   }));
   ```

2. **External API Clients:**
   ```javascript
   // Mock OpenAI client
   jest.mock('openai', () => ({
     __esModule: true,
     default: jest.fn(() => ({
       chat: {
         completions: {
           create: jest.fn().mockResolvedValue({
             choices: [{ message: { content: 'mocked response' } }],
             usage: { prompt_tokens: 10, completion_tokens: 20 }
           })
         }
       }
     }))
   }));
   ```

3. **HTTP Requests:**
   ```javascript
   // Mock axios
   jest.mock('axios');

   // In test
   axios.post.mockResolvedValue({ data: { /* ... */ } });
   ```

4. **Express Request/Response:**
   ```javascript
   const mockReq = {
     user: { _id: 'user123', email: 'test@example.com' },
     params: { piva: '12345678901' },
     query: { format: 'slim' },
     body: { email: 'test@example.com', password: 'pass123' },
     isAuthenticated: () => true
   };

   const mockRes = {
     status: jest.fn().mockReturnThis(),
     json: jest.fn(),
     statusCode: 200
   };

   const mockNext = jest.fn();
   ```

## Coverage Gaps

**Critical Areas Without Tests:**

1. **Credit System (`creditTracker.js`):**
   - Debit creation with limit checks
   - Daily/monthly limit enforcement
   - Insufficient balance error handling
   - Atomic transaction guarantee

2. **Authentication Flow (`auth.js`):**
   - Login/logout session persistence
   - Password hashing and comparison
   - Email verification token validity
   - Password reset token expiration

3. **Activity Logging (`activityLogger.js`):**
   - Metadata extraction accuracy
   - Failed request exclusion (statusCode >= 400)
   - User context capture across middleware chain

4. **OpenAI Integration (`openaiService.js`):**
   - Query parsing with LLM (prompt injection risk)
   - Financial overview generation accuracy
   - Token counting and cost calculation
   - Cache validation and staleness

5. **Permission System (`roleAuth.js`):**
   - Role-based access control enforcement
   - Permission scope validation across endpoints

---

*Testing analysis: 2026-03-04*
