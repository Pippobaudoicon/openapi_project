<template>
    <div class="flex flex-col md:flex-row justify-between items-center px-12">
        <div class=" py-10 w-full md:w-96">
            <img src="../../media/vicsam-dtextr.png" alt="">
        </div>
        <div class="flex items-center gap-8">
            <div class="flex gap-3 items-center">
                <div class=" w-14 ">
                    <img class="profile-media" src="../../media/Molinari_Valentina.jpg" alt="">
                </div>
                <div>
                    Ciao Valentina
                </div>
            </div>
            <div class="flex gap-3 items-center">
                <div class=" w-14 border-icon">
                    <img class="scale-75" src="../../svg/dollar.svg" alt="">
                </div>
                <div>
                    Crediti: <span class=" font-bold">111</span>
                </div>
            </div>
            <div class="flex gap-3 items-center">
                <div class=" w-14 border-icon">
                    <img class="scale-50" src="../../svg/logout.svg" alt="">
                </div>
                <div>
                    Esci
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .profile-media {
        border: 1px solid black;
        border-radius: 50%;
    }
    .border-icon {
        border: 1px solid black;
        border-radius: 50%;
    }
</style>