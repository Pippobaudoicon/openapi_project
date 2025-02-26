<script setup>
import { ref, onMounted } from 'vue';

const data = ref([]);
const filteredData = ref([]);
const vat = ref('');
const selectedTipo = ref('');
const selectedStatus = ref('');
const loading = ref(false);
const baseUrl = 'http://localhost:3000/api/v1/';
const endUrl = '/allegati';

const vatExport = ref('');
const visuraExport = ref('');

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
        filteredData.value = result.data;
    } catch (error) {
        alert(error.message);
    }
};

const newExport = async () => {
    try {
        const response = await fetch(`${baseUrl}${visuraExport.value}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                piva: vatExport.value,
            })
        });
        const result = await response.json();
        if (response.ok) {
            alert('Export created successfully');
        } else {
            alert('Export failed: ' + result.message);
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
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

const startSearch = () => {
    loading.value = true;
    filteredData.value = data.value.filter(item => {
        const matchesVat = vat.value ? item.data.cf_piva_id.includes(vat.value) : true;
        const matchesTipo = selectedTipo.value ? item.data.tipo === selectedTipo.value : true;
        const matchesStatus = selectedStatus.value ? item.status === selectedStatus.value : true;
        return matchesVat && matchesTipo && matchesStatus;
    });
    loading.value = false;
};

const resetFilters = () => {
    vat.value = '';
    selectedTipo.value = '';
    selectedStatus.value = '';
    filteredData.value = data.value;
}

onMounted(() => {
    businessReport();
});
</script>

<template>
    <div class="gray-bkg h-full text-sm">
        <div class="flex flex-col md:flex-row items-start">
            <div class="p-12 w-96 flex flex-col gap-4">
                <div class="text-5xl italic-font light-blue-txt mb-6">
                    Filtra per
                </div>
                <div class="border-b-2 px-2 py-1 border-gray-500">
                    <input 
                        id="vat" 
                        name="vat" 
                        type="text" 
                        v-model="vat" 
                        autocomplete="vat" 
                        required 
                        class="w-full focus:outline-none placeholder-black font-bold" 
                        placeholder="Partita IVA"
                    >
                </div>
                <div class="border-b-2 px-2 py-1 font-bold border-gray-500">
                    <select v-model="selectedTipo" class="w-full focus:outline-none">
                        <option value="">Visura</option>
                        <option v-for="(tipo, index) in [...new Set(data.map(item => item.data.tipo))]" :key="index" :value="tipo">
                            {{ tipo }}
                        </option>
                    </select>
                </div>
                <div class="border-b-2 px-2 py-1 font-bold border-gray-500">
                    <select v-model="selectedStatus" class="w-full focus:outline-none">
                        <option value="">Stato</option>
                        <option v-for="item in data" :key="item.status" :value="item.status">
                            {{ item.status }}
                        </option>
                    </select>
                </div>
                <button 
                    @click="startSearch" 
                    class="w-full text-center light-blue-bkg text-white py-2 cursor-pointer uppercase main-font" 
                    :disabled="loading"
                >
                    {{ loading ? "Caricamento..." : "Avvia Ricerca" }}
                </button>
                <button 
                    @click="resetFilters" 
                    class="w-full text-center bg-red-900 text-white py-2 cursor-pointer uppercase main-font" 
                >
                    reset
                </button>
                <div class="bg-white px-4 py-8">
                    <form class="flex flex-col gap-4" @submit.prevent="newExport">
                        <div class="border-b-2 px-2 py-1 border-gray-500">
                            <input 
                                id="vatExport" 
                                name="vatExport" 
                                type="text" 
                                v-model="vatExport" 
                                autocomplete="vatExport" 
                                required 
                                class="w-full focus:outline-none placeholder-black font-bold" 
                                placeholder="Partita IVA"
                            >
                        </div>
                        <div class="border-b-2 px-2 py-1 font-bold border-gray-500">
                            <select v-model="visuraExport" class="w-full focus:outline-none">
                                <option value="">Visura</option>
                                <option value="bilancio-ottico">
                                    Bilancio Ottico
                                </option>
                            </select>
                        </div>    
                        <button class="w-full text-center light-blue-bkg text-white py-2 uppercase main-font cursor-pointer">
                            nuova esportazione
                        </button>
                    </form>
                </div>
            </div>
            <div class="p-12 h-custom overflow-auto">
                <div class="flex flex-col flex-wrap gap-1.5 md:flex-row">
                    <div v-for="item in filteredData" :key="item.requestId" class="bg-white px-4 md:px-12 py-8">
                        <div class="mb-2 font-semibold text-md md:text-lg">
                            Partita IVA - {{ item.data.cf_piva_id }}
                        </div>
                        <div class="text-md mb-1 font-semibold">
                            Visura - {{ item.data.tipo }}
                        </div>
                        <div class="text-md mb-1 font-semibold">
                            Ultima estrazione - {{ formatDate(item.data.timestamp_creation) }}
                        </div>
                        <div class="text-md mb-1 font-semibold text-gray-400 flex items-center gap-3 py-2">
                            <span class="w-4 aspect-square rounded-custom inline-block" :class="{'bg-red-500':item.status === 'pending' , 'bg-green-600':item.status != 'pending'}"></span> Status - {{ item.status }}
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
    </div>
</template>

<style lang="scss" scoped>
.h-custom {
    height: 65vh;
}
.rounded-custom {
    border-radius: 50%;
}
</style>