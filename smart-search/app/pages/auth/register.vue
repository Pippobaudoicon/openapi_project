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
    } as any);
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
