<template>
  <div class="admin-trips">
    <div class="page-header">
      <button @click="$router.push('/admin')" class="back-btn">
        ← Назад к админ-панели
      </button>
      <h1>Управление рейсами</h1>
    </div>

    <div class="section">
      <h2>Создать новый рейс</h2>
      <form @submit.prevent="createTrip" class="trip-form">
        <div class="form-row">
          <div class="form-group">
            <label>Город отправления:</label>
            <select v-model="newTrip.departure_city_id" required>
              <option value="">Выберите город</option>
              <option v-for="city in cities" :key="city.id" :value="city.id">
                {{ city.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Город прибытия:</label>
            <select v-model="newTrip.arrival_city_id" required>
              <option value="">Выберите город</option>
              <option v-for="city in cities" :key="city.id" :value="city.id">
                {{ city.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Аэропорт отправления:</label>
            <select v-model="newTrip.departure_airport_id" required>
              <option value="">Выберите аэропорт</option>
              <option v-for="airport in departureAirports" :key="airport.id" :value="airport.id">
                {{ airport.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Аэропорт прибытия:</label>
            <select v-model="newTrip.arrival_airport_id" required>
              <option value="">Выберите аэропорт</option>
              <option v-for="airport in arrivalAirports" :key="airport.id" :value="airport.id">
                {{ airport.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Авиакомпания:</label>
            <select v-model="newTrip.airline_id" required>
              <option value="">Выберите авиакомпанию</option>
              <option v-for="airline in airlines" :key="airline.id" :value="airline.id">
                {{ airline.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Цена:</label>
            <input 
              type="number" 
              v-model="newTrip.price" 
              min="0" 
              step="1" 
              required
              placeholder="Цена в рублях"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Дата отправления:</label>
            <input 
              type="datetime-local" 
              v-model="newTrip.departure_date" 
              required
            >
          </div>
          <div class="form-group">
            <label>Дата прибытия:</label>
            <input 
              type="datetime-local" 
              v-model="newTrip.arrival_date" 
              required
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Доступных мест:</label>
            <input 
              type="number" 
              v-model="newTrip.available_seats" 
              min="1" 
              required
              placeholder="Количество мест"
            >
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Создание...' : 'Создать рейс' }}
        </button>
      </form>
    </div>

    <div class="section">
      <h2>Существующие рейсы</h2>
      <div class="trips-list">
        <div v-if="trips.length === 0" class="no-trips">
          Нет доступных рейсов
        </div>
        <div v-for="trip in trips" :key="trip.id" class="trip-item">
          <div class="trip-info">
            <h3>{{ trip.departure_city }} → {{ trip.arrival_city }}</h3>
            <p>{{ trip.airline_name }}</p>
            <p>{{ formatDate(trip.departure_date) }} - {{ formatDate(trip.arrival_date) }}</p>
            <p>Цена: {{ trip.price }}₽ | Мест: {{ trip.available_seats }}</p>
          </div>
          <div class="trip-actions">
            <button @click="editTrip(trip)" class="btn btn-edit">
              Изменить
            </button>
            <button @click="deleteTrip(trip.id)" class="btn btn-delete" :disabled="loading">
              Отменить
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingTrip" class="modal-overlay" @click="closeEdit">
      <div class="modal" @click.stop>
        <h3>Редактирование рейса</h3>
        <form @submit.prevent="updateTrip" class="trip-form">
          <div class="form-group">
            <label>Цена:</label>
            <input 
              type="number" 
              v-model="editingTrip.price" 
              min="0" 
              step="1" 
              required
            >
          </div>
          <div class="form-group">
            <label>Дата отправления:</label>
            <input 
              type="datetime-local" 
              v-model="editingTrip.departure_date" 
              required
            >
          </div>
          <div class="form-group">
            <label>Дата прибытия:</label>
            <input 
              type="datetime-local" 
              v-model="editingTrip.arrival_date" 
              required
            >
          </div>
          <div class="form-group">
            <label>Доступных мест:</label>
            <input 
              type="number" 
              v-model="editingTrip.available_seats" 
              min="1" 
              required
            >
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button type="button" @click="closeEdit" class="btn btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import api from '@/api'

const loading = ref(false)
const message = ref('')
const messageType = ref('success')

const cities = ref([])
const airlines = ref([])
const airports = ref([])
const trips = ref([])

const newTrip = ref({
  departure_city_id: '',
  arrival_city_id: '',
  departure_airport_id: '',
  arrival_airport_id: '',
  airline_id: '',
  price: '',
  departure_date: '',
  arrival_date: '',
  available_seats: ''
})

const editingTrip = ref(null)

const departureAirports = computed(() => {
  if (!newTrip.value.departure_city_id) return []
  return airports.value.filter(airport => airport.city_id == newTrip.value.departure_city_id)
})

const arrivalAirports = computed(() => {
  if (!newTrip.value.arrival_city_id) return []
  return airports.value.filter(airport => airport.city_id == newTrip.value.arrival_city_id)
})

const loadReferenceData = async () => {
  try {
    const [citiesRes, airlinesRes, airportsRes] = await Promise.all([
      api.reference.getAllCities(),
      api.reference.getAllAirlines(),
      api.reference.getAllAirports()
    ])
    
    cities.value = citiesRes.data.data || []
    airlines.value = airlinesRes.data.data || []
    airports.value = airportsRes.data.data || []
    
  } catch (error) {
    console.error('Ошибка загрузки справочных данных:', error)
    showMessage('Ошибка загрузки справочных данных', 'error')
  }
}

const loadTrips = async () => {
  try {
    const response = await api.admin.trips.getAll()
    trips.value = response.data.data || []
  } catch (error) {
    showMessage('Ошибка загрузки рейсов', 'error')
  }
}

const createTrip = async () => {
  loading.value = true
  try {
    const tripData = {
      departure_airport: newTrip.value.departure_airport_id,
      arrival_airport: newTrip.value.arrival_airport_id,
      departure_date: newTrip.value.departure_date,
      arrival_date: newTrip.value.arrival_date,
      price: newTrip.value.price,
      available_seats: newTrip.value.available_seats,
      airline: newTrip.value.airline_id
    }
    
    await api.admin.trips.create(tripData)
    showMessage('Рейс успешно создан', 'success')
    newTrip.value = {
      departure_city_id: '',
      arrival_city_id: '',
      departure_airport_id: '',
      arrival_airport_id: '',
      airline_id: '',
      price: '',
      departure_date: '',
      arrival_date: '',
      available_seats: ''
    }

    await loadTrips()
  } catch (error) {
    showMessage(error.response?.data?.message || 'Ошибка создания рейса', 'error')
  } finally {
    loading.value = false
  }
}

const editTrip = (trip) => {
  editingTrip.value = {
    id: trip.id,
    price: trip.price,
    departure_date: formatDateForInput(trip.departure_date),
    arrival_date: formatDateForInput(trip.arrival_date),
    available_seats: trip.available_seats
  }
}

const updateTrip = async () => {
  loading.value = true
  try {
    const updateData = {
      price: editingTrip.value.price,
      departure_date: editingTrip.value.departure_date,
      arrival_date: editingTrip.value.arrival_date,
      available_seats: editingTrip.value.available_seats
    }
    
    await api.admin.trips.update(editingTrip.value.id, updateData)
    showMessage('Рейс успешно обновлён', 'success')
    closeEdit()
    await loadTrips()
  } catch (error) {
    showMessage(error.response?.data?.message || 'Ошибка обновления рейса', 'error')
  } finally {
    loading.value = false
  }
}

const closeEdit = () => {
  editingTrip.value = null
}

const deleteTrip = async (tripId) => {
  if (!confirm('Вы уверены, что хотите отменить этот рейс?')) {
    return
  }
  
  loading.value = true
  try {
    await api.admin.trips.delete(tripId)
    showMessage('Рейс успешно отменён', 'success')
    await loadTrips()
  } catch (error) {
    showMessage(error.response?.data?.message || 'Ошибка отмены рейса', 'error')
  } finally {
    loading.value = false
  }
}

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('ru-RU')
}

const formatDateForInput = (dateString) => {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

watch(() => newTrip.value.departure_city_id, () => {
  newTrip.value.departure_airport_id = ''
})

watch(() => newTrip.value.arrival_city_id, () => {
  newTrip.value.arrival_airport_id = ''
})

onMounted(async () => {
  await loadReferenceData()
  await loadTrips()
})
</script>

<style scoped>
.admin-trips {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.trip-form {
  max-width: 800px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-edit {
  background: #f39c12;
  color: white;
  margin-right: 0.5rem;
}

.btn-edit:hover {
  background: #e67e22;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #c0392b;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.trips-list {
  display: grid;
  gap: 1rem;
}

.trip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
}

.trip-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.trip-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
}

.trip-actions {
  display: flex;
  align-items: center;
}

.no-trips {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
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
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  color: white;
  z-index: 1001;
}

.message.success {
  background: #27ae60;
}

.message.error {
  background: #e74c3c;
}

@media (max-width: 768px) {
  .admin-trips {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .trip-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .trip-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal {
    margin: 1rem;
  }
}
</style>
