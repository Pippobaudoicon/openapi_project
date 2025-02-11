<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from "@/stores/companyStore";

const store = useCompanyStore();
const router = useRouter();
const vat = ref('');
const companyType = ref('advance'); // Valore predefinito
const loading = ref(false);

const searchCompany = async () => {
    if (!vat.value) {
        alert("Inserisci una Partita IVA!");
        return;
    }
    loading.value = true; // Mostra il caricamento
    const requestOptions = {
        method: "GET",
        redirect: "follow",
        credentials: 'include'
    };
    try {
        // Effettua la chiamata API
        const response = await fetch(`http://localhost:3000/api/v1/IT-${companyType.value}/${vat.value}`, requestOptions);
        if (!response.ok) {
            throw new Error("Errore nella richiesta API");
        }
        const data = await response.json(); 
        console.log(data);
        store.setCompanyData(data);
        // Naviga alla pagina corretta con i dati ricevuti
        const routeName = companyType.value === 'advanced' ? 'company-advance' : 'company-full';
        router.push({
            name: routeName,
            params: { vat: vat.value },
        });
    } catch (error) {
        alert("Errore nel recupero dati: " + error.message);
    } finally {
        loading.value = false; 
    }
};
</script>

<template>
    <div class="gray-bkg h-full text-sm">
        <div class="flex flex-col items-center justify-center h-full">
            <div>
                <div class="text-7xl italic-font light-blue-txt mb-6">
                    Ricerca Ora
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
                <div class="flex justify-between py-5">
                    <div>
                        <input 
                            type="radio" 
                            id="advanced" 
                            name="company" 
                            value="advanced" 
                            v-model="companyType"
                        >
                        <span class="ml-2 font-bold">Company Advanced</span>
                    </div>
                    <div>
                        <input 
                            type="radio" 
                            id="full" 
                            name="company" 
                            value="full" 
                            v-model="companyType"
                        >
                        <span class="ml-2 font-bold">Company Full</span>
                    </div>
                </div>
                <button 
                    @click="searchCompany" 
                    class="w-full text-center light-blue-bkg text-white py-2 cursor-pointer uppercase main-font" 
                    :disabled="loading"
                >
                    {{ loading ? "Caricamento..." : "Avvia Ricerca" }}
                </button>
            </div>
        </div>
    </div>
</template>
