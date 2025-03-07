<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const showResetPassword = ref(false);
const showConfirmPassword = ref(false);

const resetPassword = ref('');
const confirmPassword = ref('');

let confirmPasswordTimer = null;
let resetPasswordTimer = null;

const route = useRoute();
const router = useRouter();
const token = route.params.token;

const baseUrl = 'http://localhost:3000/api/v1/auth/reset-password';

const toggleNewPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
    clearTimeout(confirmPasswordTimer);  // Cancella eventuale timer precedente

    if (showConfirmPassword.value) {
        confirmPasswordTimer = setTimeout(() => {
            showConfirmPassword.value = false;
        }, 3000);  // 3 secondi
    }

};

const toggleResetPassword = () => {
    showResetPassword.value = !showResetPassword.value;
    clearTimeout(resetPasswordTimer);  // Cancella eventuale timer precedente

    if (showResetPassword.value) {
        resetPasswordTimer = setTimeout(() => {
            showResetPassword.value = false;
        }, 3000);  // 3 secondi
    }
};

const passwordMailVerification = async () => {
    try {
        const response = await fetch(`${baseUrl}/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                password: confirmPassword.value
            })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Password changed successfully');
            router.push({ name: 'login' });
        } else {
            alert('Failed to change password: ' + data.message);
        }
    } catch (error) {
        alert('Failed to change password: ' + error.message);
    }
};

</script>

<template>
    <main>
        <div class="flex justify-center h-screen w-screen text-sm">
            <div class="flex flex-col basis-4/5 md:basis-1/4 justify-center gap-12">
                <div class="w-full">
                    <img src="../media/vicsam-dtextr.png" alt="">
                </div>
                <div class="flex flex-col gap-5">
                    <!-- Old Password Input -->
                    <div class="border-b-2 px-2 py-1 flex justify-between items-center border-gray-400">
                        <input 
                            id="reset-password" 
                            name="reset-password" 
                            :type="showResetPassword ? 'text' : 'password'"
                            v-model="resetPassword" 
                            autocomplete="reset-password" 
                            required 
                            class="w-full focus:outline-none placeholder-black font-bold text-xs md:text-sm" 
                            placeholder="Inserisci la nuova password"
                        >
                        <div class="w-5 cursor-pointer" @click="toggleResetPassword">
                            <img 
                                v-if="!showResetPassword" 
                                src="../media/eye-password-see-view.svg" 
                                alt="Mostra password"
                            >
                            <img 
                                v-else 
                                src="../media/eye-key-look-password-security-see.svg" 
                                alt="Nascondi password"
                            >
                        </div>
                    </div>

                    <!-- New Password Input -->
                    <div class="border-b-2 flex justify-between items-center px-2 py-1 border-gray-400">
                        <input 
                            id="confirm-password" 
                            name="confirm-password" 
                            :type="showConfirmPassword ? 'text' : 'password'" 
                            v-model="confirmPassword" 
                            autocomplete="confirm-password" 
                            required 
                            class="w-full focus:outline-none placeholder-black font-bold text-xs md:text-sm" 
                            placeholder="Conferma la nuova password"
                        >
                        <div class="w-5 cursor-pointer" @click="toggleNewPassword">
                            <img 
                                v-if="!showConfirmPassword" 
                                src="../media/eye-password-see-view.svg" 
                                alt="Mostra password"
                            >
                            <img 
                                v-else 
                                src="../media/eye-key-look-password-security-see.svg" 
                                alt="Nascondi password"
                            >
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button @click="passwordMailVerification"
                        class="w-full text-center light-blue-bkg text-white py-2 cursor-pointer uppercase main-font" 
                    >
                        cambia password
                    </button>
                </div>
            </div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
    main {
        background-image: url('../media/bgapp.jpg');
        background-size: cover;
        .icon {
            width: 35px;
            height: auto;
        }
    }
</style>


