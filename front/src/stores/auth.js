import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { getStoredAuthStatus, setStoredAuthStatus, clearAuthData } from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isAuthStatusLoaded = ref(false)

  const authStatus = ref(getStoredAuthStatus())

  const isAuthenticated = computed(() => authStatus.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.auth.login(credentials)
      authStatus.value = true
      setStoredAuthStatus(true)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка авторизации'
      authStatus.value = false
      setStoredAuthStatus(false)
      return false
    } finally {
      loading.value = false
    }
  }
  const register = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.auth.register(userData)
      authStatus.value = true
      setStoredAuthStatus(true)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка регистрации'
      authStatus.value = false
      setStoredAuthStatus(false)
      return false
    } finally {
      loading.value = false
    }
  }
  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (err) {
      console.error('Ошибка выхода:', err)
    } finally {
      user.value = null
      authStatus.value = false
      setStoredAuthStatus(false)
    }
  }

  const checkAuthStatus = async () => {
    if (isAuthStatusLoaded.value) {
      return
    }

    if (!authStatus.value) {
      isAuthStatusLoaded.value = true
      return
    }

    try {
      await api.auth.getMe()
      authStatus.value = true
      setStoredAuthStatus(true)
    } catch (err) {
      user.value = null
      authStatus.value = false
      setStoredAuthStatus(false)
    } finally {
      isAuthStatusLoaded.value = true
    }
  }

  const fetchUserData = async () => {
    if (!authStatus.value) {
      return false
    }

    try {
      const response = await api.auth.getMe()
      user.value = response.data.data.user
      return true
    } catch (err) {
      user.value = null
      authStatus.value = false
      setStoredAuthStatus(false)
      return false
    }
  }
  const updateProfile = async (data) => {
    try {
      await api.profile.updateProfile(data)
      await fetchUserData()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка обновления профиля'
      return false
    }
  }

  const updateContact = async (data) => {
    try {
      await api.profile.updateContact(data)
      await fetchUserData()
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка обновления контактов'
      return false
    }
  }

  const changePassword = async (data) => {
    try {
      await api.profile.changePassword(data)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка смены пароля'
      return false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuthStatus,
    fetchUserData,
    updateProfile,
    updateContact,
    changePassword
  }
})
