<template>
  <div class="edit-profile">
    <div class="container">
      <div class="edit-form">
        <div class="card">
          <h1>Изменить данные</h1>
          
          <div v-if="authStore.error" class="error">
            {{ authStore.error }}
          </div>
          
          <div v-if="success" class="success">
            Данные успешно обновлены!
          </div>
          
          <form @submit.prevent="handleSubmit">
            <div class="grid grid-2">
              <div class="form-group">
                <label>Фамилия</label>
                <input
                  v-model="form.surname"
                  type="text"
                  class="form-control"
                  required
                />
              </div>
              
              <div class="form-group">
                <label>Имя</label>
                <input
                  v-model="form.firstname"
                  type="text"
                  class="form-control"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label>Отчество</label>
              <input
                v-model="form.lastname"
                type="text"
                class="form-control"
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
              />
            </div>
            
            <div class="form-group">
              <label>Телефон</label>
              <input
                v-model="form.phone"
                type="tel"
                class="form-control"
              />
            </div>
            
            <div class="actions">
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="authStore.loading"
              >
                {{ authStore.loading ? 'Сохранение...' : 'Сохранить' }}
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const success = ref(false)

const form = ref({
  surname: '',
  firstname: '',
  lastname: '',
  birth_date: '',
  email: '',
  phone: ''
})

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
})

const loadUserData = () => {
  if (authStore.user) {
    form.value = {
      surname: authStore.user.surname || '',
      firstname: authStore.user.firstname || '',
      lastname: authStore.user.lastname || '',
      birth_date: authStore.user.birth_date?.split('T')[0] || '',
      email: authStore.user.email || '',
      phone: authStore.user.phone || ''
    }
  }
}

const handleSubmit = async () => {
  const profileData = {
    surname: form.value.surname,
    firstname: form.value.firstname,
    lastname: form.value.lastname,
    birth_date: form.value.birth_date
  }
  
  const contactData = {
    email: form.value.email,
    phone: form.value.phone
  }
  
  const profileSuccess = await authStore.updateProfile(profileData)
  const contactSuccess = await authStore.updateContact(contactData)
  
  if (profileSuccess && contactSuccess) {
    success.value = true
    setTimeout(() => {
      router.push('/profile')
    }, 2000)
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.edit-profile {
  padding: 60px 0;
  min-height: calc(100vh - 80px);
}

.edit-form {
  max-width: 600px;
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
