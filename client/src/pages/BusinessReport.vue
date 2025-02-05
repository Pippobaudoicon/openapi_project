<template>
    <div class="h-screen flex flex-col">
        <div>
            <Header />
        </div>
        <div class="grow">
            <SelectBusinessReport />
        </div>
    </div>
</template>

<script setup>
import Header from "@/components/header/Header.vue";
import SelectBusinessReport from "@/components/business_report/SelectBusinessReport.vue";
</script>