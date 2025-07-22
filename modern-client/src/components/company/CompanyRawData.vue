<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">Raw Data</h3>
      <button
        @click="toggleExpanded"
        class="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center"
      >
        {{ isExpanded ? 'Hide' : 'Show' }} Raw Data
        <svg 
          class="w-4 h-4 ml-1 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </div>
    
    <div v-if="isExpanded" class="space-y-4">
      <!-- Search within raw data -->
      <div class="flex items-center space-x-3">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search in raw data..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          @click="copyToClipboard"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-medium text-gray-700 transition-colors"
        >
          Copy JSON
        </button>
      </div>
      
      <!-- Raw data display -->
      <div class="relative">
        <pre class="bg-gray-50 rounded-lg p-4 text-xs overflow-auto max-h-96 font-mono" v-html="formattedData"></pre>
        
        <!-- Copy success notification -->
        <div v-if="showCopySuccess" 
             class="absolute top-2 right-2 bg-green-100 border border-green-300 rounded-md px-3 py-1 text-xs text-green-800">
          Copied!
        </div>
      </div>
      
      <!-- Data summary -->
      <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Data Summary</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span class="text-blue-600 font-medium">Total Keys:</span>
            <span class="text-blue-900 ml-1">{{ totalKeys }}</span>
          </div>
          <div>
            <span class="text-blue-600 font-medium">Data Type:</span>
            <span class="text-blue-900 ml-1">{{ dataType }}</span>
          </div>
          <div>
            <span class="text-blue-600 font-medium">Size:</span>
            <span class="text-blue-900 ml-1">{{ dataSize }}</span>
          </div>
          <div>
            <span class="text-blue-600 font-medium">Arrays:</span>
            <span class="text-blue-900 ml-1">{{ arrayCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  dataType: {
    type: String,
    default: 'unknown'
  }
})

const isExpanded = ref(false)
const searchTerm = ref('')
const showCopySuccess = ref(false)

// Toggle expanded state
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Update the filterObjectBySearchTerm function to ensure it works correctly
const filterObjectBySearchTerm = (obj, searchTerm) => {
  if (!obj || typeof obj !== 'object') return obj;

  const result = Array.isArray(obj) ? [] : {};
  let hasMatches = false;

  for (const [key, value] of Object.entries(obj)) {
    const keyMatches = key.toLowerCase().includes(searchTerm);
    const valueMatches =
      typeof value === 'string' && value.toLowerCase().includes(searchTerm);

    if (keyMatches || valueMatches) {
      result[key] = value;
      hasMatches = true;
    } else if (typeof value === 'object' && value !== null) {
      const filteredValue = filterObjectBySearchTerm(value, searchTerm);
      if (Array.isArray(value)) {
        const filteredArray = value.filter((item) =>
          typeof item === 'object'
            ? Object.keys(filterObjectBySearchTerm(item, searchTerm)).length > 0
            : String(item).toLowerCase().includes(searchTerm)
        );
        if (filteredArray.length > 0) {
          result[key] = filteredArray;
          hasMatches = true;
        }
      } else if (Object.keys(filteredValue).length > 0) {
        result[key] = filteredValue;
        hasMatches = true;
      }
    }
  }

  return hasMatches ? result : {};
};

// Add a function to highlight the search term in the raw data
const highlightSearchTerm = (data, searchTerm) => {
  if (!searchTerm.trim()) return data;

  const term = searchTerm.toLowerCase();
  const highlight = (text) =>
    text.replace(new RegExp(`(${term})`, 'gi'), '<mark>$1</mark>');

  const traverseAndHighlight = (obj) => {
    if (typeof obj === 'string') {
      return highlight(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(traverseAndHighlight);
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          highlight(key),
          traverseAndHighlight(value),
        ])
      );
    }
    return obj;
  };

  return traverseAndHighlight(data);
};

// Format and filter data based on search term
const formattedData = computed(() => {
  let dataToShow = props.data;

  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase();
    dataToShow = filterObjectBySearchTerm(props.data, term);
    dataToShow = highlightSearchTerm(dataToShow, term);
  }

  return JSON.stringify(dataToShow, null, 2).replace(/\"<mark>(.*?)<\/mark>\"/g, '<mark>$1</mark>');
})

// Calculate data statistics
const totalKeys = computed(() => {
  return countKeys(props.data)
})

const dataSize = computed(() => {
  const jsonString = JSON.stringify(props.data)
  const sizeInBytes = new Blob([jsonString]).size
  
  if (sizeInBytes < 1024) return `${sizeInBytes} B`
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
})

const arrayCount = computed(() => {
  return countArrays(props.data)
})

// Copy JSON to clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.data, null, 2))
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = JSON.stringify(props.data, null, 2)
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  }
}

// Utility functions
const countKeys = (obj, count = 0) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        count = countKeys(item, count)
      })
    } else {
      count += Object.keys(obj).length
      Object.values(obj).forEach(value => {
        count = countKeys(value, count)
      })
    }
  }
  return count
}

const countArrays = (obj, count = 0) => {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      count++
      obj.forEach(item => {
        count = countArrays(item, count)
      })
    } else {
      Object.values(obj).forEach(value => {
        count = countArrays(value, count)
      })
    }
  }
  return count
}
</script>
