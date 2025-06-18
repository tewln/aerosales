<template>
  <div class="admin-statistics">
    <div class="page-header">
      <button @click="$router.push('/admin')" class="back-btn">
        ← Назад к админ-панели
      </button>
      <h1>Статистика и отчёты</h1>
    </div>

    <div class="section">
      <h2>Общая статистика</h2>
      <div v-if="loading" class="loading">
        Загрузка статистики...
      </div>
      <div v-else-if="statistics" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ statistics.total_users || 0 }}</h3>
            <p>Пользователей</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✈️</div>
          <div class="stat-info">
            <h3>{{ statistics.total_trips || 0 }}</h3>
            <p>Рейсов</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎫</div>
          <div class="stat-info">
            <h3>{{ statistics.total_purchases || 0 }}</h3>
            <p>Билетов продано</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>{{ formatMoney(statistics.total_revenue || 0) }}₽</h3>
            <p>Общая выручка</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <h3>{{ formatMoney(statistics.average_ticket_price || 0) }}₽</h3>
            <p>Средняя цена билета</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <h3>{{ statistics.total_favorites || 0 }}</h3>
            <p>В избранном</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section" v-if="statistics?.airlines_stats">
      <h2>Статистика по авиакомпаниям</h2>
      <div class="table-container">
        <table class="stats-table">
          <thead>
            <tr>
              <th>Авиакомпания</th>
              <th>Рейсов</th>
              <th>Билетов продано</th>
              <th>Выручка</th>
              <th>Средняя цена</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="airline in statistics.airlines_stats" :key="airline.airline_id">
              <td class="airline-name">{{ airline.airline_name }}</td>
              <td>{{ airline.trips_count }}</td>
              <td>{{ airline.tickets_sold }}</td>
              <td>{{ formatMoney(airline.revenue) }}₽</td>
              <td>{{ formatMoney(airline.average_price) }}₽</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section" v-if="statistics?.popular_routes">
      <h2>Популярные направления</h2>
      <div class="routes-list">
        <div v-for="route in statistics.popular_routes" :key="`${route.departure_city}-${route.arrival_city}`" class="route-item">
          <div class="route-info">
            <h3>{{ route.departure_city }} → {{ route.arrival_city }}</h3>
            <p>{{ route.tickets_sold }} билетов продано</p>
          </div>
          <div class="route-stats">
            <span class="revenue">{{ formatMoney(route.revenue) }}₽</span>
            <span class="avg-price">Средняя цена: {{ formatMoney(route.average_price) }}₽</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section" v-if="statistics?.monthly_stats">
      <h2>Статистика по месяцам</h2>
      <div class="monthly-chart">
        <div v-for="month in statistics.monthly_stats" :key="month.month" class="month-bar">
          <div class="bar" :style="{ height: getBarHeight(month.revenue) + '%' }"></div>
          <div class="month-label">{{ formatMonth(month.month) }}</div>
          <div class="month-value">{{ formatMoney(month.revenue) }}₽</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Создать отчёт</h2>
      <form @submit.prevent="generateReport" class="report-form">
        <div class="form-row">
          <div class="form-group">
            <label>Дата начала:</label>
            <input 
              type="date" 
              v-model="reportParams.start_date" 
              required
            >
          </div>
          <div class="form-group">
            <label>Дата окончания:</label>
            <input 
              type="date" 
              v-model="reportParams.end_date" 
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>Тип отчёта:</label>
          <select v-model="reportParams.type" required>
            <option value="">Выберите тип отчёта</option>
            <option value="sales">Отчёт по продажам</option>
            <option value="airlines">Отчёт по авиакомпаниям</option>
            <option value="routes">Отчёт по направлениям</option>
            <option value="users">Отчёт по пользователям</option>
          </select>
        </div>
        
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Создание отчёта...' : 'Создать отчёт' }}
        </button>
      </form>

      <div v-if="reportData" class="report-result">
        <h3>Результат отчёта</h3>
        <pre>{{ JSON.stringify(reportData, null, 2) }}</pre>
      </div>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'

const loading = ref(false)
const message = ref('')
const messageType = ref('success')

const statistics = ref(null)
const reportData = ref(null)

const reportParams = ref({
  start_date: '',
  end_date: '',
  type: ''
})

const loadStatistics = async () => {
  loading.value = true
  try {
    const response = await api.admin.statistics.get()
    statistics.value = response.data.data || {}
    console.log('Статистика загружена:', statistics.value)
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
    showMessage('Ошибка загрузки статистики: ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    loading.value = false
  }
}

const generateReport = async () => {
  if (new Date(reportParams.value.start_date) >= new Date(reportParams.value.end_date)) {
    showMessage('Дата окончания должна быть позже даты начала', 'error')
    return
  }

  loading.value = true
  try {
    const response = await api.admin.statistics.get(reportParams.value)
    reportData.value = response.data.data || {}
    showMessage('Отчёт успешно создан', 'success')
  } catch (error) {
    showMessage(error.response?.data?.message || 'Ошибка создания отчёта', 'error')
  } finally {
    loading.value = false
  }
}

const maxMonthlyRevenue = computed(() => {
  if (!statistics.value?.monthly_stats) return 0
  return Math.max(...statistics.value.monthly_stats.map(m => m.revenue))
})

const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const formatMoney = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount)
}

const formatMonth = (monthString) => {
  const [year, month] = monthString.split('-')
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
}

const getBarHeight = (revenue) => {
  if (!maxMonthlyRevenue.value) return 0
  return (revenue / maxMonthlyRevenue.value) * 100
}

onMounted(async () => {
  await loadStatistics()

  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  
  reportParams.value.start_date = lastMonth.toISOString().split('T')[0]
  reportParams.value.end_date = today.toISOString().split('T')[0]
})
</script>

<style scoped>
.admin-statistics {
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

.loading {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
}

.stat-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.table-container {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.stats-table th,
.stats-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.stats-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.airline-name {
  font-weight: 500;
  color: #2c3e50;
}

.routes-list {
  display: grid;
  gap: 1rem;
}

.route-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.route-info h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.route-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.route-stats {
  text-align: right;
}

.revenue {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #27ae60;
}

.avg-price {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.monthly-chart {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  height: 300px;
  padding: 1rem 0;
  overflow-x: auto;
}

.month-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.bar {
  width: 40px;
  background: #3498db;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s;
}

.bar:hover {
  background: #2980b9;
}

.month-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.month-value {
  font-size: 0.75rem;
  color: #2c3e50;
  font-weight: 500;
}

.report-form {
  max-width: 600px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.report-result {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.report-result h3 {
  margin-top: 0;
  color: #2c3e50;
}

.report-result pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
  font-size: 0.85rem;
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
  .admin-statistics {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .route-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .route-stats {
    text-align: left;
  }
  
  .monthly-chart {
    height: 200px;
  }
  
  .month-bar {
    min-width: 60px;
  }
  
  .bar {
    width: 30px;
  }
}
</style>
