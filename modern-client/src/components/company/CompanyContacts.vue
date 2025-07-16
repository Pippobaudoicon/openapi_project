<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Email -->
      <div v-if="email" class="contact-item">
        <div class="contact-icon bg-blue-100">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Email</dt>
          <dd class="text-sm text-gray-900">
            <a :href="`mailto:${email}`" class="text-blue-600 hover:text-blue-800">{{ email }}</a>
          </dd>
        </div>
      </div>

      <!-- PEC -->
      <div v-if="pec" class="contact-item">
        <div class="contact-icon bg-green-100">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">PEC (Certified Email)</dt>
          <dd class="text-sm text-gray-900">
            <a :href="`mailto:${pec}`" class="text-green-600 hover:text-green-800">{{ pec }}</a>
          </dd>
        </div>
      </div>

      <!-- Phone -->
      <div v-if="phone" class="contact-item">
        <div class="contact-icon bg-purple-100">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Phone</dt>
          <dd class="text-sm text-gray-900">
            <a :href="`tel:${phone}`" class="text-purple-600 hover:text-purple-800">{{ phone }}</a>
          </dd>
        </div>
      </div>

      <!-- Fax -->
      <div v-if="fax" class="contact-item">
        <div class="contact-icon bg-gray-100">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m4 0H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/>
          </svg>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Fax</dt>
          <dd class="text-sm text-gray-900">{{ fax }}</dd>
        </div>
      </div>

      <!-- Website -->
      <div v-if="website" class="contact-item">
        <div class="contact-icon bg-indigo-100">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
          </svg>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Website</dt>
          <dd class="text-sm text-gray-900">
            <a :href="formatWebsiteUrl(website)" target="_blank" rel="noopener noreferrer" 
               class="text-indigo-600 hover:text-indigo-800 flex items-center">
              {{ website }}
              <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </dd>
        </div>
      </div>

      <!-- SDI Code -->
      <div v-if="sdiCode" class="contact-item">
        <div class="contact-icon bg-amber-100">
          <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">SDI Code</dt>
          <dd class="text-sm text-gray-900 font-mono">{{ sdiCode }}</dd>
        </div>
      </div>
    </div>

    <!-- Social Media & Additional Links -->
    <div v-if="socialMedia.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-md font-medium text-gray-700 mb-4">Social Media & Links</h4>
      <div class="flex flex-wrap gap-3">
        <a v-for="social in socialMedia" :key="social.platform" 
           :href="social.url" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors"
           :class="social.className">
          <component :is="social.icon" class="w-4 h-4 mr-2" />
          {{ social.platform }}
        </a>
      </div>
    </div>

    <!-- No Contact Data -->
    <div v-if="!hasContactData" class="text-center py-8 text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      <p>No contact information available</p>
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

// Extract email
const email = computed(() => {
  return props.data?.email || 
         props.data?.mail?.email || 
         props.data?.contatti?.email ||
         null
})

// Extract PEC
const pec = computed(() => {
  return props.data?.pec || 
         props.data?.pec_address ||
         props.data?.domicilio_digitale ||
         null
})

// Extract phone
const phone = computed(() => {
  return props.data?.telefono || 
         props.data?.phone ||
         props.data?.contacts?.telephoneNumber ||
         props.data?.contatti?.telefono ||
         null
})

// Extract fax
const fax = computed(() => {
  return props.data?.fax || 
         props.data?.contacts?.fax ||
         props.data?.contatti?.fax ||
         null
})

// Extract website
const website = computed(() => {
  return props.data?.sito_web || 
         props.data?.website ||
         props.data?.webAndSocial?.website ||
         null
})

// Extract SDI code
const sdiCode = computed(() => {
  return props.data?.sdiCode || 
         props.data?.codice_sdi ||
         props.data?.sdi ||
         null
})

// Extract social media
const socialMedia = computed(() => {
  const socials = []
  
  // Facebook
  const facebook = props.data?.webAndSocial?.facebook || props.data?.facebook
  if (facebook) {
    socials.push({
      platform: 'Facebook',
      url: facebook,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      icon: 'facebook-icon'
    })
  }
  
  // LinkedIn
  const linkedin = props.data?.webAndSocial?.linkedin || props.data?.linkedin
  if (linkedin) {
    socials.push({
      platform: 'LinkedIn',
      url: linkedin,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      icon: 'linkedin-icon'
    })
  }
  
  // Twitter
  const twitter = props.data?.webAndSocial?.twitter || props.data?.twitter
  if (twitter) {
    socials.push({
      platform: 'Twitter',
      url: twitter,
      className: 'bg-sky-100 text-sky-800 hover:bg-sky-200',
      icon: 'twitter-icon'
    })
  }
  
  return socials
})

// Check if any contact data is available
const hasContactData = computed(() => 
  email.value || 
  pec.value || 
  phone.value || 
  fax.value || 
  website.value || 
  sdiCode.value || 
  socialMedia.value.length > 0
)

// Utility functions
const formatWebsiteUrl = (url) => {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}
</script>

<style scoped>
.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.contact-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
