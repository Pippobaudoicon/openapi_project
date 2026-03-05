export default defineNuxtRouteMiddleware(async (to) => {
  // Auth pages don't require authentication
  if (to.path.startsWith("/auth")) return;

  const { isAuthenticated, isPending } = useAuthClient();

  // On SSR, check session server-side
  if (import.meta.server) {
    const { auth } = await import("~/server/utils/auth");
    const headers = useRequestHeaders(["cookie"]);
    const session = await auth.api.getSession({ headers });
    if (!session) return navigateTo("/auth/login");
    return;
  }

  // On client, wait for the reactive session to resolve
  if (isPending.value) return;

  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }
});
