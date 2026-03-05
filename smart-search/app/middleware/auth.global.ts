export default defineNuxtRouteMiddleware(async (to) => {
  // Auth pages don't require authentication
  if (to.path.startsWith("/auth")) return;

  const { isAuthenticated, isPending } = useAuthClient();

  // On SSR, check session via Better Auth API endpoint
  if (import.meta.server) {
    const headers = useRequestHeaders(["cookie"]);
    try {
      const session = await $fetch("/_auth/get-session", { headers });
      if (!session) return navigateTo("/auth/login");
    } catch {
      return navigateTo("/auth/login");
    }
    return;
  }

  // On client, wait for the reactive session to resolve
  if (isPending.value) return;

  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }
});
