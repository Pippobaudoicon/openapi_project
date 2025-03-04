<script setup>
import FormChange from "@/components/change_password/FormChange.vue";
import Header from "@/components/header/Header.vue";
</script>

<template>
    <div class="h-screen flex flex-col">
        <div>
            <Header />
        </div>
        <div class="grow">
            <FormChange />
        </div>
    </div>
</template>

