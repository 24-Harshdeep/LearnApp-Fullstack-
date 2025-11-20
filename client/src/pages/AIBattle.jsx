import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, Coins, X, Check, Clock, Brain, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuthStore, useAppStore } from '../store/store'

const API_URL = 'http://localhost:5000/api/ai-battle'

export default function AIBattle() {
  const { user, incrementXP, incrementCoins } = useAuthStore()
  const { refreshLeaderboard } = useAppStore()
  const [battle, setBattle] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(40)
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [isAnswering, setIsAnswering] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [battleResult, setBattleResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (!battle || showResult) return

    if (timeRemaining > 0 && !isAnswering) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isAnswering) {
      // Time's up! AI gets the point
      handleTimeUp()
    }
  }, [timeRemaining, battle, isAnswering, showResult])

  const handleCreateBattle = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/create`, {
        userId: user._id,
        topic: 'JavaScript',
        difficulty: 'medium',
        questionCount: 5
      })

      setBattle(response.data.battle)
      setCurrentQuestionIndex(0)
      setPlayerScore(0)
      setAiScore(0)
      setTimeRemaining(40)
      setShowResult(false)
      toast.success('Battle started! You vs AI 🤖')
    } catch (error) {
      console.error('Battle creation error:', error)
      toast.error('Failed to create battle')
    } finally {
      setLoading(false)
    }
  }

  const handleTimeUp = async () => {
    setIsAnswering(true)
    
    // AI scores when time runs out
    const newAiScore = aiScore + 10
    setAiScore(newAiScore)
    
    const currentQ = battle.questions[currentQuestionIndex]
    toast.error(`Time's up! AI got it right. Answer was: ${currentQ.options[currentQ.correctAnswer]}`, {
      duration: 3000
    })

    // Wait 2 seconds then move to next question
    setTimeout(() => {
      moveToNextQuestion()
    }, 2000)
  }

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer!')
      return
    }

    setIsAnswering(true)

    const currentQ = battle.questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQ.correctAnswer

    if (isCorrect) {
      const newPlayerScore = playerScore + 10
      setPlayerScore(newPlayerScore)
      
      // Award XP immediately
      incrementXP(10)
      
      toast.success(`✅ Correct! +10 XP\n${currentQ.explanation}`, {
        duration: 3000
      })
    } else {
      const newAiScore = aiScore + 10
      setAiScore(newAiScore)
      
      toast.error(`❌ Wrong! AI scored.\nCorrect answer: ${currentQ.options[currentQ.correctAnswer]}\n${currentQ.explanation}`, {
        duration: 4000
      })
    }

    // Wait 2 seconds then move to next question
    setTimeout(() => {
      moveToNextQuestion()
    }, 2000)
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < battle.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setTimeRemaining(40)
      setIsAnswering(false)
    } else {
      // Battle complete
      completeBattle()
    }
  }

  const completeBattle = async () => {
    try {
      const didPlayerWin = playerScore > aiScore
      const isDraw = playerScore === aiScore
      
      // Calculate rewards
      const baseXP = playerScore * 10 // 10 XP per correct answer
      const coinsAwarded = didPlayerWin ? 10 : 0 // 10 coins only for winning
      
      // Award XP and coins locally
      incrementXP(baseXP)
      if (didPlayerWin) {
        incrementCoins(coinsAwarded)
      }
      
      // Update backend - use correct endpoint
      if (user && user.email) {
        const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
        await axios.post('http://localhost:5000/api/users/award-xp', { 
          email: user.email,
          xpToAdd: baseXP,
          reason: `AI Battle ${didPlayerWin ? 'win' : isDraw ? 'draw' : 'loss'}`
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      // Refresh leaderboard
      setTimeout(() => {
        refreshLeaderboard()
      }, 1000)

      const result = {
        result: didPlayerWin ? 'win' : isDraw ? 'draw' : 'loss',
        playerScore,
        aiScore,
        xpAwarded: baseXP,
        coinsAwarded
      }

      setBattleResult(result)
      setShowResult(true)
      
      // Show result toast
      if (didPlayerWin) {
        toast.success(`🏆 Victory! +${baseXP} XP, +${coinsAwarded} coins!`, {
          duration: 5000
        })
      } else if (isDraw) {
        toast('🤝 Draw! +' + baseXP + ' XP', {
          duration: 5000
        })
      } else {
        toast('😔 AI Wins! +' + baseXP + ' XP for trying!', {
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Battle completion error:', error)
      console.error('Error details:', error.response?.data)
      toast.error('Failed to complete battle')
    }
  }

  const handlePlayAgain = () => {
    handleCreateBattle()
  }

  if (!battle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-12 max-w-2xl w-full text-center shadow-2xl"
        >
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              AI Battle Arena
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Challenge the AI! Answer questions before time runs out. ⚡
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
              <div className="text-purple-600 dark:text-purple-400 font-bold mb-1">Correct Answer</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">+10 XP</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="text-blue-600 dark:text-blue-400 font-bold mb-1">Win Battle</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">+10 🪙</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="text-green-600 dark:text-green-400 font-bold mb-1">Each Question</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">40 sec</div>
            </div>
          </div>

          <motion.button
            onClick={handleCreateBattle}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-6 h-6" />
            {loading ? 'Creating Battle...' : 'Start AI Battle'}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (showResult && battleResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-12 max-w-2xl w-full text-center shadow-2xl"
        >
          <div className="mb-8">
            {battleResult.result === 'win' ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-16 h-16 text-white" />
              </motion.div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-16 h-16 text-white" />
              </div>
            )}
            
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              {battleResult.result === 'win' ? '🏆 Victory!' : battleResult.result === 'draw' ? '🤝 Draw!' : '😔 AI Wins'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {battleResult.result === 'win' ? 'You defeated the AI!' : battleResult.result === 'draw' ? 'Evenly matched!' : 'Better luck next time!'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
              <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Score</div>
              <div className="text-4xl font-bold text-blue-600">{playerScore}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Score</div>
              <div className="text-4xl font-bold text-purple-600">{aiScore}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">XP Earned</div>
                <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  +{battleResult.xpAwarded}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Coins Earned</div>
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5" />
                  +{battleResult.coinsAwarded}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              onClick={handlePlayAgain}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Play Again
            </motion.button>
            <motion.button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-4 px-6 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = battle.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / battle.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-white/70 text-sm mb-1">You</div>
              <div className="text-3xl font-bold text-white">{playerScore}</div>
            </div>
            <div className="text-white/50 text-2xl font-bold">VS</div>
            <div className="text-center">
              <div className="text-white/70 text-sm mb-1">AI</div>
              <div className="text-3xl font-bold text-white">{aiScore}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining <= 10 ? 'bg-red-500/20 text-red-200' : 'bg-white/20 text-white'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold">{timeRemaining}s</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-white/70 text-sm mb-2">
            <span>Question {currentQuestionIndex + 1} of {battle.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => !isAnswering && setSelectedAnswer(index)}
                disabled={isAnswering}
                className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${
                  selectedAnswer === index
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${isAnswering ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={!isAnswering ? { scale: 1.02 } : {}}
                whileTap={!isAnswering ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer === index && (
                    <Check className="w-6 h-6" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <motion.button
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || isAnswering}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={selectedAnswer !== null && !isAnswering ? { scale: 1.02 } : {}}
            whileTap={selectedAnswer !== null && !isAnswering ? { scale: 0.98 } : {}}
          >
            {isAnswering ? 'Checking...' : 'Submit Answer'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
