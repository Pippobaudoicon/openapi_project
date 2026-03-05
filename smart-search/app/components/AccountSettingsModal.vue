<script setup lang="ts">
import QRCode from 'qrcode'

const emit = defineEmits<{ close: [] }>()
const { user, fetchProfile, updateProfile, authClient, twoFactor } = useAuthClient()

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

// 2FA state
const twoFAEnabled = ref(false)
const twoFALoading = ref(false)
const twoFAError = ref('')
const twoFASetupStep = ref<'idle' | 'qr' | 'verify' | 'done'>('idle')
const twoFAQRDataUrl = ref('')
const twoFATotpURI = ref('')
const twoFABackupCodes = ref<string[]>([])
const twoFAVerifyCode = ref('')
const twoFADisablePassword = ref('')
const twoFAEnablePassword = ref('')

const passwordMismatch = computed(() =>
  confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value
)

const canSubmitPassword = computed(() =>
  currentPassword.value.length > 0 &&
  newPassword.value.length >= 8 &&
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

  // Check if 2FA is already enabled
  try {
    const session = await authClient.getSession()
    twoFAEnabled.value = !!(session?.data as any)?.user?.twoFactorEnabled
  } catch {
    // ignore
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
    await authClient.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
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

async function startTwoFASetup() {
  if (!twoFAEnablePassword.value) {
    twoFAError.value = 'Inserisci la tua password per abilitare il 2FA'
    return
  }
  twoFALoading.value = true
  twoFAError.value = ''
  try {
    const result = await twoFactor.enable({
      password: twoFAEnablePassword.value,
    })
    if (result.error) {
      twoFAError.value = result.error.message || 'Errore nell\'abilitazione del 2FA'
      return
    }
    const data = result.data as any
    twoFATotpURI.value = data.totpURI
    twoFABackupCodes.value = data.backupCodes || []
    twoFAQRDataUrl.value = await QRCode.toDataURL(data.totpURI)
    twoFASetupStep.value = 'qr'
  } catch (err: any) {
    twoFAError.value = err?.message || 'Errore nell\'abilitazione del 2FA'
  } finally {
    twoFALoading.value = false
  }
}

async function verifyTwoFASetup() {
  twoFALoading.value = true
  twoFAError.value = ''
  try {
    const result = await twoFactor.verifyTotp({
      code: twoFAVerifyCode.value,
    })
    if (result.error) {
      twoFAError.value = result.error.message || 'Codice non valido'
      twoFAVerifyCode.value = ''
      return
    }
    twoFAEnabled.value = true
    twoFASetupStep.value = 'done'
  } catch (err: any) {
    twoFAError.value = err?.message || 'Verifica fallita'
    twoFAVerifyCode.value = ''
  } finally {
    twoFALoading.value = false
  }
}

async function disableTwoFA() {
  const password = twoFADisablePassword.value || prompt('Inserisci la tua password per disabilitare il 2FA')
  if (!password) return

  twoFALoading.value = true
  twoFAError.value = ''
  try {
    const result = await twoFactor.disable({
      password,
    })
    if (result.error) {
      twoFAError.value = result.error.message || 'Errore nella disabilitazione del 2FA'
      return
    }
    twoFAEnabled.value = false
    twoFASetupStep.value = 'idle'
    twoFADisablePassword.value = ''
  } catch (err: any) {
    twoFAError.value = err?.message || 'Errore nella disabilitazione del 2FA'
  } finally {
    twoFALoading.value = false
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
        <div class="max-h-[70vh] overflow-y-auto p-6">
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
          <div v-if="activeTab === 'security'" class="space-y-6">
            <!-- Change Password -->
            <form @submit.prevent="handlePasswordSubmit" class="space-y-4">
              <h3 class="text-sm font-600 text-zinc-900 dark:text-zinc-100">Cambia password</h3>

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
                <p v-if="newPassword.length > 0 && newPassword.length < 8" class="mt-1 text-xs text-amber-500">Minimo 8 caratteri</p>
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

              <p v-if="passwordError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-400/10 dark:text-red-400">
                {{ passwordError }}
              </p>

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

            <!-- Divider -->
            <div class="border-t border-zinc-100 dark:border-white/[0.06]" />

            <!-- Two-Factor Authentication -->
            <div class="space-y-4">
              <h3 class="text-sm font-600 text-zinc-900 dark:text-zinc-100">Autenticazione a due fattori (2FA)</h3>

              <p v-if="twoFAError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-400/10 dark:text-red-400">
                {{ twoFAError }}
              </p>

              <!-- 2FA Not Enabled -->
              <template v-if="!twoFAEnabled && twoFASetupStep === 'idle'">
                <p class="text-sm text-zinc-500 dark:text-zinc-400">
                  Aggiungi un ulteriore livello di sicurezza al tuo account con un'app di autenticazione.
                </p>
                <div>
                  <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Password attuale</label>
                  <input
                    v-model="twoFAEnablePassword"
                    type="password"
                    autocomplete="current-password"
                    placeholder="Inserisci la tua password"
                    class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
                    @keyup.enter="startTwoFASetup"
                  />
                </div>
                <button
                  @click="startTwoFASetup"
                  :disabled="twoFALoading || !twoFAEnablePassword"
                  class="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-500 text-white transition-all hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {{ twoFALoading ? 'Caricamento...' : 'Abilita 2FA' }}
                </button>
              </template>

              <!-- QR Code Step -->
              <template v-if="twoFASetupStep === 'qr'">
                <p class="text-sm text-zinc-500 dark:text-zinc-400">
                  Scansiona il codice QR con la tua app di autenticazione (Google Authenticator, Authy, ecc.)
                </p>
                <div class="flex justify-center rounded-xl bg-white p-4 dark:bg-zinc-800">
                  <img :src="twoFAQRDataUrl" alt="QR Code 2FA" class="h-48 w-48" />
                </div>
                <details class="text-xs text-zinc-400">
                  <summary class="cursor-pointer">Inserimento manuale</summary>
                  <code class="mt-1 block break-all rounded bg-zinc-100 p-2 dark:bg-zinc-800">{{ twoFATotpURI }}</code>
                </details>

                <div v-if="twoFABackupCodes.length" class="rounded-xl bg-amber-50 p-3 dark:bg-amber-400/10">
                  <p class="mb-2 text-sm font-500 text-amber-700 dark:text-amber-400">Codici di backup (salvali in un posto sicuro):</p>
                  <div class="grid grid-cols-2 gap-1">
                    <code v-for="code in twoFABackupCodes" :key="code" class="text-xs text-amber-600 dark:text-amber-300">{{ code }}</code>
                  </div>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-500 text-zinc-600 dark:text-zinc-400">Inserisci il codice dall'app</label>
                  <input
                    v-model="twoFAVerifyCode"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    placeholder="000000"
                    class="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-800"
                  />
                </div>
                <button
                  @click="verifyTwoFASetup"
                  :disabled="twoFALoading || twoFAVerifyCode.length !== 6"
                  class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-500 text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  {{ twoFALoading ? 'Verifica...' : 'Verifica e abilita' }}
                </button>
              </template>

              <!-- 2FA Setup Complete -->
              <template v-if="twoFASetupStep === 'done'">
                <p class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                  2FA abilitato con successo!
                </p>
              </template>

              <!-- 2FA Enabled — option to disable -->
              <template v-if="twoFAEnabled && twoFASetupStep !== 'qr'">
                <div class="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-400/10">
                  <svg class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span class="text-sm font-500 text-emerald-700 dark:text-emerald-400">2FA attivo</span>
                </div>
                <button
                  @click="disableTwoFA"
                  :disabled="twoFALoading"
                  class="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-500 text-red-600 transition-all hover:bg-red-50 disabled:opacity-40 dark:border-red-400/20 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-400/10"
                >
                  {{ twoFALoading ? 'Disabilitazione...' : 'Disabilita 2FA' }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
