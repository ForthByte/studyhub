import { create } from 'zustand'
import api from '../api/axios'

// shape of a friend
export interface Friend {
  user_id: string
  username: string
  email: string
  friendship_id: string
  status: string
}

// shape of an incoming friend request
export interface FriendRequest {
  friendship_id: string
  requester_id: string
  username: string
  email: string
  created_at: string
}

interface FriendState {
  friends: Friend[]
  incomingRequests: FriendRequest[]
  unreadCounts: Record<string, number>
  isLoading: boolean

  // actions
  fetchFriends: () => Promise<void>
  fetchIncomingRequests: () => Promise<void>
  fetchUnreadCounts: () => Promise<void>
  sendFriendRequest: (username: string) => Promise<void>
  acceptRequest: (friendshipId: string) => Promise<void>
  declineRequest: (friendshipId: string) => Promise<void>
  removeFriend: (friendId: string) => Promise<void>
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  incomingRequests: [],
  unreadCounts: {},
  isLoading: false,

  // fetch all accepted friends
  fetchFriends: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/friends')
      set({ friends: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  // fetch all pending incoming friend requests
  fetchIncomingRequests: async () => {
    try {
      const { data } = await api.get('/friends/requests')
      set({ incomingRequests: data })
    } catch {
      set({ incomingRequests: [] })
    }
  },

  // fetch unread DM counts per friend
  fetchUnreadCounts: async () => {
    try {
      const { data } = await api.get('/dm/unread')
      set({ unreadCounts: data })
    } catch {
      set({ unreadCounts: {} })
    }
  },

  // send a friend request by username
  sendFriendRequest: async (username) => {
    await api.post(`/friends/request/${username}`)
  },

  // accept an incoming friend request and refresh the lists
  acceptRequest: async (friendshipId) => {
    await api.post(`/friends/accept/${friendshipId}`)
    await get().fetchFriends()
    await get().fetchIncomingRequests()
  },

  // decline an incoming friend request and refresh the list
  declineRequest: async (friendshipId) => {
    await api.post(`/friends/decline/${friendshipId}`)
    await get().fetchIncomingRequests()
  },

  // remove a friend and refresh the friends list
  removeFriend: async (friendId) => {
    await api.delete(`/friends/${friendId}`)
    set((state) => ({
      friends: state.friends.filter((f) => f.user_id !== friendId),
    }))
  },
}))