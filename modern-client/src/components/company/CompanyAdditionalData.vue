<template>
  <div v-if="hasAdditionalData" class="space-y-6">
    <!-- Business Activities & Classifications -->
    <div v-if="businessActivities.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Business Activities & Classifications</h3>
      
      <!-- Primary ATECO -->
      <div v-if="primaryAteco" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 class="font-medium text-blue-900 mb-2">Primary Activity</h4>
        <div class="text-sm text-blue-800">
          <span class="font-mono">{{ primaryAteco.code }}</span> - {{ primaryAteco.description }}
        </div>
      </div>
      
      <!-- Secondary Activities -->
      <div v-if="secondaryActivities.length > 0" class="mb-6">
        <h4 class="font-medium text-gray-700 mb-3">Secondary Activities</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="activity in secondaryActivities" :key="activity.code" 
               class="p-3 bg-gray-50 rounded-lg border">
            <div class="text-sm font-mono text-gray-600">{{ activity.code }}</div>
            <div class="text-sm text-gray-800">{{ activity.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legal & Regulatory Information -->
    <div v-if="legalInfo.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Legal & Regulatory Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="info in legalInfo" :key="info.label" class="space-y-2">
          <dt class="text-sm font-medium text-gray-500">{{ info.label }}</dt>
          <dd class="text-sm text-gray-900" :class="info.className">{{ info.value }}</dd>
        </div>
      </div>
    </div>

    <!-- Bank & Financial Institutions -->
    <div v-if="bankInfo.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Banking & Financial Information</h3>
      
      <div class="space-y-4">
        <div v-for="bank in bankInfo" :key="bank.name" 
             class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div>
            <div class="font-medium text-green-900">{{ bank.name }}</div>
            <div class="text-sm text-green-700">{{ bank.type }}</div>
          </div>
          <div v-if="bank.details" class="text-sm text-green-600">{{ bank.details }}</div>
        </div>
      </div>
    </div>

    <!-- Certifications & Qualifications -->
    <div v-if="certifications.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Certifications & Qualifications</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="cert in certifications" :key="cert.name" 
             class="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div class="flex items-start justify-between">
            <div>
              <div class="font-medium text-purple-900">{{ cert.name }}</div>
              <div class="text-sm text-purple-700">{{ cert.description }}</div>
              <div v-if="cert.issueDate" class="text-xs text-purple-600 mt-1">
                Issued: {{ formatDate(cert.issueDate) }}
              </div>
            </div>
            <span v-if="cert.status" 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="cert.statusClass">
              {{ cert.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Public Contracts & Tenders -->
    <div v-if="publicContracts.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Public Contracts & Tenders</h3>
      
      <div class="space-y-4">
        <div v-for="contract in publicContracts" :key="contract.id" 
             class="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium text-amber-900">{{ contract.title }}</div>
              <div class="text-sm text-amber-700">{{ contract.authority }}</div>
              <div class="text-xs text-amber-600 mt-1">
                {{ formatDate(contract.date) }} • {{ contract.type }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold text-amber-900">{{ formatCurrency(contract.value) }}</div>
              <div class="text-xs text-amber-600">{{ contract.status }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- International Trade -->
    <div v-if="internationalTrade" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">International Trade Activity</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-if="internationalTrade.isImporter" class="bg-blue-50 rounded-lg p-4">
          <div class="text-sm font-medium text-blue-600">Import Activity</div>
          <div class="text-lg font-semibold text-blue-900">Active Importer</div>
          <div v-if="internationalTrade.importCountries" class="text-xs text-blue-600">
            {{ internationalTrade.importCountries.join(', ') }}
          </div>
        </div>
        
        <div v-if="internationalTrade.isExporter" class="bg-green-50 rounded-lg p-4">
          <div class="text-sm font-medium text-green-600">Export Activity</div>
          <div class="text-lg font-semibold text-green-900">Active Exporter</div>
          <div v-if="internationalTrade.exportCountries" class="text-xs text-green-600">
            {{ internationalTrade.exportCountries.join(', ') }}
          </div>
        </div>
        
        <div v-if="internationalTrade.tradeVolume" class="bg-purple-50 rounded-lg p-4">
          <div class="text-sm font-medium text-purple-600">Trade Volume</div>
          <div class="text-lg font-semibold text-purple-900">{{ formatCurrency(internationalTrade.tradeVolume) }}</div>
        </div>
        
        <div v-if="internationalTrade.mainMarkets" class="bg-amber-50 rounded-lg p-4">
          <div class="text-sm font-medium text-amber-600">Main Markets</div>
          <div class="text-sm text-amber-900">{{ internationalTrade.mainMarkets.join(', ') }}</div>
        </div>
      </div>
    </div>

    <!-- Innovation & Technology -->
    <div v-if="innovationInfo" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Innovation & Technology</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-if="innovationInfo.isInnovativeStartup" class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div class="text-sm font-medium text-blue-600">Innovation Status</div>
          <div class="text-lg font-semibold text-blue-900">Innovative Startup</div>
          <div class="text-xs text-blue-600">Certified innovative company</div>
        </div>
        
        <div v-if="innovationInfo.isInnovativeSME" class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div class="text-sm font-medium text-green-600">SME Status</div>
          <div class="text-lg font-semibold text-green-900">Innovative SME</div>
          <div class="text-xs text-green-600">Small-Medium Enterprise</div>
        </div>
        
        <div v-if="innovationInfo.hasPatents" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div class="text-sm font-medium text-purple-600">IP Portfolio</div>
          <div class="text-lg font-semibold text-purple-900">Patent Holder</div>
          <div class="text-xs text-purple-600">Intellectual property assets</div>
        </div>
      </div>
    </div>

    <!-- Operational Metrics -->
    <div v-if="operationalMetrics.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">Operational Metrics</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="metric in operationalMetrics" :key="metric.label" 
             class="bg-gray-50 rounded-lg p-4 border">
          <div class="text-sm font-medium text-gray-600">{{ metric.label }}</div>
          <div class="text-lg font-semibold text-gray-900">{{ metric.value }}</div>
          <div v-if="metric.note" class="text-xs text-gray-500">{{ metric.note }}</div>
        </div>
      </div>
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
    default: 'advanced'
  }
})

// Only show for full data
const isFullData = computed(() => props.dataType === 'full')

// Extract business activities
const businessActivities = computed(() => {
  const activities = []
  
  if (props.data?.classificazione_ateco) {
    activities.push({
      code: props.data.classificazione_ateco.codice || 'N/A',
      description: props.data.classificazione_ateco.descrizione || props.data.classificazione_ateco,
      primary: true
    })
  }
  
  if (props.data?.attivita_secondarie && Array.isArray(props.data.attivita_secondarie)) {
    props.data.attivita_secondarie.forEach(activity => {
      activities.push({
        code: activity.codice || 'N/A',
        description: activity.descrizione || activity,
        primary: false
      })
    })
  }
  
  return activities
})

const primaryAteco = computed(() => 
  businessActivities.value.find(activity => activity.primary)
)

const secondaryActivities = computed(() => 
  businessActivities.value.filter(activity => !activity.primary)
)

// Extract legal information
const legalInfo = computed(() => {
  const info = []
  
  if (props.data?.rea) info.push({ label: 'REA Number', value: props.data.rea })
  if (props.data?.numero_iscrizione) info.push({ label: 'Registration Number', value: props.data.numero_iscrizione })
  if (props.data?.data_iscrizione) info.push({ label: 'Registration Date', value: formatDate(props.data.data_iscrizione) })
  if (props.data?.durata_societa) info.push({ label: 'Company Duration', value: props.data.durata_societa })
  if (props.data?.oggetto_sociale) info.push({ label: 'Corporate Purpose', value: props.data.oggetto_sociale })
  if (props.data?.stato_liquidazione) {
    info.push({ 
      label: 'Liquidation Status', 
      value: props.data.stato_liquidazione,
      className: props.data.stato_liquidazione.toLowerCase().includes('liquidazione') ? 'text-red-600 font-medium' : ''
    })
  }
  
  return info
})

// Extract banking information
const bankInfo = computed(() => {
  const banks = []
  
  if (props.data?.banche && Array.isArray(props.data.banche)) {
    props.data.banche.forEach(bank => {
      banks.push({
        name: bank.denominazione || bank.nome || 'Bank',
        type: bank.tipo || 'Financial Institution',
        details: bank.dettagli || bank.codice
      })
    })
  }
  
  return banks
})

// Extract certifications
const certifications = computed(() => {
  const certs = []
  
  if (props.data?.certificazioni_soa) {
    certs.push({
      name: 'SOA Certification',
      description: 'Qualified for public works',
      status: props.data.certificazioni_soa.attiva ? 'Active' : 'Inactive',
      statusClass: props.data.certificazioni_soa.attiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      issueDate: props.data.certificazioni_soa.data_rilascio
    })
  }
  
  if (props.data?.certificazioni_qualita && Array.isArray(props.data.certificazioni_qualita)) {
    props.data.certificazioni_qualita.forEach(cert => {
      certs.push({
        name: cert.tipo || 'Quality Certification',
        description: cert.descrizione || 'Quality management system',
        status: cert.stato || 'Valid',
        statusClass: 'bg-blue-100 text-blue-800',
        issueDate: cert.data_rilascio
      })
    })
  }
  
  return certs
})

// Extract public contracts
const publicContracts = computed(() => {
  const contracts = []
  
  if (props.data?.gare_appalto && Array.isArray(props.data.gare_appalto)) {
    props.data.gare_appalto.forEach(contract => {
      contracts.push({
        id: contract.id || Math.random(),
        title: contract.oggetto || contract.descrizione || 'Public Contract',
        authority: contract.ente_appaltante || contract.stazione_appaltante || 'Public Authority',
        value: contract.importo || contract.valore,
        date: contract.data || contract.data_aggiudicazione,
        type: contract.tipo || 'Public Tender',
        status: contract.stato || 'Completed'
      })
    })
  }
  
  return contracts.slice(0, 5) // Show max 5 contracts
})

// Extract international trade info
const internationalTrade = computed(() => {
  const trade = props.data?.commercio_estero || props.data?.international_trade
  
  if (!trade) return null
  
  return {
    isImporter: trade.importatore || trade.is_importer,
    isExporter: trade.esportatore || trade.is_exporter,
    importCountries: trade.paesi_import || trade.import_countries || [],
    exportCountries: trade.paesi_export || trade.export_countries || [],
    tradeVolume: trade.volume_commercio || trade.trade_volume,
    mainMarkets: trade.mercati_principali || trade.main_markets || []
  }
})

// Extract innovation information
const innovationInfo = computed(() => {
  const data = props.data
  
  if (!data) return null
  
  return {
    isInnovativeStartup: data.startup_innovativa || data.is_innovative_startup,
    isInnovativeSME: data.pmi_innovativa || data.is_innovative_sme,
    hasPatents: data.brevetti || data.has_patents || (data.proprieta_intellettuale && data.proprieta_intellettuale.length > 0)
  }
})

// Extract operational metrics
const operationalMetrics = computed(() => {
  const metrics = []
  
  if (props.data?.superficie_aziendale) {
    metrics.push({
      label: 'Company Surface Area',
      value: `${props.data.superficie_aziendale} m²`,
      note: 'Total area'
    })
  }
  
  if (props.data?.numero_sedi) {
    metrics.push({
      label: 'Number of Offices',
      value: props.data.numero_sedi,
      note: 'Total locations'
    })
  }
  
  if (props.data?.capacita_produttiva) {
    metrics.push({
      label: 'Production Capacity',
      value: props.data.capacita_produttiva,
      note: 'Annual capacity'
    })
  }
  
  if (props.data?.numero_clienti) {
    metrics.push({
      label: 'Customer Base',
      value: props.data.numero_clienti.toLocaleString(),
      note: 'Active customers'
    })
  }
  
  return metrics
})

// Check if there's any additional data to show
const hasAdditionalData = computed(() => 
  isFullData.value && (
    businessActivities.value.length > 0 ||
    legalInfo.value.length > 0 ||
    bankInfo.value.length > 0 ||
    certifications.value.length > 0 ||
    publicContracts.value.length > 0 ||
    internationalTrade.value ||
    innovationInfo.value ||
    operationalMetrics.value.length > 0
  )
)

// Utility functions
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('it-IT')
  } catch {
    return dateStr
  }
}

const formatCurrency = (amount) => {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>
