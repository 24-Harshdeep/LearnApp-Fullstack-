import axios from 'axios'

// Match backend PORT in `server/.env` (default 5000). Change if you run the server on a different port.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  // Try regular token first
  let token = localStorage.getItem('token')
  
  // If no regular token, try LMS token
  if (!token) {
    token = localStorage.getItem('lms_token')
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle HTML error pages (Unexpected token '<')
    if (error.response && error.response.headers['content-type']?.includes('text/html')) {
      console.error('❌ Received HTML instead of JSON:', error.response.config.url)
      return Promise.reject({
        response: {
          data: { message: 'Server error: Received HTML instead of JSON. Please check the API endpoint.' }
        }
      })
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('❌ Network error:', error.message)
      return Promise.reject({
        response: {
          data: { message: 'Network error. Please check your connection.' }
        }
      })
    }
    
    return Promise.reject(error)
  }
)

// User API
export const userAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateXP: (id, xpToAdd) => api.patch(`/users/${id}/xp`, { xpToAdd })
}

// Learning Path API
export const learningPathAPI = {
  getAll: () => api.get('/learning-path'),
  getById: (id) => api.get(`/learning-path/${id}`),
  create: (data) => api.post('/learning-path', data)
}

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  getHints: (id) => api.get(`/tasks/${id}/hints`),
  // submit can be called as submit(id, { userId, email, code }) or submit(id, userId, code)
  submit: (id, arg1, arg2) => {
    if (typeof arg1 === 'object') {
      return api.post(`/tasks/${id}/submit`, arg1)
    }
    return api.post(`/tasks/${id}/submit`, { userId: arg1, code: arg2 })
  }
}

// Progress API
export const progressAPI = {
  getUserProgress: (userId) => api.get(`/progress/user/${userId}`),
  getModuleProgress: (userId, moduleId) => api.get(`/progress/user/${userId}/module/${moduleId}`),
  updateProgress: (data) => api.post('/progress/update', data),
  getStats: (userId) => api.get(`/progress/stats/${userId}`)
}

// Rewards API
export const rewardsAPI = {
  getBadges: (userId) => api.get(`/rewards/badges/${userId}`),
  awardBadge: (userId, badgeId) => api.post(`/rewards/badges/${userId}`, { badgeId }),
  getUnlocked: (userId) => api.get(`/rewards/unlocked/${userId}`),
  unlockReward: (userId, rewardId, requiredXP) => api.post(`/rewards/unlock/${userId}`, { rewardId, requiredXP }),
  getLeaderboard: (timeframe = 'all') => api.get('/rewards/leaderboard', { params: { timeframe } })
}

// AI API
export const aiAPI = {
  generateTask: (data) => api.post('/ai/generate-task', data),
  getRecommendation: (data) => api.post('/ai/recommend', data),
  getHint: (data) => api.post('/ai/hint', data),
  chat: (message, context) => api.post('/ai/chat', { message, context }).then(res => res.data),
  getFeedback: (code, task) => api.post('/ai/feedback', { code, task }).then(res => res.data)
}

export default api
