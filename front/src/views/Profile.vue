<template>
  <div class="profile">
    <div class="container">
      <div class="profile-content">
        <div class="card">
          <h1>Личный кабинет</h1>
          
          <div v-if="authStore.user" class="profile-info">
            <div class="info-section">
              <h3>Личные данные</h3>
              <div class="info-row">
                <span class="label">ФИО:</span>
                <span class="value">
                  {{ authStore.user.surname }} {{ authStore.user.firstname }}
                  {{ authStore.user.lastname }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">Дата рождения:</span>
                <span class="value">{{ formatDate(authStore.user.birth_date) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Роль:</span>
                <span class="value role" :class="authStore.user.role">
                  {{ getRoleName(authStore.user.role) }}
                </span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Контактная информация</h3>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">{{ authStore.user.email || 'Не указан' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Телефон:</span>
                <span class="value">{{ authStore.user.phone || 'Не указан' }}</span>
              </div>
            </div>
            
            <div class="actions">
              <RouterLink to="/profile/edit" class="btn btn-primary">
                Изменить данные
              </RouterLink>
              <RouterLink to="/profile/password" class="btn btn-secondary">
                Сменить пароль
              </RouterLink>
            </div>
          </div>
          
          <div v-else class="loading">
            Загрузка профиля...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const formatDate = (dateString) => {
  if (!dateString) return 'Не указана'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

const getRoleName = (role) => {
  const roles = {
    'user': 'Пользователь',
    'admin': 'Администратор'
  }
  return roles[role] || role
}
</script>

<style scoped>
.profile {
  padding: 60px 0;
  min-height: calc(100vh - 80px);
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
}

.card h1 {
  text-align: center;
  margin-bottom: 40px;
  color: #2c3e50;
}

.info-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.info-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-section h3 {
  margin-bottom: 15px;
  color: #34495e;
  font-size: 1.2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px 0;
}

.label {
  font-weight: 600;
  color: #7f8c8d;
  flex: 0 0 40%;
}

.value {
  flex: 1;
  text-align: right;
  color: #2c3e50;
}

.role {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.role.user {
  background: #e8f5e8;
  color: #27ae60;
}

.role.admin {
  background: #fdf2e9;
  color: #e67e22;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .value {
    text-align: left;
    margin-top: 5px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
