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
        try {
            const response = await api.put('/users/profile/password', passwordData)
            user.value = response.data
        } catch (error) {
            console.error('Error changing password:', error)
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