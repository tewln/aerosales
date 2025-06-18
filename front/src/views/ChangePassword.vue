<template>
  <div class="change-password">
    <div class="container">
      <div class="password-form">
        <div class="card">
          <h1>Смена пароля</h1>
          
          <div v-if="authStore.error" class="error">
            {{ authStore.error }}
          </div>
          
          <div v-if="success" class="success">
            Пароль успешно изменен!
          </div>
          
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Текущий пароль</label>
              <input
                v-model="form.currentPassword"
                type="password"
                class="form-control"
                required
                placeholder="Введите текущий пароль"
              />
            </div>
            
            <div class="form-group">
              <label>Новый пароль</label>
              <input
                v-model="form.newPassword"
                type="password"
                class="form-control"
                required
                placeholder="Введите новый пароль"
                minlength="6"
              />
            </div>
            
            <div class="form-group">
              <label>Подтвердите новый пароль</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                class="form-control"
                required
                placeholder="Повторите новый пароль"
                minlength="6"
              />
            </div>
            
            <div v-if="passwordError" class="error">
              {{ passwordError }}
            </div>
            
            <div class="actions">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="authStore.loading || !isFormValid"
              >
                {{ authStore.loading ? 'Сохранение...' : 'Изменить пароль' }}
              </button>
              <RouterLink to="/profile" class="btn btn-secondary">
                Отмена
              </RouterLink>
            </div>
          </form>
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
const success = ref(false)

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = computed(() => {
  if (form.value.newPassword && form.value.confirmPassword) {
    if (form.value.newPassword !== form.value.confirmPassword) {
      return 'Пароли не совпадают'
    }
  }
  return null
})

const isFormValid = computed(() => {
  return form.value.currentPassword &&
         form.value.newPassword &&
         form.value.confirmPassword &&
         form.value.newPassword === form.value.confirmPassword &&
         form.value.newPassword.length >= 6
})

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  const success = await authStore.changePassword({
    currentPassword: form.value.currentPassword,
    newPassword: form.value.newPassword,
    confirmPassword: form.value.confirmPassword
  })
  
  if (success) {
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    success.value = true
    setTimeout(() => {
      router.push('/profile')
    }, 2000)
  }
}
</script>

<style scoped>
.change-password {
  padding: 60px 0;
  min-height: calc(100vh - 80px);
}

.password-form {
  max-width: 400px;
  margin: 0 auto;
}

.card h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .actions {
    flex-direction: column;
  }
}
</style>
