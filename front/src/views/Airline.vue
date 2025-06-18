<template>
  <div class="airline-page">
    <div class="container">
      <div v-if="loading" class="loading">
        Загрузка информации об авиакомпании...
      </div>
      
      <div v-else-if="airline" class="airline-content">
        <div class="airline-header">
          <div class="airline-logo">
            <img 
              v-if="airline.logo_url" 
              :src="airline.logo_url" 
              :alt="airline.name"
              @error="onImageError"
            />            <div v-else class="logo-placeholder">
              {{ (airline && airline.name) ? airline.name.charAt(0) : '?' }}
            </div>
          </div>
          
          <div class="airline-info">
            <h1>{{ airline.name }}</h1>
            <p v-if="airline.description" class="description">
              {{ airline.description }}
            </p>
            <div class="airline-stats">
              <div class="stat" v-if="airline.country">
                <span class="label">Страна:</span>
                <span class="value">{{ airline.country }}</span>
              </div>
              <div class="stat" v-if="airline.founded_year">
                <span class="label">Основана:</span>
                <span class="value">{{ airline.founded_year }}</span>
              </div>
              <div class="stat" v-if="tripsCount > 0">
                <span class="label">Рейсов:</span>
                <span class="value">{{ tripsCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="airline-trips">
          <h2>Рейсы {{ airline.name }}</h2>
          
          <div v-if="tripsLoading" class="loading">
            Загрузка рейсов...
          </div>
          
          <div v-else-if="trips.length === 0" class="empty-state">
            <p>У этой авиакомпании пока нет доступных рейсов</p>
          </div>
          
          <div v-else class="trips-list">
            <div v-for="trip in trips" :key="trip.id" class="trip-card">
              <div class="trip-info">
                <div class="route">
                  <h3>{{ trip.departure_city }} → {{ trip.arrival_city }}</h3>
                  <p class="airports">
                    {{ trip.departure_airport }} — {{ trip.arrival_airport }}
                  </p>
                </div>
                  <div class="schedule">
                  <div class="time">
                    <span class="departure">{{ formatTime(trip.departure_date) }}</span>
                    <span class="separator">—</span>
                    <span class="arrival">{{ formatTime(trip.arrival_date) }}</span>
                  </div>
                  <div class="date">{{ formatDate(trip.departure_date) }}</div>
                  <div class="duration">{{ getDurationText(trip.departure_date, trip.arrival_date) }}</div>
                </div>
                
                <div class="price">
                  <span class="amount">{{ trip.price }} ₽</span>
                  <span class="available" v-if="trip.available_seats">
                    {{ trip.available_seats }} мест
                  </span>
                </div>
              </div>
              
              <div class="actions">
                <router-link 
                  :to="`/trip/${trip.id}`" 
                  class="btn btn-primary"
                >
                  Подробнее
                </router-link>
                <button 
                  @click="toggleFavorite(trip.id)"
                  class="btn btn-outline"
                  :class="{ 'active': isFavorite(trip.id) }"
                >
                  {{ isFavorite(trip.id) ? '♥' : '♡' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="error-state">
        <h2>Авиакомпания не найдена</h2>
        <p>Возможно, авиакомпания была удалена или указан неверный идентификатор</p>
        <router-link to="/" class="btn btn-primary">
          На главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

export default {
  name: 'Airline',
  setup() {
    const route = useRoute()
    const ticketsStore = useTicketsStore()
    const authStore = useAuthStore()
    
    const airline = ref(null)
    const loading = ref(true)
    const trips = ref([])
    const tripsLoading = ref(false)
    
    const favorites = computed(() => ticketsStore.favorites.map(f => f.id))
    const tripsCount = computed(() => trips.value.length)
    
    const formatTime = (dateTime) => {
      return new Date(dateTime).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatDate = (dateTime) => {
      return new Date(dateTime).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
      const formatDuration = (minutes) => {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}ч ${mins}м`
    }
    
    const getDurationText = (departureDate, arrivalDate) => {
      const minutes = Math.floor((new Date(arrivalDate) - new Date(departureDate)) / (1000 * 60))
      return formatDuration(minutes)
    }
    
    const isFavorite = (tripId) => {
      return favorites.value.includes(tripId)
    }
    
    const toggleFavorite = async (tripId) => {
      if (!authStore.isAuthenticated) {
        return
      }
      
      try {
        if (isFavorite(tripId)) {
          await ticketsStore.removeFromFavorites(tripId)
        } else {
          await ticketsStore.addToFavorites(tripId)
        }
      } catch (error) {
        console.error('Ошибка при работе с избранным:', error)
      }
    }
    
    const onImageError = (event) => {
      event.target.style.display = 'none'
    }
      const loadAirline = async () => {
      try {
        loading.value = true
        const airlineId = route.params.id
        const response = await api.airlines.getDetails(airlineId)

        if (response.data.success && response.data.data) {
          airline.value = response.data.data.airline
        } else {
          airline.value = null
        }

        await loadAirlineTrips(airlineId)
        
      } catch (error) {
        console.error('Ошибка при загрузке авиакомпании:', error)
        airline.value = null
      } finally {
        loading.value = false
      }
    }
      const loadAirlineTrips = async (airlineId) => {
      try {
        tripsLoading.value = true
        const response = await api.tickets.search({ airline_id: airlineId })

        if (response.data.success && response.data.data) {
          trips.value = response.data.data
        } else {
          trips.value = []
        }
      } catch (error) {
        console.error('Ошибка при загрузке рейсов:', error)
        trips.value = []
      } finally {
        tripsLoading.value = false
      }
    }
    
    watch(() => authStore.isAuthenticated, (isAuth) => {
      if (isAuth) {
        ticketsStore.loadFavorites()
      }
    })
    
    onMounted(() => {
      loadAirline()
      
      if (authStore.isAuthenticated) {
        ticketsStore.loadFavorites()
      }
    })
      return {
      airline,
      loading,
      trips,
      tripsLoading,
      tripsCount,
      formatTime,
      formatDate,
      formatDuration,
      getDurationText,
      isFavorite,
      toggleFavorite,
      onImageError
    }
  }
}
</script>

<style scoped>
.airline-page {
  padding: 2rem 0;
  min-height: 60vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading,
.error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.error-state h2 {
  color: #666;
  margin-bottom: 1rem;
}

.error-state p {
  color: #888;
  margin-bottom: 2rem;
}

.airline-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.airline-logo {
  flex-shrink: 0;
}

.airline-logo img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
}

.logo-placeholder {
  width: 120px;
  height: 120px;
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: #666;
}

.airline-info h1 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 2rem;
}

.description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.airline-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-weight: 600;
  color: #333;
}

.airline-trips h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.trips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trip-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}

.trip-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.trip-info {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.route h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.airports {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.schedule {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time {
  font-weight: 600;
  color: #333;
}

.separator {
  margin: 0 0.5rem;
  color: #ccc;
}

.date,
.duration {
  color: #666;
  font-size: 0.9rem;
}

.price {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.available {
  color: #28a745;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-outline {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-outline.active {
  color: #dc3545;
  border-color: #dc3545;
}

@media (max-width: 768px) {
  .airline-page {
    padding: 1rem 0;
  }
  
  .container {
    padding: 0 0.5rem;
  }
  
  .airline-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .airline-logo {
    align-self: center;
  }
  
  .airline-logo img,
  .logo-placeholder {
    width: 80px;
    height: 80px;
  }
  
  .logo-placeholder {
    font-size: 2rem;
  }
  
  .airline-info h1 {
    font-size: 1.5rem;
  }
  
  .airline-stats {
    justify-content: center;
    gap: 1rem;
  }
  
  .stat {
    text-align: center;
  }
  
  .trip-info {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: left;
  }
  
  .route h3 {
    font-size: 1.1rem;
  }
  
  .schedule {
    text-align: center;
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 6px;
  }
  
  .price {
    text-align: center;
    margin-top: 1rem;
  }
  
  .amount {
    font-size: 1.3rem;
  }
  
  .actions {
    justify-content: stretch;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .btn:not(.btn-outline) {
    flex: 1;
    text-align: center;
  }
  
  .btn-outline {
    width: 50px;
    height: 50px;
    align-self: center;
  }
}

@media (max-width: 480px) {
  .airline-header {
    padding: 1rem;
  }
  
  .airline-logo img,
  .logo-placeholder {
    width: 60px;
    height: 60px;
  }
  
  .logo-placeholder {
    font-size: 1.5rem;
  }
  
  .airline-info h1 {
    font-size: 1.3rem;
  }
  
  .airline-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .trip-card {
    padding: 1rem;
  }
  
  .actions {
    gap: 0.75rem;
  }
}
</style>
