<script setup>
import Header from "@/components/header/Header.vue";
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const companyData = computed(() => history.state.companyData || {});

</script>

<template>
    <div class="h-screen flex flex-col">
        <div>
            <Header />
        </div>
        <div class="grow">
            <div v-if="Object.keys(companyData).length">
            <p><strong>Nome:</strong> {{ companyData.name }}</p>
            <p><strong>Indirizzo:</strong> {{ companyData.address }}</p>
            <p><strong>Settore:</strong> {{ companyData.industry }}</p>
            <!-- Aggiungi altri campi in base alla risposta dell'API -->
        </div>
        </div>
    </div>
</template>

