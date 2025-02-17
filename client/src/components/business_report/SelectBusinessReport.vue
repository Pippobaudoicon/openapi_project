<template>
    <div class="gray-bkg h-full text-sm">
        <div class=" flex flex-col items-center justify-center h-full">
            <!-- <div>
                <div class="text-7xl italic-font light-blue-txt mb-6">
                    Ricerca Ora
                </div>
                <div class="border-b-2 px-2 py-1 border-gray-500">
                    <input id="vat" name="vat" type="text" autocomplete="vat" required class="w-full focus:outline-none placeholder-black font-bold" placeholder="Partita IVA">
                </div>
                <div class="flex justify-between py-5">
                    <ul>
                        <li class="flex items-center" v-for="(option, index) in options" :key="index">
                            <input 
                                type="checkbox" 
                                :id="'option-' + index" 
                                :value="option.value" 
                                :checked="selectedOption === option.value"
                                @change="selectOption(option.value)"
                                class="cursor-pointer">
                            <span class="ml-2 font-bold capitalize">{{ option.label }}</span>
                        </li>
                    </ul>
                </div>
                <button class="w-full text-center light-blue-bkg text-white py-2 cursor-pointer uppercase main-font">
                    avvia ricerca
                </button>
            </div> -->
        </div>
    </div>
</template>

<script setup>
const businessReport = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/v1/visure', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        alert( error.message);
    }
};
window.onload = () => {
    businessReport();
};
</script>