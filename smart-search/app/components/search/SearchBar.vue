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
</script>

<template>
  <form @submit.prevent="onSubmit" class="w-full" :class="compact ? 'max-w-2xl' : 'max-w-xl'">
    <div class="relative">
      <input
        v-model="input"
        type="text"
        :placeholder="compact ? 'Cerca aziende...' : 'Cerca aziende in Italia...'"
        maxlength="500"
        class="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-gray-900 shadow-sm transition-shadow focus:border-blue-400 focus:shadow-md focus:outline-none"
        :class="compact ? 'text-sm py-2.5 px-5' : 'text-base'"
        @focus="historyRef?.show()"
        @blur="historyRef?.hide()"
      />
      <button
        type="submit"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
        :class="compact ? 'p-1.5' : 'p-2'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="compact ? 'h-4 w-4' : 'h-5 w-5'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      <SearchHistory ref="historyRef" @select="onHistorySelect" />
    </div>
  </form>
</template>
