import { createAuthClient } from "better-auth/vue";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "", // same-origin
  basePath: "/_auth",
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        navigateTo("/auth/2fa");
      },
    }),
  ],
});

export const useAuthClient = () => {
  const session = authClient.useSession();

  const user = computed(() => (session.value?.data?.user as any) ?? null);
  const isAuthenticated = computed(() => !!session.value?.data?.session);
  const isPending = computed(() => session.value?.isPending ?? true);

  const displayName = computed(() => {
    const u = user.value as any;
    if (!u) return "";
    if (u.firstName || u.lastName) {
      return [u.firstName, u.lastName].filter(Boolean).join(" ");
    }
    return u.name || u.email;
  });

  const initials = computed(() => {
    const u = user.value as any;
    if (!u) return "";
    if (u.firstName && u.lastName) {
      return (u.firstName[0] + u.lastName[0]).toUpperCase();
    }
    return (u.name?.[0] || u.email[0]).toUpperCase();
  });

  async function fetchProfile() {
    const data = await $fetch<any>("/api/v1/users/profile");
    return data;
  }

  async function updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
  }) {
    const data = await $fetch<any>("/api/v1/users/profile", {
      method: "PUT",
      body: updates,
    });
    return data;
  }

  return {
    session,
    user,
    isAuthenticated,
    isPending,
    displayName,
    initials,
    // Auth actions
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
    // Profile (still via Express API)
    fetchProfile,
    updateProfile,
    // Direct client access for advanced operations
    authClient,
  };
};
