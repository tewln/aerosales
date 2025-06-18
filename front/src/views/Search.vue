<template>
  <div class="search">
    <div class="container">
      <h1>Результаты поиска</h1>
      
      <div v-if="ticketsStore.loading" class="loading">
        Поиск рейсов...
      </div>
      
      <div v-else-if="ticketsStore.searchResults.length > 0" class="search-results">
        <div
          v-for="trip in ticketsStore.searchResults"
          :key="trip.id"
          class="trip-card card"
          @click="goToTrip(trip.id)"
        >
          <div class="trip-info">
            <div class="route">
              <h3>{{ trip.departure_city }} → {{ trip.arrival_city }}</h3>
              <p class="airline">{{ trip.airline_name }}</p>
            </div>
              <div class="time-info">
              <div class="departure">
                <span class="time">{{ formatTime(trip.departure_date) }}</span>
                <span class="date">{{ formatDate(trip.departure_date) }}</span>
              </div>
              <div class="arrow">✈️</div>
              <div class="arrival">
                <span class="time">{{ formatTime(trip.arrival_date) }}</span>
                <span class="date">{{ formatDate(trip.arrival_date) }}</span>
              </div>
            </div>
            
            <div class="price-seats">
              <div class="price">{{ Math.round(trip.price) }} ₽</div>
              <div class="seats">{{ trip.available_seats }} мест</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-results">
        <h2>Рейсы не найдены</h2>
        <p>Попробуйте изменить параметры поиска</p>
        <RouterLink to="/" class="btn btn-primary">
          Новый поиск
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'

const router = useRouter()
const ticketsStore = useTicketsStore()

const goToTrip = (tripId) => {
  router.push(`/trip/${tripId}`)
}

const formatTime = (dateString) => {
  if (!dateString) return 'Не указано'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    console.warn('Неверный формат даты:', dateString)
    return 'Неверная дата'
  }
  
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    console.warn('Неверный формат даты:', dateString)
    return 'Неверная дата'
  }
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

onMounted(() => {
  console.log('Результаты поиска:', ticketsStore.searchResults.length)
  
})
</script>

<style scoped>
.search {
  padding: 40px 0;
}

.search h1 {
  text-align: center;
  margin-bottom: 40px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.trip-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.trip-info {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  gap: 20px;
  align-items: center;
}

.route h3 {
  margin-bottom: 5px;
  color: #2c3e50;
}

.airline {
  color: #7f8c8d;
  margin: 0;
}

.time-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}

.departure, .arrival {
  display: flex;
  flex-direction: column;
}

.time {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.date {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.arrow {
  font-size: 1.5rem;
  color: #3498db;
}

.price-seats {
  text-align: right;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 5px;
}

.seats {
  color: #e67e22;
  font-size: 0.9rem;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);  
}

.no-results h2 {
  margin-bottom: 20px;
}

.no-results p {
  margin-bottom: 30px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .trip-info {
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: center;
  }
  
  .time-info {
    flex-direction: column;
    gap: 20px;
  }
  
  .price-seats {
    text-align: center;
  }
}
</style>
