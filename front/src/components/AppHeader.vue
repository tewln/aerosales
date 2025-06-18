<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <RouterLink to="/" class="logo">
          <img class="logo-img" src="http://localhost:3000/uploads/icons/logo.png" alt="Логотип">
          <span class="logo-text">Аэросэйлс</span>
        </RouterLink>
        
        <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ active: isMobileMenuOpen }">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
        
        <nav class="nav" :class="{ 'mobile-open': isMobileMenuOpen }">
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/my-tickets" class="nav-link" @click="closeMobileMenu">
              <img class="nav-icon" src="http://localhost:3000/uploads/icons/ticket.png" alt="Билеты">
              <span class="nav-text">Мои билеты</span>
            </RouterLink>
            <RouterLink to="/favorites" class="nav-link" @click="closeMobileMenu">
              <img class="nav-icon" src="http://localhost:3000/uploads/icons/heart.png" alt="Избранное">
              <span class="nav-text">Избранное</span>
            </RouterLink>            <RouterLink 
              v-if="authStore.isAdmin" 
              to="/admin" 
              class="nav-link admin-link"
              @click="loadUserDataIfNeeded(); closeMobileMenu()">
              <img class="nav-icon" src="http://localhost:3000/uploads/icons/gear.png" alt="Админ">
              <span class="nav-text">Админ-панель</span>
            </RouterLink>
            <RouterLink to="/profile" class="nav-link" @click="closeMobileMenu">
              <img class="nav-icon" src="http://localhost:3000/uploads/icons/user.png" alt="Профиль">
              <span class="nav-text">{{ authStore.user?.firstname || 'Профиль' }}</span>
            </RouterLink>            <button @click="handleLogout(); closeMobileMenu()" class="btn btn-secondary">
              Выйти
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn btn-primary" @click="closeMobileMenu">
              Войти
            </RouterLink>
            <RouterLink to="/register" class="btn btn-secondary" @click="closeMobileMenu">
              Регистрация
            </RouterLink>
          </template>
        </nav>
        
        <div 
          v-if="isMobileMenuOpen" 
          class="mobile-overlay" 
          @click="closeMobileMenu"
        ></div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const loadUserDataIfNeeded = () => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchUserData()
  }
}

const handleResize = () => {
  if (window.innerWidth > 768 && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  transition: color 0.3s ease;
  z-index: 1001;
}

.logo:hover {
  color: #3498db;
}

.logo-img {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  object-fit: contain;
}

.logo-text {
  white-space: nowrap;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.3s ease;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background: #2c3e50;
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  object-fit: contain;
}

.nav-link {
  display: flex;
  align-items: center;
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  padding: 8px 12px;
  border-radius: 6px;
}

.nav-link:hover {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.nav-link.router-link-active {
  color: #3498db;
  background: rgba(52, 152, 219, 0.15);
}

.nav-text {
  white-space: nowrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #2c3e50;
  border: 2px solid #2c3e50;
}

.btn-secondary:hover {
  background: #2c3e50;
  color: white;
}

.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  
  .nav {
    position: fixed;
    top: 80px;
    right: -100%;
    width: 280px;
    height: calc(100vh - 80px);
    background: white;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    padding: 20px;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    overflow-y: auto;
  }
  
  .nav.mobile-open {
    right: 0;
  }
  
  .nav-link {
    width: 100%;
    padding: 15px 12px;
    border-bottom: 1px solid #f0f0f0;
    justify-content: flex-start;
  }
  
  .nav-link:last-of-type {
    border-bottom: none;
  }
  
  .nav-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
  }
  
  .btn {
    width: 100%;
    margin-top: 10px;
    padding: 15px 20px;
    font-size: 16px;
  }
  
  .mobile-overlay {
    display: block;
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  
  .logo-text {
    font-size: 20px;
  }
  
  .logo-img {
    width: 35px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .logo-img {
    width: 30px;
    height: 30px;
    margin-right: 8px;
  }
  
  .nav {
    width: 260px;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .nav {
    gap: 15px;
  }
  
  .nav-link {
    padding: 6px 10px;
  }
  
  .nav-text {
    font-size: 14px;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
