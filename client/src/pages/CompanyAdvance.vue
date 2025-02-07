<script setup>
import Header from "@/components/header/Header.vue";
import CompanyData from "@/components/company_advance/CompanyData.vue";
</script>

<template>
    <div class="h-screen flex flex-col">
        <div>
            <Header />
        </div>
        <div class="grow gray-bkg">
            <CompanyData />
        </div>
    </div>
</template>
