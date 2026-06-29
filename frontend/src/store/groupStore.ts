import { create } from 'zustand'
import api from '../api/axios'

// shape of a group returned from the API
export interface Group {
  id: string
  name: string
  description: string | null
  invite_code: string
  is_private: boolean
  owner_id: string
  created_at: string
}

// shape of a group with the current user's role
export interface GroupWithRole extends Group {
  my_role: 'owner' | 'admin' | 'member'
  role: 'owner' | 'admin' | 'member' // mapped from my_role
}

// shape of a group member
export interface GroupMember {
  user_id: string
  username: string
  email: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

// shape of the group store state and actions
interface GroupState {
  groups: GroupWithRole[]
  activeGroup: Group | null
  members: GroupMember[]
  isLoading: boolean

  // actions
  fetchGroups: () => Promise<void>
  fetchGroup: (groupId: string) => Promise<void>
  fetchMembers: (groupId: string) => Promise<void>
  createGroup: (name: string, description: string, isPrivate: boolean) => Promise<Group>
  joinGroup: (inviteCode: string) => Promise<void>
  leaveGroup: (groupId: string) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  promoteToAdmin: (groupId: string, userId: string) => Promise<void>
  demoteAdmin: (groupId: string, userId: string) => Promise<void>
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  members: [],
  isLoading: false,

  // fetch all groups the current user belongs to
  fetchGroups: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/groups/me')
      // map my_role to role for consistency throughout the frontend
      const groups = data.map((g: any) => ({ ...g, role: g.my_role }))
      set({ groups, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  // fetch a single group by ID and set as active
  fetchGroup: async (groupId) => {
    try {
      const { data } = await api.get(`/groups/${groupId}`)
      set({ activeGroup: data })
    } catch {
      set({ activeGroup: null })
    }
  },

  // fetch members for a specific group
  fetchMembers: async (groupId) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/members`)
      set({ members: data })
    } catch {
      set({ members: [] })
    }
  },

  // create a new group and add it to the list
  createGroup: async (name, description, isPrivate) => {
  const { data } = await api.post('/groups', {
    name,
    description,
    is_private: isPrivate,
  })
  // refresh the full groups list from the API rather than manually appending
  await get().fetchGroups()
  return data
  },

  // join a group via invite code and refresh the groups list
  joinGroup: async (inviteCode) => {
    await api.post('/groups/join', { invite_code: inviteCode })
    await get().fetchGroups()
  },

  // leave a group and remove it from the list
  leaveGroup: async (groupId) => {
    await api.delete(`/groups/${groupId}/leave`)
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId)
    }))
  },

  // delete a group (owner only) and remove it from the list
  deleteGroup: async (groupId) => {
    await api.delete(`/groups/${groupId}`)
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId)
    }))
  },

  // promote a member to admin and refresh the members list
  promoteToAdmin: async (groupId, userId) => {
    await api.post(`/groups/${groupId}/admins/${userId}`)
    await get().fetchMembers(groupId)
  },

  // demote an admin back to member and refresh the members list
  demoteAdmin: async (groupId, userId) => {
    await api.delete(`/groups/${groupId}/admins/${userId}`)
    await get().fetchMembers(groupId)
  },
}))