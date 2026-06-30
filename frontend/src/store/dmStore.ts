import { create } from 'zustand'
import { useAuthStore } from './authStore'
import type { Message } from './chatStore'
import type { TypingUser } from './chatStore'

// store socket outside Zustand — WebSocket objects don't serialize well in state
// and React strict mode can cause the socket reference to become stale
let dmSocket: WebSocket | null = null

interface DMState {
  messages: Message[]
  typingUsers: TypingUser[]
  isConnected: boolean
  isConnecting: boolean
  otherUserId: string | null

  // actions
  connectToDM: (otherUserId: string) => void
  disconnectFromDM: () => void
  sendMessage: (content: string) => void
  sendTyping: () => void
  sendStopTyping: () => void
}

export const useDMStore = create<DMState>((set, get) => ({
  messages: [],
  typingUsers: [],
  isConnected: false,
  isConnecting: false,
  otherUserId: null,

  // open a WebSocket connection to a DM conversation
  connectToDM: (otherUserId) => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    // don't reconnect if already connected to this user
    if (get().otherUserId === otherUserId && get().isConnected) return

    // close any existing socket
    if (dmSocket) {
      dmSocket.close()
      dmSocket = null
    }

    set({ isConnecting: true, otherUserId, isConnected: false })

    const wsBase = import.meta.env.VITE_WS_URL.replace('/ws', '')
    const wsUrl = `${wsBase}/api/v1/dm/${otherUserId}/ws?token=${token}`

    dmSocket = new WebSocket(wsUrl)

    dmSocket.onopen = () => {
      set({ isConnected: true, isConnecting: false })
    }

    dmSocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const { type, payload } = data

      if (type === 'history') {
        // map sender_id to user_id for MessageBubble compatibility
        const mapped = payload.messages.map((m: any) => ({ ...m, user_id: m.sender_id }))
        set({ messages: mapped })
      } else if (type === 'message') {
        // map sender_id to user_id for MessageBubble compatibility
        const mapped = { ...payload, user_id: payload.sender_id }
        set((state) => ({ messages: [...state.messages, mapped] }))
      } else if (type === 'typing') {
        set((state) => {
          const already = state.typingUsers.find((u) => u.user_id === payload.user_id)
          if (already) return state
          return { typingUsers: [...state.typingUsers, payload] }
        })
      } else if (type === 'stop_typing') {
        set((state) => ({
          typingUsers: state.typingUsers.filter((u) => u.user_id !== payload.user_id),
        }))
      } else if (type === 'read') {
        set((state) => ({
          messages: state.messages.map((m) => ({ ...m, is_read: true })),
        }))
      }
    }

    dmSocket.onclose = () => {
      dmSocket = null
      set({ isConnected: false, isConnecting: false })
    }

    dmSocket.onerror = () => {
      set({ isConnected: false, isConnecting: false })
    }
  },

  // close the WebSocket connection and clear state
  disconnectFromDM: () => {
    if (dmSocket) {
      dmSocket.close()
      dmSocket = null
    }
    set({
      isConnected: false,
      isConnecting: false,
      messages: [],
      typingUsers: [],
      otherUserId: null,
    })
  },

  // send a message over the WebSocket
  sendMessage: (content) => {
    if (!dmSocket || dmSocket.readyState !== WebSocket.OPEN) return
    dmSocket.send(JSON.stringify({ type: 'message', content }))
  },

  // send typing indicator
  sendTyping: () => {
    if (!dmSocket || dmSocket.readyState !== WebSocket.OPEN) return
    dmSocket.send(JSON.stringify({ type: 'typing' }))
  },

  // send stop typing indicator
  sendStopTyping: () => {
    if (!dmSocket || dmSocket.readyState !== WebSocket.OPEN) return
    dmSocket.send(JSON.stringify({ type: 'stop_typing' }))
  },
}))