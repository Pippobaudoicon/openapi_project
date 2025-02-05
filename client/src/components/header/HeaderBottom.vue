<template>
    <div class="text-center w-full light-blue-bkg">
        <ul class="uppercase flex justify-center gap-10 text-white py-5">
            <li><router-link :to="{ name: 'dashboard' }"> estrazione dati </router-link></li>
            <li><router-link :to="{ name: 'business-report' }"> visure </router-link></li>
            <li><router-link :to="{ name: 'search-leads' }"> ricerca leads </router-link></li>
            <li><router-link :to="{ name: 'files' }"> scarica i file </router-link></li>
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