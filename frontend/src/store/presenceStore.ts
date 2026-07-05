import { create } from 'zustand'
import api from '../api/axios'
import { useAuthStore } from './authStore'

interface PresenceState {
  onlineUsers: Record<string, boolean>
  heartbeatInterval: ReturnType<typeof setInterval> | null

  // actions
  startHeartbeat: () => void
  stopHeartbeat: () => void
  fetchStatus: (userIds: string[]) => Promise<void>
  isOnline: (userId: string) => boolean
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: {},
  heartbeatInterval: null,

  // start sending heartbeats every 30 seconds
  startHeartbeat: () => {
    const sendHeartbeat = () => {
      // only send heartbeat if user is authenticated
      const token = useAuthStore.getState().accessToken
      if (!token) return
      api.post('/presence/heartbeat').catch(() => {})
    }

    sendHeartbeat()

    const interval = setInterval(sendHeartbeat, 30000)
    set({ heartbeatInterval: interval })
  },

  // stop sending heartbeats on logout
  stopHeartbeat: () => {
    const { heartbeatInterval } = get()
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      set({ heartbeatInterval: null })
    }
  },

  // fetch online status for a list of user IDs
  fetchStatus: async (userIds) => {
    if (userIds.length === 0) return
    try {
      const { data } = await api.post('/presence/status', userIds)
      set({ onlineUsers: data })
    } catch {
      // silently fail — presence is non-critical
    }
  },

  // check if a specific user is online
  isOnline: (userId) => {
    return get().onlineUsers[userId] ?? false
  },
}))