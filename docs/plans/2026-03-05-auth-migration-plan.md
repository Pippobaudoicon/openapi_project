# Auth Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate authentication from modern-client + Passport.js to smart-search + Better Auth with OAuth, 2FA, and remember-me support.

**Architecture:** Better Auth runs inside Nuxt's Nitro server, owning all auth flows (login, register, OAuth, 2FA, sessions). Express becomes a pure data API that validates sessions via a shared Better Auth instance. Modern-client is retired.

**Tech Stack:** Better Auth, MongoDB adapter, Nuxt 4 (Nitro), Express 4, nodemailer (existing SMTP), Vue 3 (better-auth/vue client)

**Design Doc:** `docs/plans/2026-03-05-auth-migration-design.md`

---

## Phase 1: Install Better Auth + Server Config

### Task 1: Install Better Auth in smart-search

**Files:**
- Modify: `smart-search/package.json`

**Step 1: Install dependencies**

Run:
```bash
cd smart-search && npm install better-auth
```

**Step 2: Verify installation**

Run: `cd smart-search && node -e "import('better-auth').then(() => console.log('OK'))"`
Expected: `OK`

**Step 3: Commit**

```bash
git add smart-search/package.json smart-search/package-lock.json
git commit -m "chore: install better-auth in smart-search"
```

---

### Task 2: Create shared Better Auth server config

**Files:**
- Create: `smart-search/server/utils/auth.ts`

This is the core Better Auth instance. It runs inside Nitro and is importable by Express too.

**Step 1: Create the auth config**

```typescript
// smart-search/server/utils/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { twoFactor } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/openapi");
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      // We'll wire up nodemailer in a later task
      console.log(`[Auth] Password reset for ${user.email}: ${url}`);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(`[Auth] Verify email for ${user.email}: ${url}`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24, // 24 hours default
    updateAge: 60 * 60, // refresh session every hour
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 min cache
    },
  },

  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },

  user: {
    additionalFields: {
      firstName: { type: "string", required: false, input: true },
      lastName: { type: "string", required: false, input: true },
      company: { type: "string", required: false, input: true },
      phone: { type: "string", required: false, input: true },
      role: { type: "string", defaultValue: "user", input: false },
      creditBalance: { type: "number", defaultValue: 100, input: false },
      creditLimit: { type: "number", defaultValue: 1000, input: false },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  plugins: [
    twoFactor({
      issuer: "OpenAPI Platform",
      otpOptions: {
        async sendOTP({ user, otp }) {
          console.log(`[Auth] 2FA OTP for ${user.email}: ${otp}`);
        },
      },
    }),
  ],
});
```

**Step 2: Commit**

```bash
git add smart-search/server/utils/auth.ts
git commit -m "feat: create Better Auth server config with MongoDB adapter"
```

---

### Task 3: Create Nitro API handler for Better Auth

**Files:**
- Create: `smart-search/server/routes/auth/[...all].ts`

Better Auth needs a catch-all route to handle its endpoints (`/auth/sign-in`, `/auth/sign-up`, `/auth/callback/*`, etc.).

**Step 1: Create the catch-all handler**

```typescript
// smart-search/server/routes/auth/[...all].ts
import { auth } from "~/server/utils/auth";
import { toWebHandler } from "better-auth/node";

const handler = toWebHandler(auth);

export default defineEventHandler(async (event) => {
  // Better Auth expects the path relative to its base
  // Nitro gives us the full path, so we pass the native request
  return handler(event.node.req, event.node.res);
});
```

Note: Check Better Auth Nuxt integration docs — may need `toNodeHandler` instead of `toWebHandler`. Test by hitting `GET /auth/ok` or `GET /auth/error` to see if Better Auth responds.

**Step 2: Verify the handler works**

Run: `cd smart-search && npm run dev` (in a separate terminal)
Then: `curl http://localhost:3001/auth/ok`
Expected: A JSON response from Better Auth (not a 404)

**Step 3: Commit**

```bash
git add smart-search/server/routes/auth/\[...all\].ts
git commit -m "feat: add Better Auth catch-all Nitro handler"
```

---

### Task 4: Install mongodb driver in smart-search

Better Auth's MongoDB adapter needs the `mongodb` native driver (not Mongoose).

**Step 1: Install**

Run:
```bash
cd smart-search && npm install mongodb
```

**Step 2: Commit**

```bash
git add smart-search/package.json smart-search/package-lock.json
git commit -m "chore: install mongodb driver for Better Auth adapter"
```

---

## Phase 2: Better Auth Vue Client + Composable

### Task 5: Create Better Auth client composable

