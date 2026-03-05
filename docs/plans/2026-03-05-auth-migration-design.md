# Auth Migration Design: Passport.js → Better Auth

**Date:** 2026-03-05
**Status:** Approved
**Scope:** Migrate authentication from modern-client + Passport.js to smart-search + Better Auth

## Context

Smart Search (Nuxt 4) is replacing modern-client (Vue 3 + Vite) as the sole frontend. Authentication currently lives in modern-client and relies on Passport.js + express-session on the Express backend. Smart Search has no login pages — it redirects externally to modern-client for auth.

### Current Issues
- No `sameSite` on session cookie
- No CSRF protection
- `isActive` not checked in Passport verify (unverified users can log in)
- Modern client uses stale localStorage for auth guards
- `resetPassword` URL mismatch (body vs URL param for token)
- No OAuth, 2FA, or remember-me support

## Decision

Replace Passport.js + express-session with **Better Auth** running inside Nuxt's Nitro server. Express becomes a pure data API validated by Better Auth sessions.

### Why Better Auth over alternatives
- **vs Passport.js + manual features:** OAuth, 2FA, remember-me, email verification all built-in. 3-4x less custom code, fewer security bugs.
- **vs Auth.js / nuxt-auth-utils:** Auth.js is Next.js-centric. nuxt-auth-utils is minimal (OAuth only, no email/password or 2FA).
- **vs JWT:** Stateless tokens add complexity (refresh tokens, rotation, revocation) without benefit for a single-frontend + single-backend setup.

## Architecture

### Before
```
Browser → Smart Search (Nuxt) → devProxy → Express → Passport.js → MongoDB
Browser → Modern Client (Vue) → CORS → Express → Passport.js → MongoDB
```

### After
```
Browser → Smart Search (Nuxt) → Better Auth (Nitro server) → MongoDB
                                       ↓
                              Express API (data routes only, session-validated)
```

- **Nuxt owns auth:** Login, register, OAuth, 2FA, sessions — all handled by Better Auth inside Nitro
- **Express is a pure API:** No more Passport, no more express-session. Validates sessions via `auth.api.getSession()`
- **No CORS for auth:** Auth is same-origin (Nuxt serves pages + auth endpoints)
- **Modern client retired:** All UI lives in smart-search

### Express API Protection

Express routes are protected by a `requireAuth` middleware that calls Better Auth's server-side API:

```typescript
// Replaces Passport's isAuthenticated
async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.user = session.user;
  next();
}
```

The `auth` instance is a shared config imported by both Nuxt and Express. The session cookie (httpOnly, secure, sameSite: lax) is validated on every request — same security model as before, better defaults.

## Data Model

### Better Auth Collections

| Collection | Purpose |
|-----------|---------|
| `user` | Core user data + custom fields (role, credits, company, phone) |
| `session` | Active sessions (replaces MongoStore sessions) |
| `account` | Auth provider links (email/password hash, OAuth tokens) |
| `verification` | Email verification and password reset tokens |
| `twoFactor` | 2FA secrets and backup codes |

### Custom Fields on User

Better Auth's `additionalFields` config preserves all existing business fields:

```typescript
user: {
  additionalFields: {
    firstName: { type: "string" },
    lastName: { type: "string" },
    company: { type: "string", required: false },
    phone: { type: "string", required: false },
    role: { type: "string", defaultValue: "user" },
    creditBalance: { type: "number", defaultValue: 100 },
    creditLimit: { type: "number", defaultValue: 1000 },
    creditSettings: { type: "object" },
  }
}
```

## Migration Strategy

### User Data Migration
1. One-time migration script:
   - Creates Better Auth `account` records for each existing user (type: `credential`, with bcrypt hash)
   - Maps `isActive` → `emailVerified`
   - Preserves all custom fields (role, credits, company, phone)
2. Configure Better Auth to accept bcrypt hashes (custom password hasher for transition)
3. Optionally re-hash to scrypt on next login

### Session Migration
- Existing sessions are invalidated — users must log in again (accepted trade-off)
- New sessions use Better Auth's session table with configurable expiry

## Features

### Auth Pages (smart-search)

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/auth/login` | Email/password + OAuth buttons (Google) |
| Register | `/auth/register` | Sign up with email verification |
| Forgot Password | `/auth/forgot-password` | Request reset email |
| Reset Password | `/auth/reset-password` | Set new password from email link |
| Verify Email | `/auth/verify` | Email verification callback |
| 2FA Setup | `/settings/security` | Enable TOTP, view backup codes |
| 2FA Challenge | `/auth/2fa` | TOTP input during login |

### OAuth
- Google provider (initial), extensible to others
- Better Auth handles the full OAuth flow + account linking

### Two-Factor Authentication
- TOTP via authenticator apps (Google Authenticator, etc.)
- Backup codes (10 codes, generated on enable)
- Trusted device support (skip 2FA for 30 days on trusted devices)
- OTP via email as fallback

### Remember Me
- Configurable session expiry: short (24h default) vs long (30 days for "remember me")
- Trusted device cookies for 2FA bypass

### Security Defaults
- `httpOnly: true` — cookies not accessible via JavaScript
- `secure: true` in production — HTTPS only
- `sameSite: lax` — CSRF protection
- Signed session tokens — tamper-proof
- Rate limiting on auth endpoints (can add via Nuxt middleware)

## What Gets Removed

| Component | Action |
|-----------|--------|
| `server/auth/passport-config.js` | Delete — Passport entirely removed |
| `express-session` + `connect-mongo` | Remove dependencies |
| `passport`, `passport-local` | Remove dependencies |
| `modern-client/` | Archive/delete — replaced by smart-search |
| `smart-search/server/routes/auth/` | Delete — Better Auth handles natively |
| `smart-search/app/composables/useAuth.ts` | Replace with Better Auth Vue client |
| `smart-search/app/middleware/auth.global.ts` | Rewrite to use Better Auth session check |

## What Stays (Modified)

| Component | Change |
|-----------|--------|
| `server/routes/api/openapi.js` | Replace `req.isAuthenticated()` with `requireAuth` middleware |
| `server/routes/api/company.js` | Same middleware swap |
| `server/routes/api/credits.js` | Same middleware swap |
| `server/routes/api/users.js` | Same middleware swap |
| `server/middleware/roleAuth.js` | Update to read `req.user` from Better Auth session |
| `server/middleware/creditTracker.js` | No change (already reads `req.user`) |
| Credit system, activity logging | No change |

## Open Questions

1. **Which OAuth providers beyond Google?** — Can add later via config
2. **Email service for verification/reset emails?** — Need to confirm current email setup works with Better Auth's `sendVerificationEmail` hook
3. **Production proxy for Nuxt → Express?** — devProxy doesn't work in production; need Nginx config or runtime `apiBaseUrl`
