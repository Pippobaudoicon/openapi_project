<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  submit: [query: string]
  'update:modelValue': [value: string]
}>()

const input = ref(props.modelValue || '')
const focused = ref(false)
const mobileExpanded = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const desktopHistoryRef = ref<{ addQuery: (q: string) => void; show: () => void; hide: () => void } | null>(null)
const mobileHistoryRef = ref<{ addQuery: (q: string) => void; show: () => void; hide: () => void } | null>(null)

const historyRef = computed(() => mobileExpanded.value ? mobileHistoryRef.value : desktopHistoryRef.value)

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

watch(() => props.modelValue, (val) => {
  if (val !== undefined) input.value = val
})

function onSubmit() {
  const q = input.value.trim()
  if (!q) return
  historyRef.value?.addQuery(q)
  emit('submit', q)
  emit('update:modelValue', q)
  closeMobileOverlay()
}

function onHistorySelect(query: string) {
  input.value = query
  onSubmit()
}

function onFocus() {
  focused.value = true
  historyRef.value?.show()

  if (isMobile.value) {
    mobileExpanded.value = true
    document.body.style.overflow = 'hidden'
    nextTick(() => {
      inputRef.value?.focus()
      mobileHistoryRef.value?.show()
    })
  }
}

function onBlur() {
  if (mobileExpanded.value) return
  focused.value = false
  historyRef.value?.hide()
}

function closeMobileOverlay() {
  if (!mobileExpanded.value) return
  mobileExpanded.value = false
  focused.value = false
  document.body.style.overflow = ''
  historyRef.value?.hide()
  inputRef.value?.blur()
}

function onMobileBackdropClick() {
  closeMobileOverlay()
}

function clearInput() {
  input.value = ''
  nextTick(() => inputRef.value?.focus())
}
</script>

<template>
  <!-- Mobile Full-Screen Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileExpanded"
        class="mobile-search-overlay"
        @click.self="onMobileBackdropClick"
      >
        <!-- Animated gradient orbs -->
        <div class="mobile-search-orb mobile-search-orb-1" />
        <div class="mobile-search-orb mobile-search-orb-2" />

        <div class="mobile-search-content">
          <!-- Close button -->
          <button
            type="button"
            class="mobile-search-close"
            @click="closeMobileOverlay"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Expanded search input -->
          <form @submit.prevent="onSubmit" class="mobile-search-form">
            <div class="mobile-search-input-wrap">
              <svg
                class="mobile-search-icon"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>

              <input
                ref="inputRef"
                v-model="input"
                type="text"
                placeholder="Cerca aziende in Italia..."
                maxlength="500"
                class="mobile-search-input"
                @keydown.escape="closeMobileOverlay"
              />

              <!-- Clear button -->
              <button
                v-if="input.length"
                type="button"
                class="mobile-search-clear"
                @click="clearInput"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="mobile-search-submit"
              :class="input.trim() ? 'mobile-search-submit-active' : 'mobile-search-submit-inactive'"
            >
              <span class="mobile-search-submit-text">Cerca</span>
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>

          <!-- History in mobile overlay -->
          <div class="mobile-search-history">
            <SearchHistory ref="mobileHistoryRef" inline @select="onHistorySelect" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Standard Search Bar (desktop + mobile trigger) -->
  <form @submit.prevent="onSubmit" class="w-full" :class="compact ? 'max-w-2xl' : 'max-w-xl'">
    <div class="relative">
      <div
        class="relative overflow-hidden border transition-all duration-300"
        :class="[
          compact ? 'rounded-xl' : 'rounded-2xl',
          focused && !mobileExpanded
            ? 'search-glow border-indigo-400/50 dark:border-indigo-400/30'
            : 'border-zinc-200 hover:border-zinc-300 dark:border-white/[0.08] dark:hover:border-white/[0.12]',
        ]"
      >
        <!-- Search icon -->
        <svg
          class="absolute top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 transition-colors"
          :class="[
            compact ? 'h-4 w-4 left-3.5' : 'h-5 w-5 left-4',
            focused && !mobileExpanded ? 'text-indigo-500 dark:text-indigo-400' : '',
          ]"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>

        <input
          v-model="input"
          type="text"
          :placeholder="compact ? 'Cerca aziende...' : 'Cerca aziende in Italia...'"
          maxlength="500"
          class="w-full border-0 bg-white/80 text-zinc-900 placeholder-zinc-400 backdrop-blur-xl focus:outline-none dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-500"
          :class="[
            compact
              ? 'py-2.5 text-sm pl-10 pr-10'
              : 'py-3.5 sm:py-4 text-[15px] sm:text-base pl-11 sm:pl-12 pr-12 sm:pr-14',
          ]"
          @focus="onFocus"
          @blur="onBlur"
        />

        <!-- Submit button -->
        <button
          type="submit"
          class="absolute top-1/2 -translate-y-1/2 rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-500 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          :class="compact ? 'p-1.5 rounded-lg right-1.5' : 'p-2.5 right-2'"
        >
          <svg
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      <!-- Desktop history (hidden on mobile when overlay is active) -->
      <div class="hidden sm:block">
        <SearchHistory ref="desktopHistoryRef" @select="onHistorySelect" />
      </div>
    </div>
  </form>
</template>
