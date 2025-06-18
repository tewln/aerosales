<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h1>Админ-панель</h1>
      <p>Управление системой AeroSales</p>
    </div>

    <div class="admin-menu">
      <div class="menu-card" @click="$router.push('/admin/trips')">
        <div class="menu-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Управление рейсами</h3>
        <p>Создание, изменение и отмена рейсов</p>
      </div>

      <div class="menu-card" @click="$router.push('/admin/discounts')">
        <div class="menu-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Управление скидками</h3>
        <p>Добавление и удаление скидок</p>
      </div>

      <div class="menu-card" @click="$router.push('/admin/statistics')">
        <div class="menu-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 20V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Статистика</h3>
        <p>Просмотр отчётов и аналитики</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 3rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.admin-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.admin-menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  justify-items: center;
}

.menu-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #e1e8ed;
  width: 100%;
  max-width: 350px;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.menu-card h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 0.8rem;
}

.menu-card p {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem;
  }
  
  .admin-header h1 {
    font-size: 2rem;
  }
  
  .admin-header p {
    font-size: 1rem;
  }
  
  .admin-menu {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .menu-card {
    padding: 1.5rem;
  }
  
  .menu-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 1rem;
  }
  
  .menu-card h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .menu-card p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .admin-panel {
    padding: 0.5rem;
  }
  
  .admin-header {
    margin-bottom: 2rem;
  }
  
  .admin-header h1 {
    font-size: 1.8rem;
  }
  
  .menu-card {
    padding: 1.25rem;
    max-width: none;
  }
  
  .menu-icon {
    width: 45px;
    height: 45px;
  }
  
  .menu-card h3 {
    font-size: 1.1rem;
  }
  
  .menu-card p {
    font-size: 0.85rem;
    line-height: 1.4;
  }
}
</style>
