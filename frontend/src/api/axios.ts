import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// create a pre-configured axios instance pointing at the FastAPI backend.
// all API calls in the app should use this instance rather than plain axios.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ensures the httpOnly refresh token cookie is sent with every request
})

// request interceptor — automatically attaches the JWT access token to every
// outgoing request so protected endpoints receive the Authorization header.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// response interceptor — catches 401 errors and attempts a silent token
// refresh using the httpOnly cookie. if the refresh fails the user is
// logged out and redirected to login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // only attempt refresh once to avoid infinite retry loops
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        // store the new access token and retry the original request
        useAuthStore.getState().setAccessToken(data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        // refresh failed — clear auth state and redirect to login
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api