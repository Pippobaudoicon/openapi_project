import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';
import BusinessReport from '@/pages/BusinessReport.vue';
import SearchLeads from '@/pages/SearchLeads.vue';
import Files from '@/pages/Files.vue';

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
        },
        {
            path : '/business-report',
            name : 'business-report',
            component : BusinessReport
        },
        {
            path : '/search-leads',
            name : 'search-leads',
            component : SearchLeads
        },
        {
            path : '/files',
            name : 'files',
            component : Files
        }
    ]
});

export {router};