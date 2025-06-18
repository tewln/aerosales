<template>
  <div class="admin-discounts">
    <div class="page-header">
      <button @click="$router.push('/admin')" class="back-btn">
        ← Назад к админ-панели
      </button>
      <h1>Управление скидками</h1>
    </div>

    <div class="section">
      <h2>Добавить новую скидку</h2>
      <form @submit.prevent="createDiscount" class="discount-form">
        <div class="form-row">
          <div class="form-group">
            <label>Название скидки:</label>
            <input 
              type="text" 
              v-model="newDiscount.name" 
              required
              placeholder="Например: Раннее бронирование"
            >
          </div>
          <div class="form-group">
            <label>Размер скидки (%):</label>
            <input 
              type="number" 
              v-model="newDiscount.percentage" 
              min="1" 
              max="100" 
              required
              placeholder="От 1 до 100"
            >
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Дата начала:</label>
            <input 
              type="date" 
              v-model="newDiscount.start_date" 
              required
            >
          </div>
          <div class="form-group">
            <label>Дата окончания:</label>
            <input 
              type="date" 
              v-model="newDiscount.end_date" 
              required
            >
          </div>
        </div>

        <div class="form-group">
          <label>Описание:</label>
          <textarea 
            v-model="newDiscount.description" 
            rows="3"
            placeholder="Опишите условия применения скидки"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Минимальная сумма заказа:</label>
            <input 
              type="number" 
              v-model="newDiscount.min_amount" 
              min="0" 
              step="100"
              placeholder="Минимальная сумма для применения скидки"
            >
          </div>
          <div class="form-group">
            <label>Максимальная скидка (₽):</label>
            <input 
              type="number" 
              v-model="newDiscount.max_discount" 
              min="0" 
              step="100"
              placeholder="Максимальная сумма скидки"
            >
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="newDiscount.is_active"
            >
            Скидка активна
          </label>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Добавление...' : 'Добавить скидку' }}
        </button>
      </form>
    </div>

    <div class="section">
      <h2>Существующие скидки</h2>
      <div class="discounts-list">
        <div v-if="discounts.length === 0" class="no-discounts">
          Нет созданных скидок
        </div>
        <div v-for="discount in discounts" :key="discount.id" class="discount-item">
          <div class="discount-info">
            <div class="discount-header">
              <h3>{{ discount.name }}</h3>
              <span :class="['status', discount.is_active ? 'active' : 'inactive']">
                {{ discount.is_active ? 'Активна' : 'Неактивна' }}
              </span>
            </div>
            <p class="discount-percentage">{{ discount.percentage }}% скидка</p>
            <p class="discount-description">{{ discount.description }}</p>
            <div class="discount-details">
              <span>Период: До {{ formatDate(discount.expires_at) }}</span>
              <span v-if="discount.min_amount">Мин. сумма: {{ discount.min_amount }}₽</span>
              <span v-if="discount.max_discount">Макс. скидка: {{ discount.max_discount }}₽</span>
            </div>
          </div>
          <div class="discount-actions">
            <button @click="toggleDiscount(discount)" class="btn btn-toggle" :disabled="loading">
              {{ discount.is_active ? 'Деактивировать' : 'Активировать' }}
            </button>
            <button @click="deleteDiscount(discount.id)" class="btn btn-delete" :disabled="loading">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const loading = ref(false)
const message = ref('')
const messageType = ref('success')

const discounts = ref([])

const newDiscount = ref({
  name: '',
  percentage: '',
  description: '',
  start_date: '',
  end_date: '',
  min_amount: '',
  max_discount: '',
  is_active: true
})

const loadDiscounts = async () => {
  try {
    const response = await api.admin.discounts.getAll()
    discounts.value = response.data.data || []
  } catch (error) {
    showMessage('Ошибка загрузки скидок', 'error')
  }
}

const createDiscount = async () => {
  if (new Date(newDiscount.value.start_date) >= new Date(newDiscount.value.end_date)) {
    showMessage('Дата окончания должна быть позже даты начала', 'error')
    return
  }

  loading.value = true
  try {
    await api.admin.discounts.create(newDiscount.value)
    showMessage('Скидка успешно создана', 'success')
    
    newDiscount.value = {
      name: '',
      percentage: '',
      description: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_discount: '',
      is_active: true
    }
    
    await loadDiscounts()
  } catch (error) {
    showMessage(error.response?.data?.message || 'Ошибка создания скидки', 'error')
  } finally {
    loading.value = false
  }
}

const toggleDiscount = async (discount) => {
  loading.value = true
  try {
    const updatedDiscount = {
      ...discount,
      is_active: !discount.is_active
    }
    await api.admin.discounts.delete(discount.id)
    await api.admin.discounts.create(updatedDiscount)
    
    showMessage(`Скидка ${updatedDiscount.is_active ? 'активирована' : 'деактивирована'}`, 'success')
    await loadDiscounts()
  } catch (error) {
    showMessage(error.response?.data?.message || 'Ошибка изменения статуса скидки', 'error')
  } finally {
    loading.value = false
  }
}

const deleteDiscount = async (discountId) => {
  if (!confirm('Вы уверены, что хотите удалить эту скидку?')) {
    return
  }
  
  loading.value = true
  try {
    await api.admin.discounts.delete(discountId)
    showMessage('Скидка успешно удалена', 'success')
    await loadDiscounts()
  } catch (error) {
    showMessage(error.response?.data?.message || 'Ошибка удаления скидки', 'error')
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
  return new Date(dateString).toLocaleDateString('ru-RU')
}

onMounted(async () => {
  await loadDiscounts()
})
</script>

<style scoped>
.admin-discounts {
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

.discount-form {
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
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
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

.btn-toggle {
  background: #f39c12;
  color: white;
  margin-right: 0.5rem;
}

.btn-toggle:hover:not(:disabled) {
  background: #e67e22;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #c0392b;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.discounts-list {
  display: grid;
  gap: 1rem;
}

.discount-item {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.discount-info {
  flex: 1;
}

.discount-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.discount-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.discount-percentage {
  font-size: 1.2rem;
  font-weight: 600;
  color: #27ae60;
  margin: 0.5rem 0;
}

.discount-description {
  color: #7f8c8d;
  margin: 0.5rem 0;
}

.discount-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.discount-details span {
  font-size: 0.9rem;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.discount-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  justify-content: center;
}

.no-discounts {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
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
  .admin-discounts {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .discount-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .discount-actions {
    flex-direction: row;
    justify-content: flex-start;
  }
  
  .discount-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .discount-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
