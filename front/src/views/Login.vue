<template>
  <div class="login">
    <div class="container">
      <div class="login-form">
        <div class="card">
          <h1>Вход в систему</h1>
          
          <div v-if="authStore.error" class="error">
            {{ authStore.error }}
          </div>
          
          <form @submit.prevent="handleLogin">
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
              {{ authStore.loading ? 'Вход...' : 'Войти' }}
            </button>
          </form>
          
          <div class="login-footer">
            <p>Нет аккаунта? <RouterLink to="/register">Зарегистрироваться</RouterLink></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  login: '',
  password: ''
})

const handleLogin = async () => {
  const success = await authStore.login(form.value)
  if (success) {
    router.push('/profile')
  }
}
</script>

<style scoped>
.login {
  padding: 60px 0;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
}

.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer a {
  color: #3498db;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
