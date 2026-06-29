import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// create a pre-configured axios instance pointing at the FastAPI backend.
// all API calls in the app should use this instance rather than plain axios.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// tracks whether a refresh is already in progress to prevent concurrent refresh calls
let isRefreshing = false

// queue of requests that failed with 401 while a refresh was in progress.
// each entry holds resolve/reject so they can be retried or failed together.
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

// process the queue once a refresh completes — either retry all with the new
// token or reject all if the refresh itself failed.
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else {
      p.resolve(token!)
    }
  })
  failedQueue = []
}

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
// refresh using the httpOnly cookie. concurrent 401s are queued and retried
// together once the single refresh call completes.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // skip retry if this was the refresh endpoint itself failing
    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // a refresh is already in progress — queue this request and wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newToken = data.access_token
        useAuthStore.getState().setAccessToken(newToken)
        original.headers.Authorization = `Bearer ${newToken}`

        // retry all queued requests with the new token
        processQueue(null, newToken)
        return api(original)
      } catch (err) {
        // refresh failed — reject all queued requests and log out
        processQueue(err, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api