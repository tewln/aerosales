import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import EditProfile from '@/views/EditProfile.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import TripDetails from '@/views/TripDetails.vue'
import Purchase from '@/views/Purchase.vue'
import MyTickets from '@/views/MyTickets.vue'
import Favorites from '@/views/Favorites.vue'
import Search from '@/views/Search.vue'
import Airline from '@/views/Airline.vue'
import AdminPanel from '@/views/AdminPanel.vue'
import AdminTrips from '@/views/AdminTrips.vue'
import AdminDiscounts from '@/views/AdminDiscounts.vue'
import AdminStatistics from '@/views/AdminStatistics.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true, requiresUserData: true }
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    component: EditProfile,
    meta: { requiresAuth: true, requiresUserData: true }
  },
  {
    path: '/profile/password',
    name: 'ChangePassword',
    component: ChangePassword,
    meta: { requiresAuth: true }
  },
  {
    path: '/trip/:id',
    name: 'TripDetails',
    component: TripDetails,
    props: true
  },
  {
    path: '/purchase/:tripId',
    name: 'Purchase',
    component: Purchase,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-tickets',
    name: 'MyTickets',
    component: MyTickets,
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites,
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },  {
    path: '/airline/:id',
    name: 'Airline',
    component: Airline,
    props: true
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true, requiresUserData: true }
  },
  {
    path: '/admin/trips',
    name: 'AdminTrips',
    component: AdminTrips,
    meta: { requiresAuth: true, requiresAdmin: true, requiresUserData: true }
  },
  {
    path: '/admin/discounts',
    name: 'AdminDiscounts',
    component: AdminDiscounts,
    meta: { requiresAuth: true, requiresAdmin: true, requiresUserData: true }
  },
  {
    path: '/admin/statistics',
    name: 'AdminStatistics',
    component: AdminStatistics,
    meta: { requiresAuth: true, requiresAdmin: true, requiresUserData: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresUserData && authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchUserData()
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next('/')
      return
    }
    
    next()
  } else if (to.meta.requiresAdmin) {
    if (!authStore.user) {
      await authStore.fetchUserData()
    }
    
    if (!authStore.isAdmin) {
      next('/')
      return
    }
    
    next()
  } else {
    next()
  }
})

export default router
