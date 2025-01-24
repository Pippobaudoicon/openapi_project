<template>
    <main>
        <div class="flex justify-center h-screen w-screen">
            <div class="flex flex-col basis-1/3 justify-center gap-12">
                <div class="w-full">
                    <img src="../media/vicsam-dtextr.png" alt="">
                </div>
                <div class="px-0 md:px-12">
                    <form id="loginForm" class="space-y-6 flex flex-col" action="#" method="POST">
                        <div class="flex items-end gap-5 border-b-2 px-2 py-1 border-gray-300">
                            <div>
                                <img class="icon" src="../svg/teacher.svg" alt="">
                            </div>
                            <div>
                                <input id="user" name="user" type="text" autocomplete="user" required class="" placeholder="User">
                            </div>
                        </div>
                        <div class="flex items-end gap-5 border-b-2 px-2 py-1 border-gray-300">
                            <div>
                                <img class="icon" src="../svg/secure.svg" alt="">
                            </div>
                            <div>
                                <input id="user" name="user" type="text" autocomplete="user" required class="" placeholder="Password">
                            </div>
                        </div>
                        <router-link :to="{ name: 'dashboard' }">
                            <button class="w-full text-center bg-blue-400 text-white py-2 cursor-pointer">
                                ACCEDI ORA
                            </button>
                        </router-link>
			        </form>
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