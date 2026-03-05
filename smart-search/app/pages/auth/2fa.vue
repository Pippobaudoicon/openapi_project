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
