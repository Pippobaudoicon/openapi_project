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
const historyRef = ref<{ addQuery: (q: string) => void; show: () => void; hide: () => void } | null>(null)

watch(() => props.modelValue, (val) => {
  if (val !== undefined) input.value = val
})

function onSubmit() {
  const q = input.value.trim()
  if (!q) return
  historyRef.value?.addQuery(q)
  emit('submit', q)
  emit('update:modelValue', q)
}

function onHistorySelect(query: string) {
  input.value = query
  onSubmit()
}

function onFocus() {
  focused.value = true
  historyRef.value?.show()
}

function onBlur() {
  focused.value = false
  historyRef.value?.hide()
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="w-full" :class="compact ? 'max-w-2xl' : 'max-w-xl'">
    <div class="relative">
      <div
        class="relative overflow-hidden rounded-2xl border transition-all duration-300"
        :class="[
          compact ? 'rounded-xl' : 'rounded-2xl',
          focused
            ? 'search-glow border-indigo-400/50 dark:border-indigo-400/30'
            : 'border-zinc-200 hover:border-zinc-300 dark:border-white/[0.08] dark:hover:border-white/[0.12]',
        ]"
      >
        <!-- Search icon -->
        <svg
          class="absolute top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 transition-colors"
          :class="[
            compact ? 'h-4 w-4 left-3.5' : 'h-5 w-5 left-4',
            focused ? 'text-indigo-500 dark:text-indigo-400' : '',
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
          :class="compact ? 'py-2.5 text-sm pl-10 pr-10' : 'py-4 text-base pl-12 pr-14'"
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

      <SearchHistory ref="historyRef" @select="onHistorySelect" />
    </div>
  </form>
</template>
