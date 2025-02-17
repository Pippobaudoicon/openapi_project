<script setup>
import { ref, onMounted } from 'vue';

const data = ref(null);
const baseUrl = 'http://localhost:3000/api/v1/';
const endUrl = '/allegati';

const businessReport = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/v1/visure', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const result = await response.json();
        data.value = result.data;
    } catch (error) {
        alert(error.message);
    }
};

const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Converti in millisecondi
    return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

onMounted(() => {
    businessReport();
});
</script>

<template>
    <div class="gray-bkg h-full text-sm">
        <div class="p-12 h-custom overflow-auto">
            <div class="flex flex-col flex-wrap gap-1.5 md:flex-row">
                <div v-for="item in data" class="bg-white px-4 md:px-12 py-8">
                    <div class="mb-2 font-semibold text-md md:text-lg">
                        Partita IVA - {{ item.data.cf_piva_id }}
                    </div>
                    <div class="text-md mb-1 font-semibold">
                        Visura - {{ item.data.tipo }}
                    </div>
                    <div class="text-md mb-1 font-semibold">
                        Ultima estrazione - {{ formatDate(item.data.timestamp_creation) }}
                    </div>
                    <div class="text-md mb-1 font-semibold text-gray-400">
                        Status - {{ item.status }}
                    </div>
                    <a :href="`${baseUrl}${item.data.tipo}/${item.requestId}${endUrl}`">
                        <button 
                            :class="{ 'opacity-50 cursor-not-allowed': item.status === 'pending', 'cursor-pointer': item.status !== 'pending' }"
                            :disabled="item.status === 'pending'"
                            class="w-full text-center light-blue-bkg text-white py-2 uppercase main-font" 
                        >
                            scarica allegato
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.h-custom {
    height: 65vh;
}
</style>