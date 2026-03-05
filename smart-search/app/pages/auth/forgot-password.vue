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
    const result = await authClient.requestPasswordReset({
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
