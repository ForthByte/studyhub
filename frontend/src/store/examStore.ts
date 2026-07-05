import { create } from 'zustand'
import api from '../api/axios'

export interface Exam {
  id: string
  user_id: string
  group_id: string | null
  name: string
  subject: string | null
  exam_date: string
  created_at: string
}

interface ExamState {
  exams: Exam[]
  groupExams: Exam[]
  isLoading: boolean

  // actions
  fetchExams: () => Promise<void>
  fetchGroupExams: (groupId: string) => Promise<void>
  createExam: (name: string, subject: string | null, examDate: string) => Promise<void>
  createGroupExam: (groupId: string, name: string, subject: string | null, examDate: string) => Promise<void>
  deleteExam: (examId: string) => Promise<void>
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  groupExams: [],
  isLoading: false,

  // fetch all exams visible to the current user
  // includes personal exams and group exams from groups they belong to
  fetchExams: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/exams')
      set({ exams: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  // fetch exams for a specific group
  fetchGroupExams: async (groupId) => {
    try {
      const { data } = await api.get(`/groups/${groupId}/exams`)
      set({ groupExams: data })
    } catch {
      set({ groupExams: [] })
    }
  },

  // create a personal exam
  createExam: async (name, subject, examDate) => {
    await api.post('/exams', {
      name,
      subject,
      exam_date: examDate,
    })
    const { data } = await api.get('/exams')
    set({ exams: data })
  },

  // create a group exam — visible to all group members
  createGroupExam: async (groupId, name, subject, examDate) => {
    await api.post(`/groups/${groupId}/exams`, {
      name,
      subject,
      exam_date: examDate,
    })
    await get().fetchGroupExams(groupId)
  },

  // delete an exam
  deleteExam: async (examId) => {
    await api.delete(`/exams/${examId}`)
    set((state) => ({
      exams: state.exams.filter((e) => e.id !== examId),
      groupExams: state.groupExams.filter((e) => e.id !== examId),
    }))
  },
}))