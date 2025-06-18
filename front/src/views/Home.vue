<template>
  <div class="home">
    <div class="container">
      <div class="hero">
        <h1>Найдите лучшие авиабилеты</h1>
        <p>Быстро, удобно, выгодно</p>
      </div>
      <div class="search-form card">
        <h2>Поиск рейсов</h2>
        <form @submit.prevent="searchFlights">
          <div class="grid grid-2">
            <div class="form-group">
              <label>Откуда</label>
              <select v-model="searchForm.departure_city" class="form-control">
                <option value="">Любой город</option>
                <option v-for="city in cities" :key="city.id" :value="city.id">
                  {{ city.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Куда</label>
              <select v-model="searchForm.arrival_city" class="form-control">
                <option value="">Любой город</option>
                <option v-for="city in cities" :key="city.id" :value="city.id">
                  {{ city.name }}
                </option>
              </select>
            </div>
              <div class="form-group">
              <label>Период вылета (необязательно)</label>
              <div class="date-range">
                <input
                  v-model="searchForm.departure_date_from"
                  type="date"
                  class="form-control date-input"
                  :min="today"
                  placeholder="От"
                />
                <span class="date-separator">—</span>
                <input
                  v-model="searchForm.departure_date_to"
                  type="date"
                  class="form-control date-input"
                  :min="searchForm.departure_date_from || today"
                  placeholder="До"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label>Цена</label>
              <div class="price-range">
                <div class="price-inputs">
                  <input
                    v-model="searchForm.min_price"
                    type="number"
                    step="1"
                    class="form-control price-input"
                    :min="priceRange.min_price"
                    :max="priceRange.max_price"
                    :placeholder="`От ${Math.ceil(priceRange.min_price)}`"
                    @input="updateSliderFromInput"
                  />
                  <span class="price-separator">—</span>
                  <input
                    v-model="searchForm.max_price"
                    type="number"
                    step="1"
                    class="form-control price-input"
                    :min="priceRange.min_price"
                    :max="priceRange.max_price"
                    :placeholder="`До ${Math.floor(priceRange.max_price)}`"
                    @input="updateSliderFromInput"
                  />
                </div>
                <div class="price-sliders">
                  <input
                    v-model="priceSlider.min"
                    type="range"
                    class="slider slider-min"
                    :min="priceRange.min_price"
                    :max="priceRange.max_price"
                    @input="updatePriceFromSlider"
                  />
                  <input
                    v-model="priceSlider.max"
                    type="range"
                    class="slider slider-max"
                    :min="priceRange.min_price"
                    :max="priceRange.max_price"
                    @input="updatePriceFromSlider"
                  />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Поиск...' : 'Найти рейсы' }}
          </button>
        </form>
      </div>

      <div class="destinations">
        <h2>Направления</h2>
        <div v-if="ticketsStore.loading" class="loading">
          Загрузка направлений...
        </div>
        <div v-else class="grid grid-3">
          <div
            v-for="destination in ticketsStore.destinations"
            :key="destination.id"
            class="destination-card card"
            @click="goToTrip(destination.id)"
          >
            <div class="destination-info">
              <h3>{{ destination.departure_city }} → {{ destination.arrival_city }}</h3>
              <p class="airline">{{ destination.airline_name }}</p>
              <p class="date">{{ formatDate(destination.departure_date) }}</p>
              <div class="price">{{ Math.round(destination.price) }} ₽</div>
              <div class="seats">Мест: {{ destination.available_seats }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketsStore } from '@/stores/tickets'
import api from '@/api'

const router = useRouter()
const ticketsStore = useTicketsStore()

const cities = ref([])
const priceRange = ref({ min_price: 0, max_price: 100000 })
const loading = ref(false)

const searchForm = ref({
  departure_city: '',
  arrival_city: '',
  departure_date_from: '',
  departure_date_to: '',
  min_price: '',
  max_price: ''
})

const priceSlider = ref({
  min: 0,
  max: 100000
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const loadData = async () => {
  try {
    const [citiesResponse, priceResponse] = await Promise.all([
      api.reference.getCities(),
      api.reference.getPriceRange()
    ])
    
    cities.value = citiesResponse.data.data
    priceRange.value = priceResponse.data.data

    priceSlider.value.min = priceRange.value.min_price
    priceSlider.value.max = priceRange.value.max_price

    setTimeout(() => {
      updateSliderBackground()
    }, 100)
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

const updatePriceFromSlider = () => {
  const minValue = parseInt(priceSlider.value.min)
  const maxValue = parseInt(priceSlider.value.max)

  if (minValue > maxValue) {
    priceSlider.value.min = maxValue
  }
  if (maxValue < minValue) {
    priceSlider.value.max = minValue
  }

  searchForm.value.min_price = parseInt(priceSlider.value.min)
  searchForm.value.max_price = parseInt(priceSlider.value.max)

  updateSliderBackground()
}

const updateSliderFromInput = () => {
  if (searchForm.value.min_price !== '') {
    const minPrice = parseInt(searchForm.value.min_price) || priceRange.value.min_price
    priceSlider.value.min = minPrice
    searchForm.value.min_price = minPrice
  }
  if (searchForm.value.max_price !== '') {
    const maxPrice = parseInt(searchForm.value.max_price) || priceRange.value.max_price
    priceSlider.value.max = maxPrice
    searchForm.value.max_price = maxPrice
  }

  if (priceSlider.value.min < priceRange.value.min_price) {
    priceSlider.value.min = priceRange.value.min_price
    searchForm.value.min_price = priceRange.value.min_price
  }
  if (priceSlider.value.max > priceRange.value.max_price) {
    priceSlider.value.max = priceRange.value.max_price
    searchForm.value.max_price = priceRange.value.max_price
  }
  if (priceSlider.value.min > priceSlider.value.max) {
    priceSlider.value.min = priceSlider.value.max
    searchForm.value.min_price = priceSlider.value.max
  }
  
  updateSliderBackground()
}

const updateSliderBackground = () => {
  const range = priceRange.value.max_price - priceRange.value.min_price
  const minPercent = ((priceSlider.value.min - priceRange.value.min_price) / range) * 100
  const maxPercent = ((priceSlider.value.max - priceRange.value.min_price) / range) * 100
  
  const sliderElement = document.querySelector('.price-sliders')
  if (sliderElement) {
    sliderElement.style.setProperty('--min-percent', `${minPercent}%`)
    sliderElement.style.setProperty('--max-percent', `${maxPercent}%`)
  }
}

const searchFlights = async () => {
  loading.value = true
  
  const params = {}
  
  if (searchForm.value.departure_city) {
    params.departure_city = searchForm.value.departure_city
  }
  if (searchForm.value.arrival_city) {
    params.arrival_city = searchForm.value.arrival_city
  }  if (searchForm.value.departure_date_from) {
    params.departure_date_from = searchForm.value.departure_date_from
  }
  if (searchForm.value.departure_date_to) {
    params.departure_date_to = searchForm.value.departure_date_to
  }
  if (searchForm.value.min_price) {
    params.min_price = parseInt(searchForm.value.min_price)
  }
  if (searchForm.value.max_price) {
    params.max_price = parseInt(searchForm.value.max_price)
  }
  
  console.log('Параметры поиска:', params)
  
  try {
    await ticketsStore.searchTickets(params)
    router.push('/search')
  } catch (error) {
    console.error('Ошибка поиска:', error)
  } finally {
    loading.value = false
  }
}

const goToTrip = (tripId) => {
  router.push(`/trip/${tripId}`)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
  ticketsStore.loadDestinations()
})
</script>

<style scoped>
.home {
  padding: 40px 0;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero p {
  font-size: 1.5rem;
  opacity: 0.9;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.search-form {
  margin-bottom: 60px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.search-form h2 {
  margin-bottom: 30px;
  text-align: center;
  color: #2c3e50;
}

.destinations h2 {
  margin-bottom: 30px;
  text-align: center;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  flex: 1;
}

.price-separator {
  font-weight: bold;
  color: #7f8c8d;
}

.price-sliders {
  position: relative;
  height: 30px;
  margin-top: 10px;
}

.slider {
  position: absolute;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: transparent;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
}

.slider::-webkit-slider-track {
  height: 6px;
  border-radius: 3px;
  background: transparent;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  position: relative;
}

.slider::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: transparent;
  border: none;
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  position: relative;
}

.slider-min {
  z-index: 2;
}

.slider-max {
  z-index: 1;
}

.price-sliders::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: 0;
}

.price-sliders::before {
  content: '';
  position: absolute;
  top: 50%;
  height: 6px;
  background: #3498db;
  border-radius: 3px;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
  left: var(--min-percent, 0%);
  width: calc(var(--max-percent, 100%) - var(--min-percent, 0%));
}

.destination-card {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.destination-info h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #2c3e50;
}

.airline {
  color: #7f8c8d;
  margin-bottom: 5px;
}

.date {
  color: #95a5a6;
  margin-bottom: 10px;
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

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  flex: 1;
}

.date-separator {
  font-weight: bold;
  color: #7f8c8d;
  margin: 0 5px;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero p {
    font-size: 1.2rem;
  }
}
</style>
