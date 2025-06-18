<template>
  <div class="purchase">
    <div class="container">
      <div class="purchase-content">
        <div v-if="loading" class="loading">
          Загрузка информации о рейсе...
        </div>
        
        <div v-else-if="trip" class="purchase-form">
          <div class="card trip-summary">
            <h2>Подтверждение покупки</h2>
            
            <div class="trip-details">
              <h3>{{ trip.departure_city }} → {{ trip.arrival_city }}</h3>
              <p class="airline">{{ trip.airline_name }}</p>
              <div class="time-info">
                <span>{{ formatDateTime(trip.departure_date) }}</span>
                <span> - </span>
                <span>{{ formatDateTime(trip.arrival_date) }}</span>
              </div>
            </div>
          </div>
          
          <div class="card purchase-details">
            <h3>Детали заказа</h3>
            
            <form @submit.prevent="handlePurchase">
              <div class="form-group">
                <label>Количество билетов</label>
                <div class="quantity-selector">
                  <input 
                    v-model="purchaseForm.seats"
                    type="number" 
                    class="quantity-input"
                    :min="1" 
                    :max="maxSeats"
                    @input="validateAndCalculate"
                  />
                  <div class="quantity-buttons">
                    <button 
                      type="button" 
                      class="quantity-btn increase" 
                      @click="increaseSeats"
                      :disabled="purchaseForm.seats >= maxSeats"
                    >
                      ▲
                    </button>
                    <button 
                      type="button" 
                      class="quantity-btn decrease" 
                      @click="decreaseSeats"
                      :disabled="purchaseForm.seats <= 1"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                <small class="seats-info">Доступно мест: {{ trip?.available_seats || 0 }}</small>
              </div>
              
              <div class="price-breakdown">
                <div class="price-row">
                  <span>Цена за билет:</span>
                  <span>{{ trip.price }} ₽</span>
                </div>
                <div class="price-row">
                  <span>Количество:</span>
                  <span>{{ purchaseForm.seats }}</span>
                </div>
                <div v-if="discount > 0" class="price-row discount">
                  <span>Скидка:</span>
                  <span>-{{ discount }} %</span>
                </div>
                <div class="price-row total">
                  <span>Итого:</span>
                  <span>{{ totalPrice }} ₽</span>
                </div>
              </div>
              
              <div v-if="error" class="error">
                {{ error }}
              </div>
              
              <div v-if="success" class="success">
                Билет успешно приобретен! Перенаправляем в личный кабинет...
              </div>
              
              <div class="actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="purchasing || success"
                >
                  {{ purchasing ? 'Обработка...' : 'Купить билет' }}
                </button>
                <RouterLink :to="`/trip/${tripId}`" class="btn btn-secondary">
                  Отмена
                </RouterLink>
              </div>
            </form>
          </div>
        </div>
        
        <div v-else class="error">
          Рейс не найден
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

const props = defineProps(['tripId'])
const router = useRouter()
const ticketsStore = useTicketsStore()

const trip = ref(null)
const loading = ref(true)
const purchasing = ref(false)
const error = ref(null)
const success = ref(false)
const totalPrice = ref(0)
const discount = ref(0)

const purchaseForm = ref({
  seats: 1
})

const maxSeats = computed(() => {
  if (!trip.value) return 1
  return Math.min(trip.value.available_seats, 10)
})

const loadTripDetails = async () => {
  try {
    console.log('Загружаем детали рейса для ID:', props.tripId)
    const response = await api.tickets.getTripDetails(props.tripId)
    console.log('Ответ API:', response.data)
    trip.value = response.data.data
    console.log('Данные рейса:', trip.value)
    calculateTotal()
  } catch (err) {
    console.error('Ошибка загрузки рейса:', err)
    error.value = 'Ошибка загрузки рейса: ' + (err.response?.data?.message || err.message)
  } finally {
    loading.value = false
  }
}

const calculateTotal = async () => {
  if (!trip.value) return
    try {
    const response = await api.tickets.calculatePrice({
      trip_id: props.tripId,
      number_of_seats: purchaseForm.value.seats
    })
    
    const data = response.data.data
    totalPrice.value = parseInt(data.final_price || data.total_price)
    discount.value = parseInt(data.discount_percentage || 0)
  } catch (err) {
    // Если расчет не удался, используем базовую цену
    totalPrice.value = parseInt(trip.value.price) * purchaseForm.value.seats
    discount.value = 0
  }
}

const increaseSeats = () => {
  if (purchaseForm.value.seats < maxSeats.value) {
    purchaseForm.value.seats++
    calculateTotal()
  }
}

const decreaseSeats = () => {
  if (purchaseForm.value.seats > 1) {
    purchaseForm.value.seats--
    calculateTotal()
  }
}

const validateAndCalculate = () => {
  // Приводим к числу и проверяем границы
  let seats = parseInt(purchaseForm.value.seats)
  
  if (isNaN(seats) || seats < 1) {
    seats = 1
  } else if (seats > maxSeats.value) {
    seats = maxSeats.value
  }
  
  purchaseForm.value.seats = seats
  calculateTotal()
}

const handlePurchase = async () => {
  purchasing.value = true
  error.value = null
  
  try {
    const purchaseData = {
      trip_id: props.tripId,
      number_of_seats: purchaseForm.value.seats
    }
    
    await ticketsStore.purchaseTicket(purchaseData)
    
    if (ticketsStore.error) {
      error.value = ticketsStore.error
    } else {
      success.value = true
      setTimeout(() => {
        router.push('/my-tickets')
      }, 2000)
    }
  } catch (err) {
    error.value = 'Ошибка при покупке билета'
  } finally {
    purchasing.value = false
  }
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadTripDetails()
})
</script>

<style scoped>
.purchase {
  padding: 40px 0;
}

.purchase-content {
  max-width: 600px;
  margin: 0 auto;
}

.trip-summary h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.trip-details h3 {
  margin-bottom: 5px;
  color: #2c3e50;
}

.airline {
  color: #7f8c8d;
  margin-bottom: 10px;
}

.time-info {
  font-weight: 600;
  color: #34495e;
}

.purchase-details h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.price-breakdown {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price-row.discount {
  color: #e74c3c;
}

.price-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  border-top: 2px solid #34495e;
  padding-top: 10px;
  margin-top: 15px;
  color: #27ae60;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.quantity-selector {
  display: flex;
  align-items: stretch;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  max-width: 200px;
}

.quantity-input {
  border: none;
  padding: 12px 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  outline: none;
  color: #2c3e50;
}

.quantity-buttons {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ddd;
}

.quantity-btn {
  background: #f8f9fa;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  color: #495057;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 24px;
}

.quantity-btn:hover:not(:disabled) {
  background: #e9ecef;
  color: #3498db;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-btn.decrease {
  border-top: 1px solid #ddd;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.seats-info {
  display: block;
  margin-top: 8px;
  color: #6c757d;
  font-size: 14px;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
  
  .quantity-selector {
    max-width: 100%;
  }
}
</style>
