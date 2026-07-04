import { create } from 'zustand'
import api from '../api/axios'

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
    // send immediately on start
    api.post('/presence/heartbeat').catch(() => {})

    const interval = setInterval(() => {
      api.post('/presence/heartbeat').catch(() => {})
    }, 30000)

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