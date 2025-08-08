import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/views/auth/LoginView.vue')
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/views/auth/RegisterView.vue')
        },
        {
          path: 'forgot-password',
          name: 'ForgotPassword',
          component: () => import('@/views/auth/ForgotPasswordView.vue')
        },
        {
          path: 'reset-password',
          name: 'ResetPassword',
          component: () => import('@/views/auth/ResetPasswordView.vue')
        }
      ]
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'search',
          name: 'Search',
          component: () => import('@/views/SearchView.vue')
        },
        {
          path: 'company/:piva',
          name: 'CompanyDetail',
          component: () => import('@/views/CompanyDetailView.vue'),
          props: true
        },
        {
          path: 'company',
          name: 'CompanyUnified',
          component: () => import('@/views/CompanyUnifiedView.vue')
        },
        {
          path: 'stored',
          name: 'Stored',
          component: () => import('@/views/StoredView.vue')
        },
        // {
        //   path: 'company-advanced',
        //   name: 'CompanyAdvanced',
        //   component: () => import('@/views/CompanyAdvancedView.vue')
        // },
        // {
        //   path: 'company-full',
        //   name: 'CompanyFull',
        //   component: () => import('@/views/CompanyFullView.vue')
        // },
        // {
        //   path: 'company-status',
        //   name: 'CompanyStatus',
        //   component: () => import('@/views/CompanyStatusView.vue')
        // },
        {
          path: 'visure',
          name: 'Visure',
          component: () => import('@/views/VisureView.vue')
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/ProfileView.vue')
        },
        {
          path: 'files',
          name: 'Files',
          component: () => import('@/views/FilesView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } else if (to.path.startsWith('/auth') && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
