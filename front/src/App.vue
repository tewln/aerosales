<template>
  <div id="app">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <Clouds />
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import Clouds from '@/components/Clouds.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuthStatus()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(to right, 
    #78beff 0%,
    #8dc8ff 10%,
    #b7dcff 50%,
    #8dc8ff 90%,
    #85c4ff 100%
  );
  position: relative;
  z-index: 1;
}

.main-content {
  padding-top: 80px;
  min-height: 100vh;
}
</style>
