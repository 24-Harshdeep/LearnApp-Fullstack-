import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Zap, Target, Award, Send, Swords, UserPlus, Brain } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuthStore } from '../store/store'
import { useNavigate } from 'react-router-dom'
import AIBattle from './AIBattle'
import AIQuiz from './AIQuiz'

const API_URL = 'http://localhost:5000/api/social'

const Social = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('battle')
  const [availableBattles, setAvailableBattles] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeBattle, setActiveBattle] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'battle') {
        const response = await axios.get(`${API_URL}/battles/available`)
        setAvailableBattles(response.data)
      }
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBattle = async () => {
    try {
      const response = await axios.post(`${API_URL}/battles/create`, {
        userId: user._id,
        userName: user.name,
        topic: 'JavaScript',
        difficulty: 'medium'
      })
      setActiveBattle(response.data.battle)
      toast.success('Battle room created! Waiting for opponent...')
    } catch (error) {
      toast.error('Failed to create battle')
    }
  }

  const handleJoinBattle = async (battleId) => {
    try {
      const response = await axios.post(`${API_URL}/battles/${battleId}/join`, {
        userId: user._id,
        userName: user.name
      })
      setActiveBattle(response.data.battle)
      toast.success('Battle joined! Get ready...')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join')
    }
  }

  const handleAnswerQuestion = async () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer!')
      return
    }
    try {
      const question = activeBattle.questions[currentQuestion]
      const response = await axios.post(`${API_URL}/battles/${activeBattle._id}/answer`, {
        userId: user._id,
        questionId: question.id,
        answer: selectedAnswer,
        timeSpent: 30
      })
      if (response.data.correct) {
        toast.success('Correct! +' + response.data.score)
      } else {
        toast.error('Wrong answer!')
      }
      setSelectedAnswer(null)
      if (currentQuestion < activeBattle.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
      } else {
        await axios.post(`${API_URL}/battles/${activeBattle._id}/complete`)
        toast.success('Battle complete!')
        setActiveBattle(null)
        setCurrentQuestion(0)
      }
    } catch (error) {
      toast.error('Failed to submit answer')
    }
  }

  const tabs = [
    { id: 'battle', name: '40-Second Battle', icon: Swords },
    { id: 'quiz', name: 'AI Quiz', icon: Brain }
  ]

  // Show AI Battle component (40-second turn-based)
  if (activeTab === 'battle') {
    return <AIBattle />
  }

  // Show AI Quiz component (standalone quiz mode)
  if (activeTab === 'quiz') {
    return <AIQuiz />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <Users className="w-10 h-10 text-purple-600" />
          Social Gaming Arena
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Compete, collaborate, and level up together! 🎮
        </p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <tab.icon className="w-5 h-5" />
            {tab.name}
          </motion.button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'battle' && (
          <div>
            {!activeBattle ? (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Available Battles</h2>
                  <motion.button
                    onClick={handleCreateBattle}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Swords className="w-5 h-5" />
                    Create Battle
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableBattles.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
                      <Swords className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Battles Available</h3>
                      <p className="text-gray-500 mb-4">Be the first to create one!</p>
                    </div>
                  ) : (
                    availableBattles.map((battle) => (
                      <motion.div
                        key={battle._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{battle.topic}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            battle.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            battle.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{battle.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {battle.player1.userName.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{battle.player1.userName}</span>
                          <span className="text-xs text-gray-500">waiting...</span>
                        </div>
                        <motion.button
                          onClick={() => handleJoinBattle(battle._id)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <UserPlus className="w-4 h-4" />
                          Join Battle
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
                        {activeBattle.player1.userName.charAt(0)}
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{activeBattle.player1.userName}</p>
                      <p className="text-lg font-bold text-purple-600">{activeBattle.player1.score}</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mb-1">
                        {activeBattle.player2?.userName?.charAt(0) || '?'}
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{activeBattle.player2?.userName || 'Waiting...'}</p>
                      <p className="text-lg font-bold text-pink-600">{activeBattle.player2?.score || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Question</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{currentQuestion + 1}/{activeBattle.questions.length}</p>
                  </div>
                </div>
                {activeBattle.questions[currentQuestion] && (
                  <div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{activeBattle.questions[currentQuestion].question}</h3>
                    </div>
                    <div className="space-y-3 mb-6">
                      {activeBattle.questions[currentQuestion].options.map((option, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => setSelectedAnswer(option)}
                          className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${
                            selectedAnswer === option
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                    <motion.button
                      onClick={handleAnswerQuestion}
                      disabled={!selectedAnswer}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: selectedAnswer ? 1.02 : 1 }}
                      whileTap={{ scale: selectedAnswer ? 0.98 : 1 }}
                    >
                      <Send className="w-5 h-5" />
                      Submit Answer
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white cursor-pointer"
              onClick={() => navigate('/ai-challenges')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">AI Quiz Master</h3>
              <p className="mb-6 opacity-90">Dynamically generated questions from topics you're studying</p>
              <div className="bg-white/20 backdrop-blur rounded-lg py-3 text-center font-bold">Start AI Quiz →</div>
            </motion.div>
            {/* Debug Duel card removed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 shadow-xl text-white cursor-pointer"
              onClick={() => navigate('/ai-challenges')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Adaptive Difficulty</h3>
              <p className="mb-6 opacity-90">Games get tougher as your performance improves</p>
              <div className="bg-white/20 backdrop-blur rounded-lg py-3 text-center font-bold">Generate Challenge →</div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Social