**Files:**
- Create: `smart-search/app/composables/useAuthClient.ts`

This replaces the current `useAuth.ts` composable with Better Auth's Vue client.

**Step 1: Create the client composable**

```typescript
// smart-search/app/composables/useAuthClient.ts
import { createAuthClient } from "better-auth/vue";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "", // same-origin, no need to specify
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        navigateTo("/auth/2fa");
      },
    }),
  ],
});

// Convenience exports
export const useAuthClient = () => {
  const session = authClient.useSession();

  return {
    session,
    user: computed(() => session.value?.data?.user ?? null),
    isAuthenticated: computed(() => !!session.value?.data?.session),
    isPending: computed(() => session.value?.isPending ?? true),
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
    // OAuth
    signInWithGoogle: () =>
      authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      }),
    // 2FA
    twoFactor: authClient.twoFactor,
  };
};
```

**Step 2: Commit**

```bash
git add smart-search/app/composables/useAuthClient.ts
git commit -m "feat: create Better Auth Vue client composable"
```

---

### Task 6: Update auth middleware to use Better Auth

**Files:**
- Modify: `smart-search/app/middleware/auth.global.ts`

Replace the external redirect to modern-client with an internal redirect to `/auth/login`.

**Step 1: Rewrite the middleware**

Replace the entire content of `smart-search/app/middleware/auth.global.ts`:

```typescript
// smart-search/app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Auth pages don't require authentication
  if (to.path.startsWith("/auth")) return;

  const { isAuthenticated, isPending } = useAuthClient();

  // Wait for session check to complete on initial load
  // Better Auth's useSession() auto-fetches on mount
  if (isPending.value) {
    // On SSR, we need to check server-side
    if (import.meta.server) {
      const { auth } = await import("~/server/utils/auth");
      const headers = useRequestHeaders(["cookie"]);
      const session = await auth.api.getSession({ headers });
      if (!session) return navigateTo("/auth/login");
      return; // session valid, continue
    }
    // On client, wait for the reactive session to resolve
    // The useSession composable handles this automatically
  }

  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }
});
```

**Step 2: Commit**

```bash
git add smart-search/app/middleware/auth.global.ts
git commit -m "feat: update auth middleware to use Better Auth with internal redirects"
```

---

## Phase 3: Auth Pages in Smart Search

### Task 7: Create auth layout

**Files:**
- Create: `smart-search/app/layouts/auth.vue`

Auth pages need a minimal layout (no AppHeader, centered content).

**Step 1: Create the layout**

```vue
<!-- smart-search/app/layouts/auth.vue -->
<template>
  <div class="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
    <div class="w-full max-w-md">
      <slot />
    </div>
  </div>
</template>
```

**Step 2: Update app.vue to support layouts**

Modify `smart-search/app/app.vue` to use `NuxtLayout`:

```vue
<script setup lang="ts">
const { init } = useTheme()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 font-sans antialiased transition-colors dark:bg-zinc-950">
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

Note: The default layout should keep `AppHeader`. Create `smart-search/app/layouts/default.vue`:

```vue
<!-- smart-search/app/layouts/default.vue -->
<template>
  <div>
    <AppHeader />
    <slot />
  </div>
</template>
```

**Step 3: Commit**

```bash
git add smart-search/app/layouts/ smart-search/app/app.vue
git commit -m "feat: add auth and default layouts for smart-search"
```

---

### Task 8: Create login page

**Files:**
- Create: `smart-search/app/pages/auth/login.vue`

**Step 1: Build the login page**

```vue
<!-- smart-search/app/pages/auth/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { signIn, signInWithGoogle } = useAuthClient();
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    const result = await signIn.email({
      email: email.value,
      password: password.value,
      callbackURL: "/",
      rememberMe: rememberMe.value,
    });
    if (result.error) {
      error.value = result.error.message || "Login failed";
    }
  } catch (e: any) {
    error.value = e.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}

