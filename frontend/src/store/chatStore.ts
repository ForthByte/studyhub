import { create } from 'zustand'
import api from '../api/axios'
import { useAuthStore } from './authStore'

// store socket outside Zustand — WebSocket objects don't serialize well in state
// and React strict mode can cause the socket reference to become stale
let channelSocket: WebSocket | null = null

// shape of a channel
export interface Channel {
  id: string
  group_id: string
  name: string
  description: string | null
  channel_type: string
  is_default: boolean
  created_at: string
}

// shape of a chat message
export interface Message {
  id: string
  channel_id: string
  user_id: string | null
  content: string
  is_deleted: boolean
  created_at: string
  edited_at: string | null
  username: string | null
}

// shape of a typing indicator
export interface TypingUser {
  user_id: string
  username: string
}

interface ChatState {
  channels: Channel[]
  activeChannel: Channel | null
  messages: Message[]
  typingUsers: TypingUser[]
  onlineCount: number
  isConnected: boolean
  isConnecting: boolean

  // actions
  fetchChannels: (groupId: string) => Promise<void>
  setActiveChannel: (channel: Channel) => void
  connectToChannel: (channelId: string) => void
  disconnectFromChannel: () => void
  sendMessage: (content: string) => void
  sendTyping: () => void
  sendStopTyping: () => void
  createChannel: (groupId: string, name: string, description: string | null) => Promise<Channel>
  deleteChannel: (groupId: string, channelId: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  channels: [],
  activeChannel: null,
  messages: [],
  typingUsers: [],
  onlineCount: 0,
  isConnected: false,
  isConnecting: false,

  // fetch all channels for a group and set the default channel as active
  fetchChannels: async (groupId) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/channels`)
      set({ channels: data })

      // auto-select the default channel if none is active
      const defaultChannel = data.find((c: Channel) => c.is_default) ?? data[0]
      if (defaultChannel && !get().activeChannel) {
        get().setActiveChannel(defaultChannel)
      }
    } catch {
      set({ channels: [] })
    }
  },

  // set the active channel and connect to it via WebSocket
  setActiveChannel: (channel) => {
    const current = get().activeChannel
    if (current?.id !== channel.id) {
      get().disconnectFromChannel()
      set({ activeChannel: channel, messages: [], typingUsers: [] })
      get().connectToChannel(channel.id)
    }
  },

  // open a WebSocket connection to a channel
  connectToChannel: (channelId) => {
    const token = useAuthStore.getState().accessToken
    if (!token) return

    // close any existing socket
    if (channelSocket) {
      channelSocket.close()
      channelSocket = null
    }

    set({ isConnecting: true, isConnected: false })

    const wsUrl = `${import.meta.env.VITE_WS_URL}/channel/${channelId}?token=${token}`
    channelSocket = new WebSocket(wsUrl)

    channelSocket.onopen = () => {
      set({ isConnected: true, isConnecting: false })
    }

    channelSocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const { type, payload } = data

      if (type === 'history') {
        set({ messages: payload.messages })
      } else if (type === 'message') {
        set((state) => ({ messages: [...state.messages, payload] }))
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
      } else if (type === 'presence') {
        set({ onlineCount: payload.online_count })
      }
    }

    channelSocket.onclose = () => {
      channelSocket = null
      set({ isConnected: false, isConnecting: false })
    }

    channelSocket.onerror = () => {
      set({ isConnected: false, isConnecting: false })
    }
  },

  // close the WebSocket connection and clear state
  disconnectFromChannel: () => {
    if (channelSocket) {
      channelSocket.close()
      channelSocket = null
    }
    set({
      isConnected: false,
      isConnecting: false,
      messages: [],
      typingUsers: [],
      onlineCount: 0,
    })
  },

  // send a chat message over the WebSocket
  sendMessage: (content) => {
    if (!channelSocket || channelSocket.readyState !== WebSocket.OPEN) return
    channelSocket.send(JSON.stringify({ type: 'message', content }))
  },

  // send typing indicator
  sendTyping: () => {
    if (!channelSocket || channelSocket.readyState !== WebSocket.OPEN) return
    channelSocket.send(JSON.stringify({ type: 'typing' }))
  },

  // send stop typing indicator
  sendStopTyping: () => {
    if (!channelSocket || channelSocket.readyState !== WebSocket.OPEN) return
    channelSocket.send(JSON.stringify({ type: 'stop_typing' }))
  },

  // create a new channel in a group
  createChannel: async (groupId, name, description) => {
    const { data } = await api.post(`/groups/${groupId}/channels`, {
      name,
      description,
      channel_type: 'text',
    })
    set((state) => ({ channels: [...state.channels, data] }))
    return data
  },

  // delete a channel from a group
  deleteChannel: async (groupId, channelId) => {
    await api.delete(`/groups/${groupId}/channels/${channelId}`)
    set((state) => ({
      channels: state.channels.filter((c) => c.id !== channelId),
    }))
  },
}))