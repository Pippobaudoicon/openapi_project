<script setup>
import { useRouter } from 'vue-router';
import { useCompanyStore } from "@/stores/companyStore";
const store = useCompanyStore();
const credit = store.credit ? store.credit.data : { credit: 0 };const router = useRouter();
const mail = store.email;
const firstChar = mail.charAt(0).toUpperCase();

const logout = () => {
    if (confirm("Sei sicuro di voler uscire?")) {
        router.push({ name: "login" }); // Reindirizza alla pagina di login
    }
};
</script>

<template>
    <div class="flex flex-col md:flex-row justify-between items-center px-6">
        <div class="py-4 w-full md:w-60">
            <img src="../../media/vicsam-dtextr.png" alt="">
        </div>
        <div class="flex items-center gap-6 text-xs md:text-sm">
            <div class="flex gap-3 items-center">
                <div class="w-10 profile-media aspect-square flex items-center justify-center">
                    <span class="font-bold text-2xl">{{ firstChar }}</span>
                </div>
                <div>
                    <span>Ciao <span class="font-bold">{{ mail }}</span></span>
                    <router-link :to="{ name: 'change-password' }"><span class="text-[10px] light-blue-txt block cursor-pointer">cambia password</span></router-link> 
                </div>
            </div>
            <div class="flex gap-2 items-center">
                <div class="w-10 border-icon">
                    <img class="scale-75" src="../../svg/dollar.svg" alt="">
                </div>
                <div class="">
                    Crediti: <span class="font-bold">{{ credit.credit }}</span>
                </div>
            </div>
            <div class="flex gap-3 items-center cursor-pointer" @click="logout">
                <div class="w-10 border-icon">
                    <img class="scale-50" src="../../svg/logout.svg" alt="">
                </div>
                <div>
                    <span class="font-bold">Esci</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.profile-media {
    border: 1px solid black;
    border-radius: 50%;
}
.border-icon {
    border: 1px solid black;
    border-radius: 50%;
}
</style>
