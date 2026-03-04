<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
const { user, fetchProfile, updateProfile, changePassword } = useAuth()

const activeTab = ref<'profile' | 'security'>('profile')

// Profile form
const profileForm = reactive({
  firstName: '',
  lastName: '',
  company: '',
  phone: '',
})
const profileLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref(false)

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

const passwordMismatch = computed(() =>
  confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value
)

const canSubmitPassword = computed(() =>
  currentPassword.value.length > 0 &&
  newPassword.value.length >= 6 &&
  newPassword.value === confirmPassword.value &&
  !passwordLoading.value
)

const canSubmitProfile = computed(() => !profileLoading.value)

// Load full profile on mount
onMounted(async () => {
  try {
    const data = await fetchProfile()
    profileForm.firstName = data.firstName || ''
    profileForm.lastName = data.lastName || ''
    profileForm.company = data.company || ''
    profileForm.phone = data.phone || ''
  } catch {
    profileError.value = 'Errore nel caricamento del profilo'
  }
})

async function handleProfileSubmit() {
  if (!canSubmitProfile.value) return

  profileLoading.value = true
  profileError.value = ''
  profileSuccess.value = false

  try {
    await updateProfile({ ...profileForm })
    profileSuccess.value = true
  } catch (err: any) {
    profileError.value = err?.data?.error || err?.message || 'Errore nell\'aggiornamento del profilo'
  } finally {
    profileLoading.value = false
  }
}

async function handlePasswordSubmit() {
  if (!canSubmitPassword.value) return

  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = false

  try {
    await changePassword(currentPassword.value, newPassword.value)
    passwordSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err: any) {
    passwordError.value = err?.data?.statusMessage || err?.data?.error || err?.message || 'Errore nel cambio password'
  } finally {
    passwordLoading.value = false
  }
}

function handleBackdropClick(e: Event) {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      @click="handleBackdropClick"
    >
      <div class="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-zinc-900 animate-scale-in">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-100 px-6 pt-5 pb-0 dark:border-white/[0.06]">
          <div class="flex gap-1">
            <button
              @click="activeTab = 'profile'"
              class="relative px-4 py-3 text-sm font-500 transition-colors"
              :class="activeTab === 'profile'
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'"
            >
              Profilo
              <span
                v-if="activeTab === 'profile'"
                class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-500"
              />
            </button>
            <button
              @click="activeTab = 'security'"
              class="relative px-4 py-3 text-sm font-500 transition-colors"
              :class="activeTab === 'security'
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'"
            >
              Sicurezza
              <span
                v-if="activeTab === 'security'"
                class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-500"
              />
            </button>
          </div>

          <button
            @click="emit('close')"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-300"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Profile Tab -->
          <form v-if="activeTab === 'profile'" @submit.prevent="handleProfileSubmit" class="space-y-4">
            <!-- Email (read-only) -->
            <div>
              <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Email</label>
              <input
                :value="user?.email"
                disabled
                class="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-500 dark:border-white/[0.06] dark:bg-zinc-800/30 dark:text-zinc-500"
              />
            </div>

            <!-- Name row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Nome</label>
                <input
                  v-model="profileForm.firstName"
                  type="text"
                  placeholder="Nome"
                  class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Cognome</label>
                <input
                  v-model="profileForm.lastName"
                  type="text"
                  placeholder="Cognome"
                  class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
                />
              </div>
            </div>

            <!-- Company -->
            <div>
              <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Azienda</label>
              <input
                v-model="profileForm.company"
                type="text"
                placeholder="Nome azienda"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Telefono</label>
              <input
                v-model="profileForm.phone"
                type="tel"
                placeholder="Numero di telefono"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
              />
            </div>

            <!-- Error -->
            <p v-if="profileError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-400/10 dark:text-red-400">
              {{ profileError }}
            </p>

            <!-- Success -->
            <p v-if="profileSuccess" class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              Profilo aggiornato con successo
            </p>

            <button
              type="submit"
              :disabled="!canSubmitProfile"
              class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-500 text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <span v-if="profileLoading">Salvataggio...</span>
              <span v-else>Salva modifiche</span>
            </button>
          </form>

          <!-- Security Tab -->
          <form v-if="activeTab === 'security'" @submit.prevent="handlePasswordSubmit" class="space-y-4">
            <div>
              <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Password attuale</label>
              <input
                v-model="currentPassword"
                type="password"
                autocomplete="current-password"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Nuova password</label>
              <input
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
              />
              <p v-if="newPassword.length > 0 && newPassword.length < 6" class="mt-1 text-xs text-amber-500">Minimo 6 caratteri</p>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Conferma nuova password</label>
              <input
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
              />
              <p v-if="passwordMismatch" class="mt-1 text-xs text-red-500">Le password non corrispondono</p>
            </div>

            <!-- Error -->
            <p v-if="passwordError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-400/10 dark:text-red-400">
              {{ passwordError }}
            </p>

            <!-- Success -->
            <p v-if="passwordSuccess" class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              Password aggiornata con successo
            </p>

            <button
              type="submit"
              :disabled="!canSubmitPassword"
              class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-500 text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <span v-if="passwordLoading">Aggiornamento...</span>
              <span v-else>Aggiorna password</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>
