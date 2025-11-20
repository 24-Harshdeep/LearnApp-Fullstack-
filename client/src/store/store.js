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
      
      clearAuth: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('lms_token')
        localStorage.removeItem('lms_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      updateUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData } 
      })),
      
      // Update XP and coins dynamically
      updateXP: (xp) => set((state) => ({
        user: { ...state.user, xp }
      })),
      
      updateCoins: (coins) => set((state) => ({
        user: { ...state.user, coins }
      })),
      
      // Increment XP (for dynamic updates after activities)
      incrementXP: (amount) => set((state) => ({
        user: { ...state.user, xp: (state.user?.xp || 0) + amount }
      })),
      
      incrementCoins: (amount) => set((state) => ({
        user: { ...state.user, coins: (state.user?.coins || 0) + amount }
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export const useAppStore = create((set, get) => ({
  learningModules: [],
  tasks: [],
  userProgress: [],
  badges: [],
  leaderboard: [],
  lastLeaderboardUpdate: null,
  leaderboardRefreshing: false,
  
  setLearningModules: (modules) => set({ learningModules: modules }),
  setTasks: (tasks) => set({ tasks }),
  setUserProgress: (progress) => set({ userProgress: progress }),
  setBadges: (badges) => set({ badges }),
  setLeaderboard: (leaderboard) => set({ 
    leaderboard, 
    lastLeaderboardUpdate: Date.now() 
  }),
  
  // Update XP and trigger leaderboard refresh
  updateXP: (newXP) => set((state) => ({
    userProgress: state.userProgress.map(p => 
      p.userId === state.user?.id ? { ...p, xp: newXP } : p
    )
  })),
  
  // Refresh leaderboard with debouncing
  refreshLeaderboard: async () => {
    const state = get()
    
    // Prevent multiple simultaneous refreshes
    if (state.leaderboardRefreshing) return
    
    // Debounce: Only refresh if last update was > 5 seconds ago
    const timeSinceLastUpdate = Date.now() - (state.lastLeaderboardUpdate || 0)
    if (timeSinceLastUpdate < 5000) return
    
    set({ leaderboardRefreshing: true })
    
    try {
      // Import rewardsAPI dynamically to avoid circular dependency
      const { rewardsAPI } = await import('../services/api')
      const response = await rewardsAPI.getLeaderboard()
      
      set({ 
        leaderboard: response.data,
        lastLeaderboardUpdate: Date.now(),
        leaderboardRefreshing: false
      })
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error)
      set({ leaderboardRefreshing: false })
    }
  }
}))

// Theme Store
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light', 'dark', 'ocean', 'forest', 'sunset', 'minimal', 'matrix', 'neon', 'grey'
      
      setTheme: (theme) => {
        // Remove all theme classes
        const themeClasses = ['dark', 'ocean', 'forest', 'sunset', 'minimal', 'matrix', 'neon', 'grey']
        document.documentElement.classList.remove(...themeClasses)
        
        // Add new theme class (except for 'light' which is default)
        if (theme !== 'light') {
          document.documentElement.classList.add(theme)
        }
        
        set({ theme })
      },
      
      toggleDarkMode: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark'
        const themeClasses = ['dark', 'ocean', 'forest', 'sunset', 'minimal', 'matrix', 'neon', 'grey']
        document.documentElement.classList.remove(...themeClasses)
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
