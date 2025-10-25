import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export const useAppStore = create((set) => ({
  learningModules: [],
  tasks: [],
  userProgress: [],
  badges: [],
  
  setLearningModules: (modules) => set({ learningModules: modules }),
  setTasks: (tasks) => set({ tasks }),
  setUserProgress: (progress) => set({ userProgress: progress }),
  setBadges: (badges) => set({ badges }),
}))
