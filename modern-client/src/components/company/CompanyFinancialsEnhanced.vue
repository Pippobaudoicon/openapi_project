<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Detailed Financial Information</h3>
    
    <!-- Full Balance Sheets with All Columns -->
    <div v-if="balanceSheets.length > 0" class="mb-8">
      <h4 class="text-md font-medium text-gray-700 mb-4">Complete Balance Sheets ({{ balanceSheets.length }} years)</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assets</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Worth</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EBITDA</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debt</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sheet in balanceSheets" :key="sheet.year" class="hover:bg-gray-50">
              <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{{ sheet.year }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900">{{ formatCurrency(sheet.revenue) }}</td>
              <td class="px-4 py-3 whitespace-nowrap" :class="getProfitClass(sheet.profit)">{{ formatCurrency(sheet.profit) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900">{{ formatCurrency(sheet.totalAssets) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900">{{ formatCurrency(sheet.netWorth) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900">{{ sheet.employees || 'N/A' }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900">{{ formatCurrency(sheet.ebitda) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900">{{ formatCurrency(sheet.debt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Financial Ratios & Analysis -->
    <div v-if="isFullData && financialRatios.length > 0" class="mb-8">
      <h4 class="text-md font-medium text-gray-700 mb-4">Financial Ratios & Analysis</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="ratio in financialRatios" :key="ratio.label" class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <div class="text-sm font-medium text-gray-600">{{ ratio.label }}</div>
          <div class="text-lg font-semibold text-gray-900">{{ ratio.value }}</div>
          <div v-if="ratio.trend" class="text-xs" :class="ratio.trendClass">{{ ratio.trend }}</div>
        </div>
      </div>
    </div>

    <!-- Detailed Revenue Breakdown -->
    <div v-if="isFullData && revenueBreakdown.length > 0" class="mb-8">
      <h4 class="text-md font-medium text-gray-700 mb-4">Revenue Breakdown by Source</h4>
      <div class="space-y-3">
        <div v-for="source in revenueBreakdown" :key="source.type" class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <div class="font-medium text-blue-900">{{ source.type }}</div>
            <div class="text-sm text-blue-600">{{ source.description }}</div>
          </div>
          <div class="text-lg font-semibold text-blue-900">{{ formatCurrency(source.amount) }}</div>
        </div>
      </div>
    </div>

    <!-- Expense Analysis -->
    <div v-if="isFullData && expenseBreakdown.length > 0" class="mb-8">
      <h4 class="text-md font-medium text-gray-700 mb-4">Expense Analysis</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="expense in expenseBreakdown" :key="expense.category" class="bg-red-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-red-900">{{ expense.category }}</div>
              <div class="text-sm text-red-600">{{ expense.percentage }}% of revenue</div>
            </div>
            <div class="text-lg font-semibold text-red-900">{{ formatCurrency(expense.amount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assets & Liabilities Detail -->
    <div v-if="isFullData && (assets.length > 0 || liabilities.length > 0)" class="mb-8">
      <h4 class="text-md font-medium text-gray-700 mb-4">Assets & Liabilities Breakdown</h4>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Assets -->
        <div v-if="assets.length > 0">
          <h5 class="font-medium text-green-800 mb-3">Assets</h5>
          <div class="space-y-2">
            <div v-for="asset in assets" :key="asset.type" class="flex justify-between p-2 bg-green-50 rounded">
              <span class="text-green-800">{{ asset.type }}</span>
              <span class="font-medium text-green-900">{{ formatCurrency(asset.value) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Liabilities -->
        <div v-if="liabilities.length > 0">
          <h5 class="font-medium text-red-800 mb-3">Liabilities</h5>
          <div class="space-y-2">
            <div v-for="liability in liabilities" :key="liability.type" class="flex justify-between p-2 bg-red-50 rounded">
              <span class="text-red-800">{{ liability.type }}</span>
              <span class="font-medium text-red-900">{{ formatCurrency(liability.value) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Standard Financial Summary (for both types) -->
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

const isFullData = computed(() => props.dataType === 'full')

// Extract enhanced balance sheets data with more fields
const balanceSheets = computed(() => {
  const sheets = []
  
  // For full data (bilanci array) - extract more fields
  if (props.data?.bilanci && Array.isArray(props.data.bilanci)) {
    props.data.bilanci.forEach(bilancio => {
      sheets.push({
        year: bilancio.anno,
        revenue: bilancio.fatturato || bilancio.ricavi || bilancio.valore_produzione,
        profit: bilancio.utile || bilancio.risultato || bilancio.utile_perdita,
        totalAssets: bilancio.totale_attivo || bilancio.attivo_totale,
        netWorth: bilancio.patrimonio_netto || bilancio.capitale_netto,
        employees: bilancio.dipendenti || bilancio.numero_dipendenti,
        ebitda: bilancio.ebitda || bilancio.margine_operativo,
        debt: bilancio.debiti || bilancio.passivita_correnti,
        operatingIncome: bilancio.ricavi_operativi,
        financialExpenses: bilancio.oneri_finanziari,
        taxes: bilancio.imposte
      })
    })
  }
  
  // For advanced data (balanceSheets object)
  if (props.data?.balanceSheets?.all && Array.isArray(props.data.balanceSheets.all)) {
    props.data.balanceSheets.all.forEach(sheet => {
      sheets.push({
        year: sheet.year || sheet.balanceSheetDate?.split('-')[0],
        revenue: sheet.revenue || sheet.turnover,
        profit: sheet.profit || sheet.netIncome,
        totalAssets: sheet.totalAssets,
        netWorth: sheet.netWorth || sheet.equity,
        employees: sheet.employees,
        ebitda: sheet.ebitda,
        debt: sheet.totalDebt || sheet.liabilities
      })
    })
  }
  
  // Sort by year descending
  return sheets
    .filter(sheet => sheet.year)
    .sort((a, b) => b.year - a.year)
    .slice(0, 10) // Show up to 10 years for full data
})

// Financial ratios calculation
const financialRatios = computed(() => {
  if (!isFullData.value || balanceSheets.value.length < 2) return []
  
  const ratios = []
  const latest = balanceSheets.value[0]
  const previous = balanceSheets.value[1]
  
  // Revenue Growth
  if (latest.revenue && previous.revenue) {
    const growth = ((latest.revenue - previous.revenue) / previous.revenue * 100).toFixed(1)
    ratios.push({
      label: 'Revenue Growth (YoY)',
      value: `${growth}%`,
      trend: growth > 0 ? `+${growth}%` : `${growth}%`,
      trendClass: growth > 0 ? 'text-green-600' : 'text-red-600'
    })
  }
  
  // Profit Margin
  if (latest.profit && latest.revenue) {
    const margin = (latest.profit / latest.revenue * 100).toFixed(1)
    ratios.push({
      label: 'Profit Margin',
      value: `${margin}%`,
      trendClass: margin > 0 ? 'text-green-600' : 'text-red-600'
    })
  }
  
  // Debt to Assets Ratio
  if (latest.debt && latest.totalAssets) {
    const debtRatio = (latest.debt / latest.totalAssets * 100).toFixed(1)
    ratios.push({
      label: 'Debt to Assets',
      value: `${debtRatio}%`,
      trendClass: debtRatio < 30 ? 'text-green-600' : debtRatio < 60 ? 'text-yellow-600' : 'text-red-600'
    })
  }
  
  return ratios
})

// Revenue breakdown (extract from full data if available)
const revenueBreakdown = computed(() => {
  if (!isFullData.value) return []
  
  const breakdown = []
  const data = props.data
  
  // Look for detailed revenue sources in full data
  if (data?.ricavi_dettaglio) {
    Object.entries(data.ricavi_dettaglio).forEach(([key, value]) => {
      if (value && typeof value === 'number') {
        breakdown.push({
          type: formatLabel(key),
          amount: value,
          description: getRevenueDescription(key)
        })
      }
    })
  }
  
  return breakdown
})

// Expense breakdown
const expenseBreakdown = computed(() => {
  if (!isFullData.value || !balanceSheets.value[0]) return []
  
  const latest = balanceSheets.value[0]
  const expenses = []
  
  if (latest.revenue) {
    if (latest.operatingExpenses) {
      expenses.push({
        category: 'Operating Expenses',
        amount: latest.operatingExpenses,
        percentage: (latest.operatingExpenses / latest.revenue * 100).toFixed(1)
      })
    }
    
    if (latest.financialExpenses) {
      expenses.push({
        category: 'Financial Expenses',
        amount: latest.financialExpenses,
        percentage: (latest.financialExpenses / latest.revenue * 100).toFixed(1)
      })
    }
    
    if (latest.taxes) {
      expenses.push({
        category: 'Taxes',
        amount: latest.taxes,
        percentage: (latest.taxes / latest.revenue * 100).toFixed(1)
      })
    }
  }
  
  return expenses
})

// Assets breakdown
const assets = computed(() => {
  if (!isFullData.value) return []
  
  const assetsList = []
  const data = props.data
  
  // Extract asset details from full data
  if (data?.attivo_corrente) assetsList.push({ type: 'Current Assets', value: data.attivo_corrente })
  if (data?.attivo_immobilizzato) assetsList.push({ type: 'Fixed Assets', value: data.attivo_immobilizzato })
  if (data?.liquidita) assetsList.push({ type: 'Cash & Equivalents', value: data.liquidita })
  if (data?.crediti) assetsList.push({ type: 'Receivables', value: data.crediti })
  if (data?.rimanenze) assetsList.push({ type: 'Inventory', value: data.rimanenze })
  
  return assetsList.filter(asset => asset.value)
})

// Liabilities breakdown
const liabilities = computed(() => {
  if (!isFullData.value) return []
  
  const liabilitiesList = []
  const data = props.data
  
  // Extract liability details from full data
  if (data?.passivo_corrente) liabilitiesList.push({ type: 'Current Liabilities', value: data.passivo_corrente })
  if (data?.debiti_lungo_termine) liabilitiesList.push({ type: 'Long-term Debt', value: data.debiti_lungo_termine })
  if (data?.debiti_fornitori) liabilitiesList.push({ type: 'Trade Payables', value: data.debiti_fornitori })
  if (data?.debiti_fiscali) liabilitiesList.push({ type: 'Tax Liabilities', value: data.debiti_fiscali })
  
  return liabilitiesList.filter(liability => liability.value)
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

const hasFinancialData = computed(() => 
  balanceSheets.value.length > 0 || 
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

const getProfitClass = (profit) => {
  if (!profit) return 'text-gray-900'
  return profit > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'
}

const formatLabel = (key) => {
  return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()
    .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const getRevenueDescription = (key) => {
  const descriptions = {
    'ricavi_vendite': 'Revenue from product sales',
    'ricavi_servizi': 'Revenue from services',
    'altri_ricavi': 'Other operating revenues',
    'ricavi_finanziari': 'Financial income'
  }
  return descriptions[key] || 'Operating revenue'
}
</script>
