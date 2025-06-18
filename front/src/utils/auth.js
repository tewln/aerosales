export const AUTH_STORAGE_KEY = 'aerosales_auth_status'

export const clearAuthData = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const hasStoredAuthStatus = () => {
  return localStorage.getItem(AUTH_STORAGE_KEY) !== null
}

export const getStoredAuthStatus = () => {
  const status = localStorage.getItem(AUTH_STORAGE_KEY)
  return status === 'true'
}

export const setStoredAuthStatus = (isAuthenticated) => {
  localStorage.setItem(AUTH_STORAGE_KEY, isAuthenticated.toString())
}
