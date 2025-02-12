<script setup>
import { useRouter } from 'vue-router';
import { useCompanyStore } from "@/stores/companyStore";
const store = useCompanyStore();
const credit = store.credit ? store.credit.data : { credit: 0 };const router = useRouter();

const logout = () => {
    if (confirm("Sei sicuro di voler uscire?")) {
        router.push({ name: "login" }); // Reindirizza alla pagina di login
    }
};
</script>

<template>
    <div class="flex flex-col md:flex-row justify-between items-center px-6">
        <div class="py-6 w-full md:w-60">
            <img src="../../media/vicsam-dtextr.png" alt="">
        </div>
        <div class="flex items-center gap-6">
            <div class="flex gap-3 items-center">
                <div class="w-10">
                    <img class="profile-media" src="../../media/Molinari_Valentina.jpg" alt="">
                </div>
                <div>
                    Ciao <span class="font-bold">Valentina</span>
                </div>
            </div>
            <div class="flex gap-2 items-center">
                <div class="w-10 border-icon">
                    <img class="scale-75" src="../../svg/dollar.svg" alt="">
                </div>
                <div>
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
