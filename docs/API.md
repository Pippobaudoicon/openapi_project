# API Reference

Base URL: `http://localhost:3000/api/v1`

All endpoints require authentication via session cookie unless marked `[public]`.

---

## Authentication (`/auth`)

### `POST /auth/login` [public]
Login with email and password.
```json
// Request
{ "email": "user@example.com", "password": "secret" }

// Response 200
{ "user": { "_id", "email", "role", "isActive", "firstName", "lastName" } }

// Response 401
{ "message": "Invalid credentials" }
```

### `POST /auth/register` [public]
Create a new account. Sends verification email.
```json
// Request
{ "email": "user@example.com", "password": "secret", "firstName": "John", "lastName": "Doe" }

// Response 201
{ "message": "Registration successful. Please check your email." }
```

### `GET /auth/verify/:token` [public]
Verify email address. Auto-logs in on success.

### `POST /auth/forgot-password` [public]
```json
{ "email": "user@example.com" }
// Always returns 200 (prevents email enumeration)
```

### `POST /auth/reset-password` [public]
```json
{ "token": "abc123", "password": "newpassword" }
```

### `POST /auth/change-password`
```json
{ "currentPassword": "old", "newPassword": "new" }
```

### `POST /auth/logout`
Destroys session.

### `GET /auth/check`
Returns current auth state.
```json
{ "isAuthenticated": true, "user": { "_id", "email", "role", "isActive" } }
```

---

## Company Data (`/openapi`)

### `GET /openapi/IT-search`
Search Italian companies. Permission: `search_companies`.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `dataEnrichment` | string | `start`, `advanced`, `pec`, `address`, `shareholders`, `name` (default: `name`) |
| `companyName` | string | Filter by company name (full words) |
| `autocomplete` | string | Search strings beginning with query |
| `province` | string | Province code (e.g., `MI`, `RM`) |
| `townCode` | string | Town/municipality code |
| `atecoCode` | string | ATECO classification code |
| `minTurnover` | number | Minimum revenue |
| `maxTurnover` | number | Maximum revenue |
| `minEmployees` | number | Minimum employees |
| `maxEmployees` | number | Maximum employees |
| `activityStatus` | string | `ATTIVA`, `CESSATA`, etc. |
| `legalFormCode` | string | Legal form code |
| `pec` | string | PEC email address |
| `sdiCode` | string | SDI code |
| `dryRun` | boolean | Returns count + cost only, no data |
| `skip` | number | Pagination offset |
| `limit` | number | Max results |

**Response:**
```json
{
  "source": "api",
  "timestamp": "2024-...",
  "data": [
    {
      "companyName": "ACME SRL",
      "vatCode": "12345678901",
      "address": {
        "registeredOffice": { "town": "Milano", "province": "MI" },
        "streetName": "Via Roma 1",
        "zipCode": "20100"
      },
      "atecoClassification": { "ateco": "62.01" },
      "ecofin": { "turnover": 1500000, "enterpriseSize": "PMI" },
      "employees": { "employee": 25 },
      "companyStatus": { "activityStatus": { "code": "A", "description": "ATTIVA" } }
    }
  ]
}
```

**Credit cost:** 0.344 base + 0.008 per result

### `GET /openapi/IT-advanced/:piva`
Get advanced company data. Permission: `advanced_search`. Cost: 0.389 credits.

### `GET /openapi/IT-full/:piva`
Get full company data with financials. Permission: `full_search`. Cost: 0.800 credits.
> Note: May return 302 with a polling ID. Backend handles polling automatically.

### `GET /openapi/IT-closed/:piva`
Check if company is closed. Permission: admin only. Cost: 0.085 credits.

### `GET /openapi/credit`
Get remaining OpenAPI credit balance.

---

## Cached Company Data (`/company`)

### `GET /company/:piva`
Get cached company data. Permission: `company_details`.
Returns most recent cached record (advanced, full, or closed).

```json
{
  "source": "database",
  "timestamp": "2024-...",
  "data": { /* full company object */ },
  "piva": "12345678901",
  "searchType": "advanced"
}
```

### `GET /company/stored?format=slim`
Get all cached companies. Use `?format=slim` for lightweight list.

### `GET /company/llm-overview/:piva`
Get or generate AI financial overview. Permission: `company_llm_overview`. Cost: 0.05 + OpenAI tokens.

```json
{
  "overview": "## Panoramica Finanziaria\n\n**ACME SRL** è un'azienda..."
}
```

### `GET /company/search?q=...&provincia=...`
Full-text search via Meilisearch. Permission: `search`.

---

## AI (`/ai`)

### `POST /ai/parse-query`
Parse natural language query into structured search params. Permission: `search_companies`.

```json
// Request
{ "query": "aziende software a Milano con più di 50 dipendenti" }

// Response
{
  "params": {
    "province": "MI",
    "atecoCode": "62",
    "minEmployees": 50
  },
  "interpretation": "Software companies in Milan province with more than 50 employees",
  "cached": false
}
```

**Constraints:** Max 500 characters. Cached by query hash.

**Allowed output params:** `province`, `atecoCode`, `companyName`, `minTurnover`, `maxTurnover`, `minEmployees`, `maxEmployees`, `activityStatus`, `townCode`

---

## Credits (`/credits`)

### `GET /credits/balance`
```json
{
  "creditBalance": 85.5,
  "creditLimit": 1000,
  "creditSettings": {
    "dailyLimit": 50,
    "monthlyLimit": 500,
    "autoRecharge": { "enabled": false, "threshold": 10, "amount": 100 }
  }
}
```

### `GET /credits/transactions?page=1&limit=20&type=debit&startDate=...&endDate=...`
Paginated transaction history.

### `GET /credits/stats?startDate=...&endDate=...`
Aggregated spending by service type.

### `PUT /credits/settings`
Update daily/monthly limits and auto-recharge.

---

## Users (`/users`)

### `GET /users/profile`
Get current user profile.

### `PUT /users/profile`
Update profile fields: `firstName`, `lastName`, `company`, `phone`.

### `DELETE /users/profile`
Delete user account.

---

## Activities (`/activities`)

### `GET /activities/recent?limit=10`
Recent user activity entries.

### `GET /activities/stats`
Activity statistics for last 30 days.

---

## Smart Search Nitro Routes

These are Nuxt 4 server routes that proxy to Express. They handle SSR cookie forwarding.

| Route | Proxies To |
|-------|-----------|
| `GET /auth/check` | `GET /api/v1/auth/check` |
| `GET /company/:piva` | `GET /api/v1/company/:piva` → fallback `GET /api/v1/openapi/IT-advanced/:piva` |
| `GET /company/:piva/overview` | `GET /api/v1/company/llm-overview/:piva` |

> These routes are NOT under `/api/` because Nitro devProxy intercepts `/api/**`.
