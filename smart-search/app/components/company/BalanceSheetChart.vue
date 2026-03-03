<script setup lang="ts">
import { formatCurrency, formatNumber } from '~/utils/format'

interface BalanceSheet {
  year: number
  employees?: number | null
  turnover?: number | null
  netWorth?: number | null
  shareCapital?: number | null
  totalStaffCost?: number | null
  totalAssets?: number | null
  avgGrossSalary?: number | null
}

const props = defineProps<{
  balanceSheets: BalanceSheet[]
}>()

interface MetricDef {
  key: keyof BalanceSheet
  label: string
  color: string
  colorDark: string
  format: (v: number) => string
}

const metrics: MetricDef[] = [
  { key: 'turnover', label: 'Fatturato', color: '#10b981', colorDark: '#34d399', format: formatCurrency },
  { key: 'netWorth', label: 'Utile', color: '#8b5cf6', colorDark: '#a78bfa', format: formatCurrency },
  { key: 'totalAssets', label: 'Totale Attivo Assets', color: '#6366f1', colorDark: '#818cf8', format: formatCurrency },
  { key: 'totalStaffCost', label: 'Costo Personale', color: '#f59e0b', colorDark: '#fbbf24', format: formatCurrency },
  { key: 'employees', label: 'Dipendenti', color: '#3b82f6', colorDark: '#60a5fa', format: (v) => formatNumber(v) },
]

const activeMetrics = ref<Set<string>>(new Set(['turnover']))

function toggle(key: string) {
  const s = new Set(activeMetrics.value)
  if (s.has(key)) {
    if (s.size > 1) s.delete(key)
  } else {
    s.add(key)
  }
  activeMetrics.value = s
}

// Filter to years with at least some data, sorted ascending
const years = computed(() => {
  return [...props.balanceSheets]
    .filter(bs => metrics.some(m => bs[m.key] != null))
    .sort((a, b) => a.year - b.year)
})

const chartWidth = 600
const chartHeight = 240
const padLeft = 60
const padRight = 20
const padTop = 20
const padBottom = 30

// Separate scales: currency metrics share one axis, employees gets its own
const activeMetricDefs = computed(() => metrics.filter(m => activeMetrics.value.has(m.key)))

const hasEmployees = computed(() => activeMetrics.value.has('employees'))
const hasCurrency = computed(() => activeMetricDefs.value.some(m => m.key !== 'employees'))

// Compute y-axis range for currency metrics
function getRange(keys: string[]) {
  let min = Infinity
  let max = -Infinity
  for (const bs of years.value) {
    for (const k of keys) {
      const v = bs[k as keyof BalanceSheet] as number | null | undefined
      if (v != null) {
        if (v < min) min = v
        if (v > max) max = v
      }
    }
  }
  if (min === Infinity) return { min: 0, max: 100 }
  const pad = (max - min) * 0.1 || max * 0.1 || 10
  return { min: Math.max(0, min - pad), max: max + pad }
}

const currencyRange = computed(() => {
  const keys = activeMetricDefs.value.filter(m => m.key !== 'employees').map(m => m.key as string)
  return getRange(keys)
})

const employeeRange = computed(() => getRange(['employees']))

function xPos(i: number) {
  const count = years.value.length
  if (count <= 1) return padLeft + (chartWidth - padLeft - padRight) / 2
  return padLeft + (i / (count - 1)) * (chartWidth - padLeft - padRight)
}

function yPos(value: number | null | undefined, range: { min: number; max: number }) {
  if (value == null) return null
  const h = chartHeight - padTop - padBottom
  const ratio = (value - range.min) / (range.max - range.min || 1)
  return chartHeight - padBottom - ratio * h
}

function buildPath(key: string, range: { min: number; max: number }) {
  const points: { x: number; y: number }[] = []
  years.value.forEach((bs, i) => {
    const v = bs[key as keyof BalanceSheet] as number | null | undefined
    const y = yPos(v, range)
    if (y != null) points.push({ x: xPos(i), y })
  })
  if (points.length < 2) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
}

function getMetricColor(m: MetricDef) {
  return m.color
}

// Y-axis labels for currency
const currencyTicks = computed(() => {
  const r = currencyRange.value
  const steps = 4
  const labels: { value: number; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const v = r.min + (i / steps) * (r.max - r.min)
    labels.push({ value: v, y: yPos(v, r)! })
  }
  return labels
})

// Tooltip state
const tooltip = ref<{ x: number; y: number; items: { label: string; value: string; color: string }[]; year: number } | null>(null)

function showTooltip(event: MouseEvent, bs: BalanceSheet, idx: number) {
  const items: { label: string; value: string; color: string }[] = []
  for (const m of activeMetricDefs.value) {
    const v = bs[m.key] as number | null | undefined
    if (v != null) {
      items.push({ label: m.label, value: m.format(v), color: getMetricColor(m) })
    }
  }
  if (items.length === 0) return
  tooltip.value = { x: xPos(idx), y: padTop, items, year: bs.year }
}

function hideTooltip() {
  tooltip.value = null
}

function compactCurrency(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
  return v.toFixed(0)
}
</script>

