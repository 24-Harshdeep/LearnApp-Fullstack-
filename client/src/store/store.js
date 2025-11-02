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

// Theme Store
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light', 'dark', 'ocean'
      
      setTheme: (theme) => {
        // Apply theme to document
        document.documentElement.classList.remove('dark', 'ocean')
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (theme === 'ocean') {
          document.documentElement.classList.add('ocean')
        }
        set({ theme })
      },
      
      toggleDarkMode: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.remove('dark', 'ocean')
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark')
        }
        return { theme: newTheme }
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