async function handleGoogleLogin() {
  await signInWithGoogle();
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
      Sign In
    </h1>

    <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
      {{ error }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label for="email" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label for="password" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="••••••••"
        />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input v-model="rememberMe" type="checkbox" class="rounded border-zinc-300 dark:border-zinc-700" />
          Remember me
        </label>
        <NuxtLink to="/auth/forgot-password" class="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
          Forgot password?
        </NuxtLink>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {{ loading ? "Signing in..." : "Sign In" }}
      </button>
    </form>

    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-zinc-200 dark:border-zinc-800" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-zinc-50 px-2 text-zinc-500 dark:bg-zinc-950">or</span>
      </div>
    </div>

    <button
      @click="handleGoogleLogin"
      class="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Continue with Google
    </button>

    <p class="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
      Don't have an account?
      <NuxtLink to="/auth/register" class="font-medium text-zinc-900 hover:underline dark:text-zinc-100">Sign up</NuxtLink>
    </p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add smart-search/app/pages/auth/login.vue
git commit -m "feat: add login page with email/password and Google OAuth"
```

---

### Task 9: Create register page

**Files:**
- Create: `smart-search/app/pages/auth/register.vue`

**Step 1: Build the register page**

```vue
<!-- smart-search/app/pages/auth/register.vue -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { signUp } = useAuthClient();
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  password: "",
  confirmPassword: "",
});
const error = ref("");
const success = ref(false);
const loading = ref(false);

async function handleRegister() {
  error.value = "";
  if (form.password !== form.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }
  if (form.password.length < 8) {
    error.value = "Password must be at least 8 characters";
    return;
  }

  loading.value = true;
  try {
    const result = await signUp.email({
      email: form.email,
      password: form.password,
      name: `${form.firstName} ${form.lastName}`.trim(),
      firstName: form.firstName,
      lastName: form.lastName,
      company: form.company,
    });
    if (result.error) {
      error.value = result.error.message || "Registration failed";
    } else {
      success.value = true;
    }
  } catch (e: any) {
    error.value = e.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
      Create Account
    </h1>

    <div v-if="success" class="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
      <p class="font-medium">Check your email</p>
      <p class="mt-1">We've sent a verification link to {{ form.email }}</p>
    </div>

    <template v-else>
      <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="firstName" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">First name</label>
            <input id="firstName" v-model="form.firstName" type="text" required autocomplete="given-name"
              class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
          </div>
          <div>
            <label for="lastName" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Last name</label>
            <input id="lastName" v-model="form.lastName" type="text" required autocomplete="family-name"
              class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
          </div>
        </div>

        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
          <input id="email" v-model="form.email" type="email" required autocomplete="email"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="you@company.com" />
        </div>

        <div>
          <label for="company" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Company <span class="text-zinc-400">(optional)</span></label>
          <input id="company" v-model="form.company" type="text" autocomplete="organization"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
          <input id="password" v-model="form.password" type="password" required autocomplete="new-password" minlength="8"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="At least 8 characters" />
        </div>

        <div>
          <label for="confirmPassword" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm password</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" required autocomplete="new-password"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
        </div>

        <button type="submit" :disabled="loading"
          class="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          {{ loading ? "Creating account..." : "Create Account" }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?
        <NuxtLink to="/auth/login" class="font-medium text-zinc-900 hover:underline dark:text-zinc-100">Sign in</NuxtLink>
      </p>
    </template>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add smart-search/app/pages/auth/register.vue
git commit -m "feat: add register page with email verification"
```

---

### Task 10: Create forgot password page

**Files:**
- Create: `smart-search/app/pages/auth/forgot-password.vue`

**Step 1: Build the page**

```vue
<!-- smart-search/app/pages/auth/forgot-password.vue -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { authClient } = useAuthClient();
const email = ref("");
const error = ref("");
const success = ref(false);
const loading = ref(false);

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    const result = await authClient.forgetPassword({
      email: email.value,
      redirectTo: "/auth/reset-password",
    });
    if (result.error) {
      error.value = result.error.message || "Failed to send reset email";
    } else {
      success.value = true;
    }
  } catch (e: any) {
    error.value = e.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="mb-2 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
      Reset Password
    </h1>
    <p class="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
      Enter your email and we'll send you a reset link.
    </p>

    <div v-if="success" class="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
      <p class="font-medium">Check your email</p>
      <p class="mt-1">If an account exists for {{ email }}, we've sent a reset link.</p>
    </div>

    <template v-else>
      <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="you@company.com" />
        </div>

        <button type="submit" :disabled="loading"
          class="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          {{ loading ? "Sending..." : "Send Reset Link" }}
        </button>
      </form>
    </template>

    <p class="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
      <NuxtLink to="/auth/login" class="font-medium text-zinc-900 hover:underline dark:text-zinc-100">Back to sign in</NuxtLink>
    </p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add smart-search/app/pages/auth/forgot-password.vue
git commit -m "feat: add forgot password page"
```

---

### Task 11: Create reset password page

**Files:**
- Create: `smart-search/app/pages/auth/reset-password.vue`

Better Auth sends a reset link with `?token=xxx` query param.

**Step 1: Build the page**

```vue
<!-- smart-search/app/pages/auth/reset-password.vue -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });

