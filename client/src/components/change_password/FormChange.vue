<script setup>
import { ref } from 'vue';

const oldPassword = ref('');
const newPassword = ref('');
const loading = ref(false);

const showOldPassword = ref(false);
const showNewPassword = ref(false);

let oldPasswordTimer = null;
let newPasswordTimer = null;

const toggleNewPassword = () => {
    showNewPassword.value = !showNewPassword.value;
    clearTimeout(newPasswordTimer);  // Cancella eventuale timer precedente

    if (showNewPassword.value) {
        newPasswordTimer = setTimeout(() => {
            showNewPassword.value = false;
        }, 3000);  // 3 secondi
    }

};

const toggleOldPassword = () => {
    showOldPassword.value = !showOldPassword.value;
    clearTimeout(oldPasswordTimer);  // Cancella eventuale timer precedente

    if (showOldPassword.value) {
        oldPasswordTimer = setTimeout(() => {
            showOldPassword.value = false;
        }, 3000);  // 3 secondi
    }
};

const changePassword = async () => {
    loading.value = true;
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                oldPassword: oldPassword.value,
                newPassword: newPassword.value
            })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Password changed successfully');
            window.location.href = '/dashboard';
        } else {
            alert('Failed to change password: ' + data.message);
        }
    } catch (error) {
        alert('Failed to change password: ' + error.message);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="gray-bkg h-full text-sm">
        <div class="flex flex-col items-center justify-center h-full">
            <div>
                <div class="text-6xl md:text-7xl italic-font light-blue-txt mb-6">
                    Cambia Password
                </div>
                <div class="flex flex-col gap-5">
                    <!-- Old Password Input -->
                    <div class="border-b-2 px-2 py-1 flex justify-between items-center border-gray-400">
                        <input 
                            id="old-password" 
                            name="old-password" 
                            :type="showOldPassword ? 'text' : 'password'"
                            v-model="oldPassword" 
                            autocomplete="old-password" 
                            required 
                            class="w-full focus:outline-none placeholder-black font-bold text-xs md:text-sm" 
                            placeholder="Inserisci la password attuale"
                        >
                        <div class="w-5 cursor-pointer" @click="toggleOldPassword">
                            <img 
                                v-if="!showOldPassword" 
                                src="../../media/eye-password-see-view.svg" 
                                alt="Mostra password"
                            >
                            <img 
                                v-else 
                                src="../../media/eye-key-look-password-security-see.svg" 
                                alt="Nascondi password"
                            >
                        </div>
                    </div>

                    <!-- New Password Input -->
                    <div class="border-b-2 flex justify-between items-center px-2 py-1 border-gray-400">
                        <input 
                            id="new-password" 
                            name="new-password" 
                            :type="showNewPassword ? 'text' : 'password'" 
                            v-model="newPassword" 
                            autocomplete="new-password" 
                            required 
                            class="w-full focus:outline-none placeholder-black font-bold text-xs md:text-sm" 
                            placeholder="Inserisci la nuova password"
                        >
                        <div class="w-5 cursor-pointer" @click="toggleNewPassword">
                            <img 
                                v-if="!showNewPassword" 
                                src="../../media/eye-password-see-view.svg" 
                                alt="Mostra password"
                            >
                            <img 
                                v-else 
                                src="../../media/eye-key-look-password-security-see.svg" 
                                alt="Nascondi password"
                            >
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button 
                        @click="changePassword" 
                        class="w-full text-center light-blue-bkg text-white py-2 cursor-pointer uppercase main-font" 
                        :disabled="loading"
                    >
                        {{ loading ? "Caricamento..." : "Conferma" }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
