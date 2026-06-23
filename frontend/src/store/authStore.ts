import { create } from 'zustand'
import api from '../api/axios'

// shape of the authenticated user object returned from /auth/me
interface User {
  id: string
  email: string
  username: string
}

// shape of the auth store state and actions
interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean

  // actions
  setAccessToken: (token: string) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  rehydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true, // true on startup until rehydrate() completes

  // store a new access token in state after login or silent refresh
  setAccessToken: (token: string) => set({ accessToken: token }),

  // call the register endpoint and automatically log the user in on success
  register: async (email, username, password) => {
    await api.post('/auth/register', { email, username, password })
    // registration succeeded — now log them in to get the access token
    const { data } = await api.post('/auth/login', { email, password })
    set({ accessToken: data.access_token })

    // fetch the full user profile and store it
    const me = await api.get('/auth/me')
    set({ user: me.data })
  },

  // call the login endpoint, store the access token and fetch the user profile
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    set({ accessToken: data.access_token })

    // fetch the full user profile and store it
    const me = await api.get('/auth/me')
    set({ user: me.data })
  },

  // clear all auth state — called on logout or when refresh token fails
  logout: () => set({ user: null, accessToken: null, isLoading: false }),

  // on app startup, attempt to restore the session using the httpOnly cookie.
  // if the refresh token is still valid a new access token is returned and the
  // user is silently logged back in without needing to re-enter credentials.
  rehydrate: async () => {
    try {
      const { data } = await api.post('/auth/refresh', {}, { withCredentials: true })
      set({ accessToken: data.access_token })

      const me = await api.get('/auth/me')
      set({ user: me.data, isLoading: false })
    } catch {
      // no valid refresh token — user needs to log in manually
      set({ user: null, accessToken: null, isLoading: false })
    }
  },
}))