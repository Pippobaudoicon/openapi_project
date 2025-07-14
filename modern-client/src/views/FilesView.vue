<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between" v-motion-slide-visible-once-top>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">File Manager</h1>
        <p class="text-gray-600 mt-1">Manage your downloaded reports and documents</p>
      </div>
      
      <button class="btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Upload File
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6" v-motion-slide-visible-once-bottom>
      <div class="card text-center">
        <div class="text-2xl font-bold text-gray-900">24</div>
        <div class="text-sm text-gray-600">Total Files</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-blue-600">12</div>
        <div class="text-sm text-gray-600">Reports</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-green-600">8</div>
        <div class="text-sm text-gray-600">Documents</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold text-orange-600">156 MB</div>
        <div class="text-sm text-gray-600">Storage Used</div>
      </div>
    </div>

    <!-- File List -->
    <div class="card" v-motion-fade-visible-once>
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">Recent Files</h3>
        <div class="flex items-center space-x-3">
          <select class="text-sm border border-gray-200 rounded-lg px-3 py-2">
            <option>All Files</option>
            <option>Reports</option>
            <option>Documents</option>
          </select>
          <button class="text-sm text-primary-600 hover:text-primary-500 font-medium">
            View All →
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="file in sampleFiles"
          :key="file.id"
          class="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
        >
          <div class="flex items-center space-x-4">
            <div :class="[
              'w-10 h-10 rounded-lg flex items-center justify-center',
              getFileTypeColor(file.type)
            ]">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getFileIcon(file.type)" />
              </svg>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900">{{ file.name }}</h4>
              <p class="text-sm text-gray-600">{{ file.size }} • {{ file.date }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button class="p-2 text-gray-400 hover:text-primary-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button class="p-2 text-gray-400 hover:text-red-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sampleFiles = ref([
  {
    id: 1,
    name: 'Company_Report_12345678901.pdf',
    type: 'pdf',
    size: '2.4 MB',
    date: '2 hours ago'
  },
  {
    id: 2,
    name: 'Visure_Report_98765432109.zip',
    type: 'archive',
    size: '1.2 MB',
    date: '1 day ago'
  },
  {
    id: 3,
    name: 'Search_Results_Export.xlsx',
    type: 'spreadsheet',
    size: '856 KB',
    date: '3 days ago'
  }
])

const getFileTypeColor = (type) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-500'
    case 'archive':
      return 'bg-orange-500'
    case 'spreadsheet':
      return 'bg-green-500'
    case 'document':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    case 'archive':
      return 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
    case 'spreadsheet':
      return 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2'
    default:
      return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  }
}
</script>
