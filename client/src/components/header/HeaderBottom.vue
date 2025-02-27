<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<template>
    <div class="text-center w-full light-blue-bkg">
        <ul class="uppercase flex justify-center gap-10 text-white px-2 md:px-0 text-xs md:text-sm py-5">
            <li><router-link :to="{ name: 'dashboard' }" :class="{ 'font-bold scale-110 block': route.name === 'dashboard' }"> estrazione dati </router-link></li>
            <li><router-link :to="{ name: 'business-report' }" :class="{ 'font-bold scale-110 block': route.name === 'business-report' }"> visure </router-link></li>
            <li><router-link :to="{ name: 'search-leads' }" :class="{ 'font-bold scale-110 block': route.name === 'search-leads' }"> ricerca leads </router-link></li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
ul{
    li{
        cursor: pointer;
    }
}
</style>