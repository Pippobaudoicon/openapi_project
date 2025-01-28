<template>
    <div class="gray-bkg h-full text-sm">
        <div class=" flex flex-col items-center justify-center h-full">
            <div>
                <div class="text-7xl italic-font light-blue-txt mb-6">
                    Ricerca Ora
                </div>
                <div class="border-b-2 px-2 py-1 border-gray-500">
                    <input id="vat" name="vat" type="text" autocomplete="vat" required class="w-full focus:outline-none placeholder-black font-bold" placeholder="Partita IVA">
                </div>
                <div class="flex justify-between py-5">
                    <div>
                        <input type="radio" id="advance" name="company" value="advance">
                        <span class="ml-2 font-bold">Company Advance</span>
                    </div>
                    <div>
                        <input type="radio" id="full" name="company" value="full">
                        <span class="ml-2 font-bold">Company Full</span>
                    </div>
                </div>
                <button class="w-full text-center light-blue-bkg text-white py-2 cursor-pointer uppercase main-font">
                    avvia ricerca
                </button>
            </div>
        </div>
    </div>
</template>