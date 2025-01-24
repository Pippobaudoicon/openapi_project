import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';

const router = createRouter ({
    history:createWebHistory(),

    routes : [
        {
            path : '/',
            name : 'login',
            component : Login
        },
        {
            path : '/dashboard',
            name : 'dashboard',
            component : Dashboard
        }
    ]
});

export {router};