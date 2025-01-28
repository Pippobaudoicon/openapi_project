<template>
    <main>
        <div class="flex justify-center h-screen w-screen text-sm">
            <div class="flex flex-col basis-4/5 md:basis-1/4 justify-center gap-12">
                <div class="w-full">
                    <img src="../media/vicsam-dtextr.png" alt="">
                </div>
                <div class="px-0 md:px-6">
                    <form id="loginForm" class="space-y-6 flex flex-col" @submit.prevent="login">
                        <div class="flex items-end gap-5 border-b-2 px-2 py-1 border-gray-300">
                            <div>
                                <img class="icon" src="../svg/teacher.svg" alt="">
                            </div>
                            <div class="grow"> 
                                <input v-model="user" id="user" name="user" type="text" autocomplete="user" required class="w-full focus:outline-none" placeholder="User">
                            </div>
                        </div>
                        <div class="flex items-end gap-5 border-b-2 px-2 py-1 border-gray-300">
                            <div>
                                <img class="icon" src="../svg/secure.svg" alt="">
                            </div>
                            <div class="grow">
                                <input v-model="password" id="password" name="password" type="password" autocomplete="current-password" required class="w-full focus:outline-none" placeholder="Password">
                            </div>
                        </div>
                        <button type="submit" class="w-full text-center light-blue-bkg text-white py-2 cursor-pointer uppercase main-font">
                            accedi ora
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const user = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: user.value,
                password: password.value
            })
        });
        const data = await response.json();
        if (response.ok) {
            router.push({ name: 'dashboard' });
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
};
</script>

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