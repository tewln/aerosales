import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export default {
  auth: {
    login: (credentials) => api.post('/user/auth/login', credentials),
    register: (userData) => api.post('/user/auth/register', userData),
    logout: () => api.post('/user/auth/logout'),
    getMe: () => api.get('/user/me')
  },

  profile: {
    updateProfile: (data) => api.put('/user/profile', data),
    updateContact: (data) => api.put('/user/contact', data),
    changePassword: (data) => api.put('/user/password', data)
  },

  tickets: {
    getDestinations: () => api.get('/tickets/destinations'),
    search: (params) => api.get('/tickets/search', { params }),
    getTripDetails: (id) => api.get(`/tickets/trip/${id}`),
    calculatePrice: (data) => api.post('/tickets/calculate-price', data),
    purchase: (data) => api.post('/tickets/purchase', data),
    getMyTickets: () => api.get('/tickets/my-tickets'),
    getMyHistory: () => api.get('/tickets/my-history'),
    cancelTicket: (purchaseId) => api.delete(`/tickets/cancel/${purchaseId}`),
    addReview: (data) => api.post('/tickets/review', data)
  },

  favorites: {
    get: () => api.get('/tickets/favorites'),
    add: (tripId) => api.post('/tickets/favorites', { trip_id: tripId }),
    remove: (tripId) => api.delete(`/tickets/favorites/${tripId}`)
  },

  reference: {
    getCities: () => api.get('/reference/cities'),
    getAirlines: () => api.get('/reference/airlines'),
    getAirports: () => api.get('/reference/airports'),
    getAirportsByCity: (cityId) => api.get(`/reference/airports/city/${cityId}`),
    getPriceRange: () => api.get('/reference/price-range'),
    getAllCities: () => api.get('/reference/cities/all'),
    getAllAirlines: () => api.get('/reference/airlines/all'),
    getAllAirports: () => api.get('/reference/airports/all')
  },

  airlines: {
    getDetails: (id) => api.get(`/airlines/${id}`),
    getReviews: (id) => api.get(`/tickets/reviews/airline/${id}`)
  },

  admin: {
    trips: {
      getAll: () => api.get('/admin/trips'),
      create: (data) => api.post('/admin/trips', data),
      update: (id, data) => api.put(`/admin/trips/${id}`, data),
      delete: (id) => api.delete(`/admin/trips/${id}`)
    },
    discounts: {
      getAll: () => api.get('/admin/discounts'),
      create: (data) => api.post('/admin/discounts', data),
      delete: (id) => api.delete(`/admin/discounts/${id}`)
    },
    statistics: {
      get: () => api.get('/admin/statistics')
    }
  }
}
