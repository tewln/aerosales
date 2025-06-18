<template>
  <div class="trip-details">
    <div class="container">
      <div v-if="loading" class="loading">
        Загрузка информации о рейсе...
      </div>
      
      <div v-else-if="trip" class="trip-content">
        <div class="card trip-info">
          <h1>{{ trip.departure_city }} → {{ trip.arrival_city }}</h1>
          
          <div class="trip-details-grid">
            <div class="detail-section">
              <h3>Вылет</h3>
              <div class="flight-info">
                <div class="airport">{{ trip.departure_airport }}</div>
                <div class="city">{{ trip.departure_city }}</div>
                <div class="time">{{ formatDateTime(trip.departure_date) }}</div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Прибытие</h3>
              <div class="flight-info">
                <div class="airport">{{ trip.arrival_airport }}</div>
                <div class="city">{{ trip.arrival_city }}</div>
                <div class="time">{{ formatDateTime(trip.arrival_date) }}</div>
              </div>
            </div>
          </div>
          
          <div class="airline-info">
            <h3>Авиакомпания</h3>
            <div class="airline-card" @click="goToAirline">
              <img 
                v-if="trip.airline_logo" 
                :src="trip.airline_logo" 
                :alt="trip.airline_name"
                class="airline-logo"
              />
              <span class="airline-name">{{ trip.airline_name }}</span>
            </div>
          </div>
            <div class="price-info">
            <div class="price">{{ Math.round(trip.price) }} ₽</div>
            <div class="seats">Осталось мест: {{ trip.available_seats }}</div>
          </div>
          
          <div class="actions">
            <button 
              v-if="trip.available_seats > 0"
              @click="goToPurchase" 
              class="btn btn-primary"
              :disabled="!authStore.isAuthenticated"
            >
              {{ authStore.isAuthenticated ? 'Купить билет' : 'Войдите для покупки' }}
            </button>
            
            <button 
              v-if="authStore.isAuthenticated"
              @click="toggleFavorite" 
              class="btn btn-secondary"
              :disabled="favoriteLoading"
            >
              {{ isFavorite ? '❤️ В избранном' : '🤍 В избранное' }}
            </button>
          </div>
        </div>

        <div class="card reviews">
          <h2>Отзывы об авиакомпании {{ trip.airline_name }}</h2>
          
          <div v-if="reviews.length > 0" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="reviewer">{{ review.user_name }}</span>
                <div class="rating">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }">
                    ★
                  </span>
                </div>
              </div>
              <p class="review-text">{{ review.comment }}</p>
              <div class="review-meta">
                <span class="route">{{ review.departure_city }} → {{ review.arrival_city }}</span>
                <span class="date">{{ formatDate(review.departure_date) }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="no-reviews">
            Пока нет отзывов об этой авиакомпании
          </div>
        </div>
      </div>
      
      <div v-else class="error">
        Рейс не найден
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTicketsStore } from '@/stores/tickets'
import api from '@/api'

const props = defineProps(['id'])
const router = useRouter()
const authStore = useAuthStore()
const ticketsStore = useTicketsStore()

const trip = ref(null)
const reviews = ref([])
const loading = ref(true)
const favoriteLoading = ref(false)

const isFavorite = computed(() => {
  return ticketsStore.favorites.some(fav => fav.trip_id === parseInt(props.id))
})

const loadTripDetails = async () => {
  try {
    const response = await api.tickets.getTripDetails(props.id)
    
    if (response.data.success && response.data.data) {
      trip.value = response.data.data
      reviews.value = response.data.data.airline_reviews || []

      console.log('Trip dates:', {
        departure: trip.value.departure_date,
        arrival: trip.value.arrival_date
      })
    } else {
      console.error('Неожиданная структура ответа:', response.data)
    }
  } catch (error) {
    console.error('Ошибка загрузки рейса:', error)
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async () => {
  favoriteLoading.value = true
  
  if (isFavorite.value) {
    await ticketsStore.removeFromFavorites(props.id)
  } else {
    await ticketsStore.addToFavorites(props.id)
  }
  
  favoriteLoading.value = false
}

const goToPurchase = () => {
  if (authStore.isAuthenticated) {
    router.push(`/purchase/${props.id}`)
  } else {
    router.push('/login')
  }
}

const goToAirline = () => {
  router.push(`/airline/${trip.value.airline_id}`)
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Не указано'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Неверная дата'
  
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Неверная дата'
  
  return date.toLocaleDateString('ru-RU')
}

onMounted(() => {
  loadTripDetails()
  if (authStore.isAuthenticated) {
    ticketsStore.loadFavorites()
  }
})
</script>

<style scoped>
.trip-details {
  padding: 40px 0;
}

.trip-content {
  max-width: 800px;
  margin: 0 auto;
}

.trip-info h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-align: center;
  color: #2c3e50;
}

.trip-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 30px;
}

.detail-section h3 {
  margin-bottom: 15px;
  color: #34495e;
}

.flight-info {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.airport {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.city {
  color: #7f8c8d;
  margin-bottom: 10px;
}

.time {
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: bold;
}

.airline-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.airline-card:hover {
  background: #e9ecef;
}

.airline-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.airline-name {
  font-weight: 600;
}

.price-info {
  text-align: center;
  margin: 30px 0;
}

.price {
  font-size: 3rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 10px;
}

.seats {
  color: #e67e22;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.reviews h2 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.review-item {
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reviewer {
  font-weight: 600;
}

.rating .star {
  color: #ffd700;
  font-size: 18px;
}

.rating .star:not(.filled) {
  color: #e0e0e0;
}

.review-text {
  margin-bottom: 10px;
  line-height: 1.6;
}

.review-meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .trip-details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
