<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Financial Information</h3>
    
    <!-- Balance Sheets Table -->
    <div v-if="balanceSheets.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Balance Sheets</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th v-if="showEmployees" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
              <th v-if="showProfit" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              <th v-if="showAssets" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assets</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sheet in balanceSheets" :key="sheet.year" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ sheet.year }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.revenue) }}</td>
              <td v-if="showEmployees" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sheet.employees || 'N/A' }}</td>
              <td v-if="showProfit" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.profit) }}</td>
              <td v-if="showAssets" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(sheet.totalAssets) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Latest Financial Summary -->
    <div v-if="latestFinancials" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-if="latestFinancials.revenue" class="bg-blue-50 rounded-lg p-4">
        <div class="text-sm font-medium text-blue-600">Latest Revenue</div>
        <div class="text-lg font-semibold text-blue-900">{{ formatCurrency(latestFinancials.revenue) }}</div>
        <div class="text-xs text-blue-600">{{ latestFinancials.year }}</div>
      </div>
      
      <div v-if="latestFinancials.employees" class="bg-green-50 rounded-lg p-4">
        <div class="text-sm font-medium text-green-600">Employees</div>
        <div class="text-lg font-semibold text-green-900">{{ latestFinancials.employees }}</div>
        <div class="text-xs text-green-600">{{ latestFinancials.year }}</div>
      </div>
      
      <div v-if="latestFinancials.profit" class="bg-purple-50 rounded-lg p-4">
        <div class="text-sm font-medium text-purple-600">Latest Profit</div>
        <div class="text-lg font-semibold text-purple-900">{{ formatCurrency(latestFinancials.profit) }}</div>
        <div class="text-xs text-purple-600">{{ latestFinancials.year }}</div>
      </div>
      
      <div v-if="latestFinancials.totalAssets" class="bg-amber-50 rounded-lg p-4">
        <div class="text-sm font-medium text-amber-600">Total Assets</div>
        <div class="text-lg font-semibold text-amber-900">{{ formatCurrency(latestFinancials.totalAssets) }}</div>
        <div class="text-xs text-amber-600">{{ latestFinancials.year }}</div>
      </div>
    </div>

    <!-- Economic Indicators -->
    <div v-if="economicIndicators.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-md font-medium text-gray-700 mb-4">Economic Indicators</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="indicator in economicIndicators" :key="indicator.label" class="bg-gray-50 rounded-lg p-4">
          <div class="text-sm font-medium text-gray-600">{{ indicator.label }}</div>
          <div class="text-lg font-semibold text-gray-900">{{ indicator.value }}</div>
        </div>
      </div>
    </div>

    <!-- No Financial Data -->
    <div v-if="!hasFinancialData" class="text-center py-8 text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <p>No financial data available</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  dataType: {
    type: String,
    default: 'advanced' // 'advanced' or 'full'
  }
})

// Extract balance sheets data
const balanceSheets = computed(() => {
  const sheets = []
  
  // For full data (bilanci array)
  if (props.data?.bilanci && Array.isArray(props.data.bilanci)) {
    props.data.bilanci.forEach(bilancio => {
      sheets.push({
        year: bilancio.anno,
        revenue: bilancio.fatturato || bilancio.ricavi,
        employees: bilancio.dipendenti,
        profit: bilancio.utile || bilancio.risultato,
        totalAssets: bilancio.totale_attivo || bilancio.attivo_totale
      })
    })
  }
  
  // For advanced data (balanceSheets object)
  if (props.data?.balanceSheets?.all && Array.isArray(props.data.balanceSheets.all)) {
    props.data.balanceSheets.all.forEach(sheet => {
      sheets.push({
        year: sheet.year || sheet.balanceSheetDate?.split('-')[0],
        revenue: sheet.revenue || sheet.turnover,
        employees: sheet.employees,
        profit: sheet.profit || sheet.netIncome,
        totalAssets: sheet.totalAssets
      })
    })
  }
  
  // Sort by year descending and limit to 5 most recent
  return sheets
    .filter(sheet => sheet.year)
    .sort((a, b) => b.year - a.year)
    .slice(0, 5)
})

// Latest financial data
const latestFinancials = computed(() => {
  if (balanceSheets.value.length > 0) {
    return balanceSheets.value[0]
  }
  
  // Fallback to single values
  return {
    year: new Date().getFullYear() - 1,
    revenue: props.data?.ecofin?.turnover || props.data?.fatturato_ultimo,
    employees: props.data?.employees?.employee || props.data?.dipendenti,
    profit: null,
    totalAssets: null
  }
})

// Economic indicators
const economicIndicators = computed(() => {
  const indicators = []
  
  // EBITDA
  if (props.data?.operatingResults?.ebitda) {
    indicators.push({
      label: 'EBITDA',
      value: formatCurrency(props.data.operatingResults.ebitda)
    })
  }
  
  // Permanent contracts
  if (props.data?.employeesStatistic?.permanentContract) {
    indicators.push({
      label: 'Permanent Contracts',
      value: props.data.employeesStatistic.permanentContract
    })
  }
  
  // Share capital
  const shareCapital = props.data?.capitale_sociale || props.data?.balanceSheets?.last?.shareCapital
  if (shareCapital) {
    indicators.push({
      label: 'Share Capital',
      value: formatCurrency(shareCapital)
    })
  }
  
  // Credit rating
  if (props.data?.rating) {
    indicators.push({
      label: 'Credit Rating',
      value: props.data.rating
    })
  }
  
  return indicators
})

// Show/hide columns based on available data
const showEmployees = computed(() => 
  balanceSheets.value.some(sheet => sheet.employees !== null && sheet.employees !== undefined)
)

const showProfit = computed(() => 
  balanceSheets.value.some(sheet => sheet.profit !== null && sheet.profit !== undefined)
)

const showAssets = computed(() => 
  balanceSheets.value.some(sheet => sheet.totalAssets !== null && sheet.totalAssets !== undefined)
)

const hasFinancialData = computed(() => 
  balanceSheets.value.length > 0 || 
  economicIndicators.value.length > 0 || 
  latestFinancials.value.revenue
)

// Utility functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return 'N/A'
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return 'N/A'
  
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}
</script>
