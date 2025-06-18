<template>
  <div class="register">
    <div class="container">
      <div class="register-form">
        <div class="card">
          <h1>Регистрация</h1>
          
          <div v-if="authStore.error" class="error">
            {{ authStore.error }}
          </div>
          
          <form @submit.prevent="handleRegister">
            <div class="grid grid-2">
              <div class="form-group">
                <label>Фамилия</label>
                <input
                  v-model="form.surname"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Введите фамилию"
                />
              </div>
              
              <div class="form-group">
                <label>Имя</label>
                <input
                  v-model="form.firstname"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Введите имя"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label>Отчество</label>
              <input
                v-model="form.lastname"
                type="text"
                class="form-control"
                placeholder="Введите отчество (необязательно)"
              />
            </div>
            
            <div class="form-group">
              <label>Дата рождения</label>
              <input
                v-model="form.birth_date"
                type="date"
                class="form-control"
                required
                :max="maxDate"
              />
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input
                v-model="form.email"
                type="email"
                class="form-control"
                required
                placeholder="Введите email"
              />
            </div>
            
            <div class="form-group">
              <label>Телефон</label>
              <input
                v-model="form.phone"
                type="tel"
                class="form-control"
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            
            <div class="form-group">
              <label>Логин</label>
              <input
                v-model="form.login"
                type="text"
                class="form-control"
                required
                placeholder="Введите логин"
              />
            </div>
            
            <div class="form-group">
              <label>Пароль</label>
              <input
                v-model="form.password"
                type="password"
                class="form-control"
                required
                placeholder="Введите пароль"
              />
            </div>
            
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="authStore.loading"
            >
              {{ authStore.loading ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>
          </form>
          
          <div class="register-footer">
            <p>Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  surname: '',
  firstname: '',
  lastname: '',
  birth_date: '',
  email: '',
  phone: '',
  login: '',
  password: ''
})

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
})

const handleRegister = async () => {
  const success = await authStore.register(form.value)
  if (success) {
    router.push('/profile')
  }
}
</script>

<style scoped>
.register {
  padding: 60px 0;
  min-height: calc(100vh - 80px);
}

.register-form {
  max-width: 600px;
  margin: 0 auto;
}

.card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}

.register-footer a {
  color: #3498db;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
