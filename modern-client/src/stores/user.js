import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useUserStore = defineStore('user', () => {
    const user = ref(null)
    const isLoggedIn = computed(() => !!user.value)

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/profile')
            user.value = response.data
        } catch (error) {
            console.error('Error fetching user:', error)
        }
    }

    const updateUser = async (updates) => {
        try {
            const response = await api.put('/users/profile', updates)
            user.value = response.data
        } catch (error) {
            console.error('Error updating user:', error)
        }
    }

    const deleteUser = async () => {
        try {
            await api.delete('/users/profile')
            user.value = null
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    const changePassword = async (passwordData) => {
        if (passwordData.currentPassword === passwordData.newPassword) {
            throw new Error('New password must be different from the current password.')
        }
        if(passwordData.newPassword !== passwordData.confirmPassword) {
            throw new Error('New password and confirmation do not match.')
        }
        try {
            await api.post('/auth/change-password', passwordData)
        } catch (error) {
            console.error('Error changing password:', error)
            // Extract meaningful error message from API response
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message)
            } else if (error.response?.status === 400) {
                throw new Error('Invalid password or request. Please check your current password.')
            } else if (error.response?.status === 401) {
                throw new Error('Current password is incorrect.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else {
                throw new Error('Failed to change password. Please try again.')
            }
        }
    }

    return {
        user,
        isLoggedIn,
        fetchUser,
        updateUser,
        deleteUser,
        changePassword
    }
})