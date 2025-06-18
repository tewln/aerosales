<template>
  <div class="my-tickets">
    <div class="container">
      <h1>Мои билеты</h1>
      
      <div class="ticket-tabs">
        <button
          @click="activeTab = 'current'"
          class="tab-btn"
          :class="{ active: activeTab === 'current' }"
        >
          Текущие билеты
        </button>
        <button
          @click="activeTab = 'history'"
          class="tab-btn"
          :class="{ active: activeTab === 'history' }"
        >
          Архив
        </button>
      </div>
      
      <div v-if="ticketsStore.loading" class="loading">
        Загрузка билетов...
      </div>
      
      <div v-else-if="activeTab === 'current'" class="tickets-list">
        <div v-if="ticketsStore.myTickets.length > 0">
          <div
            v-for="ticket in ticketsStore.myTickets"
            :key="ticket.purchase_id"
            class="ticket-card card"
          >
            <div class="ticket-header">
              <h3>{{ ticket.departure_city }} → {{ ticket.arrival_city }}</h3>
              <span class="status" :class="ticket.status">{{ getStatusName(ticket.status) }}</span>
            </div>
            
            <div class="ticket-details">
              <div class="detail-item">
                <span class="label">Авиакомпания:</span>
                <span>{{ ticket.airline_name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Дата вылета:</span>
                <span>{{ formatDateTime(ticket.departure_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Количество мест:</span>
                <span>{{ ticket.number_of_seats }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Стоимость:</span>
                <span class="price">{{ Math.round(ticket.number_of_seats * ticket.price) }} ₽</span>
              </div>
            </div>
            
            <div class="ticket-actions">
              <RouterLink :to="`/trip/${ticket.trip_id}`" class="btn btn-secondary">
                Подробнее
              </RouterLink>
              <button
                v-if="ticket.status === 'paid' && !isPastTrip(ticket.departure_date)"
                @click="cancelTicket(ticket.purchase_id)"
                class="btn btn-danger"
                :disabled="cancelling"
              >
                Сдать в кассу
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-tickets">
          <h3>У вас пока нет активных билетов</h3>
          <RouterLink to="/" class="btn btn-primary">Найти рейсы</RouterLink>
        </div>
      </div>
      
      <div v-else class="tickets-list">
        <div v-if="ticketsStore.myHistory.length > 0">
          <div
            v-for="ticket in ticketsStore.myHistory"
            :key="ticket.purchase_id"
            class="ticket-card card"
          >
            <div class="ticket-header">
              <h3>{{ ticket.departure_city }} → {{ ticket.arrival_city }}</h3>
              <span class="status" :class="ticket.status">{{ getStatusName(ticket.status) }}</span>
            </div>
            
            <div class="ticket-details">
              <div class="detail-item">
                <span class="label">Авиакомпания:</span>
                <span>{{ ticket.airline_name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Дата вылета:</span>
                <span>{{ formatDateTime(ticket.departure_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Количество мест:</span>
                <span>{{ ticket.number_of_seats }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Стоимость:</span>
                <span class="price">{{ Math.round(ticket.number_of_seats * ticket.price) }} ₽</span>
              </div>
            </div>
            
            <div class="ticket-actions">
              <RouterLink :to="`/trip/${ticket.trip_id}`" class="btn btn-secondary">
                Подробнее
              </RouterLink>              <button
                v-if="isPastTrip(ticket.departure_date) && ticket.status === 'paid'"
                @click="showReviewForm(ticket)"
                class="btn btn-primary"
              >
                Оставить отзыв
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-tickets">
          <h3>История пуста</h3>
          <p>Здесь будут отображаться завершенные и отмененные поездки</p>
        </div>
      </div>
      
      <div v-if="reviewModal" class="modal-overlay" @click="closeReviewModal">
        <div class="modal" @click.stop>
          <h3>Оставить отзыв</h3>
          <form @submit.prevent="submitReview">
            <div class="form-group">
              <label>Оценка</label>
              <div class="rating-input">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  @click="reviewForm.rating = i"
                  class="star-btn"
                  :class="{ active: i <= reviewForm.rating }"
                >
                  ★
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Комментарий</label>
              <textarea
                v-model="reviewForm.comment"
                class="form-control"
                rows="4"
                required
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn btn-primary" :disabled="submittingReview">
                {{ submittingReview ? 'Отправка...' : 'Отправить' }}
              </button>
              <button type="button" @click="closeReviewModal" class="btn btn-secondary">
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTicketsStore } from '@/stores/tickets'
import api from '@/api'

const ticketsStore = useTicketsStore()
const activeTab = ref('current')
const cancelling = ref(false)
const reviewModal = ref(false)
const submittingReview = ref(false)
const selectedTicket = ref(null)

const reviewForm = ref({
  rating: 5,
  comment: ''
})

const loadTickets = async () => {
  await Promise.all([
    ticketsStore.loadMyTickets(),
    ticketsStore.loadMyHistory()
  ])
}

const cancelTicket = async (purchaseId) => {
  if (!confirm('Вы уверены, что хотите сдать билет в кассу?')) return
  
  cancelling.value = true
  console.log('Сдаем билет в кассу с ID:', purchaseId)
  
  try {
    const success = await ticketsStore.cancelTicket(purchaseId)
    
    if (success) {
      alert('Билет сдан в кассу!')
      await loadTickets()
    } else {
      alert('Ошибка при сдаче билета: ' + (ticketsStore.error || 'Неизвестная ошибка'))
    }
  } catch (error) {
    console.error('Ошибка сдачи билета:', error)
    alert('Ошибка при сдаче билета')
  } finally {
    cancelling.value = false
  }
}

const showReviewForm = (ticket) => {
  selectedTicket.value = ticket
  reviewForm.value = {
    rating: 5,
    comment: ''
  }
  reviewModal.value = true
}

const closeReviewModal = () => {
  reviewModal.value = false
  selectedTicket.value = null
}

const submitReview = async () => {
  submittingReview.value = true
  
  try {
    await api.tickets.addReview({
      trip_id: selectedTicket.value.trip_id,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment
    })
    
    closeReviewModal()
    alert('Отзыв успешно добавлен!')
  } catch (error) {
    alert('Ошибка при добавлении отзыва')
  } finally {
    submittingReview.value = false
  }
}

const getStatusName = (status) => {
  const statuses = {
    'paid': 'Оплачен',
    'canceled': 'Рейс отменен',
    'used': 'Использован',
    'refunded': 'Сдан в кассу'
  }
  return statuses[status] || status
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isPastTrip = (dateString) => {
  return new Date(dateString) < new Date()
}

onMounted(() => {
  loadTickets()
})
</script>

<style scoped>
.my-tickets {
  padding: 40px 0;
}

.my-tickets h1 {
  text-align: center;
  margin-bottom: 30px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.ticket-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 10px;
}

.tab-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: white;
  color: #2c3e50;
}

.ticket-card {
  margin-bottom: 20px;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ticket-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status.paid {
  background: #e8f5e8;
  color: #27ae60;
}

.status.canceled {
  background: #fdf2f2;
  color: #e74c3c;
}

.status.refunded {
  background: #fff4e6;
  color: #f39c12;
}

.status.used {
  background: #f0f8ff;
  color: #3498db;
}

.ticket-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  color: #7f8c8d;
  font-weight: 600;
}

.price {
  color: #27ae60;
  font-weight: bold;
}

.ticket-actions {
  display: flex;
  gap: 10px;
}

.no-tickets {
  text-align: center;
  padding: 60px 20px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.no-tickets h3 {
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.rating-input {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #e0e0e0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.star-btn.active {
  color: #ffd700;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .ticket-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 5px;
  }
  
  .ticket-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
