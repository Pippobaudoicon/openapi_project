<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Corporate Structure</h3>
    
    <!-- Corporate Groups -->
    <div v-if="corporateGroups.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Corporate Groups</h4>
      <div class="space-y-3">
        <div v-for="group in corporateGroups" :key="group.id || group.name" 
             class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h5 class="text-sm font-medium text-gray-900">{{ group.name }}</h5>
              <p v-if="group.type" class="text-sm text-gray-600">{{ group.type }}</p>
              <p v-if="group.description" class="text-xs text-gray-500 mt-1">{{ group.description }}</p>
            </div>
            <div v-if="group.role" class="text-right">
              <span class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {{ group.role }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subsidiaries -->
    <div v-if="subsidiaries.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Subsidiaries & Controlled Companies</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="subsidiary in subsidiaries" :key="subsidiary.id || subsidiary.name" 
             class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m-2 0h2m0 0h4m6 0h2m-7-4v-9m-4 0v9"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-gray-900 truncate">{{ subsidiary.name }}</h5>
              <p v-if="subsidiary.taxCode" class="text-xs text-gray-500">{{ subsidiary.taxCode }}</p>
              <p v-if="subsidiary.percentage" class="text-xs text-green-600 font-medium">
                {{ subsidiary.percentage }}% controlled
              </p>
              <p v-if="subsidiary.relationship" class="text-xs text-gray-500">{{ subsidiary.relationship }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parent Companies -->
    <div v-if="parentCompanies.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Parent Companies</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="parent in parentCompanies" :key="parent.id || parent.name" 
             class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-gray-900 truncate">{{ parent.name }}</h5>
              <p v-if="parent.taxCode" class="text-xs text-gray-500">{{ parent.taxCode }}</p>
              <p v-if="parent.percentage" class="text-xs text-purple-600 font-medium">
                {{ parent.percentage }}% ownership
              </p>
              <p v-if="parent.relationship" class="text-xs text-gray-500">{{ parent.relationship }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Affiliated Companies -->
    <div v-if="affiliatedCompanies.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Affiliated Companies</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="affiliate in affiliatedCompanies" :key="affiliate.id || affiliate.name" 
             class="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <h6 class="text-sm font-medium text-gray-900 truncate">{{ affiliate.name }}</h6>
          <p v-if="affiliate.taxCode" class="text-xs text-gray-500">{{ affiliate.taxCode }}</p>
          <p v-if="affiliate.relationship" class="text-xs text-amber-600">{{ affiliate.relationship }}</p>
        </div>
      </div>
    </div>

    <!-- Branches -->
    <div v-if="branches.length > 0" class="mb-6">
      <h4 class="text-md font-medium text-gray-700 mb-4">Branches & Offices</h4>
      <div class="space-y-2">
        <div v-for="branch in branches" :key="branch.id || branch.address" 
             class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h6 class="text-sm font-medium text-gray-900">{{ branch.name || 'Branch Office' }}</h6>
              <p v-if="branch.address" class="text-xs text-gray-600">{{ branch.address }}</p>
            </div>
            <div v-if="branch.type" class="text-xs text-gray-500">{{ branch.type }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="hasStructureData" class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Corporate Structure Summary</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div v-if="subsidiaries.length > 0">
          <div class="text-lg font-semibold text-green-600">{{ subsidiaries.length }}</div>
          <div class="text-xs text-gray-500">Subsidiaries</div>
        </div>
        <div v-if="parentCompanies.length > 0">
          <div class="text-lg font-semibold text-purple-600">{{ parentCompanies.length }}</div>
          <div class="text-xs text-gray-500">Parent Companies</div>
        </div>
        <div v-if="affiliatedCompanies.length > 0">
          <div class="text-lg font-semibold text-amber-600">{{ affiliatedCompanies.length }}</div>
          <div class="text-xs text-gray-500">Affiliates</div>
        </div>
        <div v-if="branches.length > 0">
          <div class="text-lg font-semibold text-gray-600">{{ branches.length }}</div>
          <div class="text-xs text-gray-500">Branches</div>
        </div>
      </div>
    </div>

    <!-- No Structure Data -->
    <div v-if="!hasStructureData" class="text-center py-8 text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m-2 0h2m0 0h4m6 0h2m-7-4v-9m-4 0v9"/>
      </svg>
      <p>No corporate structure information available</p>
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

// Extract corporate groups
const corporateGroups = computed(() => {
  const groups = []
  
  // For full data
  if (props.data?.gruppi_societari && Array.isArray(props.data.gruppi_societari)) {
    props.data.gruppi_societari.forEach(gruppo => {
      groups.push({
        name: gruppo.denominazione || gruppo.nome || 'N/A',
        type: gruppo.tipo || 'Corporate Group',
        role: gruppo.ruolo || gruppo.posizione,
        description: gruppo.descrizione,
        id: gruppo.id
      })
    })
  }
  
  // For advanced data
  if (props.data?.corporateGroups) {
    if (Array.isArray(props.data.corporateGroups)) {
      props.data.corporateGroups.forEach(group => {
        groups.push({
          name: group.groupName || group.name || 'N/A',
          type: 'Corporate Group',
          role: group.role,
          description: group.description,
          id: group.id
        })
      })
    } else if (props.data.corporateGroups.groupName) {
      groups.push({
        name: props.data.corporateGroups.groupName,
        type: 'Corporate Group',
        role: props.data.corporateGroups.role,
        id: 'main-group'
      })
    }
  }
  
  return groups
})

// Extract subsidiaries
const subsidiaries = computed(() => {
  const subs = []
  
  // For full data
  if (props.data?.controllate && Array.isArray(props.data.controllate)) {
    props.data.controllate.forEach(controllata => {
      subs.push({
        name: controllata.denominazione || controllata.nome || 'N/A',
        taxCode: controllata.codice_fiscale || controllata.partita_iva,
        percentage: controllata.percentuale || controllata.quota_controllo,
        relationship: 'Subsidiary',
        id: controllata.id
      })
    })
  }
  
  // For advanced data
  if (props.data?.subsidiaries && Array.isArray(props.data.subsidiaries)) {
    props.data.subsidiaries.forEach(sub => {
      subs.push({
        name: sub.companyName || sub.name || 'N/A',
        taxCode: sub.taxCode || sub.vatNumber,
        percentage: sub.controlPercentage || sub.percentage,
        relationship: 'Subsidiary',
        id: sub.id
      })
    })
  }
  
  return subs
})

// Extract parent companies
const parentCompanies = computed(() => {
  const parents = []
  
  // For full data
  if (props.data?.societa_controllanti && Array.isArray(props.data.societa_controllanti)) {
    props.data.societa_controllanti.forEach(controllante => {
      parents.push({
        name: controllante.denominazione || controllante.nome || 'N/A',
        taxCode: controllante.codice_fiscale || controllante.partita_iva,
        percentage: controllante.percentuale || controllante.quota_possesso,
        relationship: 'Parent Company',
        id: controllante.id
      })
    })
  }
  
  // For advanced data, extract from shareholders if they have control
  if (props.data?.shareholders && Array.isArray(props.data.shareholders)) {
    props.data.shareholders.forEach(shareholder => {
      if (shareholder.shareholdersInformation && Array.isArray(shareholder.shareholdersInformation)) {
        shareholder.shareholdersInformation.forEach(info => {
          if (info.percentage && info.percentage > 50) { // Majority ownership = parent
            parents.push({
              name: info.companyName || info.name || 'N/A',
              taxCode: info.taxCode || info.vatNumber,
              percentage: info.percentage,
              relationship: 'Parent Company',
              id: info.id
            })
          }
        })
      }
    })
  }
  
  return parents
})

// Extract affiliated companies
const affiliatedCompanies = computed(() => {
  const affiliates = []
  
  // For full data
  if (props.data?.societa_collegate && Array.isArray(props.data.societa_collegate)) {
    props.data.societa_collegate.forEach(collegata => {
      affiliates.push({
        name: collegata.denominazione || collegata.nome || 'N/A',
        taxCode: collegata.codice_fiscale || collegata.partita_iva,
        relationship: 'Affiliated Company',
        id: collegata.id
      })
    })
  }
  
  // For advanced data
  if (props.data?.affiliationCompanies && Array.isArray(props.data.affiliationCompanies)) {
    props.data.affiliationCompanies.forEach(affiliate => {
      affiliates.push({
        name: affiliate.companyName || affiliate.name || 'N/A',
        taxCode: affiliate.taxCode || affiliate.vatNumber,
        relationship: 'Affiliated Company',
        id: affiliate.id
      })
    })
  }
  
  return affiliates
})

// Extract branches
const branches = computed(() => {
  const branchList = []
  
  // For full data
  if (props.data?.sedi_secondarie && Array.isArray(props.data.sedi_secondarie)) {
    props.data.sedi_secondarie.forEach(sede => {
      branchList.push({
        name: sede.denominazione || 'Branch Office',
        address: formatAddress(sede.indirizzo || sede),
        type: sede.tipo || 'Secondary Office',
        id: sede.id
      })
    })
  }
  
  // For advanced data
  if (props.data?.branches) {
    if (props.data.branches.numberOfBranches && props.data.branches.numberOfBranches > 0) {
      // If we only have the number, create placeholder entries
      for (let i = 1; i <= Math.min(props.data.branches.numberOfBranches, 5); i++) {
        branchList.push({
          name: `Branch Office ${i}`,
          address: 'Address not specified',
          type: 'Branch',
          id: `branch-${i}`
        })
      }
    } else if (Array.isArray(props.data.branches)) {
      props.data.branches.forEach(branch => {
        branchList.push({
          name: branch.name || 'Branch Office',
          address: formatAddress(branch.address),
          type: branch.type || 'Branch',
          id: branch.id
        })
      })
    }
  }
  
  return branchList
})

// Check if any structure data is available
const hasStructureData = computed(() => 
  corporateGroups.value.length > 0 || 
  subsidiaries.value.length > 0 || 
  parentCompanies.value.length > 0 || 
  affiliatedCompanies.value.length > 0 || 
  branches.value.length > 0
)

// Utility functions
const formatAddress = (address) => {
  if (!address) return 'N/A'
  if (typeof address === 'string') return address
  
  const parts = []
  if (address.via) parts.push(address.via)
  if (address.civico) parts.push(address.civico)
  if (address.comune) parts.push(address.comune)
  if (address.provincia) parts.push(`(${address.provincia})`)
  
  return parts.length > 0 ? parts.join(' ') : 'N/A'
}
</script>
