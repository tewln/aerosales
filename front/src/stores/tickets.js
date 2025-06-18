import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useTicketsStore = defineStore('tickets', () => {
  const destinations = ref([])
  const searchResults = ref([])
  const myTickets = ref([])
  const myHistory = ref([])
  const favorites = ref([])
  const loading = ref(false)
  const error = ref(null)

  const loadDestinations = async () => {
    loading.value = true
    try {
      const response = await api.tickets.getDestinations()
      destinations.value = response.data.data
    } catch (err) {
      error.value = 'Ошибка загрузки направлений'
    } finally {
      loading.value = false
    }
  }
  const searchTickets = async (searchParams) => {
    loading.value = true
    error.value = null
    
    console.log('Поиск билетов с параметрами:', searchParams)
    
    try {
      const response = await api.tickets.search(searchParams)
      console.log('Ответ API поиска:', response.data)
      
      searchResults.value = response.data.data || []
      console.log('Результаты поиска сохранены:', searchResults.value.length)
    } catch (err) {
      console.error('Ошибка поиска билетов:', err)
      error.value = err.response?.data?.message || 'Ошибка поиска билетов'
      searchResults.value = []
    } finally {
      loading.value = false
    }  }

  const loadMyTickets = async () => {
    loading.value = true
    try {
      const response = await api.tickets.getMyTickets()
      myTickets.value = response.data.data || []
    } catch (err) {
      error.value = 'Ошибка загрузки билетов'
    } finally {
      loading.value = false
    }
  }
  const loadMyHistory = async () => {
    loading.value = true
    try {
      const response = await api.tickets.getMyHistory()
      myHistory.value = response.data.data || []
    } catch (err) {
      error.value = 'Ошибка загрузки истории'
    } finally {
      loading.value = false
    }
  }

  const loadFavorites = async () => {
    loading.value = true
    try {
      const response = await api.favorites.get()
      favorites.value = response.data.data
    } catch (err) {
      error.value = 'Ошибка загрузки избранного'
    } finally {
      loading.value = false
    }
  }

  const addToFavorites = async (tripId) => {
    try {
      await api.favorites.add(tripId)
      await loadFavorites()
      return true
    } catch (err) {
      error.value = 'Ошибка добавления в избранное'
      return false
    }
  }

  const removeFromFavorites = async (tripId) => {
    try {
      await api.favorites.remove(tripId)
      await loadFavorites()
      return true
    } catch (err) {
      error.value = 'Ошибка удаления из избранного'
      return false
    }
  }

  const purchaseTicket = async (purchaseData) => {
    try {
      const response = await api.tickets.purchase(purchaseData)
      await loadMyTickets()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Ошибка покупки билета'
      return null
    }  }

  const cancelTicket = async (purchaseId) => {
    try {
      console.log('Store: сдаем билет в кассу с ID:', purchaseId)
      const response = await api.tickets.cancelTicket(purchaseId)
      console.log('Store: ответ на сдачу билета:', response.data)
      
      await loadMyTickets()
      await loadMyHistory()
      return true
    } catch (err) {
      console.error('Store: ошибка сдачи билета:', err)
      error.value = err.response?.data?.message || 'Ошибка сдачи билета в кассу'
      return false
    }
  }

  return {
    destinations,
    searchResults,
    myTickets,
    myHistory,
    favorites,
    loading,
    error,
    loadDestinations,
    searchTickets,
    loadMyTickets,
    loadMyHistory,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    purchaseTicket,
    cancelTicket
  }
})
