<script setup>
import { useRoute } from 'vue-router';
import Header from "@/components/header/Header.vue";

const route = useRoute();

// Recupera i dati passati dalla pagina precedente
const companyData = route.state?.companyData || null;
console.log(companyData);
</script>

<template>
    <div class="h-screen flex flex-col">
        <div>
            <Header />
        </div>
        <div class="grow">
            
        </div>
    </div>
</template>
