import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiAward, FiTrendingUp, FiTarget, FiClock, FiGift } from 'react-icons/fi'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore, useAppStore } from '../store/store'
import socket from '../utils/socket'

const StudentProgressModal = ({ student, onClose, onUpdate }) => {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [awardPoints, setAwardPoints] = useState('')
  const [awardReason, setAwardReason] = useState('')
  const [awarding, setAwarding] = useState(false)
  const { updateCoins, updateUser, user: currentUser } = useAuthStore()

  useEffect(() => {
    fetchStudentProgress()
  }, [student])

  // Keep modal badges/streak in sync with global leaderboard updates
  const globalLeaderboard = useAppStore(state => state.leaderboard)

  useEffect(() => {
    try {
      if (!student || !globalLeaderboard || globalLeaderboard.length === 0) return
      const match = globalLeaderboard.find(l => l._id === student._id || l.email === student.email)
      if (match) {
        setProgress(prev => {
          if (!prev) return prev
          const newBadges = match.badges && match.badges.length > 0 ? match.badges : prev.badges || []
          const newStreak = match.loginStreak ?? match.streak ?? prev.loginStreak ?? prev.streak
          return { ...prev, badges: newBadges, loginStreak: newStreak, streak: newStreak }
        })
      }
    } catch (e) {
      console.error('Error syncing modal with global leaderboard:', e)
    }
  }, [globalLeaderboard, student])

  useEffect(() => {
    // Listen for real-time streak updates and refresh progress if it matches this student
    const handleStreak = (payload) => {
      try {
        if (!payload || !payload.email) return
        if (payload.email === student.email) {
          // Try to update local progress.streak quickly without full refetch
          setProgress((prev) => {
            if (!prev) return prev
            const newStreak = payload.loginStreak ?? payload.streak ?? prev.streak
            return { ...prev, streak: newStreak, loginStreak: payload.loginStreak ?? prev.loginStreak }
          })
        }
      } catch (e) {
        console.error('Error applying streak update to modal:', e)
      }
    }

    socket.on('streak:update', handleStreak)
    return () => socket.off('streak:update', handleStreak)
  }, [student])

  const fetchStudentProgress = async () => {
    try {
      setLoading(true)
      // Support multiple token keys used across the app
      const token = localStorage.getItem('lms_token') || localStorage.getItem('lmsToken') || localStorage.getItem('token')
      
      if (!token) {
        // No token, use student data as fallback
        const appBadges = useAppStore.getState().badges || []
        setProgress({
          xp: student.xp || 0,
          level: student.level || 1,
          // normalize streak shape: accept number or object
          streak: (student?.streak && (typeof student.streak === 'number' ? student.streak : student.streak.currentStreak)) || student.loginStreak || 0,
          // If viewing the current user's profile, prefer global app badges so UI updates immediately
          badges: (student.email === currentUser?.email) ? (appBadges || student.badges || []) : (student.badges || []),
          progress: student.progress || {},
          confidenceIndex: student.confidenceIndex || 50,
          recentSubmissions: [],
          activityTimeline: []
        })
        setLoading(false)
        return
      }
      
        // Initialize UI immediately from the passed student prop so teacher view shows correct info
        // If the passed student does not include badges, try to pull them from the global leaderboard
        const globalLB = useAppStore.getState().leaderboard || []
        const lbMatch = globalLB.find(l => l._id === student._id || l.email === student.email)
        const initialBadges = (student.badges && student.badges.length > 0)
          ? student.badges
          : (lbMatch?.badges && lbMatch.badges.length > 0) ? lbMatch.badges : (prev => prev?.badges || [])

        setProgress(prev => ({
          xp: student.xp || student.points || prev?.xp || 0,
          level: student.level || Math.floor(((student.xp || student.points || prev?.xp || 0) / 100)) + 1,
          streak: (student?.streak && (typeof student.streak === 'number' ? student.streak : student.streak.currentStreak)) || student.loginStreak || prev?.streak || 0,
          badges: Array.isArray(initialBadges) ? initialBadges : (prev?.badges || []),
          progress: student.progress || prev?.progress || {},
          confidenceIndex: student.confidenceIndex || prev?.confidenceIndex || 50,
          recentSubmissions: prev?.recentSubmissions || [],
          activityTimeline: prev?.activityTimeline || []
        }))

        // If we don't have a token, we won't be able to fetch more details — keep the passed student values
        if (!token) {
          setLoading(false)
          return
        }

        // If student._id is not available try to avoid making a bad request
        const studentId = student._id || student.id || null
        if (!studentId) {
          // No server id available; keep showing provided student data
          setLoading(false)
          return
        }

        try {
          const { data } = await axios.get(
            `http://localhost:5000/api/teacher/student/${studentId}/progress`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          if (data && data.success) {
            // Normalize streak in returned progress if nested
            const prog = data.progress || {}
            if (prog.streak && typeof prog.streak !== 'number') {
              prog.streak = prog.streak.currentStreak ?? prog.streak
            }
            prog.loginStreak = prog.loginStreak ?? (prog.streak || 0)

            // Merge server data into existing progress to avoid replacing UI with unrelated values
            setProgress(prev => ({
              xp: prog.xp ?? prog.points ?? prev?.xp ?? 0,
              level: prog.level ?? prev?.level ?? Math.floor((prev?.xp || 0) / 100) + 1,
              streak: prog.loginStreak ?? prog.streak ?? prev?.streak ?? 0,
              badges: prog.badges || prev?.badges || [],
              progress: prog.progress || prev?.progress || {},
              confidenceIndex: prog.confidenceIndex ?? prev?.confidenceIndex ?? 50,
              recentSubmissions: prog.recentSubmissions || prev?.recentSubmissions || [],
              activityTimeline: prog.activityTimeline || prev?.activityTimeline || []
            }))
          
            // Fetch badges separately if endpoint exists and merge into global store so teacher/leaderboard see them
            try {
              const badgeResp = await axios.get(`http://localhost:5000/api/rewards/badges/${studentId}`, { headers: { Authorization: `Bearer ${token}` } })
              const badgesFromApi = (badgeResp.data && (badgeResp.data.badges || badgeResp.data)) || []
              if (Array.isArray(badgesFromApi) && badgesFromApi.length > 0) {
                // Update modal state
                setProgress(prev => ({ ...prev, badges: badgesFromApi }))

                // Update global leaderboard entries so other components (teacher table, leaderboard) reflect new badge counts
                try {
                  const appStore = useAppStore.getState()
                  const setLeaderboard = appStore.setLeaderboard
                  const currentLB = appStore.leaderboard || []
                  if (typeof setLeaderboard === 'function' && currentLB.length > 0) {
                    const updated = currentLB.map(item => {
                      if (item._id === studentId || item.email === student.email) {
                        return { ...item, badges: badgesFromApi }
                      }
                      return item
                    })
                    setLeaderboard(updated)
                  }
                } catch (e) {
                  console.error('Failed to sync badges into global leaderboard:', e)
                }
              }
            } catch (e) {
              // badge endpoint may not exist or fail — ignore silently
            }
          } else {
            console.warn('Teacher progress API returned no success, keeping passed student data')
          }
        } catch (apiError) {
          console.log('API failed to fetch detailed progress; keeping passed student data', apiError?.response?.status)
          // Keep the initial student-provided progress — do not overwrite with unrelated values
        }
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Failed to fetch student progress')
      // Set basic data even on error
      const appBadges = useAppStore.getState().badges || []
      setProgress({
        xp: student.xp || 0,
        level: student.level || 1,
        streak: student.streak || 0,
        badges: (student.email === currentUser?.email) ? (appBadges || student.badges || []) : (student.badges || []),
        progress: student.progress || {},
        confidenceIndex: student.confidenceIndex || 50,
        recentSubmissions: [],
        activityTimeline: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAwardPoints = async () => {
    if (!awardPoints || awardPoints <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setAwarding(true)
      const token = localStorage.getItem('lms_token') || localStorage.getItem('lmsToken') || localStorage.getItem('token')

      const payload = {
        studentId: student._id,
        studentEmail: student.email,
        teacherId: (JSON.parse(localStorage.getItem('lms_user') || 'null') || {})._id,
        points: parseInt(awardPoints, 10),
        reason: awardReason,
        timestamp: new Date().toISOString()
      }

      const { data } = await axios.post(
        `http://localhost:5000/api/rewards/award`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data && data.success) {
        toast.success('✅ Points awarded successfully!')
        setAwardPoints('')
        setAwardReason('')
        // Refresh progress panel
        fetchStudentProgress()
        // Notify parent to refresh lists
        if (onUpdate) onUpdate()

        // Update client-side auth store and localStorage if the awarded student is the current user
        try {
          const lmsUser = JSON.parse(localStorage.getItem('lms_user') || 'null') || {}
          const awardedUser = data.user
          if (awardedUser && lmsUser?.email && lmsUser.email === student.email) {
            // Update store user coins
            if (typeof updateUser === 'function') {
              updateUser({ coins: awardedUser.coins })
            }
            if (typeof updateCoins === 'function') {
              updateCoins(awardedUser.coins)
            }
            // Update localStorage for lms_user as well
            const newLmsUser = { ...lmsUser, coins: awardedUser.coins }
            localStorage.setItem('lms_user', JSON.stringify(newLmsUser))
          }
        } catch (e) {
          console.error('Error updating local store after award:', e)
        }
      } else {
        console.error('Award API responded with failure:', data)
        toast.error('⚠️ Failed to award points. Please try again.')
      }
    } catch (error) {
      console.error('Error awarding points:', error)
      toast.error('⚠️ Failed to award points. Please try again.')
    } finally {
      setAwarding(false)
    }
  }

  const getConceptColor = (value) => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-blue-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {student.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{student.name || 'Student'}</h2>
                  <p className="text-purple-100">{student.email}</p>
                  {student.classes && student.classes.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {student.classes.map((cls, idx) => (
                        <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded">
                          {cls.name || 'Class'}
                        </span>
                      ))}
                    </div>
                  )}
                  {student.classesJoined && student.classesJoined.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {student.classesJoined.map((cls, idx) => (
                        <span key={idx} className="text-xs bg-white/20 px-2 py-1 rounded">
                          {cls.name || cls}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading progress...</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  icon={<FiTrendingUp />}
                  label="XP"
                  value={progress?.xp || 0}
                  color="purple"
                />
                <StatCard
                  icon={<FiTarget />}
                  label="Level"
                  value={progress?.level || 1}
                  color="blue"
                />
                <StatCard
                  icon={<FiAward />}
                  label="Badges"
                  value={progress?.badges?.length || 0}
                  color="yellow"
                />
                <StatCard
                    icon={<FiClock />}
                    label="Streak"
                    value={`${(progress?.loginStreak ?? (typeof progress?.streak === 'object' ? progress?.streak?.currentStreak : progress?.streak) ?? 0)} 🔥`}
                    color="orange"
                  />
              </div>

              {/* XP Progress Bar */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress to Next Level
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {progress?.xp || 0} / {((progress?.level || 1) * 100)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((progress?.xp || 0) % 100), 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Concept Mastery */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiTarget className="text-purple-600" />
                  Concept Mastery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {progress?.progress && Object.entries(progress.progress).map(([concept, value]) => (
                    <div key={concept} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {concept}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {value}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`${getConceptColor(value)} h-2 rounded-full transition-all`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence Index */}
              {progress?.confidenceIndex !== undefined && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                    Confidence Index
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200 dark:text-gray-600"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress.confidenceIndex / 100)}`}
                          className="text-green-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800 dark:text-white">
                          {progress.confidenceIndex}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {progress.confidenceIndex >= 80 && "Excellent! Student is highly confident."}
                        {progress.confidenceIndex >= 60 && progress.confidenceIndex < 80 && "Good progress! Building confidence."}
                        {progress.confidenceIndex >= 40 && progress.confidenceIndex < 60 && "Moderate confidence. Keep encouraging!"}
                        {progress.confidenceIndex < 40 && "Needs support. Consider extra help."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Submissions */}
              {progress?.recentSubmissions && progress.recentSubmissions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Recent Submissions
                  </h3>
                  <div className="space-y-3">
                    {progress.recentSubmissions.slice(0, 5).map((submission, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {submission.assignmentTitle || 'Assignment'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {submission.points !== undefined && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              submission.points >= 70
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : submission.points >= 50
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {submission.points}/100
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            submission.status === 'graded'
                              ? 'bg-green-100 text-green-700'
                              : submission.status === 'submitted'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              {progress?.activityTimeline && progress.activityTimeline.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Activity Timeline
                  </h3>
                  <div className="space-y-2">
                    {progress.activityTimeline.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {activity.action}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Award Points Section - only visible to teachers */}
              {currentUser?.role === 'teacher' && (
                <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiGift className="text-purple-600" />
                    Award Points
                  </h3>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="number"
                      placeholder="Points"
                      value={awardPoints}
                      onChange={(e) => setAwardPoints(e.target.value)}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Reason (optional)"
                      value={awardReason}
                      onChange={(e) => setAwardReason(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={handleAwardPoints}
                      disabled={awarding}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {awarding ? 'Awarding...' : 'Award'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    yellow: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
  }

  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
    </div>
  )
}

export default StudentProgressModal
