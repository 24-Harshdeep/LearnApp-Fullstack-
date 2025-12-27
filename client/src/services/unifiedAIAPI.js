import axios from 'axios'

const API_URL = 'http://localhost:5000/api/unified-ai'

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lmsToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==================== AI CHATBOT API ====================

/**
 * Send message to AI chatbot
 */
export const sendChatMessage = async (message, context = {}) => {
  try {
    const response = await api.post('/chat', { message, context })
    return response.data
  } catch (error) {
    console.error('Chat API Error:', error)
    throw error.response?.data || error
  }
}

/**
 * Get personalized learning recommendation
 */
export const getRecommendation = async (completedTopics = [], weakAreas = []) => {
  try {
    const response = await api.post('/chat/recommendation', {
      completedTopics,
      weakAreas
    })
    return response.data
  } catch (error) {
    console.error('Recommendation API Error:', error)
    throw error.response?.data || error
  }
}

// ==================== QUIZ MASTER API ====================

/**
 * Generate quiz questions
 */
export const generateQuiz = async (topic, difficulty = 'medium', questionCount = 5) => {
  try {
    const response = await api.post('/quiz/generate', {
      topic,
      difficulty,
      questionCount
    })
    return response.data
  } catch (error) {
    console.error('Quiz Generation API Error:', error)
    throw error.response?.data || error
  }
}

/**
 * Validate quiz answer and get feedback
 */
export const validateQuizAnswer = async (question, userAnswer, correctAnswer, options) => {
  try {
    const response = await api.post('/quiz/validate', {
      question,
      userAnswer,
      correctAnswer,
      options
    })
    return response.data
  } catch (error) {
    console.error('Quiz Validation API Error:', error)
    throw error.response?.data || error
  }
}

/**
 * Get adaptive difficulty adjustment
 */
export const getAdaptiveDifficulty = async (currentDifficulty, score, totalQuestions) => {
  try {
    const response = await api.post('/quiz/adaptive-difficulty', {
      currentDifficulty,
      score,
      totalQuestions
    })
    return response.data
  } catch (error) {
    console.error('Adaptive Difficulty API Error:', error)
    throw error.response?.data || error
  }
}

// ==================== DEBUG DUEL API ====================

/**
 * Analyze code for bugs
 */
// Debug Duel APIs removed — feature deprecated

// ==================== ADMIN & STATS API ====================

/**
 * Get AI service statistics (teacher/admin only)
 */
export const getAIStats = async () => {
  try {
    const response = await api.get('/stats')
    return response.data
  } catch (error) {
    console.error('Stats API Error:', error)
    throw error.response?.data || error
  }
}

/**
 * Reset AI statistics (admin only)
 */
export const resetAIStats = async () => {
  try {
    const response = await api.post('/stats/reset')
    return response.data
  } catch (error) {
    console.error('Reset Stats API Error:', error)
    throw error.response?.data || error
  }
}

export default {
  // Chatbot
  sendChatMessage,
  getRecommendation,
  
  // Quiz Master
  generateQuiz,
  validateQuizAnswer,
  getAdaptiveDifficulty,
  
  // Debug Duel: removed
  
  // Admin
  getAIStats,
  resetAIStats
}
