import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Dashboard from '@/pages/Dashboard.vue';
import BusinessReport from '@/pages/BusinessReport.vue';
import SearchLeads from '@/pages/SearchLeads.vue';
import Files from '@/pages/Files.vue';
import CompanyAdvance from '@/pages/CompanyAdvance.vue';
import CompanyFull from '@/pages/CompanyFull.vue';

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
        },
        {
            path : '/dashboard/company-advanced/:vat',
            name : 'company-advance',
            component : CompanyAdvance,
            props: true
        },
        {
            path : '/dashboard/company-full/:vat',
            name : 'company-full',
            component : CompanyFull,
            props: true
        }
    ]
});

export {router};