const route = useRoute();
const { authClient } = useAuthClient();
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const success = ref(false);
const loading = ref(false);

const token = computed(() => route.query.token as string);

async function handleSubmit() {
  error.value = "";
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }
  if (password.value.length < 8) {
    error.value = "Password must be at least 8 characters";
    return;
  }

  loading.value = true;
  try {
    const result = await authClient.resetPassword({
      newPassword: password.value,
      token: token.value,
    });
    if (result.error) {
      error.value = result.error.message || "Failed to reset password";
    } else {
      success.value = true;
    }
  } catch (e: any) {
    error.value = e.message || "An unexpected error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
      Set New Password
    </h1>

    <div v-if="!token" class="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
      Invalid or missing reset token. Please request a new reset link.
    </div>

    <div v-else-if="success" class="rounded-lg bg-green-50 p-4 text-center text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
      <p class="font-medium">Password reset successfully</p>
      <NuxtLink to="/auth/login" class="mt-2 inline-block font-medium underline">Sign in with your new password</NuxtLink>
    </div>

    <template v-else>
      <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">New password</label>
          <input id="password" v-model="password" type="password" required autocomplete="new-password" minlength="8"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="At least 8 characters" />
        </div>

        <div>
          <label for="confirmPassword" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" required autocomplete="new-password"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100" />
        </div>

        <button type="submit" :disabled="loading"
          class="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          {{ loading ? "Resetting..." : "Reset Password" }}
        </button>
      </form>
    </template>

    <p class="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
      <NuxtLink to="/auth/login" class="font-medium text-zinc-900 hover:underline dark:text-zinc-100">Back to sign in</NuxtLink>
    </p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add smart-search/app/pages/auth/reset-password.vue
git commit -m "feat: add reset password page"
```

---

### Task 12: Create 2FA challenge page

**Files:**
- Create: `smart-search/app/pages/auth/2fa.vue`

This page is shown when Better Auth redirects during login for users who have 2FA enabled.

**Step 1: Build the page**

```vue
<!-- smart-search/app/pages/auth/2fa.vue -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { twoFactor } = useAuthClient();
const code = ref("");
const error = ref("");
const loading = ref(false);
const trustDevice = ref(true);

async function handleVerify() {
  error.value = "";
  loading.value = true;
  try {
    const result = await twoFactor.verifyTotp({
      code: code.value,
      trustDevice: trustDevice.value,
    });
    if (result.error) {
      error.value = result.error.message || "Invalid code";
      code.value = "";
    } else {
      navigateTo("/");
    }
  } catch (e: any) {
    error.value = e.message || "Verification failed";
    code.value = "";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="mb-2 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
      Two-Factor Authentication
    </h1>
    <p class="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
      Enter the 6-digit code from your authenticator app.
    </p>

    <div v-if="error" class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
      {{ error }}
    </div>

    <form @submit.prevent="handleVerify" class="space-y-4">
      <div>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          required
          autofocus
          autocomplete="one-time-code"
          class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-center text-2xl font-mono tracking-widest text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder="000000"
        />
      </div>

      <label class="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input v-model="trustDevice" type="checkbox" class="rounded border-zinc-300 dark:border-zinc-700" />
        Trust this device for 30 days
      </label>

      <button type="submit" :disabled="loading || code.length !== 6"
        class="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
        {{ loading ? "Verifying..." : "Verify" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
      <NuxtLink to="/auth/login" class="font-medium text-zinc-900 hover:underline dark:text-zinc-100">Back to sign in</NuxtLink>
    </p>
  </div>
</template>
```

**Step 2: Commit**

```bash
git add smart-search/app/pages/auth/2fa.vue
git commit -m "feat: add 2FA challenge page"
```

---

## Phase 4: Wire Up Email Service

### Task 13: Connect Better Auth email hooks to nodemailer

**Files:**
- Modify: `smart-search/server/utils/auth.ts`
- Create: `smart-search/server/utils/email.ts`

Better Auth has hooks for sending emails. We need to wire these to the existing nodemailer SMTP setup.

**Step 1: Create email utility**

```typescript
// smart-search/server/utils/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
```

**Step 2: Install nodemailer in smart-search**

Run: `cd smart-search && npm install nodemailer && npm install -D @types/nodemailer`

**Step 3: Update auth.ts to use real email sending**

Replace the `console.log` placeholders in `smart-search/server/utils/auth.ts`:

```typescript
// In emailAndPassword config:
sendResetPassword: async ({ user, url, token }, request) => {
  const { sendEmail } = await import("~/server/utils/email");
  await sendEmail(
    user.email,
    "Password Reset Request",
    `<h1>Reset Your Password</h1>
     <p>Click the link below to reset your password:</p>
     <a href="${url}">${url}</a>
     <p>This link will expire in 1 hour.</p>`
  );
},

// In emailVerification config:
sendVerificationEmail: async ({ user, url, token }, request) => {
  const { sendEmail } = await import("~/server/utils/email");
  await sendEmail(
    user.email,
    "Verify Your Email",
    `<h1>Email Verification</h1>
     <p>Click the link below to verify your email address:</p>
     <a href="${url}">${url}</a>`
  );
},

// In twoFactor plugin otpOptions:
async sendOTP({ user, otp }) {
  const { sendEmail } = await import("~/server/utils/email");
  await sendEmail(
    user.email,
    "Your Verification Code",
    `<h1>Your Code: ${otp}</h1>
     <p>This code expires in 3 minutes.</p>`
  );
},
```

**Step 4: Commit**

```bash
git add smart-search/server/utils/email.ts smart-search/server/utils/auth.ts smart-search/package.json smart-search/package-lock.json
git commit -m "feat: wire Better Auth email hooks to nodemailer SMTP"
```

---

## Phase 5: Update Express to Validate Better Auth Sessions

### Task 14: Create Better Auth session validation middleware for Express

**Files:**
- Create: `server/middleware/betterAuth.js`
- Modify: `server/app.js`

Express needs to validate Better Auth sessions instead of using Passport. Since Better Auth stores sessions in MongoDB, Express can validate them by querying the session collection directly, or by calling Better Auth's API.

**Step 1: Create the middleware**

```javascript
// server/middleware/betterAuth.js
import { MongoClient } from "mongodb";

let db;

async function getDb() {
  if (db) return db;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db();
  return db;
}

/**
 * Validates Better Auth session from cookie.
 * Better Auth stores a session token in a cookie named "better-auth.session_token".
 * The token format may be "token.signature" — we use the token part to look up the session.
 */
export async function requireAuth(req, res, next) {
  try {
    const cookieHeader = req.headers.cookie || "";
    const sessionCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("better-auth.session_token="));

    if (!sessionCookie) {
      return res.status(401).json({ error: "Unauthorized - No session" });
    }

    const tokenValue = decodeURIComponent(sessionCookie.split("=")[1]);
    // Better Auth token format: "token.signature" — extract the token part
    const token = tokenValue.includes(".") ? tokenValue.split(".")[0] : tokenValue;

    const database = await getDb();
    const session = await database.collection("session").findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized - Invalid session" });
    }

    const user = await database.collection("user").findOne({ _id: session.userId });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    // Attach user to request (same shape Express routes expect)
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
      isActive: user.emailVerified || false,
      company: user.company,
      phone: user.phone,
      creditBalance: user.creditBalance,
      creditLimit: user.creditLimit,
      creditSettings: user.creditSettings,
    };

    next();
  } catch (error) {
    console.error("[Auth] Session validation error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}

/**
 * Optional auth — attaches user if session exists, but doesn't block.
 */
export async function optionalAuth(req, res, next) {
  try {
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch {
    // No valid session — that's ok, just continue without req.user
  }
  next();
}
```

**Note:** The exact cookie name and token format should be verified against Better Auth docs during implementation. The cookie name might be `better-auth.session_token` or configurable. Check what Better Auth actually sets.

**Step 2: Install mongodb driver in server**

Run: `cd server && npm install mongodb`

**Step 3: Commit**

```bash
git add server/middleware/betterAuth.js server/package.json server/package-lock.json
git commit -m "feat: add Better Auth session validation middleware for Express"
```

---

### Task 15: Remove Passport from Express and wire up new middleware

**Files:**
- Modify: `server/app.js`
- Modify: `server/routes/api/auth.js`

**Step 1: Update app.js — remove Passport, keep only data API**

Remove these imports and lines from `server/app.js`:
- `import session from 'express-session';`
- `import passport from 'passport';`
- `import { initializePassport } from './auth/passport-config.js';`
- `import { sessionStore } from './config/database.js';` (keep the `connectDB` import)
- `initializePassport();`
- `app.use(session({...}));`
- `app.use(passport.initialize());`
- `app.use(passport.session());`
- The SPA fallback `app.get('*', ...)` and static file serving (modern-client dist)

The resulting `app.js` should look like:

```javascript
import './config/env.js';
import express from 'express';
import errorHandler from 'express-error-handler';
import morgan from 'morgan';
import * as rfs from 'rotating-file-stream';
import { __dirname, path, distDir, logsDir } from './utils/paths.js';
import connectDB from './config/database.js';
import cors from 'cors';
import apiRoutes from './routes/api/index.js';
import closedCompanyRouter from './routes/api/one-time-script/closedCompany.js';

connectDB();

const app = express();

// CORS — allow smart-search origin
app.use(cors({
    origin: process.env.APP_URL,
    credentials: true
}));

// Logging
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logsDir,
    size: '10M',
    compress: 'gzip',
    teeToStdout: true
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
} else {
    app.use(morgan('combined', { stream: accessLogStream }));
}

// Body parsing
app.use(express.json({
    limit: '1mb',
    verify: (req, res, buf, encoding) => {
        try { JSON.parse(buf); }
        catch (e) {
            res.status(400).json({ error: 'Invalid JSON payload', details: e.message });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use('/closed-company', closedCompanyRouter);

// Error handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload', details: err.message });
    }
    next();
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});
```

**Step 2: Update auth routes to remove Passport-dependent code**

The Express auth routes (`server/routes/api/auth.js`) can be simplified dramatically or removed entirely since Better Auth handles login/register/etc. Keep only routes that Express still needs (if any business logic like activity logging needs to remain Express-side).

Most likely, **delete or gut `server/routes/api/auth.js`** — all auth endpoints now live on Better Auth. If you need a `/auth/check` endpoint for backward compatibility during transition:

```javascript
// server/routes/api/auth.js — minimal version
import express from 'express';
import { requireAuth } from '../../middleware/betterAuth.js';

const router = express.Router();

// Session check (can be used by any client for backward compat)
router.get('/check', async (req, res) => {
    // Try to attach user, respond accordingly
    try {
        await new Promise((resolve, reject) => {
            requireAuth(req, res, (err) => err ? reject(err) : resolve());
        });
        res.json({ isAuthenticated: true, user: req.user });
    } catch {
        res.json({ isAuthenticated: false });
    }
});

export default router;
```

**Step 3: Update all protected route files to use `requireAuth`**

In each route file that currently relies on `req.user` being set by Passport's `deserializeUser`, add the `requireAuth` middleware. Check these files:
- `server/routes/api/openapi.js` — uses `req.user` via `checkCreditBalance` (which checks `req.user`)
- `server/routes/api/company.js` — uses `req.user`
- `server/routes/api/ai.js` — uses `req.user`
- `server/routes/api/credits.js` — uses `req.user`
- `server/routes/api/users.js` — uses `req.user`
- `server/routes/api/activities.js` — uses `req.user`

For the route index file (`server/routes/api/index.js`), add `requireAuth` as a global middleware for all `/v1/*` routes (except auth):

```javascript
import { requireAuth } from '../../middleware/betterAuth.js';

// Apply requireAuth to all routes except auth
router.use('/v1/openapi', requireAuth, openapiRouter);
router.use('/v1/company', requireAuth, companyRouter);
router.use('/v1/ai', requireAuth, aiRouter);
router.use('/v1/credits', requireAuth, creditsRouter);
router.use('/v1/users', requireAuth, usersRouter);
router.use('/v1/activities', requireAuth, activitiesRouter);
// Auth routes don't need requireAuth (Better Auth handles its own auth)
router.use('/v1/auth', authRouter);
```

**Step 4: Commit**

```bash
git add server/app.js server/routes/api/auth.js server/routes/api/index.js
git commit -m "feat: remove Passport.js, wire Express routes to Better Auth session validation"
```

---

## Phase 6: Remove Old Nitro Auth Routes

### Task 16: Remove old Nitro BFF auth routes

**Files:**
- Delete: `smart-search/server/routes/auth/check.get.ts`
- Delete: `smart-search/server/routes/auth/logout.post.ts`
- Delete: `smart-search/server/routes/auth/change-password.post.ts`

These Nitro server routes were forwarding auth requests to Express's Passport-based auth. Better Auth now handles these natively via the `[...all].ts` catch-all.

**Step 1: Delete the old routes**

Run:
```bash
rm smart-search/server/routes/auth/check.get.ts
rm smart-search/server/routes/auth/logout.post.ts
rm smart-search/server/routes/auth/change-password.post.ts
```

**Important:** Make sure the catch-all `smart-search/server/routes/auth/[...all].ts` from Task 3 is in place first — it replaces all of these.

**Step 2: Remove the old `useAuth` composable**

Delete `smart-search/app/composables/useAuth.ts` — replaced by `useAuthClient.ts` from Task 5.

Run: `rm smart-search/app/composables/useAuth.ts`

**Step 3: Update any component that imports `useAuth`**

Check `smart-search/app/components/AppHeader.vue` and `smart-search/app/components/AccountSettingsModal.vue` — they likely use `useAuth()`. Update them to use `useAuthClient()` instead.

Key changes:
- `const { user, logout } = useAuth()` → `const { user, signOut } = useAuthClient()`
- `logout()` → `signOut()` (Better Auth's method)
- `user.value` shape may differ — Better Auth uses `user.name` instead of `firstName`/`lastName` separately. Adjust templates accordingly (or use the `additionalFields` which preserve `firstName`/`lastName`).

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove old Nitro auth routes and useAuth composable, migrate to useAuthClient"
```

---

## Phase 7: Update Existing Components

### Task 17: Update AppHeader to use Better Auth

**Files:**
- Modify: `smart-search/app/components/AppHeader.vue`

**Step 1: Replace useAuth with useAuthClient**

Find all references to `useAuth()` and replace with `useAuthClient()`. Key changes:
- `logout()` → `await signOut()` then `navigateTo('/auth/login')`
- User display name: `user.value?.firstName` should still work if `additionalFields` are configured correctly
- `isAuthenticated` check

**Step 2: Commit**

```bash
git add smart-search/app/components/AppHeader.vue
git commit -m "refactor: update AppHeader to use Better Auth client"
```

---

### Task 18: Update AccountSettingsModal for 2FA setup

**Files:**
- Modify: `smart-search/app/components/AccountSettingsModal.vue`

The security tab should now include 2FA setup using Better Auth's `twoFactor` client methods.

**Step 1: Add 2FA enable/disable flow**

In the security tab section, add:
- "Enable 2FA" button that calls `twoFactor.enable({ password })` → shows QR code (from `totpURI`) → asks user to verify with TOTP code → calls `twoFactor.verifyTotp({ code })`
- "Disable 2FA" button that calls `twoFactor.disable({ password })`
- Display backup codes on initial setup

Use a library like `qrcode` to render the TOTP URI as a QR code, or provide the URI for manual entry.

Run: `cd smart-search && npm install qrcode`

**Step 2: Update change-password to use Better Auth**

Replace the current `changePassword()` call (which went to the old Nitro route) with:
```typescript
await authClient.changePassword({
  currentPassword: currentPassword.value,
  newPassword: newPassword.value,
});
```

**Step 3: Commit**

```bash
git add smart-search/app/components/AccountSettingsModal.vue smart-search/package.json smart-search/package-lock.json
git commit -m "feat: add 2FA setup in AccountSettingsModal, update change-password to Better Auth"
```

---

## Phase 8: User Migration Script

### Task 19: Create migration script for existing users

**Files:**
- Create: `server/scripts/migrate-to-better-auth.js`

This one-time script migrates existing Mongoose User documents into Better Auth's expected format.

**Step 1: Write the migration script**

```javascript
// server/scripts/migrate-to-better-auth.js
import "../config/env.js";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  const usersCollection = db.collection("users"); // Mongoose collection name
  const baUserCollection = db.collection("user"); // Better Auth collection
  const baAccountCollection = db.collection("account"); // Better Auth accounts

  const users = await usersCollection.find({}).toArray();
  console.log(`Found ${users.length} users to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    // Check if already migrated
    const existing = await baUserCollection.findOne({ email: user.email });
    if (existing) {
      console.log(`  SKIP: ${user.email} (already exists)`);
      skipped++;
      continue;
    }

    const id = user._id.toString();

    // Create Better Auth user record
    await baUserCollection.insertOne({
      _id: id,
      id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
      email: user.email,
      emailVerified: user.isActive || false,
      image: null,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      // Custom fields
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      company: user.company || "",
      phone: user.phone || "",
      role: user.role || "user",
      creditBalance: user.creditBalance ?? 100,
      creditLimit: user.creditLimit ?? 1000,
      creditSettings: user.creditSettings || null,
    });

    // Create Better Auth account record (credential type with existing bcrypt hash)
    await baAccountCollection.insertOne({
      id: `acc_${id}`,
      userId: id,
      accountId: id,
      providerId: "credential",
      password: user.password, // Existing bcrypt hash
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    });

    console.log(`  OK: ${user.email}`);
    migrated++;
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
  await client.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
```

**Step 2: Configure Better Auth to accept bcrypt hashes**

In `smart-search/server/utils/auth.ts`, add a custom password hasher that detects bcrypt hashes:

```typescript
import bcrypt from "bcrypt";

// In betterAuth config, add:
advanced: {
  password: {
    hash: async (password) => {
      // New passwords use bcrypt (same as before)
      return bcrypt.hash(password, 10);
    },
    verify: async ({ hash, password }) => {
      // bcrypt hashes start with $2b$ or $2a$
      if (hash.startsWith("$2")) {
        return bcrypt.compare(password, hash);
      }
      // Fallback to Better Auth's default (scrypt)
      // This shouldn't happen after migration, but just in case
      return false;
    },
  },
},
```

Run: `cd smart-search && npm install bcrypt`

**Step 3: Commit**

```bash
git add server/scripts/migrate-to-better-auth.js smart-search/server/utils/auth.ts smart-search/package.json smart-search/package-lock.json
git commit -m "feat: add user migration script and bcrypt password compatibility"
```

---

## Phase 9: Cleanup

### Task 20: Remove Passport dependencies from server

**Files:**
- Modify: `server/package.json`
- Delete: `server/auth/passport-config.js`

**Step 1: Uninstall old deps**

Run:
```bash
cd server && npm uninstall passport passport-local express-session connect-mongo
```

**Step 2: Delete passport config**

Run: `rm server/auth/passport-config.js`

**Step 3: Remove sessionStore export from database.js**

Edit `server/config/database.js` — remove the `MongoStore` import and `sessionStore` creation. Keep only the Mongoose connection.

**Step 4: Verify server starts cleanly**

Run: `cd server && npm run dev`
Expected: Server starts without errors about missing Passport/session modules.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Passport.js, express-session, connect-mongo dependencies"
```

---

### Task 21: Update environment variables documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update the environment section**

Add new env vars needed for Better Auth:
- `BETTER_AUTH_SECRET` — secret for signing session tokens (can reuse `SESSION_SECRET`)
- `BETTER_AUTH_URL` — base URL for Better Auth (e.g., `http://localhost:3001`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — for Google OAuth

Remove references to `SESSION_SECRET` being for express-session.

Update the "Key Conventions" section:
- Replace "Auth: Session-based (express-session + MongoStore)" with "Auth: Better Auth (session-based, MongoDB adapter, Nitro server-side)"
- Update route table to reflect auth endpoints now live on smart-search, not Express

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Better Auth migration"
```

---

### Task 22: Update nuxt.config.ts for Better Auth

**Files:**
- Modify: `smart-search/nuxt.config.ts`

**Step 1: Add Better Auth env vars to runtimeConfig**

```typescript
runtimeConfig: {
  // Existing config...
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET,
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  // SMTP config for email sending in Nitro
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpSecure: process.env.SMTP_SECURE,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  // OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  public: {
    // Existing public config...
    // Remove clientUrl if it was pointing to modern-client
  },
},
```

**Step 2: Commit**

```bash
git add smart-search/nuxt.config.ts
git commit -m "feat: add Better Auth and SMTP env vars to nuxt.config.ts"
```

---

### Task 23: End-to-end smoke test

**Step 1: Start both services**

Run:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd smart-search && npm run dev
```

**Step 2: Test login flow**

1. Navigate to `http://localhost:3001` — should redirect to `/auth/login`
2. Register a new account — should show "check your email" message
3. (Check server logs for verification link if SMTP not configured)
4. Login with credentials — should redirect to homepage
5. Check that search works (session is valid, API calls succeed)
6. Logout — should redirect to `/auth/login`

**Step 3: Test migrated users**

1. Run migration script: `cd server && node scripts/migrate-to-better-auth.js`
2. Login with an existing user's email/password
3. Verify credits and role are preserved

**Step 4: Test 2FA**

1. Go to Account Settings → Security tab
2. Enable 2FA — should show QR code
3. Scan with authenticator app, enter code
4. Logout and login again — should show 2FA challenge page
5. Enter TOTP code — should complete login

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during auth migration smoke test"
```

---

## Summary of Changes

| Area | Before | After |
|------|--------|-------|
| Auth library | Passport.js + express-session | Better Auth |
| Session store | MongoStore (connect-mongo) | Better Auth MongoDB adapter |
| Auth server | Express | Nuxt Nitro |
| Login page | modern-client `/auth/login` | smart-search `/auth/login` |
| OAuth | None | Google (extensible) |
| 2FA | None | TOTP + backup codes + trusted devices |
| Remember me | None | Configurable session expiry |
| Cookie security | No sameSite, no CSRF | sameSite: lax, httpOnly, secure, signed |
| Email verification | Custom token + Passport | Better Auth built-in |
| Password reset | Custom token + Passport | Better Auth built-in |
| Express role | Full app (auth + data + SPA) | Pure data API |
| modern-client | Active | Retired |
