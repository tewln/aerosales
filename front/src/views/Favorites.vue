<template>
  <div class="favorites">
    <div class="container">
      <h1>Избранное</h1>
        <div v-if="loading" class="loading">
        Загрузка избранного...
      </div>
      
      <div v-else-if="favorites.length === 0" class="empty-state">
        <h3>В избранном пока ничего нет</h3>
        <p>Добавляйте интересные рейсы в избранное, чтобы они отображались здесь</p>
        <router-link to="/" class="btn btn-primary">
          Найти рейсы
        </router-link>
      </div>
      
      <div v-else class="favorites-list">
        <div v-for="trip in favorites" :key="trip.id" class="trip-card">
          <div class="trip-info">
            <div class="route">
              <h3>{{ trip.departure_city }} → {{ trip.arrival_city }}</h3>
              <p class="airline">{{ trip.airline_name }}</p>
            </div>
            
            <div class="details">
              <div class="time">
                <span class="departure">{{ formatTime(trip.departure_date) }}</span>
                <span class="separator">—</span>
                <span class="arrival">{{ formatTime(trip.arrival_date) }}</span>
              </div>
              <div v-if="formatDate(trip.departure_date) !== formatDate(trip.arrival_date)" class="date">
                <span class="departure">{{ formatDate(trip.departure_date) }}</span>
                <span class="separator">—</span>
                <span class="arrival">{{ formatDate(trip.arrival_date) }}</span>
              </div>
              <div v-else class="date">
                <span>{{ formatDate(trip.departure_date) }}</span>
              </div>
              <div class="duration">{{ getDurationText(trip.departure_date, trip.arrival_date) }}</div>
            </div>
            
            <div class="price">
              <span class="amount">{{ Math.round(trip.price) }} ₽</span>
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
              @click="removeFromFavorites(trip.id)"
              class="btn btn-outline"
            >
              Удалить из избранного
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useTicketsStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Favorites',
  setup() {
    const ticketsStore = useTicketsStore()
    const authStore = useAuthStore()
    const router = useRouter()
      const favorites = computed(() => ticketsStore.favorites)
    const loading = computed(() => ticketsStore.loading)
    
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
      const removeFromFavorites = async (tripId) => {
      try {
        console.log('Удаляем из избранного, tripId:', tripId)
        const result = await ticketsStore.removeFromFavorites(tripId)
        console.log('Результат удаления:', result)
        if (result) {
          console.log('Успешно удалено из избранного')
        } else {
          console.log('Ошибка при удалении:', ticketsStore.error)
        }
      } catch (error) {
        console.error('Ошибка при удалении из избранного:', error)
      }
    }
    
    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }
      
      ticketsStore.loadFavorites()    })
    
    return {
      favorites,
      loading,
      formatTime,
      formatDate,
      formatDuration,
      getDurationText,
      removeFromFavorites
    }
  }
}
</script>

<style scoped>
.favorites {
  padding: 2rem 0;
  min-height: 60vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #888;
  margin-bottom: 2rem;
}

.favorites-list {
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

.airline {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.details {
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
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

@media (max-width: 768px) {
  .trip-info {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: left;
  }
  
  .price {
    text-align: left;
  }
  
  .actions {
    justify-content: stretch;
  }
  
  .btn {
    flex: 1;
    text-align: center;
  }
}
</style>