<template>
  <div class="min-h-[360px] rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.06] dark:bg-zinc-900/50">
    <h3 class="mb-4 text-[11px] font-600 uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
      Andamento Storico
    </h3>

    <!-- Metric toggles -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        v-for="m in metrics"
        :key="m.key"
        class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-500 transition-all"
        :class="activeMetrics.has(m.key)
          ? 'border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100'
          : 'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 dark:border-white/[0.06] dark:text-zinc-500 dark:hover:border-white/10 dark:hover:text-zinc-400'"
        @click="toggle(m.key)"
      >
        <span
          class="h-2 w-2 rounded-full transition-opacity"
          :style="{ backgroundColor: m.color }"
          :class="activeMetrics.has(m.key) ? 'opacity-100' : 'opacity-30'"
        />
        {{ m.label }}
      </button>
    </div>

    <!-- Chart -->
    <ClientOnly>
      <div v-if="years.length >= 2" class="relative min-h-[240px] w-full overflow-x-auto">
        <svg
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
        class="w-full"
        style="min-width: 400px"
        @mouseleave="hideTooltip"
      >
        <!-- Grid lines -->
        <line
          v-for="tick in currencyTicks"
          :key="tick.value"
          :x1="padLeft"
          :x2="chartWidth - padRight"
          :y1="tick.y"
          :y2="tick.y"
          class="stroke-zinc-100 dark:stroke-white/[0.04]"
          stroke-width="1"
        />

        <!-- Y-axis labels (currency) -->
        <text
          v-if="hasCurrency"
          v-for="tick in currencyTicks"
          :key="'label-' + tick.value"
          :x="padLeft - 8"
          :y="tick.y + 3"
          text-anchor="end"
          class="fill-zinc-400 dark:fill-zinc-500"
          font-size="10"
        >
          {{ compactCurrency(tick.value) }}
        </text>

        <!-- X-axis labels (years) -->
        <text
          v-for="(bs, i) in years"
          :key="'year-' + bs.year"
          :x="xPos(i)"
          :y="chartHeight - 8"
          text-anchor="middle"
          class="fill-zinc-400 dark:fill-zinc-500"
          font-size="11"
          font-weight="500"
        >
          {{ bs.year }}
        </text>

        <!-- Lines for each active metric -->
        <template v-for="m in activeMetricDefs" :key="m.key">
          <path
            :d="buildPath(m.key, m.key === 'employees' ? employeeRange : currencyRange)"
            fill="none"
            :stroke="m.color"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="dark:hidden"
          />
          <path
            :d="buildPath(m.key, m.key === 'employees' ? employeeRange : currencyRange)"
            fill="none"
            :stroke="m.colorDark"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="hidden dark:block"
          />
          <!-- Data points -->
          <template v-for="(bs, i) in years" :key="`${m.key}-${bs.year}`">
            <circle
              v-if="yPos(bs[m.key] as number, m.key === 'employees' ? employeeRange : currencyRange) != null"
              :cx="xPos(i)"
              :cy="yPos(bs[m.key] as number, m.key === 'employees' ? employeeRange : currencyRange)!"
              r="3"
              :fill="m.color"
              class="dark:hidden"
            />
            <circle
              v-if="yPos(bs[m.key] as number, m.key === 'employees' ? employeeRange : currencyRange) != null"
              :cx="xPos(i)"
              :cy="yPos(bs[m.key] as number, m.key === 'employees' ? employeeRange : currencyRange)!"
              r="3"
              :fill="m.colorDark"
              class="hidden dark:block"
            />
          </template>
        </template>

        <!-- Hover zones -->
        <rect
          v-for="(bs, i) in years"
          :key="'hover-' + bs.year"
          :x="xPos(i) - (chartWidth - padLeft - padRight) / years.length / 2"
          :y="padTop"
          :width="(chartWidth - padLeft - padRight) / years.length"
          :height="chartHeight - padTop - padBottom"
          fill="transparent"
          class="cursor-pointer"
          @mouseenter="showTooltip($event, bs, i)"
          @mouseleave="hideTooltip"
        />

        <!-- Tooltip vertical line -->
        <line
          v-if="tooltip"
          :x1="tooltip.x"
          :x2="tooltip.x"
          :y1="padTop"
          :y2="chartHeight - padBottom"
          class="stroke-zinc-300 dark:stroke-zinc-600"
          stroke-width="1"
          stroke-dasharray="4 2"
        />
      </svg>

      <!-- Tooltip card -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="tooltip"
          class="pointer-events-none absolute z-10 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-lg dark:border-white/10 dark:bg-zinc-800"
          :style="{
            left: `${(tooltip.x / chartWidth) * 100}%`,
            top: '0px',
            transform: tooltip.x > chartWidth / 2 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)',
          }"
        >
          <div class="mb-1.5 text-xs font-600 text-zinc-900 dark:text-zinc-100">{{ tooltip.year }}</div>
          <div v-for="item in tooltip.items" :key="item.label" class="flex items-center gap-2 text-xs">
            <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: item.color }" />
            <span class="text-zinc-500 dark:text-zinc-400">{{ item.label }}</span>
            <span class="ml-auto font-600 text-zinc-900 dark:text-zinc-100">{{ item.value }}</span>
          </div>
        </div>
      </Transition>
    </div>

      <!-- Not enough data -->
      <div v-else class="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
        Dati storici non disponibili
      </div>

      <template #fallback>
        <div class="flex min-h-[240px] items-center justify-center">
          <div class="relative h-8 w-8">
            <div class="absolute inset-0 rounded-full border border-zinc-200 dark:border-white/10" />
            <div class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-zinc-900 dark:border-t-white" />
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
