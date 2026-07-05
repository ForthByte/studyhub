import { create } from 'zustand'
import api from '../api/axios'

// shape of an exam returned from the API
export interface Exam {
  id: string
  user_id: string
  name: string
  subject: string | null
  exam_date: string
  created_at: string
}

interface ExamState {
  exams: Exam[]
  isLoading: boolean

  // actions
  fetchExams: () => Promise<void>
  createExam: (name: string, subject: string | null, examDate: string) => Promise<void>
  deleteExam: (examId: string) => Promise<void>
}

export const useExamStore = create<ExamState>((set) => ({
  exams: [],
  isLoading: false,

  // fetch all exams for the current user ordered by date ascending
  fetchExams: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/exams')
      set({ exams: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  // create a new exam and refresh the list
  createExam: async (name, subject, examDate) => {
    await api.post('/exams', {
      name,
      subject,
      exam_date: examDate,
    })
    // refresh the full list to get the correct ordering
    const { data } = await api.get('/exams')
    set({ exams: data })
  },

  // delete an exam and remove it from the list
  deleteExam: async (examId) => {
    await api.delete(`/exams/${examId}`)
    set((state) => ({
      exams: state.exams.filter((e) => e.id !== examId),
    }))
  },
}))