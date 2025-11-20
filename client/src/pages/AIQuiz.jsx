import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Trophy, Zap, Check, X, ArrowLeft, Sparkles, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuthStore, useAppStore } from '../store/store'

const API_URL = 'http://localhost:5000/api'

export default function AIQuiz() {
  const { user, incrementXP, updateUser } = useAuthStore()
  const { refreshLeaderboard } = useAppStore()
  const [quizState, setQuizState] = useState('setup') // 'setup', 'active', 'results'
  const [quizConfig, setQuizConfig] = useState({
    topic: 'JavaScript',
    difficulty: 'medium',
    questionCount: 10
  })
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [userAnswers, setUserAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [quizStartTime, setQuizStartTime] = useState(null)

  // Timer effect
  useEffect(() => {
    let interval
    if (quizState === 'active' && quizStartTime) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - quizStartTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizState, quizStartTime])

  const handleStartQuiz = async () => {
    setLoading(true)
    try {
      console.log('🎯 Starting AI Quiz with config:', quizConfig)
      
      // Generate quiz questions using Unified Gemini API
      const response = await axios.post(`${API_URL}/unified-ai/quiz/generate`, {
        topic: quizConfig.topic,
        difficulty: quizConfig.difficulty,
        questionCount: quizConfig.questionCount
      })

      console.log('✅ Quiz generated:', response.data)

      // Handle both direct questions array and nested in response
      const questions = response.data.questions || response.data
      
      if (questions && Array.isArray(questions) && questions.length > 0) {
        setQuestions(questions)
        setCurrentQuestionIndex(0)
        setUserAnswers([])
        setScore(0)
        setTimeElapsed(0)
        setQuizStartTime(Date.now())
        setQuizState('active')
        toast.success('Quiz started! Good luck! 🧠')
      } else {
        throw new Error('No questions generated')
      }
    } catch (error) {
      console.error('❌ Quiz generation error:', error)
      console.error('Error details:', error.response?.data || error.message)
      toast.error('Failed to generate quiz. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (optionIndex) => {
    if (selectedAnswer !== null) return // Already answered
    setSelectedAnswer(optionIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer!')
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    // Store the answer
    const answerRecord = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      question: currentQuestion.question
    }
    setUserAnswers([...userAnswers, answerRecord])

    // Update score if correct
    if (isCorrect) {
      const newScore = score + 1
      setScore(newScore)
      toast.success('✅ Correct!', { duration: 1500 })
    } else {
      toast.error('❌ Incorrect', { duration: 1500 })
    }

    // Move to next question or show results
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
      } else {
        // Quiz complete
        finishQuiz(isCorrect ? score + 1 : score)
      }
    }, 1500)
  }

  const finishQuiz = async (finalScore) => {
    setQuizState('results')
    
    // Calculate XP reward
    const xpPerCorrect = 10
    const accuracyPercent = Math.round((finalScore / questions.length) * 100)
    let totalXP = finalScore * xpPerCorrect
    
    // Bonus for 100% accuracy
    if (accuracyPercent === 100) {
      totalXP += 20
      toast.success('🎉 Perfect score! +20 bonus XP!', { duration: 3000 })
    }

    // Award XP
    try {
      // Update local state first for immediate feedback
      incrementXP(totalXP)
      
      // Update backend - try by ID first, then by email
      try {
        if (user && user._id) {
          await axios.patch(`${API_URL}/users/${user._id}/xp`, { xpToAdd: totalXP })
        }
      } catch (error) {
        // Fallback to email-based update
        if (user && user.email) {
          const userResponse = await axios.get(`${API_URL}/users?email=${user.email}`)
          if (userResponse.data && userResponse.data._id) {
            await axios.patch(`${API_URL}/users/${userResponse.data._id}/xp`, { xpToAdd: totalXP })
          }
        }
      }

      // Fetch updated user data to refresh navbar/profile
      setTimeout(async () => {
        try {
          const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
          if (token) {
            const response = await axios.get(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data.success && response.data.user) {
              updateUser(response.data.user)
              localStorage.setItem('lms_user', JSON.stringify(response.data.user))
            }
          }
        } catch (err) {
          console.error('Failed to refresh user data:', err)
        }
        refreshLeaderboard()
      }, 500)
      
      toast.success(`Quiz complete! +${totalXP} XP earned! 🏆`, { duration: 3000 })
    } catch (error) {
      console.error('Error awarding XP:', error)
      toast.error('XP award failed, but your score was recorded!')
    }
  }

  const handleRestartQuiz = () => {
    setQuizState('setup')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setUserAnswers([])
    setScore(0)
  }

  // Setup Screen
  if (quizState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              AI Quiz Master
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test your knowledge with AI-generated questions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Setup Your Quiz
            </h2>

            {/* Topic Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Topic
              </label>
              <select
                value={quizConfig.topic}
                onChange={(e) => setQuizConfig({ ...quizConfig, topic: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="JavaScript">JavaScript</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Algorithms">Algorithms</option>
              </select>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setQuizConfig({ ...quizConfig, difficulty: level })}
                    className={`px-4 py-3 rounded-lg font-semibold transition ${
                      quizConfig.difficulty === level
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={quizConfig.questionCount}
                onChange={(e) => setQuizConfig({ ...quizConfig, questionCount: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Start AI Quiz</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Active Quiz Screen
  if (quizState === 'active' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto"
        >
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                  {quizConfig.topic}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                  <Clock className="w-3 h-3" />
                  {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                Score: {score}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl text-left font-semibold transition border-2 ${
                    selectedAnswer === null
                      ? 'border-gray-300 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-800 dark:text-white'
                      : selectedAnswer === index
                      ? index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedAnswer !== null && index === currentQuestion.correctAnswer && (
                      <Check className="w-6 h-6 text-green-600" />
                    )}
                    {selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                      <X className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Explanation (shown after answering) */}
            {selectedAnswer !== null && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </div>

          {/* Submit Button */}
          {selectedAnswer === null && (
            <button
              onClick={handleSubmitAnswer}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
            >
              Submit Answer
            </button>
          )}
        </motion.div>
      </div>
    )
  }

  // Results Screen
  if (quizState === 'results') {
    const accuracyPercent = Math.round((score / questions.length) * 100)
    const xpPerCorrect = 10
    let totalXP = score * xpPerCorrect
    if (accuracyPercent === 100) totalXP += 20

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            {/* Trophy Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Quiz Complete! 🎉
            </h1>

            {/* Score Display */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Correct Answers
                </div>
              </div>

              <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {accuracyPercent}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Accuracy
                </div>
              </div>
            </div>

            {/* XP Earned */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-500">
                    +{totalXP} XP
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {accuracyPercent === 100 && '🎯 Perfect Score Bonus! '}
                    Experience Earned
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mb-8">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {accuracyPercent === 100 && "🌟 Perfect! You're a master!"}
                {accuracyPercent >= 80 && accuracyPercent < 100 && "🎉 Excellent work! Keep it up!"}
                {accuracyPercent >= 60 && accuracyPercent < 80 && "👍 Good job! You're learning!"}
                {accuracyPercent < 60 && "📚 Keep practicing! You'll get there!"}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleRestartQuiz}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
