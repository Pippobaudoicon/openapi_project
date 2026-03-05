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
