<template>
    <div class="h-screen flex flex-col">
        <div>
            <Header />
        </div>
        <div class="grow">
            <SearchVat />
        </div>
    </div>
</template>

<script setup>
import Header from "@/components/header/Header.vue";
import SearchVat from "@/components/dashboard/SearchVat.vue";
</script>