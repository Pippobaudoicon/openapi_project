<script setup lang="ts">
const { user, displayName, initials, logout } = useAuth()
const { balance, loading: creditsLoading, fetch: fetchCredits } = useCredits()
const { isDark, toggle: toggleTheme } = useTheme()

const menuOpen = ref(false)
const showAccountSettings = ref(false)
const showCreditPanel = ref(false)
const menuRef = ref<HTMLElement>()

onMounted(() => {
  fetchCredits()
})

function closeMenu() {
  menuOpen.value = false
}

function openAccountSettings() {
  closeMenu()
  showAccountSettings.value = true
}

function openCreditPanel() {
  closeMenu()
  showCreditPanel.value = true
}

async function handleLogout() {
  closeMenu()
  await logout()
}

// Close menu on click outside
function onClickOutside(e: Event) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu()
  }
}

watch(menuOpen, (open) => {
  if (open) {
    setTimeout(() => document.addEventListener('click', onClickOutside), 0)
  } else {
    document.removeEventListener('click', onClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

const formattedBalance = computed(() => {
  return balance.value.toFixed(2).replace('.', ',')
})
</script>

<template>
  <div class="fixed right-5 top-6 z-50 flex items-center gap-2">
    <!-- Credit Balance Badge -->
    <!-- <button
      @click="openCreditPanel"
      class="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/80 px-3 py-1.5 text-sm backdrop-blur-sm transition-all hover:border-zinc-300 dark:border-white/[0.08] dark:bg-zinc-900/80 dark:hover:border-white/[0.15]"
      title="Visualizza crediti"
    >
      <svg class="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
      <span
        v-if="!creditsLoading"
        class="font-500 tabular-nums text-zinc-700 dark:text-zinc-200"
      >{{ formattedBalance }}</span>
      <span v-else class="h-4 w-8 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
    </button> -->

    <!-- User Avatar Menu -->
    <div ref="menuRef" class="relative">
      <button
        @click="menuOpen = !menuOpen"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white/80 text-xs font-600 text-zinc-600 backdrop-blur-sm transition-all hover:border-zinc-300 hover:text-zinc-800 dark:border-white/[0.08] dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-white/[0.15] dark:hover:text-zinc-100"
        :title="displayName"
      >
        {{ initials }}
      </button>

      <!-- Dropdown Menu -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-zinc-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-900/95"
        >
          <!-- User info -->
          <div class="px-3 py-2.5">
            <p class="text-sm font-600 text-zinc-900 dark:text-zinc-100">{{ displayName }}</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ user?.email }}</p>
          </div>

          <div class="mx-2 border-t border-zinc-100 dark:border-white/[0.06]" />

          <!-- Menu items -->
          <button
            @click="openAccountSettings"
            class="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            <svg class="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Impostazioni account
          </button>

          <button
            @click="openCreditPanel"
            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            <svg class="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            Crediti
          </button>

          <!-- Theme toggle -->
          <button
            @click="toggleTheme(); closeMenu()"
            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            <svg v-if="isDark" class="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            <svg v-else class="h-4 w-4 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            {{ isDark ? 'Tema chiaro' : 'Tema scuro' }}
          </button>

          <div class="mx-2 border-t border-zinc-100 dark:border-white/[0.06]" />

          <!-- Logout -->
          <button
            @click="handleLogout"
            class="mt-1 mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Esci
          </button>
        </div>
      </Transition>
    </div>

    <!-- Account Settings Modal -->
    <AccountSettingsModal
      v-if="showAccountSettings"
      @close="showAccountSettings = false"
    />

    <!-- Credit Panel -->
    <CreditPanel
      v-if="showCreditPanel"
      @close="showCreditPanel = false"
    />
  </div>
</template>
