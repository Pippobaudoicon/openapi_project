<script setup lang="ts">
const props = defineProps<{
  params: Record<string, string | number>
  interpretation?: string
}>()

const PARAM_LABELS: Record<string, string> = {
  province: 'Provincia',
  atecoCode: 'ATECO',
  companyName: 'Nome azienda',
  minTurnover: 'Fatturato min',
  maxTurnover: 'Fatturato max',
  minEmployees: 'Dipendenti min',
  maxEmployees: 'Dipendenti max',
  activityStatus: 'Stato',
  townCode: 'Comune',
}

const chips = computed(() =>
  Object.entries(props.params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([key, value]) => ({
      label: PARAM_LABELS[key] || key,
      value: String(value),
    })),
)
</script>

<template>
  <div v-if="chips.length" class="flex flex-wrap items-center gap-2">
    <span class="text-xs text-gray-400">AI ha interpretato:</span>
    <span
      v-for="chip in chips"
      :key="chip.label"
      class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
    >
      <span class="text-blue-400">{{ chip.label }}:</span>
      {{ chip.value }}
    </span>
  </div>
</template>
