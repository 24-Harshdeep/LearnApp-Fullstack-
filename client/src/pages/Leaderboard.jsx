import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiAward, FiTrendingUp, FiFilter, FiUsers } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAppStore, useAuthStore } from '../store/store'
import socket from '../utils/socket'
import StudentProgressModal from '../components/StudentProgressModal'

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global') // global or class
  const [leaderboardData, setLeaderboardData] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState('all') // all, week, month
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  
  // Subscribe to leaderboard store for real-time updates
  const { leaderboard: storedLeaderboard, setLeaderboard } = useAppStore()

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')

      let endpoint = '/api/users/leaderboard' // New endpoint with merged data
      let headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      if (activeTab === 'class' && selectedClass) {
        endpoint = `/api/teacher/class/${selectedClass}/leaderboard`
      }

      const { data } = await axios.get(`http://localhost:5000${endpoint}`, {
        headers
      })

      let users = data.users || []
      
      console.log('📊 Leaderboard data fetched:', users.length, 'users')
      
      // Users are already sorted by XP from backend and have rank
      setLeaderboardData(users)
      setLeaderboard(users) // Update global store
      // If current user is present, sync streak/loginStreak into the auth store + localStorage
      try {
        const authUpdate = useAuthStore.getState().updateUser
        const storedUser = JSON.parse(localStorage.getItem('lms_user') || '{}')
        const me = users.find(u => u._id === (storedUser._id || currentUser?._id))
        if (me) {
          // Update in-memory auth store
          authUpdate({ ...me })
          // Also update persisted lms_user in localStorage so other parts that read it get fresh data
          if (storedUser && storedUser._id === me._id) {
            try {
              localStorage.setItem('lms_user', JSON.stringify({ ...storedUser, ...me }))
            } catch (e) {
              console.error('Failed to update local lms_user with streak', e)
            }
          }
        }
      } catch (e) {
        console.error('Failed to sync current user streak into auth store', e)
      }
      // also keep store in sync
      try {
        // update app store leaderboard (already done via setLeaderboard)
      } catch (e) {
        console.error('Failed to sync leaderboard to store', e)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }, [activeTab, selectedClass, setLeaderboard])

  useEffect(() => {
    // Listen for real-time streak updates from server
    const handleStreakUpdate = (payload) => {
      try {
        // payload: { email, loginStreak, streak }
        if (!payload?.email) return
        setLeaderboardData((prev) => {
          let changed = false
          const updated = prev.map(p => {
            if (p.email === payload.email) {
              changed = true
              return { ...p, loginStreak: payload.loginStreak, streak: payload.streak || p.streak }
            }
            return p
          })
          if (changed) {
            // update global store as well
            setLeaderboard(updated)
            return updated
          }
          return prev
        })

        // If this update concerns the current user, sync to auth store and localStorage
        const stored = JSON.parse(localStorage.getItem('lms_user') || '{}')
        if (stored?.email === payload.email) {
          try {
            const authUpdate = useAuthStore.getState().updateUser
            authUpdate({ streak: payload.streak || { currentStreak: payload.loginStreak } })
            localStorage.setItem('lms_user', JSON.stringify({ ...stored, streak: payload.streak || { currentStreak: payload.loginStreak } }))
          } catch (e) {
            console.error('Failed to sync streak into auth store', e)
          }
        }
      } catch (e) {
        console.error('Error handling streak:update', e)
      }
    }

    socket.on('streak:update', handleStreakUpdate)

    // Cleanup on unmount
    return () => {
      socket.off('streak:update', handleStreakUpdate)
    }
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('lms_user') || '{}')
    setCurrentUser(user)
    fetchLeaderboard()
    if (user.role === 'teacher' || user.role === 'student') {
      fetchClasses()
    }
    
    // Auto-refresh leaderboard every 10 seconds
    const intervalId = setInterval(() => {
      fetchLeaderboard()
    }, 10000)
    
    return () => clearInterval(intervalId)
  }, [fetchLeaderboard])

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      if (!token) {
        console.log('No token, skipping class fetch')
        return
      }
      
      const { data } = await axios.get('http://localhost:5000/api/lms/classes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data.classes) {
        setClasses(data.classes)
        if (data.classes.length > 0 && !selectedClass) {
          setSelectedClass(data.classes[0]._id)
        }
      }
    } catch (error) {
      console.log('Cannot fetch classes (probably not logged in):', error.response?.status)
      // Don't show error toast - this is expected if not logged in
    }
  }

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'
    if (rank === 2) return 'from-gray-300 to-gray-500'
    if (rank === 3) return 'from-orange-400 to-orange-600'
    return 'from-purple-400 to-blue-500'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            <FiAward className="text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            See how you rank among your peers
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'global'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            🌍 Global Leaderboard
          </button>
          {localStorage.getItem('lmsToken') && (currentUser?.role === 'teacher' || currentUser?.role === 'student') && (
            <button
              onClick={() => setActiveTab('class')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'class'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              🎓 Class Leaderboard
            </button>
          )}
        </div>

        {/* Class Selector */}
        {activeTab === 'class' && classes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6"
          >
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Select Class
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.subject}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Podium for Top 3 */}
        {!loading && leaderboardData.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              🏆 Top Performers
            </h2>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <PodiumCard player={leaderboardData[1]} rank={2} />
              {/* 1st Place */}
              <PodiumCard player={leaderboardData[0]} rank={1} />
              {/* 3rd Place */}
              <PodiumCard player={leaderboardData[2]} rank={3} />
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              All Rankings
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading rankings...</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="p-12 text-center">
              <FiAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No data available</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboardData.map((player, index) => (
                <motion.div
                  key={player._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    player._id === currentUser?._id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => { setSelectedStudent(player); setShowStudentModal(true) }}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className={`text-2xl font-bold ${
                      player.rank <= 3 ? '' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {getRankIcon(player.rank)}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-r ${getRankColor(player.rank)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {player.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                        {player.name || 'Unknown'}
                      </h3>
                      {player._id === currentUser?._id && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {player.email}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {player.xp || player.points || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {player.level || Math.floor((player.points || 0) / 100) + 1}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          🔥 {player.loginStreak || player.streak || 0}
                        </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                    </div>
                    {player.badges && player.badges.length > 0 && (
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                          🏅 {player.badges.length}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Badges</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      {/* Student Profile Modal (from leaderboard) */}
      {showStudentModal && selectedStudent && (
        <StudentProgressModal
          student={selectedStudent}
          onClose={() => { setShowStudentModal(false); setSelectedStudent(null) }}
          onUpdate={() => {
            // Refresh leaderboard and other stores
            fetchLeaderboard()
          }}
        />
      )}
      </div>
    </div>
  )
}

const PodiumCard = ({ player, rank }) => {
  const heights = {
    1: 'h-48',
    2: 'h-36',
    3: 'h-32'
  }

  const colors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600'
  }

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: rank * 0.2 }}
      className="flex flex-col items-center"
    >
      {/* Avatar */}
      <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${colors[rank]} flex items-center justify-center text-white font-bold text-2xl shadow-xl mb-3`}>
        {player.name?.charAt(0).toUpperCase() || 'U'}
      </div>
      
      {/* Name */}
      <h3 className="font-bold text-gray-800 dark:text-white mb-1">
        {player.name || 'Unknown'}
      </h3>
      
      {/* XP */}
      <div className="text-purple-600 dark:text-purple-400 font-semibold mb-3">
        {player.xp || player.points || 0} XP
      </div>

      {/* Podium */}
      <div className={`${heights[rank]} w-32 bg-gradient-to-t ${colors[rank]} rounded-t-xl flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
      </div>
    </motion.div>
  )
}

export default Leaderboard
