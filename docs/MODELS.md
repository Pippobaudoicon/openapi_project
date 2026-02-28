# Data Models

All models use MongoDB via Mongoose. Collections auto-created on first write.

---

## User

**File:** `server/models/User.js`

```
User {
  firstName:        String
  lastName:         String
  email:            String (unique, required, lowercase)
  company:          String
  phone:            String
  password:         String (bcrypt hashed, 10 rounds)
  role:             String (default: 'user') → 'user' | 'admin'
  isActive:         Boolean (default: false, set true after email verification)

  // Credits
  creditBalance:    Number (default: 100, min: 0)
  creditLimit:      Number (default: 1000)
  creditSettings: {
    dailyLimit:     Number (default: 50)
    monthlyLimit:   Number (default: 500)
    autoRecharge: {
      enabled:      Boolean (default: false)
      threshold:    Number (default: 10)
      amount:       Number (default: 100)
    }
  }

  // Verification & Reset
  verificationToken:     String
  resetPasswordToken:    String
  resetPasswordExpires:  Date

  timestamps: true (createdAt, updatedAt)
}
```

**Indexes:** `email` (unique)

**Hooks:** `pre('save')` — hashes password if modified

---

## Role

**File:** `server/models/Role.js`

```
Role {
  roleName:     String (unique, required)
  permissions:  [String]
}
```

**Known permissions:** `search`, `advanced_search`, `full_search`, `search_companies`, `company_details`, `company_llm_overview`, `user`, `get_credit`, `get_activities`, `update_credit_settings`

**Default roles:**
- `user` — search, company_details, search_companies, user, get_credit, get_activities, company_llm_overview, update_credit_settings
- `admin` — all permissions + IT-closed, impresa, visure, base64tozip, download

---

## CompanySearch

**File:** `server/models/CompanySearch.js`

```
CompanySearch {
  piva:        String (indexed)
  searchType:  String → 'advanced' | 'full' | 'closed' | 'search'
  data:        Mixed (full API response object)
  searchKey:   String (indexed, required for searchType='search')
  parameters:  Mixed (query params used for search)
  llmOverview: String (cached AI-generated overview, markdown)
  createdAt:   Date (TTL: 30 days auto-delete)
}
```

**Indexes:** `piva`, `searchKey`, `createdAt` (TTL 30 days)

**Hooks:** `post('save')` — indexes in Meilisearch for full-text search (advanced/full types only)

**Static methods:**
- `fetchByPivaFull(piva)` — find most complete record for a PIVA

**Cache key patterns:**
- Company data: `{ piva, searchType: 'advanced' }`
- Search results: `{ searchKey: JSON.stringify(params), searchType: 'search' }`
- Parsed queries: `{ searchKey: 'parse:<sha256-hash>', searchType: 'search' }`

---

## CreditTransaction

**File:** `server/models/CreditTransaction.js`

```
CreditTransaction {
  userId:              ObjectId (ref: User, indexed, required)
  transactionType:     String → 'debit' | 'credit' | 'refund'
  serviceType:         String → 'openapi' | 'openai' | 'manual'
  actionType:          String (e.g., 'IT-advanced', 'IT-search', 'llm-overview')
  amount:              Number (required)
  balanceBefore:       Number (required)
  balanceAfter:        Number (required)
  description:         String
  metadata:            Mixed

  // OpenAPI specific
  apiEndpoint:         String
  httpMethod:          String
  responseStatus:      Number

  // OpenAI specific
  openaiModel:         String
  tokensUsed:          Number
  promptTokens:        Number
  completionTokens:    Number

  status:              String → 'pending' | 'completed' | 'failed' | 'refunded'
  relatedActivityId:   ObjectId (ref: Activity)
  errorMessage:        String
  processedBy:         ObjectId (ref: User)
  notes:               String

  timestamps: true
}
```

**Indexes:** `(userId, createdAt)` compound

**Critical static methods:**
- `createDebit(userId, serviceType, actionType, amount, description, metadata)` — atomic debit + balance update
- `createCredit(userId, amount, description, metadata)` — add credits
- `createDebitWithLimits(userId, ...)` — debit with daily/monthly limit enforcement
- `canUserSpend(userId, amount)` — check affordability
- `getUserStats(userId, startDate?, endDate?)` — aggregated spending by service

---

## Activity

**File:** `server/models/Activity.js`

```
Activity {
  userId:      ObjectId (ref: User, required)
  type:        String (e.g., 'login', 'company_advanced', 'company_search')
  action:      String (e.g., 'get_advanced_data', 'search_companies')
  description: String (human-readable, e.g., "Searched for companies in MI")
  metadata:    Mixed (request params, result count, etc.)
  ipAddress:   String
  userAgent:   String
  timestamps:  true
}
```

---

## VisureSearch

**File:** `server/models/VisureSearch.js`

```
VisureSearch {
  piva:        String (indexed)
  searchType:  String → 'bilancio' | 'search' | 'impresa'
  data:        Mixed
  requestId:   String (for async bilancio-ottico requests)
  searchKey:   String
  status:      String → 'pending' | 'completed'
  createdAt:   Date (TTL: 30 days)
}
```

---

## Relationships

```
User ─────────── 1:N ──────────── CreditTransaction
  │                                     │
  │                                     │ relatedActivityId
  │                                     ▼
  └──────────── 1:N ──────────── Activity

Role ─────────── 1:N ──────────── User (via user.role → role.roleName)

CompanySearch ── standalone (cache, no user FK)
VisureSearch ─── standalone (cache, no user FK)
```
